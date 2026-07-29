import re

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    if i >= 433 and i <= 438:
        continue
    new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
