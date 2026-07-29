import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logic = """  // Active user role & permissions helper
  const isRootAdmin = !currentUser.distributorId;
  const isTechnicalAdmin = isRootAdmin || currentUser.role === "مالك النظام" || currentUser.role === "مدير تقني" || currentUser.role === UserRole.TECHNICAL_ADMIN;
  const isAdmin = isRootAdmin || isTechnicalAdmin || currentUser.role === "مدير عام" || currentUser.role === "مدير" || currentUser.role === UserRole.ADMIN;
  const isDistributorSession = !!currentUser.distributorId;"""

new_logic = """  // Active user role & permissions helper
  const isActualAdmin = currentUser.username === "admin" || currentUser.role === "مالك النظام";
  const isRootAdmin = isActualAdmin || !currentUser.distributorId;
  const isTechnicalAdmin = isRootAdmin || currentUser.role === "مدير تقني" || currentUser.role === UserRole.TECHNICAL_ADMIN;
  const isAdmin = isRootAdmin || isTechnicalAdmin || currentUser.role === "مدير عام" || currentUser.role === "مدير" || currentUser.role === UserRole.ADMIN;
  const isDistributorSession = !isActualAdmin && !!currentUser.distributorId;"""

content = content.replace(old_logic, new_logic)

with open('src/App.tsx', 'w') as f:
    f.write(content)
