import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

target = """  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  if (!isOpen || !customer) return null;"""

replacement = """  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Special Offer State
  const [specialOfferId, setSpecialOfferId] = useState<string>("");
  const [specialOfferExpiry, setSpecialOfferExpiry] = useState<string>("");

  if (!isOpen || !customer) return null;"""

content = content.replace(target, replacement)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
