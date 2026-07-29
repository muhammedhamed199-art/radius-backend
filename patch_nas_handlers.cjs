const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newNasHandlers = `
  const handleAddServer = async (newServer: Omit<NasServer, "id">) => {
    if (checkReadOnly()) return;
    try {
      const res = await fetch('/api/nas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newServer)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء السيرفر");
      logAction("admin", newServer.name, "تم إضافة سيرفر NAS جديد");
      
      const nasRes = await fetch('/api/nas');
      if (nasRes.ok) setServers(await nasRes.json());
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateServer = async (edited: NasServer) => {
    if (checkReadOnly()) return;
    // API logic for updating can be added
    logAction("admin", edited.name, "تم تحديث سيرفر NAS");
  };

  const handleDeleteServer = async (id: string) => {
    if (checkReadOnly()) return;
    const target = servers.find(s => s?.id === id);
    if (!target) return;
    try {
      const res = await fetch(\`/api/nas/\${target.ipAddress}\`, { method: 'DELETE' });
      if (!res.ok) throw new Error("فشل الحذف");
      logAction("admin", target.name, "تم حذف سيرفر NAS");
      const nasRes = await fetch('/api/nas');
      if (nasRes.ok) setServers(await nasRes.json());
    } catch (e: any) {
      alert(e.message);
    }
  };
`;

const handlersRegex = /const handleAddServer =[\s\S]*?const handleToggleServerAutoReconnect =/m;

content = content.replace(handlersRegex, newNasHandlers + "\n  const handleToggleServerAutoReconnect =");

fs.writeFileSync('src/App.tsx', content);
