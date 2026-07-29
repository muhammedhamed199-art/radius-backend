with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''  const [adminAccount, setAdminAccount] = useState(() => {
    const saved = localStorage.getItem('adminAccount');
    if (saved) return JSON.parse(saved);''',
'''  const [adminAccount, setAdminAccount] = useState(() => {
    const saved = localStorage.getItem('adminAccount');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name === "م. محمد حامد") {
        parsed.name = "المالك المسئول للنظام";
        parsed.role = "مالك النظام";
        parsed.username = "admin";
        localStorage.setItem("adminAccount", JSON.stringify(parsed));
      }
      return parsed;
    }'''
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
