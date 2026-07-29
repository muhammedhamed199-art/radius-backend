import re

with open('src/components/OffersView.tsx', 'r') as f:
    content = f.read()

content = content.replace("  Percent,", "  Percent,\n  Shield,")

with open('src/components/OffersView.tsx', 'w') as f:
    f.write(content)
