import re

with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

# Remove the role <select> in Edit Modal
content = re.sub(
    r'<div>\s*<label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">نوع الرتبة وحجم الصلاحيات:</label>\s*<select.*?</select>\s*</div>',
    '',
    content,
    flags=re.DOTALL
)

with open('src/components/DistributorsView.tsx', 'w') as f:
    f.write(content)
