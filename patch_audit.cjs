const fs = require('fs');
let content = fs.readFileSync('src/components/AuditLogsView.tsx', 'utf8');

content = content.replace(/className="p-3\.5"/g, 'className="px-2 py-1.5"');
content = content.replace(/className="p-3\.5/g, 'className="px-2 py-1.5');
content = content.replace(/colSpan=\{8\} className="text-center py-12/g, 'colSpan={8} className="text-center py-8');

fs.writeFileSync('src/components/AuditLogsView.tsx', content);
