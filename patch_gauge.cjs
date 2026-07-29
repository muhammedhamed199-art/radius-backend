const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const target = `<Gauge className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />`;
const replacement = `<Gauge className={\`w-3.5 h-3.5 animate-pulse shrink-0 \${showResourceMonitor ? 'text-slate-900' : 'text-amber-400'}\`} />`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/NasServersView.tsx', content);
