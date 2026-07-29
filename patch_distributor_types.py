import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = """  permissions?: DistributorPermissions; // Custom granular permissions configured by Admin
}"""

replacement = """  permissions?: DistributorPermissions; // Custom granular permissions configured by Admin
  parentDistributorId?: string; // If this is a sub-distributor created by another distributor
}"""

content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)
