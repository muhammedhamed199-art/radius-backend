import re

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace the main container classes
content = re.sub(
    r'min-h-\[100dvh\] w-full bg-sky-50 dark:bg-slate-50 dark:bg-slate-950',
    r'min-h-[100dvh] w-full bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-zinc-950 to-black',
    content
)

# Change the orbs to strong aggressive colors (like Red/Orange/Amber or Cyan/Blue)
# Let's go with a powerful neon theme: Red/Violet/Cyan or Amber/Red
content = re.sub(r'bg-indigo-600/20', r'bg-rose-700/20', content)
content = re.sub(r'bg-purple-600/20', r'bg-amber-600/20', content)
content = re.sub(r'bg-emerald-500/10', r'bg-red-600/10', content)

# Also let's change the login card background to be a bit darker and more solid
content = re.sub(
    r'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl',
    r'bg-zinc-900/90 backdrop-blur-2xl border-zinc-800 shadow-2xl shadow-rose-900/20',
    content
)

# Fix text colors for the dark card
content = re.sub(r'text-slate-800 dark:text-white', r'text-white', content)
content = re.sub(r'text-slate-900 dark:text-white', r'text-white', content)
content = re.sub(r'text-slate-600 dark:text-slate-400', r'text-zinc-400', content)
content = re.sub(r'text-slate-500 dark:text-slate-400', r'text-zinc-500', content)
content = re.sub(r'bg-slate-50 dark:bg-slate-950', r'bg-zinc-950', content)
content = re.sub(r'border-slate-200 dark:border-slate-800', r'border-zinc-800', content)

with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
