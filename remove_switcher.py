import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Remove the "User Account Switcher in Sidebar" (Desktop)
pattern_desktop_switcher = r'\{settings\.showAccountSwitcher !== false && \(\s*<div className="p-3 mx-3 mt-3 bg-slate-800/80 border border-slate-700/60 rounded-xl space-y-1\.5">.*?</div>\s*\)\}'
content = re.sub(pattern_desktop_switcher, '', content, flags=re.DOTALL)

# 2. Remove the "User Account Switcher in Sidebar" (Mobile)
pattern_mobile_switcher = r'\{settings\.showAccountSwitcher !== false && \(\s*<div className="p-3 bg-slate-800/90 border border-slate-700 rounded-xl space-y-1">.*?</div>\s*\)\}'
content = re.sub(pattern_mobile_switcher, '', content, flags=re.DOTALL)

# 3. Remove the return to general manager block
pattern_return_admin = r'\{currentUser\.distributorId && \(\s*<div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">.*?</div>\s*\)\}'
content = re.sub(pattern_return_admin, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
