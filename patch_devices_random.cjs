const fs = require('fs');

let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

// Replace random initial speeds
content = content.replace(/const initialRx = 10 \+ \(hash % 50\) \+ Math\.random\(\) \* 5;/g, 'const initialRx = 10 + (hash % 50);');
content = content.replace(/const initialTx = 1 \+ \(hash % 10\) \+ Math\.random\(\) \* 2;/g, 'const initialTx = 1 + (hash % 10);');

// Remove setInterval mock
const intervalRegex = /const interval = setInterval\(\(\) => \{[\s\S]*?\}, 2000\);/g;
content = content.replace(intervalRegex, '');

// Remove Math.random from handleRefresh
content = content.replace(/const newSignal = Math\.max\(-88, Math\.min\(-48, baseSignal \+ Math\.floor\(\(Math\.random\(\) - 0\.5\) \* 4\)\)\);/g, 'const newSignal = baseSignal;');
content = content.replace(/const newCcq = parseFloat\(Math\.max\(40, Math\.min\(100, baseCcq \+ \(Math\.random\(\) - 0\.5\) \* 3\)\)\.toFixed\(1\)\);/g, 'const newCcq = baseCcq;');

fs.writeFileSync('src/components/DevicesView.tsx', content);
