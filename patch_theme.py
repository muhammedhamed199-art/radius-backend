import re

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Default to dark mode in App.tsx
replace_in_file('src/App.tsx', 
    r'return stored === "true";\s*\}\s*return window\.matchMedia.*?;',
    r'return stored === "true";\n      }\n      return true;')

# Change body classes if any, we'll just let the class "dark" handle it on html.

# Let's change the login view background to be more powerful.
# From bg-sky-50 dark:bg-slate-950 to bg-zinc-950 dark:bg-zinc-950 etc.
