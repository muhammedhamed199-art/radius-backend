import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace('<option value="admin">👑 المدير التقني (كامل الصلاحيات)</option>', '<option value="admin">👑 {adminAccount.name} ({adminAccount.role})</option>')
content = content.replace('<option value="admin">👑 المدير التقني</option>', '<option value="admin">👑 {adminAccount.name} ({adminAccount.role})</option>')

with open('src/App.tsx', 'w') as f:
    f.write(content)
