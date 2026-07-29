const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace(
  'class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: Error | null}> {',
  `interface ErrorBoundaryProps { children: ReactNode; }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;`
);

content = content.replace(
  'constructor(props: {children: ReactNode}) {',
  'constructor(props: ErrorBoundaryProps) {'
);

fs.writeFileSync('src/main.tsx', content);
