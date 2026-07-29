import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

target = "currentUser.role === 'admin'"
replacement = "(currentUser.role === 'المدير التقني' || currentUser.role === 'admin' || currentUser.role === 'مدير' || currentUser.role === 'مدير تقني')"
content = content.replace(target, replacement)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
