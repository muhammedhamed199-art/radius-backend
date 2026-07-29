import re

with open('src/components/SubscriberFinancialsView.tsx', 'r') as f:
    content = f.read()

content = content.replace('} , MessageSquare, Clock } from "lucide-react";', ', MessageSquare, Clock } from "lucide-react";')
content = content.replace('import FinancialReportModal from "./FinancialReportModal";', 'import FinancialReportModal from "./FinancialReportModal";\nimport WhatsAppReminderModal from "./WhatsAppReminderModal";')

with open('src/components/SubscriberFinancialsView.tsx', 'w') as f:
    f.write(content)
