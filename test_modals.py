import re
with open('src/components/NasServersView.tsx', 'r') as f:
    content = f.read()
print("Number of Modals:", content.count("fixed inset-0 z-50 flex items-center justify-center"))
