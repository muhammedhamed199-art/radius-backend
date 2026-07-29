import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

role_logic = """  // Active user role & permissions helper
  const isRootAdmin = !currentUser.distributorId;
  const isTechnicalAdmin = isRootAdmin || currentUser.role === "المدير التقني" || currentUser.role === "مدير تقني" || currentUser.role === UserRole.TECHNICAL_ADMIN;
  const isAdmin = isRootAdmin || isTechnicalAdmin || currentUser.role === "مدير عام" || currentUser.role === "مدير" || currentUser.role === UserRole.ADMIN;
  const isDistributorSession = !!currentUser.distributorId;"""

content = re.sub(
    r'  // Active user role & permissions helper\n  const isTechnicalAdmin = [^\n]+\n  const isAdmin = [^\n]+\n  const isDistributorSession = [^\n]+',
    role_logic,
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
