const fs = require('fs');

let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

content = content.replace(/const latency = Math\.floor\(Math\.random\(\) \* 25\) \+ 8;/g, 'const latency = 12;');
content = content.replace(/const loss = Math\.random\(\) > 0\.95 \? 5 : 0;/g, 'const loss = 0;');
content = content.replace(/cust\.username = \`\$\{cust\.username\}_\$\{Math\.floor\(Math\.random\(\) \* 899 \+ 100\)\}\`;/g, 'cust.username = `${cust.username}_dup`;');
content = content.replace(/\? \`10\.0\.0\.\$\{Math\.floor\(Math\.random\(\) \* 240\) \+ 10\}\`/g, '? "Auto"');
content = content.replace(/: \`192\.168\.88\.\$\{Math\.floor\(Math\.random\(\) \* 240\) \+ 10\}\`;/g, ': "Auto";');

fs.writeFileSync('src/components/SubscribersView.tsx', content);
