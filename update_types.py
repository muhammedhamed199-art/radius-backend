with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace(
    '  macAddress?: string; // MAC address',
    '  macAddress?: string; // MAC address\n  paymentLink?: string; // Electronic payment link'
)

with open('src/types.ts', 'w') as f:
    f.write(content)
