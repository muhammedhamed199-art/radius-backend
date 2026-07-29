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

    # Replace indigo with rose
    content = re.sub(r'\bindigo-600\b', 'rose-600', content)
    content = re.sub(r'\bindigo-500\b', 'rose-500', content)
    content = re.sub(r'\bindigo-400\b', 'rose-400', content)
    content = re.sub(r'\bindigo-300\b', 'rose-300', content)
    content = re.sub(r'\bindigo-700\b', 'rose-700', content)
    content = re.sub(r'\bindigo-100\b', 'rose-100', content)
    
    # Replace sky-50 with zinc-900 (for powerful dark mode defaults)
    content = re.sub(r'\bsky-50\b', 'zinc-950', content)
    
    # Give it a bit of a darker slate/zinc tone
    content = re.sub(r'\bbg-white\b', 'bg-zinc-950', content)
    content = re.sub(r'\bbg-slate-50\b', 'bg-zinc-900', content)
    content = re.sub(r'\bbg-slate-100\b', 'bg-zinc-800', content)
    content = re.sub(r'\bbg-slate-900\b', 'bg-black', content)
    content = re.sub(r'\bbg-slate-950\b', 'bg-zinc-950', content)
    
    # Darken borders
    content = re.sub(r'\bborder-slate-200\b', 'border-zinc-800', content)
    content = re.sub(r'\bborder-slate-100\b', 'border-zinc-800', content)
    
    # Ensure text is readable on dark
    content = re.sub(r'\btext-slate-900\b', 'text-white', content)
    content = re.sub(r'\btext-slate-800\b', 'text-zinc-100', content)
    content = re.sub(r'\btext-slate-700\b', 'text-zinc-300', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Color patch applied across all files.")
