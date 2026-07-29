import re

with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

# Extract from export const PERMISSION_GROUPS to export const getTotalPermissionsCount
pattern = r'(export const PERMISSION_GROUPS = \[.*?export const getTotalPermissionsCount = \(\): number => \{\n  return PERMISSION_GROUPS.reduce\(\(acc, g\) => acc \+ g.permissions.length, 0\);\n\};)'
match = re.search(pattern, content, re.DOTALL)

if match:
    extracted = match.group(1)
    # Remove from DistributorsView
    content = content.replace(extracted, '')
    
    # Write to src/utils/permissions.ts
    with open('src/utils/permissions.ts', 'w') as f2:
        f2.write('import { ShieldCheck, Server, Key, Radio, Terminal } from "lucide-react";\n')
        f2.write('import { DistributorPermissions } from "../types";\n\n')
        f2.write(extracted)
        f2.write('\n')

    # Add imports to DistributorsView
    import_statement = 'import { PERMISSION_GROUPS, getFullPermissionsObject, getDefaultDistributorPermissions, getEnabledCount, getTotalPermissionsCount } from "../utils/permissions";\n'
    content = content.replace('import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer } from "../types";\n', 'import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer } from "../types";\n' + import_statement)

    with open('src/components/DistributorsView.tsx', 'w') as f:
        f.write(content)
    print("Extraction successful.")
else:
    print("Could not find the permissions block.")

