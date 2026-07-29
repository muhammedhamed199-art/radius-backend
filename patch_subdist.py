import re

with open('src/components/SubDistributorsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("DistributorsViewProps", "SubDistributorsViewProps")
content = content.replace("export default function DistributorsView({", "export default function SubDistributorsView({\n  parentDistributorId,")
content = content.replace("  onUpdateSettings\n}: SubDistributorsViewProps) {", "  onUpdateSettings,\n  parentDistributorId\n}: SubDistributorsViewProps & { parentDistributorId: string }) {")

# Remove some root admin specific tabs if any
# Just find where it says "إدارة الموزعين (Distributors)" and change it
content = content.replace("إدارة الموزعين (Distributors)", "الموزعون الفرعيون (Sub-Distributors)")

with open('src/components/SubDistributorsView.tsx', 'w') as f:
    f.write(content)
