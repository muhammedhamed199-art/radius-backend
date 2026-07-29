import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add adminAccount state
state_inject = """  const [isPortalMode, setIsPortalMode] = useState<boolean>(false);
  
  const [adminAccount, setAdminAccount] = useState(() => {
    const saved = localStorage.getItem('adminAccount');
    if (saved) return JSON.parse(saved);
    return {
      name: "م. محمد حامد",
      role: "المدير التقني",
      username: "eng_mohamed",
      password: "admin"
    };
  });"""

content = content.replace("  const [isPortalMode, setIsPortalMode] = useState<boolean>(false);", state_inject)

# Update handleUpdateCurrentUser to also save adminAccount if it's not a distributor session
handle_update_inject = """  const handleUpdateCurrentUser = (newUser: { id?: string; name: string; role: string; username: string; password?: string; distributorId?: string; permissions?: DistributorPermissions }) => {
    const updated = { ...currentUser, ...newUser };
    setCurrentUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
    
    // If we are updating the main admin account (not impersonating a distributor)
    if (!updated.distributorId) {
      setAdminAccount(updated);
      localStorage.setItem('adminAccount', JSON.stringify(updated));
    }
  };"""

content = re.sub(
    r'  const handleUpdateCurrentUser = \([^)]+\) => \{\n    const updated = \{ \.\.\.currentUser, \.\.\.newUser \};\n    setCurrentUser\(updated\);\n    localStorage\.setItem\(\'currentUser\', JSON\.stringify\(updated\)\);\n  \};',
    handle_update_inject,
    content
)

# Update the account switcher logic for 'admin'
switch_logic = """              if (val === "admin") {
                handleUpdateCurrentUser({
                  name: adminAccount.name,
                  role: adminAccount.role,
                  username: adminAccount.username,
                  password: adminAccount.password,
                  distributorId: undefined,
                  permissions: undefined
                });
                addNotification("تم العودة لحساب المدير التقني بكامل الصلاحيات.", "success");
              } else {"""

content = re.sub(
    r'              if \(val === "admin"\) \{\n                handleUpdateCurrentUser\(\{\n                  name: "م\. محمد حامد",\n                  role: "المدير التقني",\n                  username: "eng_mohamed"\n                \}\);\n                addNotification\("تم العودة لحساب المدير التقني بكامل الصلاحيات\.", "success"\);\n              \} else \{',
    switch_logic,
    content
)

# Also update the mobile switcher
mobile_switch_logic = """                    if (val === "admin") {
                      handleUpdateCurrentUser({
                        name: adminAccount.name,
                        role: adminAccount.role,
                        username: adminAccount.username,
                        password: adminAccount.password,
                        distributorId: undefined,
                        permissions: undefined
                      });
                    } else {"""

content = re.sub(
    r'                    if \(val === "admin"\) \{\n                      handleUpdateCurrentUser\(\{\n                        name: "م\. محمد حامد",\n                        role: "المدير التقني",\n                        username: "eng_mohamed"\n                      \}\);\n                    \} else \{',
    mobile_switch_logic,
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
