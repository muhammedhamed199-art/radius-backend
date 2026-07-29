import sys

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'className="px-3.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"',
    'className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border-0 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-900/20"'
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
