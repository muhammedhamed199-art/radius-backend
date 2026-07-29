const fs = require('fs');
let content = fs.readFileSync('src/components/DistributorsView.tsx', 'utf8');

content = content.replace(
  '    setPassword("123456");\n    setPhone("");',
  '    setPassword("123456");\n    setPhone("");\n    setLogo("");'
);

fs.writeFileSync('src/components/DistributorsView.tsx', content);
