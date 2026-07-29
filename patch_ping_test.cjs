const fs = require('fs');

let content = fs.readFileSync('src/components/PingTestView.tsx', 'utf8');

// Replace ping test mock logic
const pingMockRegex = /\/\/ Simulate connection failures based on status[\s\S]*?if \(!isOnline\).*?\} else if \(isSuspended\) \{.*?\}/gm;
content = content.replace(/let isSuccess = false;\s*let ms = 0;[\s\S]*?\/\/ Simulate connection failures based on status[\s\S]*?if \(!isOnline\).*?isSuccess = false;.*?ms = 0;.*?\} else if \(isSuspended\) \{.*?isSuccess = Math\.random\(\) > 0\.8;.*?ms = Math\.floor\(Math\.random\(\) \* 150\) \+ 120;.*?\} else if \(isExpired\) \{.*?isSuccess = Math\.random\(\) > 0\.9;.*?ms = Math\.floor\(Math\.random\(\) \* 200\) \+ 180;.*?\} else \{.*?isSuccess = Math\.random\(\) > 0\.05;.*?ms = Math\.floor\(Math\.random\(\) \* 35\) \+ 10;.*?\}/gms, `
      let isSuccess = false;
      let ms = 0;
      if (isOnline) {
        isSuccess = true;
        ms = 15; // Just use 15ms constant for real connection as we don't have real ping from API yet
      }
`);

fs.writeFileSync('src/components/PingTestView.tsx', content);
