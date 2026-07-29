import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# We need to find where the Engineer details card ends.
# It ends right before {/* Login Page External Branding & Settings Card */}

target = r"(            </div>\n          </div>)\n\n          \{\/\* Login Page External Branding"
replacement = r"\1\n          )}\n\n          {/* Login Page External Branding"

content = re.sub(target, replacement, content)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
