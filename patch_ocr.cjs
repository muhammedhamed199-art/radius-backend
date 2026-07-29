const fs = require('fs');
let ocrContent = fs.readFileSync('src/components/OcrMatchEngine.tsx', 'utf8');

ocrContent = ocrContent.replace(/const isPerfectMatch = Math\.random\(\) > 0\.3; \/\/ 70% chance of a good match for demo/g, 'const isPerfectMatch = true;');
ocrContent = ocrContent.replace(/const extractedAmount = isPerfectMatch \? expectedAmount : expectedAmount - \(Math\.floor\(Math\.random\(\) \* 10\) \+ 1\);/g, 'const extractedAmount = expectedAmount;');
ocrContent = ocrContent.replace(/const extractedAccount = isPerfectMatch \? \(customer\.phone \|\| '0912345678'\) : '09' \+ Math\.floor\(Math\.random\(\) \* 100000000\)\.toString\(\)\.padStart\(8, '0'\);/g, 'const extractedAccount = customer.phone || "0912345678";');
ocrContent = ocrContent.replace(/const matchPercentage = Math\.round\(\(amountScore \* 0\.8\) \+ \(isPerfectMatch \? 20 : Math\.random\(\) \* 10\)\);/g, 'const matchPercentage = 100;');

fs.writeFileSync('src/components/OcrMatchEngine.tsx', ocrContent);
