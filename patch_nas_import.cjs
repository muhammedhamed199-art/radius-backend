const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

content = content.replace(
  'import { exportToExcel, exportToPDF } from "../utils/exportUtils";',
  'import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";'
);

const oldExportFuncs = `  const exportExcel = () => {
    const data = filteredServers.map(s => ({
      "الرقم": s.id,
      "الاسم": s.name,
      "الـ IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "Secret": s.secret,
      "التزامن": s.syncStatus,
      "حالة VPN": s.vpnStatus
    }));
    exportToExcel(data, "سيرفرات_المايكروتك");
  };`;

const newExportFuncs = `  const exportExcel = () => {
    const data = filteredServers.map(s => ({
      "الرقم": s.id,
      "الاسم": s.name,
      "الـ IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "Secret": s.secret,
      "التزامن": s.syncStatus,
      "حالة VPN": s.vpnStatus
    }));
    exportToExcel(data, "سيرفرات_المايكروتك");
  };

  const exportCSV = () => {
    const data = filteredServers.map(s => ({
      "الرقم": s.id,
      "الاسم": s.name,
      "الـ IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "Secret": s.secret,
      "التزامن": s.syncStatus,
      "حالة VPN": s.vpnStatus
    }));
    exportToCSV(data, "سيرفرات_المايكروتك");
  };`;

content = content.replace(oldExportFuncs, newExportFuncs);

fs.writeFileSync('src/components/NasServersView.tsx', content);
