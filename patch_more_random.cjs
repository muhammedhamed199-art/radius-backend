const fs = require('fs');
let nasContent = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

nasContent = nasContent.replace(/const newCpu = Math\.max\(5, Math\.min\(98, baseCpu \+ Math\.floor\(\(Math\.random\(\) - 0\.5\) \* 6\)\)\);/g, 'const newCpu = baseCpu;');
nasContent = nasContent.replace(/const newRam = Math\.max\(10, Math\.min\(95, baseRam \+ Math\.floor\(\(Math\.random\(\) - 0\.5\) \* 4\)\)\);/g, 'const newRam = baseRam;');
nasContent = nasContent.replace(/const newCpu = Math\.max\(8, Math\.min\(95, baseCpu \+ Math\.floor\(\(Math\.random\(\) - 0\.5\) \* 8\)\)\);/g, 'const newCpu = baseCpu;');
nasContent = nasContent.replace(/const newRam = Math\.max\(15, Math\.min\(92, baseRam \+ Math\.floor\(\(Math\.random\(\) - 0\.5\) \* 5\)\)\);/g, 'const newRam = baseRam;');
nasContent = nasContent.replace(/const newRx = parseFloat\(\(Math\.random\(\) \* 150 \+ 20\)\.toFixed\(1\)\);/g, 'const newRx = 0;');
nasContent = nasContent.replace(/const newTx = parseFloat\(\(Math\.random\(\) \* 100 \+ 10\)\.toFixed\(1\)\);/g, 'const newTx = 0;');
fs.writeFileSync('src/components/NasServersView.tsx', nasContent);

let portContent = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');
portContent = portContent.replace(/const ping = Math\.floor\(12 \+ Math\.random\(\) \* 25\);/g, 'const ping = 15;');
portContent = portContent.replace(/const jitter = Math\.floor\(1 \+ Math\.random\(\) \* 5\);/g, 'const jitter = 2;');
fs.writeFileSync('src/components/SubscriberPortalView.tsx', portContent);

