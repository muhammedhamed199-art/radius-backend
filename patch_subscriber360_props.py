import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'initialTab?: "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions";',
    'initialTab?: "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions" | "special_offer";'
)
content = content.replace(
    '    "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions"',
    '    "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions" | "special_offer"'
)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
