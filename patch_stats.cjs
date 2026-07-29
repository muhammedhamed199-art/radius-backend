const fs = require('fs');
let content = fs.readFileSync('src/components/StatsView.tsx', 'utf8');

content = content.replace(/pb-3 px-4/g, 'pb-2 px-2');
content = content.replace(/py-3 px-4/g, 'py-2 px-2');
content = content.replace(/className="px-4 py-3/g, 'className="px-2 py-2');

fs.writeFileSync('src/components/StatsView.tsx', content);
