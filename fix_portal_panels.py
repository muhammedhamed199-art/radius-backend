import sys

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-white dark:bg-slate-900', 'bg-white dark:bg-slate-800/60')
# Wait, let's use teal colors for panels.
content = content.replace('bg-white dark:bg-slate-800/60', 'bg-teal-50/50 dark:bg-teal-900/20')

# Also any dark:bg-slate-800 inside this file should be dark:bg-teal-900/30
content = content.replace('dark:bg-slate-800', 'dark:bg-teal-900/40')

# any dark:border-slate-800 should be dark:border-teal-800/50
content = content.replace('dark:border-slate-800', 'dark:border-teal-800/50')

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)

