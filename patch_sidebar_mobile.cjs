const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// mobile navbar buttons
content = content.replace('p-1.5 bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 focus:outline-none appearance-none', 'p-1.5 bg-slate-100 dark:bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 focus:outline-none appearance-none');

content = content.replace('p-1.5 px-2 bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60', 'p-1.5 px-2 bg-slate-100 dark:bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60');

content = content.replace('p-2 bg-slate-800 text-amber-400 rounded-xl', 'p-2 bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 rounded-xl');

// Mobile sidebar footer buttons
content = content.replace('hover:bg-slate-800 text-slate-400 hover:text-indigo-300', 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300');

content = content.replace('hover:bg-slate-800 text-amber-400', 'hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400');

content = content.replace('hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400', 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400');

// Mobile sidebar links
content = content.replace('hover:bg-slate-800 hover:text-white text-slate-400 border-transparent', 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400 border-transparent');

// User details icon mobile
content = content.replace('p-2 bg-slate-800 rounded-lg text-slate-300', 'p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300');

// Simulation mode label
content = content.replace('px-3 py-1 bg-slate-800 text-white rounded-full text-xs font-bold', 'px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-full text-xs font-bold');

fs.writeFileSync('src/App.tsx', content);
