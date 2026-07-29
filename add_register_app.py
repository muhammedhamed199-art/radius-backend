import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

register_handler = """
  const handleRegisterDistributor = (dist: Distributor) => {
    const updated = [dist, ...distributors];
    setDistributors(updated);
    saveToStorage("radius_distributors", updated);
    logAction("System", `تسجيل حساب موزع جديد: ${dist.username}`, "Register", dist.id);
    addNotification("تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول.", "success");
  };

  const handleLoginSuccess = (user: {
"""

content = content.replace("  const handleLoginSuccess = (user: {", register_handler)

login_props = """
      <LoginView
        distributors={displayDistributors}
        radiusName={settings.radiusName}
        settings={settings}
        adminUser={adminAccount}
        customers={customers}
        distributorOffers={distributorOffers}
        onRegisterDistributor={handleRegisterDistributor}
        onLoginSuccess={handleLoginSuccess}
"""
content = re.sub(r'<LoginView\n\s*distributors=\{displayDistributors\}\n\s*radiusName=\{settings\.radiusName\}\n\s*settings=\{settings\}\n\s*adminUser=\{adminAccount\}\n\s*customers=\{customers\}\n\s*onLoginSuccess=\{handleLoginSuccess\}', login_props.strip(), content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
