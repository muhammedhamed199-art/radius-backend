import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """      { id: 9, name: t("navDistributors"), icon: UserCheck, perm: !isDistributorSession || hasPerm("canManageDistributors") },"""

replacement = """      { id: 9, name: t("navDistributors"), icon: UserCheck, perm: !isDistributorSession || hasPerm("canManageDistributors") },
      { id: 17, name: currentLang === "en" ? "Sub-Distributors" : "الموزعون الفرعيون", icon: UserCheck2, perm: isDistributorSession },"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
