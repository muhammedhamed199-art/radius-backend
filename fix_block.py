import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

pattern = r'\{isDistributorSession && \(\s*<div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-indigo-200 dark:border-indigo-900/50 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-800 dark:text-slate-100 shadow-sm animate-in fade-in">.*?</div>\s*\)\}'
content = re.sub(pattern, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
