import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

pattern = r'className="w-full bg-slate-950/90 text-white (pl-.*? pr-10 py-3 rounded-2xl border border-slate-800 \$\{loginMode === "subscriber" \? "focus:border-teal-500 focus:ring-teal-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20"\} focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600 dark:text-slate-300)"'
replacement = r'className={`w-full bg-slate-950/90 text-white \1`}'

content = re.sub(pattern, replacement, content)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

