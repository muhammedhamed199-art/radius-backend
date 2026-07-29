import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Fix className errors
content = content.replace(
    'className="w-full bg-slate-950/90 text-white pl-4 pr-10 py-3 rounded-2xl border border-slate-800 ${loginMode === \\"subscriber\\" ? \\"focus:border-teal-500 focus:ring-teal-500/20\\" : \\"focus:border-indigo-500 focus:ring-indigo-500/20\\"} focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600 dark:text-slate-300"',
    'className={`w-full bg-slate-950/90 text-white pl-4 pr-10 py-3 rounded-2xl border border-slate-800 ${loginMode === "subscriber" ? "focus:border-teal-500 focus:ring-teal-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20"} focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600 dark:text-slate-300`}'
)

content = content.replace(
    'className="w-full bg-slate-950/90 text-white pl-10 pr-10 py-3 rounded-2xl border border-slate-800 ${loginMode === \\"subscriber\\" ? \\"focus:border-teal-500 focus:ring-teal-500/20\\" : \\"focus:border-indigo-500 focus:ring-indigo-500/20\\"} focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600 dark:text-slate-300"',
    'className={`w-full bg-slate-950/90 text-white pl-10 pr-10 py-3 rounded-2xl border border-slate-800 ${loginMode === "subscriber" ? "focus:border-teal-500 focus:ring-teal-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20"} focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600 dark:text-slate-300`}'
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
