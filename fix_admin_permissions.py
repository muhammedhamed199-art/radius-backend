import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
'''          onLoginSuccess({
            name: adminUser?.name || "المالك المسئول للنظام",
            role: adminUser?.role || "مالك النظام",
            username: adminUser?.username || "admin"
          });''',
'''          onLoginSuccess({
            name: adminUser?.name || "المالك المسئول للنظام",
            role: adminUser?.role || "مالك النظام",
            username: adminUser?.username || "admin",
            distributorId: undefined,
            permissions: undefined
          });'''
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
'''  const handleUpdateCurrentUser = (newUser: { id?: string; name: string; role: string; username: string; password?: string; distributorId?: string; permissions?: DistributorPermissions }) => {
    const updatedUser = { ...currentUser, ...newUser };''',
'''  const handleUpdateCurrentUser = (newUser: { id?: string; name: string; role: string; username: string; password?: string; distributorId?: string; permissions?: DistributorPermissions }) => {
    const updatedUser = { ...currentUser, ...newUser };
    if (!('distributorId' in newUser) || newUser.distributorId === undefined) {
      delete updatedUser.distributorId;
    }
    if (!('permissions' in newUser) || newUser.permissions === undefined) {
      delete updatedUser.permissions;
    }'''
)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)

