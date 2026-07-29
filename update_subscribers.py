import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

# 1. Add phone to Edit Modal state
if 'const [editPhone, setEditPhone] = useState("");' not in content:
    content = content.replace('const [editName, setEditName] = useState("");', 'const [editName, setEditName] = useState("");\n  const [editPhone, setEditPhone] = useState("");')

# sync edit phone
content = content.replace('setEditName(editingCustomer.name);', 'setEditName(editingCustomer.name);\n      setEditPhone(editingCustomer.phone || "");')

# edit submit logic
# onUpdateCustomer({ ...editingCustomer, name: editName, ... phone: editPhone })
content = re.sub(
    r'onUpdateCustomer\(\{\n\s*\.\.\.editingCustomer,\n\s*name: editName,',
    'onUpdateCustomer({\n      ...editingCustomer,\n      name: editName,\n      phone: editPhone,',
    content
)

# 2. Add phone input to Edit Modal UI
phone_input = """                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">رقم الهاتف</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>"""
content = content.replace(
    '<div>\n                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المنطقة / العنوان</label>',
    phone_input + '\n                <div>\n                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">المنطقة / العنوان</label>'
)


with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)

