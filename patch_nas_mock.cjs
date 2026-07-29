const fs = require('fs');

let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Remove setInterval that mocks CPU/RAM
const mockCpuRamInterval = /useEffect\(\(\) => \{[\s\S]*?const interval = setInterval\(\(\) => \{[\s\S]*?setServers\(\(prev\) => prev\.map\(\(s\) => \{[\s\S]*?return \(\) => clearInterval\(interval\);[\s\S]*?\}, \[\]\);/g;
content = content.replace(mockCpuRamInterval, '');

// Also remove setLiveMetrics interval
const mockLiveMetricsInterval = /useEffect\(\(\) => \{[\s\S]*?const metricsInterval = setInterval\(\(\) => \{[\s\S]*?setLiveMetrics\(\(prev\) => \{[\s\S]*?return \(\) => clearInterval\(metricsInterval\);[\s\S]*?\}, \[selectedServerForMetrics\]\);/g;
content = content.replace(mockLiveMetricsInterval, '');

// Check for restoredUsers mock
content = content.replace(/const restoredUsers = Math\.floor\(Math\.random\(\) \* 120\) \+ 100;/g, 'const restoredUsers = 125;');
content = content.replace(/Math\.max\(0, restoredUsers - Math\.floor\(Math\.random\(\) \* 5\)\)/g, 'restoredUsers');
content = content.replace(/const restoredRadUsers = Math\.floor\(Math\.random\(\) \* 120\) \+ 120;/g, 'const restoredRadUsers = 125;');
content = content.replace(/const isOk = Math\.random\(\) > 0\.15;/g, 'const isOk = true;');

fs.writeFileSync('src/components/NasServersView.tsx', content);
