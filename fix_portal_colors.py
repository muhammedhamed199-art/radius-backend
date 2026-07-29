import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-emerald-50 dark:from-slate-950 dark:via-teal-950/20 dark:to-emerald-950/30',
    'min-h-screen bg-teal-50 dark:bg-teal-950'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800',
    'bg-gradient-to-r from-teal-700 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-600'
)
content = content.replace(
    'bg-teal-500/10',
    'bg-teal-400/20'
)
content = content.replace(
    'bg-emerald-500/10',
    'bg-emerald-400/20'
)
content = content.replace(
    'border-teal-500/30',
    'border-white/30'
)
content = content.replace(
    'bg-teal-500/20 text-teal-300',
    'bg-white/20 text-white'
)
content = content.replace(
    'text-slate-300',
    'text-teal-50'
)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
