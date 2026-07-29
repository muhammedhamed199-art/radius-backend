const fs = require('fs');
let types = fs.readFileSync('src/types.ts', 'utf8');
types = types.replace('canViewRouterOSTemplate?: boolean; // واجهة التحكم بقالب كود التركيب المركزي للميكروتيك', '// واجهة التحكم بقالب كود التركيب المركزي للميكروتيك');
fs.writeFileSync('src/types.ts', types);

let perms = fs.readFileSync('src/utils/permissions.ts', 'utf8');
perms = perms.replace(',\n      { key: "canViewRouterOSTemplate", label: "واجهة التحكم بقالب كود التركيب المركزي للميكروتك", desc: "إتاحة أو منع الموزع من رؤية وتعديل قالب سكربت التركيب المركزي للميكروتك." }', '');
perms = perms.replace(',\n    canViewRouterOSTemplate: false', '');
perms = perms.replace('canManageCentralMikrotikScript: true', 'canManageCentralMikrotikScript: false');
fs.writeFileSync('src/utils/permissions.ts', perms);
