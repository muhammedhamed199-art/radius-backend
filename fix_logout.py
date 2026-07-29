with open('src/App.tsx', 'r') as f:
    content = f.read()

old_logout = """  const handleLogout = () => {
    logAction(
      currentUser?.username || "user",
      currentUser?.name || "مستخدم",
      `تسجيل خروج من النظام وتنظيف بيانات الجلسة.`
    );

    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("Error clearing storage on logout:", e);
    }"""

new_logout = """  const handleLogout = async () => {
    logAction(
      currentUser?.username || "user",
      currentUser?.name || "مستخدم",
      `تسجيل خروج من النظام وتنظيف بيانات الجلسة.`
    );

    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (err) {
      console.warn("Backend logout failed:", err);
    }

    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn("Error clearing storage on logout:", e);
    }"""

content = content.replace(old_logout, new_logout)

with open('src/App.tsx', 'w') as f:
    f.write(content)
