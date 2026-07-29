import re

with open("src/components/NasServersView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make the Actions th sticky left
content = content.replace(
    '<th className="px-2 py-3 text-xs md:text-sm text-center w-40">الإجراءات والتحكم</th>',
    '<th className="px-2 py-3 text-xs md:text-sm text-center w-40 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">الإجراءات والتحكم</th>'
)

# Make the Actions td sticky left (this matches the exact td for Actions in NasServersView)
content = content.replace(
    '<td className="px-2 py-3 text-xs md:text-sm text-center">',
    '<td className="px-2 py-3 text-xs md:text-sm text-center sticky left-0 bg-inherit z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">'
)

with open("src/components/NasServersView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
print("patched NasServersView")
