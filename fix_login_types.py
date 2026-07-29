import re

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Fix onLoginSuccess(UserRole.ADMIN, "مدير النظام", null);
content = content.replace(
    'onLoginSuccess(UserRole.ADMIN, "مدير النظام", null);',
    'onLoginSuccess({ role: UserRole.ADMIN, name: "مدير النظام", username: expectedAdminUsername });'
)

# Fix onLoginSuccess(UserRole.DISTRIBUTOR, distributorMatch.name, distributorMatch.id);
content = content.replace(
    'onLoginSuccess(UserRole.DISTRIBUTOR, distributorMatch.name, distributorMatch.id);',
    'onLoginSuccess({ role: UserRole.DISTRIBUTOR, name: distributorMatch.name, username: distributorMatch.username, id: distributorMatch.id });'
)

# Fix distributorMatch.status === "موقوف"
content = content.replace(
    'if (distributorMatch.status === "موقوف") {',
    'if (distributorMatch.subscriptionStatus === "منتهي") {'
)

with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

