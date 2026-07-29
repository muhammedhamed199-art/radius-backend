import re

with open('src/components/SubscriberFinancialsView.tsx', 'r') as f:
    content = f.read()

content = content.replace("from \"lucide-react\";", ", MessageSquare, Clock } from \"lucide-react\";")

with open('src/components/SubscriberFinancialsView.tsx', 'w') as f:
    f.write(content)
