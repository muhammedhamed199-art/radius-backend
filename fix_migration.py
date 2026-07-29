with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'if (parsed.name === "م. محمد علي") {',
    'if (parsed.name === "م. محمد علي" || parsed.name === "م. محمد حامد") {\n        parsed.role = "مالك النظام";\n        parsed.username = "admin";'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
