const fs = require('fs');

let content = fs.readFileSync('src/server/routes.ts', 'utf8');

const newRoutes = `
// POST /api/nas - Create a new NAS Server
router.post("/nas", async (req, res) => {
  const { name, ipAddress, secret, type, apiPort, location } = req.body;
  if (!name || !ipAddress || !secret) {
    return res.status(400).json({ error: "الاسم، عنوان IP، وكلمة المرور مطلوبة" });
  }
  try {
    const exists = await dbQuery("SELECT * FROM nas WHERE nasname = ?", [ipAddress]);
    if (exists.length > 0) {
      return res.status(400).json({ error: "السيرفر (IP) موجود مسبقاً" });
    }
    await dbRun(
      "INSERT INTO nas (nasname, shortname, type, ports, secret, description) VALUES (?, ?, ?, ?, ?, ?)",
      [ipAddress, name, type || 'other', apiPort || 8728, secret, location || '']
    );
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/nas/:ipAddress
router.delete("/nas/:ipAddress", async (req, res) => {
  try {
    const { ipAddress } = req.params;
    await dbRun("DELETE FROM nas WHERE nasname = ?", [ipAddress]);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});
`;

content = content.replace(/\/\/ POST \/api\/customers/, newRoutes + '\n// POST /api/customers');

fs.writeFileSync('src/server/routes.ts', content);
