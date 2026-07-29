import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

target = """  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);"""

replacement = """  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
    if (isOpen && customer) {
      setSpecialOfferId(customer.temporaryOfferId || "");
      setSpecialOfferExpiry(customer.temporaryOfferExpiry || "");
    }
  }, [isOpen, initialTab, customer]);"""

content = content.replace(target, replacement)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
