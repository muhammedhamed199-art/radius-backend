import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

content = content.replace("}) => void;", "}, forcePaymentPage?: boolean) => void;")
with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

app_login = """
  const handleLoginSuccess = (user: {
    id?: string;
    name: string;
    role: string;
    username: string;
    distributorId?: string;
    permissions?: DistributorPermissions;
  }, forcePaymentPage?: boolean) => {
    handleUpdateCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("radius_is_logged_in", "true");
    logAction(
      user.username,
      user.name,
      `تسجيل دخول ناجح إلى منصة الإدارة المركزية (${user.role}).`
    );
    addNotification(`أهلاً وسهلاً بك (${user.name}) - تم تسجيل الدخول بنجاح!`, "success");
    
    if (forcePaymentPage) {
      setTimeout(() => {
        setActivePage(15);
      }, 100);
    } else {
      setTimeout(() => {
        setActivePage(0);
      }, 100);
    }
  };
"""

content = re.sub(r'const handleLoginSuccess = \(user: \{.*?\) => \{.*?addNotification\(`أهلاً وسهلاً بك \(\$\{user\.name\}\) - تم تسجيل الدخول بنجاح!`, "success"\);\n  \};', app_login.strip(), content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
