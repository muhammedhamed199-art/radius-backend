import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = r"  const handleUpdateCurrentUser = \(newUser: \{ id\?: string; name: string; role: string; username: string; password\?: string; distributorId\?: string; permissions\?: DistributorPermissions \}\) => \{.*?  \};"

replacement = """  const handleUpdateCurrentUser = (newUser: { id?: string; name: string; role: string; username: string; password?: string; distributorId?: string; permissions?: DistributorPermissions }) => {
    const updatedUser = { ...currentUser, ...newUser };
    setCurrentUser(updatedUser);
    localStorage.setItem("radius_current_user", JSON.stringify(updatedUser));

    if (!updatedUser.distributorId) {
      setAdminAccount(updatedUser);
      localStorage.setItem("adminAccount", JSON.stringify(updatedUser));
    } else {
      setDistributors(prev => {
        const matchIndex = prev.findIndex(d => d?.id === updatedUser.distributorId);
        if (matchIndex !== -1) {
          const updated = [...prev];
          updated[matchIndex] = {
            ...updated[matchIndex],
            name: updatedUser.name,
            username: updatedUser.username,
            password: updatedUser.password || updated[matchIndex].password
          };
          localStorage.setItem("radius_distributors", JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  };"""

content = re.sub(target, replacement, content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
