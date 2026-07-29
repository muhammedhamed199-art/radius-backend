with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

content = content.replace('"eng_mohamed"', '"admin"')

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('"eng_mohamed"', '"admin"')
content = content.replace('م. محمد حامد', 'المالك المسئول للنظام')

with open('src/App.tsx', 'w') as f:
    f.write(content)
