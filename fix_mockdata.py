import re

with open('src/mockData.ts', 'r') as f:
    content = f.read()

# I will just change d3 to a normal distributor called 'شركة الاتصالات المحلية' or something
content = content.replace('م. محمد حامد (المدير التقني)', 'خالد عبدالله (موزع)')
content = content.replace('UserRole.TECHNICAL_ADMIN', 'UserRole.DISTRIBUTOR')
content = content.replace('eng_mohamed', 'khaled_dist')

with open('src/mockData.ts', 'w') as f:
    f.write(content)

