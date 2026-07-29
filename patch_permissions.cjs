const fs = require('fs');
let content = fs.readFileSync('src/utils/permissions.ts', 'utf8');

content = content.replace(
  '{ key: "canViewSettings", label: "صفحة الإعدادات العامة للنظام", desc: "الدخول إلى قسم الإعدادات العامة وضبط خيارات النظام الأساسية" }',
  '{ key: "canViewSettings", label: "صفحة الإعدادات العامة للنظام", desc: "الدخول إلى قسم الإعدادات العامة وضبط خيارات النظام الأساسية" },\n      { key: "canViewRouterOSTemplate", label: "واجهة التحكم بقالب كود التركيب المركزي للميكروتك", desc: "إتاحة أو منع الموزع من رؤية وتعديل قالب سكربت التركيب المركزي للميكروتك." }'
);

content = content.replace(
  'canViewSettings: false',
  'canViewSettings: false,\n    canViewRouterOSTemplate: false'
);

fs.writeFileSync('src/utils/permissions.ts', content);
