import express from "express";
import net from "net";
import { dbQuery, dbRun } from "./db.js";

const router = express.Router();

// Helper to check actual TCP socket connection to host and measure real latency
function checkTcpPing(host: string, port: number, timeoutMs = 1500): Promise<{ alive: boolean; latency: number }> {
  const cleanHost = host.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!done) {
        done = true;
        const latency = Date.now() - start;
        socket.destroy();
        resolve({ alive: true, latency });
      }
    });

    socket.on('timeout', () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve({ alive: false, latency: 0 });
      }
    });

    socket.on('error', () => {
      if (!done) {
        done = true;
        socket.destroy();
        resolve({ alive: false, latency: 0 });
      }
    });

    try {
      socket.connect(port, cleanHost);
    } catch {
      resolve({ alive: false, latency: 0 });
    }
  });
}

// POST /api/nas/ping - Live Ping and Connection Check Endpoint for NAS Servers
router.post("/nas/ping", async (req, res) => {
  const { ipAddress, vpnIp, id } = req.body;
  if (!ipAddress && !vpnIp) {
    return res.status(400).json({ error: "عنوان IP أو VPN_IP مطلوب لفحص الاتصال" });
  }

  const startTime = Date.now();
  try {
    const targetAddress = vpnIp || ipAddress;
    const cleanHost = targetAddress.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

    let isAlive = false;
    let pingLatency = 0;

    // 1. Try TCP ports commonly open on MikroTik / NAS servers (8728 API, 80 HTTP, 443 HTTPS, 22 SSH)
    const portsToTest = [8728, 80, 443, 22];
    for (const port of portsToTest) {
      const pingResult = await checkTcpPing(cleanHost, port, 1200);
      if (pingResult.alive) {
        isAlive = true;
        pingLatency = pingResult.latency;
        break;
      }
    }

    // 2. If TCP socket check failed, attempt HTTP fetch as fallback
    if (!isAlive) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        const urlToTest = targetAddress.startsWith("http") ? targetAddress : `http://${targetAddress}`;
        
        const response = await fetch(urlToTest, { 
          method: "HEAD", 
          signal: controller.signal 
        }).catch(() => null);

        clearTimeout(timeoutId);
        
        if (response && (response.ok || response.status < 500)) {
          isAlive = true;
          pingLatency = Date.now() - startTime;
        }
      } catch {
        isAlive = false;
      }
    }

    const calculatedStatus: "متصل" | "منفصل" = isAlive ? "متصل" : "منفصل";

    // Update DB if ID or IP match
    try {
      if (ipAddress) {
        await dbRun("UPDATE nas SET vpn_status = ? WHERE nasname = ?", [calculatedStatus, ipAddress]);
      }
    } catch {
      // DB update optional
    }

    return res.json({
      success: true,
      ipAddress: targetAddress,
      vpnStatus: calculatedStatus,
      pingMs: isAlive ? pingLatency : 0,
      checkedAt: new Date().toISOString()
    });
  } catch (e: any) {
    return res.status(500).json({ 
      success: false, 
      vpnStatus: "منفصل", 
      error: e.message || "فشل فحص الاستجابة المباشرة" 
    });
  }
});

// GET /api/nas - List NAS Servers with Realm & RADIUSDesk integration
router.get("/nas", async (req, res) => {
  try {
    const servers = await dbQuery("SELECT * FROM nas");
    // Map to frontend NasServer format with RADIUSDesk Realm support
    const formatted = servers.map(s => ({
      id: s.id.toString(),
      name: s.shortname || s.nasname,
      ipAddress: s.nasname,
      vpnIp: s.vpnIp || s.nasname,
      secret: s.secret,
      vpnStatus: s.vpn_status || s.status || "منفصل",
      realm: s.realm || "realm1.net",
      realms: Array.isArray(s.realms) ? s.realms : [s.realm || "realm1.net"],
      type: s.type || "mikrotik",
      apiUsername: s.shortname || "",
      apiPassword: "",
      apiPort: s.ports || 8728,
      location: s.description || "",
      distributorId: s.distributorId || undefined,
      autoReconnect: true,
      enableNotifications: true,
      cpuUsagePercent: 0,
      ramUsagePercent: 0
    }));
    res.json(formatted);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/realms - List available RADIUSDesk realms
router.get("/realms", async (req, res) => {
  try {
    const servers = await dbQuery("SELECT * FROM nas");
    const realmSet = new Set<string>(["realm1.net", "@realm1", "default", "hotspot.net", "pppoe.net"]);
    servers.forEach(s => {
      if (s.realm) realmSet.add(s.realm);
      if (Array.isArray(s.realms)) s.realms.forEach((r: string) => realmSet.add(r));
    });
    res.json(Array.from(realmSet));
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/customers - List users with live accounting data
router.get("/customers", async (req, res) => {
  try {
    // Basic user extraction from radcheck
    // Group by username to construct the user
    const checks = await dbQuery("SELECT * FROM radcheck");
    const grouped: Record<string, any> = {};
    
    checks.forEach(row => {
      if (!grouped[row.username]) {
        grouped[row.username] = { username: row.username, password: "", status: "نشط", concurrentLogins: 0, consumptionGB: 0, ipAddress: "" };
      }
      if (row.attribute === "Cleartext-Password") {
        grouped[row.username].password = row.value;
      }
      if (row.attribute === "Expiration") {
        grouped[row.username].expiryDate = row.value;
        if (new Date(row.value) < new Date()) {
          grouped[row.username].status = "منتهي الاشتراك";
        }
      }
      if (row.attribute === "Auth-Type" && row.value === "Reject") {
        grouped[row.username].status = "موقف";
      }
      if (row.attribute === "Framed-IP-Address") {
         grouped[row.username].ipAddress = row.value;
      }
    });

    // Get live accounting data (who is online)
    const activeSessions = await dbQuery("SELECT username, COUNT(*) as count FROM radacct WHERE acctstoptime IS NULL GROUP BY username");
    activeSessions.forEach(session => {
      if (grouped[session.username]) {
        grouped[session.username].concurrentLogins = session.count;
      }
    });

    // Get total consumption
    const consumption = await dbQuery("SELECT username, SUM(acctinputoctets + acctoutputoctets) as total_bytes FROM radacct GROUP BY username");
    consumption.forEach(c => {
      if (grouped[c.username]) {
        grouped[c.username].consumptionGB = (c.total_bytes / (1024 * 1024 * 1024)).toFixed(2);
      }
    });

    const formatted = Object.values(grouped).map((u, i) => ({
      id: `live_${i}`,
      name: u.username,
      username: u.username,
      password: u.password,
      status: u.status,
      connectionType: "برودباند PPPoE",
      ipAddress: u.ipAddress || "Auto",
      concurrentLogins: u.concurrentLogins,
      consumptionGB: parseFloat(u.consumptionGB) || 0,
      expiryDate: u.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: "",
      distributorId: "",
      category: "عادي"
    }));

    res.json(formatted);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});


// POST /api/nas - Create a new NAS Server
router.post("/nas", async (req, res) => {
  const { name, ipAddress, vpnIp, secret, type, apiPort, location, realm, realms, distributorId } = req.body;
  if (!name || (!ipAddress && !vpnIp) || !secret) {
    return res.status(400).json({ error: "الاسم، عنوان IP، وكلمة المرور مطلوبة" });
  }
  try {
    const targetIp = ipAddress || vpnIp;
    const exists = await dbQuery("SELECT * FROM nas WHERE nasname = ?", [targetIp]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "السيرفر (IP) موجود مسبقاً" });
    }
    const primaryRealm = realm || (Array.isArray(realms) && realms.length > 0 ? realms[0] : 'realm1.net');
    const realmList = Array.isArray(realms) && realms.length > 0 ? realms : [primaryRealm];

    await dbRun(
      "INSERT INTO nas (nasname, shortname, type, ports, secret, description, realm, realms, vpnIp, vpn_status, distributorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [targetIp, name, type || 'mikrotik', apiPort || 8728, secret, location || '', primaryRealm, realmList, vpnIp || targetIp, 'منفصل', distributorId || null]
    );
    res.json({ success: true, realm: primaryRealm, realms: realmList });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/nas/:identifier - Update NAS Server
router.put("/nas/:identifier", async (req, res) => {
  const { identifier } = req.params;
  const { name, ipAddress, vpnIp, secret, type, apiPort, location, realm, realms, vpnStatus } = req.body;
  try {
    const primaryRealm = realm || (Array.isArray(realms) && realms.length > 0 ? realms[0] : 'realm1.net');
    const realmList = Array.isArray(realms) && realms.length > 0 ? realms : [primaryRealm];
    const targetIp = ipAddress || vpnIp || identifier;

    await dbRun(
      "UPDATE nas SET shortname = ?, type = ?, ports = ?, secret = ?, description = ?, realm = ?, realms = ?, vpnIp = ?, vpn_status = ? WHERE nasname = ?",
      [name, type || 'mikrotik', apiPort || 8728, secret, location, primaryRealm, realmList, vpnIp || targetIp, vpnStatus || 'منفصل', identifier]
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/nas/:identifier
router.delete("/nas/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;
    await dbRun("DELETE FROM nas WHERE nasname = ?", [identifier]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/customers - Create a new RADIUS user
router.post("/customers", async (req, res) => {
  const { username, password, ipAddress } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
  }

  try {
    // Validate existence
    const exists = await dbQuery("SELECT * FROM radcheck WHERE username = ? AND attribute = 'Cleartext-Password'", [username]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "اسم المستخدم موجود مسبقاً في شبكة الريديوس" });
    }

    await dbRun("INSERT INTO radcheck (username, attribute, op, value) VALUES (?, 'Cleartext-Password', ':=', ?)", [username, password]);
    if (ipAddress && ipAddress !== "Auto") {
      await dbRun("INSERT INTO radreply (username, attribute, op, value) VALUES (?, 'Framed-IP-Address', '=', ?)", [username, ipAddress]);
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/customers/:username
router.delete("/customers/:username", async (req, res) => {
  try {
    const { username } = req.params;
    await dbRun("DELETE FROM radcheck WHERE username = ?", [username]);
    await dbRun("DELETE FROM radreply WHERE username = ?", [username]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;