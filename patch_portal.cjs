const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

content = content.replace(/bg-teal-50/g, 'bg-sky-50 dark:bg-slate-950');
content = content.replace(/bg-teal-950/g, 'bg-slate-950');
content = content.replace(/bg-teal-900/g, 'bg-slate-900');
content = content.replace(/bg-teal-800/g, 'bg-slate-800');
content = content.replace(/border-teal-800\/50/g, 'border-slate-800/50');
content = content.replace(/border-teal-900/g, 'border-slate-800');
content = content.replace(/text-teal-600/g, 'text-indigo-600 dark:text-indigo-400');
content = content.replace(/text-teal-400/g, 'text-indigo-400');
content = content.replace(/from-teal-700/g, 'from-indigo-600');
content = content.replace(/to-emerald-700/g, 'to-blue-600');
content = content.replace(/bg-teal-400\/20/g, 'bg-blue-400/20');
content = content.replace(/bg-emerald-400\/20/g, 'bg-indigo-400/20');
content = content.replace(/bg-slate-900\/90 text-white placeholder-slate-400/g, 'bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white placeholder-slate-400');
content = content.replace(/bg-teal-600/g, 'bg-indigo-600');
content = content.replace(/hover:bg-teal-500/g, 'hover:bg-indigo-500');
content = content.replace(/shadow-teal-600\/30/g, 'shadow-indigo-600/30');
content = content.replace(/ring-teal-400/g, 'ring-indigo-400');
content = content.replace(/focus:ring-teal-500/g, 'focus:ring-indigo-500');
content = content.replace(/border border-teal-600/g, 'border-indigo-500');
content = content.replace(/text-teal-900/g, 'text-slate-900 dark:text-white');
content = content.replace(/bg-slate-800\/80 hover:bg-slate-700 text-slate-300 border border-slate-700/g, 'bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700');
content = content.replace(/dark:bg-slate-950\/50 dark:bg-slate-950/g, 'dark:bg-slate-950');

fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
