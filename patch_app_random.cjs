const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Remove periodic random server status mocking in App.tsx
content = content.replace(/const mockUsers = Math\.floor\(Math\.random\(\) \* 120\) \+ 40;/g, 'const mockUsers = 0;');
content = content.replace(/if \(Math\.random\(\) > 0\.85\) \{[\s\S]*?\} else if/g, 'if (false) {} else if');
content = content.replace(/if \(Math\.random\(\) > 0\.85\) \{[\s\S]*?const newCpu =[\s\S]*?const newRam =[\s\S]*?\}\s*return s;/g, 'return s;');
content = content.replace(/if \(Math\.random\(\) > 0\.8\) \{/g, 'if (false) {');
content = content.replace(/Math\.random\(\)\.toString\(36\)\.substring\(2, 5\)/g, '"dup"');
content = content.replace(/Math\.random\(\)\.toString\(36\)\.substr\(2, 5\)/g, '"dup"');
content = content.replace(/Math\.random\(\)/g, '1');

fs.writeFileSync('src/App.tsx', content);
