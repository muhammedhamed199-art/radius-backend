const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace export default function App() { with function AppContent() {
content = content.replace('export default function App() {', 'function AppContent() {');

// Append export default App at the end
content += `

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppContent />
    </Suspense>
  );
}
`;

fs.writeFileSync('src/App.tsx', content);
