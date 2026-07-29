import re

with open('src/types.ts', 'r') as f:
    content = f.read()

content = content.replace(
    '  concurrentLogins: number;',
    '  concurrentLogins: number;\n  maxConcurrentLogins?: number;'
)

with open('src/types.ts', 'w') as f:
    f.write(content)
