import re

# 1. Update App.tsx
with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
'''    return {
      name: "م. محمد حامد",
      role: "المدير التقني",
      username: "eng_mohamed",
      password: "admin"
    };''',
'''    return {
      name: "المالك المسئول للنظام",
      role: "مالك النظام",
      username: "admin",
      password: "admin"
    };'''
)

app_content = app_content.replace(
'''      name: "م. محمد حامد",
      role: "المدير التقني",
      username: "eng_mohamed"''',
'''      name: "المالك المسئول للنظام",
      role: "مالك النظام",
      username: "admin"'''
)
app_content = app_content.replace('تم العودة لحساب المدير التقني بكامل الصلاحيات.', 'تم العودة لحساب المالك بكامل الصلاحيات.')


with open('src/App.tsx', 'w') as f:
    f.write(app_content)

# 2. Update LoginView.tsx
with open('src/components/LoginView.tsx', 'r') as f:
    login_content = f.read()

# Replace hardcoded name/role
login_content = login_content.replace(
'''          onLoginSuccess({
            name: adminUser?.name || "م. محمد حامد",
            role: adminUser?.role || "المدير التقني",
            username: adminUser?.username || "eng_mohamed"
          });''',
'''          onLoginSuccess({
            name: adminUser?.name || "المالك المسئول للنظام",
            role: adminUser?.role || "مالك النظام",
            username: adminUser?.username || "admin"
          });'''
)
login_content = login_content.replace('كلمة المرور غير صحيحة لحساب المدير التقني.', 'كلمة المرور غير صحيحة لحساب المالك.')

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(login_content)
