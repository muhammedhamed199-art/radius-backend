import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace("  category?: CustomerCategory; // Customer category rating", "  category?: CustomerCategory; // Customer category rating\n  temporaryOfferId?: string;\n  temporaryOfferExpiry?: string;")

with open('src/types.ts', 'w') as f:
    f.write(content)
