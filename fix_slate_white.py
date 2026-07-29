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

    # Dark background headers
    content = content.replace('bg-slate-900 text-slate-900', 'bg-slate-900 text-white')
    content = content.replace('bg-slate-800 text-slate-900', 'bg-slate-800 text-white')
    content = content.replace('bg-blue-600 text-slate-900', 'bg-blue-600 text-white')
    content = content.replace('bg-amber-600 text-slate-900', 'bg-amber-600 text-white')
    content = content.replace('bg-emerald-600 text-slate-900', 'bg-emerald-600 text-white')
    content = content.replace('bg-indigo-600 text-slate-900', 'bg-indigo-600 text-white')
    content = content.replace('bg-indigo-500 text-slate-900', 'bg-indigo-500 text-white')
    content = content.replace('bg-rose-600 text-slate-900', 'bg-rose-600 text-white')
    content = content.replace('bg-red-600 text-slate-900', 'bg-red-600 text-white')
    content = content.replace('text-slate-400 hover:text-slate-900 hover:bg-slate-800', 'text-slate-400 hover:text-white hover:bg-slate-800')
    content = content.replace('from-slate-900 to-indigo-950 p-8 rounded-3xl text-slate-900', 'from-slate-900 to-indigo-950 p-8 rounded-3xl text-white')
    content = content.replace('from-slate-900 via-slate-800 to-indigo-950 text-slate-900', 'from-slate-900 via-slate-800 to-indigo-950 text-white')
    
    # Check for text-slate-900 that should be text-white when inside dark bg
    content = re.sub(r'bg-indigo-600([^>]+)text-slate-900', r'bg-indigo-600\1text-white', content)
    content = re.sub(r'bg-slate-800([^>]+)text-slate-900', r'bg-slate-800\1text-white', content)

    # Revert LoginView theme
    # The user wanted to improve the shapes, colors, and fonts on the login page specifically.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

