const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberImportExportModal.tsx', 'utf8');

content = content.replace(/className="p-3/g, 'className="px-2 py-1.5');
fs.writeFileSync('src/components/SubscriberImportExportModal.tsx', content);
