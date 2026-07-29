import re

with open("src/App.tsx", "r") as f:
    content = f.read()

dropdown_replacement = """              {["USD", "LYD", "EGP", "SYP", "SAR", "AED", "IQD", "JOD"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}"""

content = re.sub(
    r"\{\[\]\.map\(c\s*=>\s*\(\s*<option key=\{c\.code\} value=\{c\.code\}>\{c\.code\} - \{c\.symbol\}</option>\s*\)\)\}",
    dropdown_replacement,
    content
)

with open("src/App.tsx", "w") as f:
    f.write(content)

