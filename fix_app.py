import sys
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Add loggedInCustomerId state
content = content.replace(
    'const [isPortalMode, setIsPortalMode] = useState<boolean>(false);',
    'const [isPortalMode, setIsPortalMode] = useState<boolean>(false);\n  const [loggedInCustomerId, setLoggedInCustomerId] = useState<string>("");'
)

# Modify portalCustomers logic
old_logic = 'const portalCustomers = activePortalDistributorId ? customers.filter(c => c.distributorId === activePortalDistributorId) : customers;'
new_logic = 'const portalCustomers = loggedInCustomerId ? customers.filter(c => c.id === loggedInCustomerId) : (activePortalDistributorId ? customers.filter(c => c.distributorId === activePortalDistributorId) : customers);'
content = content.replace(old_logic, new_logic)

# Clear loggedInCustomerId on logout
old_logout = 'setActivePortalDistributorId("");'
new_logout = 'setActivePortalDistributorId("");\n                    setLoggedInCustomerId("");'
content = content.replace(old_logout, new_logout)

# Update LoginView props
old_loginview = """      <LoginView
        distributors={displayDistributors}
        radiusName={settings.radiusName}
        settings={settings}
        adminUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onOpenSubscriberPortal={() => {
          setIsPortalMode(true);
          // Set to URL to make it copyable if needed
          window.history.pushState({}, '', '?portal=true');
        }}
        currentLang={currentLang}
        onToggleLanguage={handleToggleLanguage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />"""

new_loginview = """      <LoginView
        distributors={displayDistributors}
        radiusName={settings.radiusName}
        settings={settings}
        adminUser={currentUser}
        customers={customers}
        onLoginSuccess={handleLoginSuccess}
        onOpenSubscriberPortal={() => {
          setIsPortalMode(true);
          window.history.pushState({}, '', '?portal=true');
        }}
        onSubscriberLoginSuccess={(customer) => {
          setLoggedInCustomerId(customer.id);
          setIsPortalMode(true);
          window.history.pushState({}, '', '?portal=true');
        }}
        currentLang={currentLang}
        onToggleLanguage={handleToggleLanguage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />"""
content = content.replace(old_loginview, new_loginview)

with open('src/App.tsx', 'w') as f:
    f.write(content)
