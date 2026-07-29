import path from "path";
import fs from "fs";

const DB_DIR = path.join(process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const DB_FILE = path.join(DB_DIR, "radius_mock_db.json");

let db = {
  nas: [] as any[],
  radcheck: [] as any[],
  radreply: [] as any[],
  radacct: [] as any[],
  distributors: [] as any[]
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch (e) {
    console.error("Failed to load mock db", e);
  }
} else {
  // Seed with some initial data including RADIUSDesk realms
  db.nas.push({ 
    id: 1, 
    nasname: "192.168.1.1", 
    vpnIp: "10.10.10.1",
    shortname: "Main_MikroTik", 
    type: "mikrotik", 
    ports: 8728, 
    secret: "secret123", 
    description: "Main Router",
    realm: "realm1.net",
    realms: ["realm1.net", "default"],
    vpn_status: "متصل"
  });
  db.radcheck.push({ id: 1, username: "user1", attribute: "Cleartext-Password", op: ":=", value: "123456" });
  db.radacct.push({ radacctid: 1, username: "user1", acctstoptime: null, acctinputoctets: 1500000000, acctoutputoctets: 500000000 });
  save();
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

export const dbQuery = async (sql: string, params: any[] = []): Promise<any[]> => {
  if (sql.startsWith("SELECT * FROM nas")) {
    return db.nas;
  }
  if (sql.startsWith("SELECT * FROM radcheck WHERE username = ?")) {
    return db.radcheck.filter(r => r.username === params[0] && r.attribute === 'Cleartext-Password');
  }
  if (sql.startsWith("SELECT * FROM radcheck")) {
    return db.radcheck;
  }
  if (sql.includes("COUNT(*) as count FROM radacct WHERE acctstoptime IS NULL")) {
    const counts: any = {};
    db.radacct.forEach(r => {
      if (r.acctstoptime === null) {
        counts[r.username] = (counts[r.username] || 0) + 1;
      }
    });
    return Object.keys(counts).map(u => ({ username: u, count: counts[u] }));
  }
  if (sql.includes("SUM(acctinputoctets + acctoutputoctets) as total_bytes FROM radacct")) {
    const sums: any = {};
    db.radacct.forEach(r => {
      sums[r.username] = (sums[r.username] || 0) + (r.acctinputoctets || 0) + (r.acctoutputoctets || 0);
    });
    return Object.keys(sums).map(u => ({ username: u, total_bytes: sums[u] }));
  }
  return [];
};

export const dbRun = async (sql: string, params: any[] = []): Promise<any> => {
  if (sql.startsWith("INSERT INTO radcheck")) {
    db.radcheck.push({ id: Date.now(), username: params[0], attribute: 'Cleartext-Password', op: ':=', value: params[1] });
    save();
  } else if (sql.startsWith("INSERT INTO nas")) {
    // Supports nasname, shortname, type, ports, secret, description, realm, realms, vpnIp, vpn_status
    const [nasname, shortname, type, ports, secret, description, realm, realms, vpnIp, vpn_status, distributorId] = params;
    const existingIndex = db.nas.findIndex(r => r.nasname === nasname || r.id === params[0]);
    const nasItem = {
      id: existingIndex >= 0 ? db.nas[existingIndex].id : Date.now(),
      nasname,
      shortname,
      type: type || 'mikrotik',
      ports: ports || 8728,
      secret,
      description,
      realm: realm || 'default',
      realms: Array.isArray(realms) ? realms : (realm ? [realm] : ['default']),
      vpnIp: vpnIp || nasname,
      vpn_status: vpn_status || 'منفصل',
      distributorId
    };
    if (existingIndex >= 0) {
      db.nas[existingIndex] = { ...db.nas[existingIndex], ...nasItem };
    } else {
      db.nas.push(nasItem);
    }
    save();
  } else if (sql.startsWith("UPDATE nas SET vpn_status = ? WHERE nasname = ?")) {
    const [status, ip] = params;
    const target = db.nas.find(r => r.nasname === ip || r.vpnIp === ip);
    if (target) {
      target.vpn_status = status;
      save();
    }
  } else if (sql.startsWith("UPDATE nas")) {
    // General update NAS item
    const [shortname, type, ports, secret, description, realm, realms, vpnIp, vpn_status, nasname] = params;
    const target = db.nas.find(r => r.nasname === nasname || r.id?.toString() === nasname?.toString());
    if (target) {
      target.shortname = shortname ?? target.shortname;
      target.type = type ?? target.type;
      target.ports = ports ?? target.ports;
      target.secret = secret ?? target.secret;
      target.description = description ?? target.description;
      target.realm = realm ?? target.realm;
      target.realms = realms ? (Array.isArray(realms) ? realms : [realms]) : target.realms;
      target.vpnIp = vpnIp ?? target.vpnIp;
      target.vpn_status = vpn_status ?? target.vpn_status;
      save();
    }
  } else if (sql.startsWith("DELETE FROM nas")) {
    db.nas = db.nas.filter(r => r.nasname !== params[0] && r.id?.toString() !== params[0]?.toString());
    save();
  } else if (sql.startsWith("INSERT INTO radreply")) {
    db.radreply.push({ id: Date.now(), username: params[0], attribute: 'Framed-IP-Address', op: '=', value: params[1] });
    save();
  } else if (sql.startsWith("DELETE FROM radcheck")) {
    db.radcheck = db.radcheck.filter(r => r.username !== params[0]);
    save();
  } else if (sql.startsWith("DELETE FROM radreply")) {
    db.radreply = db.radreply.filter(r => r.username !== params[0]);
    save();
  }
  return { changes: 1 };
};

export default db;
