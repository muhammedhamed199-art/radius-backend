const fs = require('fs');
let lines = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Quick Search Widget */}')) {
    // We want to add an extra </div> before this line.
    // Let's check what's directly before it
    if (lines[i-1].includes('</div>')) {
       lines.splice(i, 0, '          </div>');
       break;
    }
  }
}

fs.writeFileSync('src/components/SubscriberPortalView.tsx', lines.join('\n'));
