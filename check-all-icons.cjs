const fs = require('fs');
const path = require('path');
const lucide = require('lucide-react');

function findIcons(dir) {
  let missing = false;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      missing = missing || findIcons(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/from\s+['"]lucide-react['"]/g);
      if (match) {
        const imports = content.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/);
        if (imports) {
          const iconNames = imports[1].split(',').map(s => s.trim()).filter(s => s);
          for (const icon of iconNames) {
            const name = icon.split(' as ')[0].trim();
            if (!lucide[name]) {
              console.error(`Missing icon ${name} in ${fullPath}`);
              missing = true;
            }
          }
        }
      }
    }
  }
  return missing;
}

if (!findIcons(path.join(__dirname, 'src'))) {
  console.log("All icons valid");
}
