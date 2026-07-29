const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

content = content.replace(
  'import { exportToExcel, exportToPDF } from "../utils/exportUtils";',
  'import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";'
);

const oldExportFuncs = `  const exportExcel = () => {
    const data = sortedCustomers.map(c => ({
      "رقم الحساب": c?.id,
      "اسم المشترك": c.name,
      "اسم المستخدم": c.username,
      "اسم دخول اللوحة": c.portalUsername || "غير محدد",
      "الرقم السري للوحة": c.portalPassword || "غير محدد",
      "رقم الهاتف": c.phone || "غير محدد",
      "الرصيد": c.balance || 0,
      "الحالة": c.status
    }));
    exportToExcel(data, "المشتركين");
  };`;

const newExportFuncs = `  const exportExcel = () => {
    const data = sortedCustomers.map(c => ({
      "رقم الحساب": c?.id,
      "اسم المشترك": c.name,
      "اسم المستخدم": c.username,
      "اسم دخول اللوحة": c.portalUsername || "غير محدد",
      "الرقم السري للوحة": c.portalPassword || "غير محدد",
      "رقم الهاتف": c.phone || "غير محدد",
      "الرصيد": c.balance || 0,
      "الحالة": c.status
    }));
    exportToExcel(data, "المشتركين");
  };

  const exportCSV = () => {
    const data = sortedCustomers.map(c => ({
      "رقم الحساب": c?.id,
      "اسم المشترك": c.name,
      "اسم المستخدم": c.username,
      "اسم دخول اللوحة": c.portalUsername || "غير محدد",
      "الرقم السري للوحة": c.portalPassword || "غير محدد",
      "رقم الهاتف": c.phone || "غير محدد",
      "الرصيد": c.balance || 0,
      "الحالة": c.status
    }));
    exportToCSV(data, "المشتركين");
  };`;

content = content.replace(oldExportFuncs, newExportFuncs);

fs.writeFileSync('src/components/SubscribersView.tsx', content);
