import re

with open('src/components/SubDistributorsView.tsx', 'r') as f:
    content = f.read()

target = """    onAddDistributor({
      name,
      role,
      username,
      password: password || "123456",
      phone,
      balance,
      currency: currency || defaultCurrency,
      customersCount: 0,
      salesCount: 0,
      permissions: newPermissions
    });"""

replacement = """    onAddDistributor({
      name,
      role,
      username,
      password: password || "123456",
      phone,
      balance,
      currency: currency || defaultCurrency,
      customersCount: 0,
      salesCount: 0,
      permissions: newPermissions,
      parentDistributorId
    });"""

content = content.replace(target, replacement)
content = content.replace("export default function SubDistributorsView({\n  parentDistributorId,\n  distributors,", "export default function SubDistributorsView({\n  distributors,")

with open('src/components/SubDistributorsView.tsx', 'w') as f:
    f.write(content)
