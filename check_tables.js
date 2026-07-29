const fs = require('fs');
const glob = require('glob'); // Note: glob is not guaranteed, let's just use readdir recursively

function findTables(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = dir + '/' + file;
    if (fs.statSync(fullPath).isDirectory()) {
      findTables(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('<table')) {
          const context = lines.slice(Math.max(0, i - 2), i + 1).join('\n');
          if (!context.includes('overflow-x-auto') && !context.includes('overflow-hidden')) {
            console.log(fullPath + ':' + (i + 1) + ' missing overflow wrapper');
          }
        }
      }
    }
  }
}
findTables('./src/components');
