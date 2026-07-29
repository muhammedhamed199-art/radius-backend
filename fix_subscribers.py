import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

# Fix CustomerStatus comparisons
content = content.replace('customer.status === 0', 'customer.status === CustomerStatus.ACTIVE')
content = content.replace('customer.status === 1', 'customer.status === CustomerStatus.EXPIRED')

# Fix ConnectionType comparisons
content = content.replace('customer.connectionType === "PPPoE"', 'customer.connectionType === ConnectionType.PPPOE')

# Fix quotaGB to limitGB
content = content.replace('offer.quotaGB', 'offer.limitGB')

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
