import os

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Make the card slightly darker to match the screenshot better
content = content.replace("bg-[#121214]", "bg-[#111113]")
# Make the inputs fully black or very dark
content = content.replace("bg-[#09090b]", "bg-[#0a0a0c]")
content = content.replace("bg-[#27272a]", "bg-[#27272a]")

# Icon size in logo
content = content.replace("w-16 h-16 rounded-[1.25rem]", "w-20 h-20 rounded-[1.75rem]")
content = content.replace("<Signal className=\"w-8 h-8 text-white\" />", "<Signal className=\"w-10 h-10 text-white\" />")
content = content.replace("BarChart3", "Signal")

with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

