const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  'return (this.props as ErrorBoundaryProps).children;',
  'return (this as any).props.children;'
);
content = content.replace(
  'public state: ErrorBoundaryState;',
  '// @ts-ignore\n  public state: ErrorBoundaryState;'
);

fs.writeFileSync('src/main.tsx', content);
