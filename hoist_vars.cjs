const fs = require('fs');

let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

const startIdx = lines.findIndex(l => l.includes('const [adminAccount, setAdminAccount]'));
const endIdx = lines.findIndex(l => l.includes('// For DevicesView interval error'));

if (startIdx !== -1 && endIdx !== -1) {
  const varsToMove = lines.splice(startIdx, endIdx - startIdx + 1);
  const targetIdx = lines.findIndex(l => l.includes('function AppContent() {')) + 1;
  lines.splice(targetIdx, 0, ...varsToMove);
  
  // also remove getInitialData
  const initDataIdx = lines.findIndex(l => l.includes('const initialData = getInitialData();'));
  if (initDataIdx !== -1) lines.splice(initDataIdx, 1);
  
  fs.writeFileSync('src/App.tsx', lines.join('\n'));
}

