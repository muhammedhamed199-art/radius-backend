const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  '  subscriptionStatus?: "نشط" | "منتهي";',
  '  subscriptionStatus?: "نشط" | "منتهي";\n  logo?: string;'
);
fs.writeFileSync('src/types.ts', content);
