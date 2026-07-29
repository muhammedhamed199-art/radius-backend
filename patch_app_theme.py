import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Change the main containers
content = re.sub(
    r'bg-sky-50 dark:bg-slate-950',
    r'bg-zinc-900 dark:bg-zinc-950',
    content
)
content = re.sub(
    r'bg-slate-50 dark:bg-slate-950',
    r'bg-zinc-900 dark:bg-zinc-950',
    content
)

# Make the sidebar powerful
content = re.sub(
    r'bg-white dark:bg-slate-900',
    r'bg-zinc-950 dark:bg-black',
    content
)

# Text colors for sidebar
content = re.sub(
    r'text-slate-700 dark:text-slate-300',
    r'text-zinc-300 dark:text-zinc-400',
    content
)

# Update the active sidebar item from indigo to a strong red or amber
# Example: text-indigo-400 -> text-rose-500, bg-indigo-600/10 -> bg-rose-500/10, border-indigo-600 -> border-rose-600
content = re.sub(r'text-indigo-400', r'text-rose-500', content)
content = re.sub(r'bg-indigo-600/10', r'bg-rose-500/10', content)
content = re.sub(r'border-indigo-600', r'border-rose-600', content)
content = re.sub(r'text-indigo-600', r'text-rose-600', content)
content = re.sub(r'bg-indigo-600', r'bg-rose-600', content)
content = re.sub(r'shadow-indigo-500/20', r'shadow-rose-600/20', content)

# Change hover backgrounds in sidebar
content = re.sub(
    r'hover:bg-slate-100 dark:hover:bg-slate-800',
    r'hover:bg-zinc-900 dark:hover:bg-zinc-900',
    content
)

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)
