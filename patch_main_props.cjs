const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  'return this.props.children;',
  'return (this.props as ErrorBoundaryProps).children;'
);

fs.writeFileSync('src/main.tsx', content);
