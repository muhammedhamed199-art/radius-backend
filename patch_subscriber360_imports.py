import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

content = content.replace("  MessageSquare\n} from \"lucide-react\";", "  MessageSquare,\n  Sparkles\n} from \"lucide-react\";")

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
