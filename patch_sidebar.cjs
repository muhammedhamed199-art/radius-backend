const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Sidebar container
content = content.replace('bg-slate-900 text-slate-300 border-l border-slate-800 shrink-0 select-none', 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 shrink-0 select-none');

// Header border
content = content.replace('p-6 border-b border-slate-800 flex items-center justify-between gap-2', 'p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2');

// Sub-title
content = content.replace('text-slate-400 mt-0.5 truncate', 'text-slate-500 dark:text-slate-400 mt-0.5 truncate');

// Buttons in header
content = content.replace(/bg-slate-800 hover:bg-slate-700/g, 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700');
content = content.replace(/border-slate-700\/60/g, 'border-slate-200 dark:border-slate-700/60');

// Navigation links inactive state
content = content.replace('hover:bg-slate-800 hover:text-white text-slate-400 border-transparent', 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-400 border-transparent');

// Nav link icons inactive state
content = content.replace('text-slate-400 group-hover:text-slate-300', 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300');

// User identity bottom footer
content = content.replace('border-t border-slate-800 bg-slate-950/40', 'border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40');
content = content.replace('hover:bg-slate-800/60', 'hover:bg-slate-200 dark:hover:bg-slate-800/60');

// Mobile navbar (bg-slate-900 -> bg-white dark:bg-slate-900, border-slate-800 -> border-slate-200 dark:border-slate-800)
content = content.replace('fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-2 sm:px-4 border-b border-slate-800 gap-1', 'fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white z-40 flex items-center justify-between px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800 gap-1');

// Mobile sidebar container
content = content.replace('bg-slate-900 text-slate-300 w-80', 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80');

fs.writeFileSync('src/App.tsx', content);
