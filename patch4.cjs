const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

content = content.replace(
  'className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5"',
  'className="px-3 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 text-rose-700 border border-rose-200 text-[11px] font-extrabold rounded-xl transition-all flex items-center gap-1.5"'
);

fs.writeFileSync('src/components/SubscribersView.tsx', content);
