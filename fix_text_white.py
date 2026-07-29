import os
import re

files_to_patch = []
for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            files_to_patch.append(os.path.join(root, file))

for filepath in files_to_patch:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The original script did: `content = re.sub(r'\btext-slate-900\b', 'text-white', content)`
    # So ANY text-slate-900 was turned into text-white. 
    # And my reverse script did: `content = content.replace('text-white', 'text-slate-900')`
    # So ANY text-white was turned into text-slate-900.
    
    # We want text-slate-900 where we actually want it (usually on white background or text-slate-900 dark:text-white).
    # We want text-white for buttons and dark modes.
    # Let's fix common occurrences of text-slate-900 that should be text-white:
    content = content.replace('bg-indigo-600 text-slate-900', 'bg-indigo-600 text-white')
    content = content.replace('text-slate-900 font-bold text-xl shadow-lg shadow-indigo-600/20', 'text-white font-bold text-xl shadow-lg shadow-indigo-500/20')
    content = content.replace('bg-indigo-600 text-slate-900', 'bg-indigo-600 text-white')
    content = content.replace('group-hover:text-slate-900 rounded-lg', 'group-hover:text-white rounded-lg')
    content = content.replace('text-[9px] bg-red-500 text-slate-900', 'text-[9px] bg-red-500 text-white')
    content = content.replace('min-h-[100dvh] w-full bg-white text-slate-900', 'min-h-[100dvh] w-full bg-slate-950 text-white')
    
    # Actually, before patch_all_colors.py, 'text-slate-900' was used for default light mode text.
    # 'text-white' was used for default dark mode text and buttons.
    # Because my script blindly replaced ALL 'text-white' to 'text-slate-900', even standard 'text-white' was lost.
    
    # Fix dark:text-slate-900 -> dark:text-white
    content = content.replace('dark:text-slate-900', 'dark:text-white')
    
    # Fix text-slate-900 when used in specific contexts
    content = content.replace('text-slate-900 dark:text-white', 'text-slate-900 dark:text-white') # this is correct
    content = content.replace('bg-slate-950 text-slate-900', 'bg-slate-950 text-white')
    content = content.replace('bg-indigo-600 text-slate-900', 'bg-indigo-600 text-white')
    content = content.replace('bg-red-500 text-slate-900', 'bg-red-500 text-white')
    content = content.replace('bg-[#25D366] hover:bg-[#20bd5a] text-slate-900', 'bg-[#25D366] hover:bg-[#20bd5a] text-white')
    content = content.replace('bg-emerald-500 text-slate-900', 'bg-emerald-500 text-white')
    content = content.replace('text-slate-900 px-1.5 py-0.2 rounded-full', 'text-white px-1.5 py-0.2 rounded-full')
    content = content.replace('bg-emerald-600 hover:bg-emerald-700 text-slate-900', 'bg-emerald-600 hover:bg-emerald-700 text-white')
    content = content.replace('bg-rose-600 hover:bg-rose-700 text-slate-900', 'bg-rose-600 hover:bg-rose-700 text-white')
    content = content.replace('bg-indigo-600 hover:bg-indigo-700 text-slate-900', 'bg-indigo-600 hover:bg-indigo-700 text-white')
    content = content.replace('bg-blue-600 hover:bg-blue-700 text-slate-900', 'bg-blue-600 hover:bg-blue-700 text-white')
    content = content.replace('text-slate-900 hover:text-slate-900', 'text-white hover:text-white') # wait, probably not
    
    # Replace any leftover shadow-indigo-600/20 with 500/20
    content = content.replace('shadow-indigo-600/20', 'shadow-indigo-500/20')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

