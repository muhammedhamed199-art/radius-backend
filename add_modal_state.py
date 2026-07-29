import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

state_code = """
  // Payment confirmation modal
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState<boolean>(false);
"""

content = content.replace(
    '  // Quick Support Ticket Modal',
    state_code + '  // Quick Support Ticket Modal'
)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
