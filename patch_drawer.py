import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add absolute right-0 to the mobile drawer to explicitly position it on the right
drawer_regex = r'(<div className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80 max-w-\[85vw\] h-full shadow-2xl p-4 flex flex-col justify-between">)'
replacement = r'<div className="absolute right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80 max-w-[85vw] h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right-10">'

if re.search(drawer_regex, content):
    content = re.sub(drawer_regex, replacement, content)
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched mobile drawer to be explicitly on the right.")
else:
    print("Could not find drawer regex.")
