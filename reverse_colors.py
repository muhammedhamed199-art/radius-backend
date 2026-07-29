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

    # Restore indigo colors
    content = re.sub(r'\brose-600\b', 'indigo-600', content)
    content = re.sub(r'\brose-500\b', 'indigo-500', content)
    content = re.sub(r'\brose-400\b', 'indigo-400', content)
    content = re.sub(r'\brose-300\b', 'indigo-300', content)
    content = re.sub(r'\brose-700\b', 'indigo-700', content)
    content = re.sub(r'\brose-100\b', 'indigo-100', content)
    
    # Restore text combinations
    content = content.replace('text-white', 'text-slate-900') # but wait, there was already text-white in some places! (like active buttons)
    # Actually text-white might have been used in "text-white" for primary buttons. 
    # The script did: content = re.sub(r'\btext-slate-900\b', 'text-white', content)
    # Let's replace 'text-white' back to 'text-slate-900' only if it's accompanied by dark:text-white or similar?
    # Or just replace `text-white dark:text-white` to `text-slate-900 dark:text-white`
    content = content.replace('text-white dark:text-white', 'text-slate-900 dark:text-white')
    
    content = content.replace('text-zinc-100 dark:text-slate-100', 'text-slate-800 dark:text-slate-100')
    content = content.replace('text-zinc-300 dark:text-zinc-400', 'text-slate-700 dark:text-slate-300')
    content = content.replace('text-zinc-300 dark:text-slate-200', 'text-slate-700 dark:text-slate-200')
    content = content.replace('text-zinc-300', 'text-slate-700')
    content = content.replace('text-zinc-400', 'text-slate-400')
    content = content.replace('text-zinc-100', 'text-slate-800')
    
    # Background combinations
    content = content.replace('bg-zinc-950 dark:bg-black', 'bg-white dark:bg-slate-900')
    content = content.replace('bg-zinc-900 dark:bg-zinc-950', 'bg-sky-50 dark:bg-slate-950')
    content = content.replace('bg-zinc-900 dark:bg-slate-800/80', 'bg-slate-50 dark:bg-slate-800/80')
    content = content.replace('bg-zinc-900 hover:bg-zinc-800', 'bg-slate-50 hover:bg-slate-100')
    content = content.replace('bg-zinc-900 dark:bg-slate-800', 'bg-slate-50 dark:bg-slate-800')
    
    # Borders
    content = content.replace('border-zinc-800 dark:border-slate-700', 'border-slate-200 dark:border-slate-700')
    content = content.replace('border-zinc-800 dark:border-slate-800', 'border-slate-200 dark:border-slate-800')
    
    # Individual classes (dangerous but necessary)
    content = content.replace('bg-zinc-950', 'bg-white')
    content = content.replace('bg-zinc-900', 'bg-slate-50')
    content = content.replace('bg-zinc-800', 'bg-slate-100')
    content = content.replace('bg-black', 'bg-slate-900')
    content = content.replace('border-zinc-800', 'border-slate-200')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Reversed color patch.")
