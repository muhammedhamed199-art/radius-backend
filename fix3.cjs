const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

const target = '            </p>\n          </div>\n\n          {/* Quick Search Widget */}';
const replacement = '            </p>\n            </div>\n          </div>\n\n          {/* Quick Search Widget */}';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
  console.log("Fixed!");
} else {
  console.log("Not found again!");
}
