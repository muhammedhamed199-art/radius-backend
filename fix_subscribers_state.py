import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  const [addDistributorId, setAddDistributorId] = useState("");',
    '  const [addMaxConcurrentLogins, setAddMaxConcurrentLogins] = useState(1);\n  const [addDistributorId, setAddDistributorId] = useState("");'
)

content = content.replace(
    '  const [editDistributorId, setEditDistributorId] = useState("");',
    '  const [editMaxConcurrentLogins, setEditMaxConcurrentLogins] = useState(1);\n  const [editDistributorId, setEditDistributorId] = useState("");'
)

content = content.replace(
    '      setEditConcurrentLogins(editingCustomer.concurrentLogins);',
    '      setEditConcurrentLogins(editingCustomer.concurrentLogins);\n      setEditMaxConcurrentLogins(editingCustomer.maxConcurrentLogins || 1);'
)

content = content.replace(
    '      concurrentLogins: 0,',
    '      concurrentLogins: 0,\n      maxConcurrentLogins: addMaxConcurrentLogins,'
)

content = content.replace(
    '      concurrentLogins: editConcurrentLogins,',
    '      concurrentLogins: editConcurrentLogins,\n      maxConcurrentLogins: editMaxConcurrentLogins,'
)

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
