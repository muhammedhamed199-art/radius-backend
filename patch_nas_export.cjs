const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldExportFuncs = `  const exportExcel = () => {
    const data = sortedServers.map(s => ({
      "رقم السيرفر": s?.id,
      "الاسم": s.name,
      "عنوان IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "حالة الاتصال": s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      "المستخدمين النشطين": s.activeUsers || 0
    }));
    exportToExcel(data, "سيرفرات_المايكروتك");
  };`;

const newExportFuncs = `  const exportExcel = () => {
    const data = sortedServers.map(s => ({
      "رقم السيرفر": s?.id,
      "الاسم": s.name,
      "عنوان IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "حالة الاتصال": s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      "المستخدمين النشطين": s.activeUsers || 0
    }));
    exportToExcel(data, "سيرفرات_المايكروتك");
  };

  const exportCSV = () => {
    const data = sortedServers.map(s => ({
      "رقم السيرفر": s?.id,
      "الاسم": s.name,
      "عنوان IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "حالة الاتصال": s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      "المستخدمين النشطين": s.activeUsers || 0
    }));
    exportToCSV(data, "سيرفرات_المايكروتك");
  };`;

content = content.replace(oldExportFuncs, newExportFuncs);
fs.writeFileSync('src/components/NasServersView.tsx', content);
