const fs = require('fs');
let perms = fs.readFileSync('src/utils/permissions.ts', 'utf8');
perms = perms.replace(
  'label: "واجهة التحكم بقالب كود التركيب المركزي للميكروتيك"',
  'label: "واجهة التحكم بقالب كود التركيب المركزي للميكروتيك (Unified RouterOS Template)"'
);
fs.writeFileSync('src/utils/permissions.ts', perms);
