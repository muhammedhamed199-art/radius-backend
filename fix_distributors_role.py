import re

with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

# Remove handleRoleChangeForAdd entirely
content = re.sub(r'const handleRoleChangeForAdd = .*?};\n', '', content, flags=re.DOTALL)

# In handleAddDistributor, replace the role usage and permissions
content = re.sub(
    r'permissions: \(role === UserRole\.TECHNICAL_ADMIN \|\| role === UserRole\.ADMIN\) \n\s*\? getFullPermissionsObject\(\) \n\s*: newPermissions',
    'permissions: newPermissions',
    content
)

# Remove the role <select> in Add form
content = re.sub(
    r'<div>\s*<label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">نوع الرتبة / دور الحساب:</label>\s*<select.*?</select>\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

# Remove the Technical Admin Banner
content = re.sub(
    r'{role === UserRole\.TECHNICAL_ADMIN && \(.*?\)}\s*',
    '',
    content,
    flags=re.DOTALL
)

# Remove the role <select> in Edit Modal
content = re.sub(
    r'<div>\s*<label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">نوع الرتبة / دور الحساب:</label>\s*<select.*?</select>\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/DistributorsView.tsx', 'w') as f:
    f.write(content)
