import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# Update interface
content = re.sub(
    r'currentUser: \{ name: string; role: string; username: string; password\?: string; permissions\?: any \};',
    r'currentUser: { name: string; role: string; username: string; password?: string; permissions?: any; distributorId?: string };',
    content
)

# Replace the condition logic
content = re.sub(
    r'\(currentUser\.role === \'المدير التقني\' \|\| currentUser\.role === \'admin\' \|\| currentUser\.role === \'مدير\' \|\| currentUser\.role === \'مدير تقني\'\)',
    r'(!currentUser.distributorId)',
    content
)

# And for the remaining 'admin' checks if any
content = content.replace("currentUser.role === 'admin'", "(!currentUser.distributorId)")
content = content.replace("currentUser.role === 'المدير التقني'", "(!currentUser.distributorId)")


with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
