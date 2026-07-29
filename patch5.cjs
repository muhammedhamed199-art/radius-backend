const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

content = content.replace(
  '<Server className="w-4 h-4" />',
  '<Server className="w-4 h-4 animate-pulse" />'
);

content = content.replace(
  '<Server className="w-5 h-5" />',
  '<Server className="w-5 h-5 animate-pulse" />'
);

fs.writeFileSync('src/components/NasServersView.tsx', content);
