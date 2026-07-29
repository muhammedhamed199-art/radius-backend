import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Replace loginMode state
content = content.replace('useState<"admin" | "subscriber" | "register">("admin")', 'useState<"admin" | "subscriber" | "register" | "register_subscriber">("admin")')

# Replace destructuring
content = content.replace('onRegisterDistributor\n}: LoginViewProps) {', 'onRegisterDistributor,\n  offers = [],\n  onRegisterCustomer\n}: LoginViewProps) {')

register_handler_new = """
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!regName.trim() || !regUsername.trim() || !regPassword.trim()) {
      setErrorMessage("يرجى تعبئة الحقول الإلزامية.");
      return;
    }
    
    // Check if username exists
    const cleanUser = regUsername.trim().toLowerCase();
    
    if (loginMode === "register_subscriber") {
      if (customers.some(c => (c.username || "").toLowerCase() === cleanUser)) {
        setErrorMessage("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
        return;
      }
    } else {
      const adminUserLower = (adminUser?.username || "admin").toLowerCase();
      if (cleanUser === adminUserLower || distributors.some(d => d.username.toLowerCase() === cleanUser)) {
        setErrorMessage("اسم المستخدم محجوز، يرجى اختيار اسم آخر.");
        return;
      }
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (loginMode === "register_subscriber") {
        if (onRegisterCustomer) {
          onRegisterCustomer({
            id: "cust_" + Date.now(),
            name: regName.trim(),
            username: regUsername.trim(),
            password: regPassword.trim(),
            phone: regPhone.trim(),
            status: "منتهي", // Not active yet until they pay
            connectionType: "PPPoE",
            ipAddress: "Dynamic",
            concurrentLogins: 0,
            maxConcurrentLogins: 1,
            offerId: regOfferId || offers[0]?.id || "",
            consumptionGB: 0,
            expiryDate: new Date().toISOString().split('T')[0],
            balance: 0,
            debt: 0
          });
        }
        setLoginMode("subscriber");
      } else {
        if (onRegisterDistributor) {
          onRegisterDistributor({
            id: "dist_" + Date.now(),
            name: regName.trim(),
            username: regUsername.trim(),
            password: regPassword.trim(),
            phone: regPhone.trim(),
            role: "موزع معتمد",
            balance: 0,
            debt: 0,
            customersCount: 0,
            salesCount: 0,
            subscriptionOfferId: regOfferId || undefined,
            subscriptionStatus: regOfferId ? "منتهي" : "نشط",
            permissions: {
               canManageSubscribers: true,
               canManageCards: true,
               canViewStats: true,
               canViewSupport: true
            }
          });
        }
        setLoginMode("admin");
      }
      
      setIsLoading(false);
      setErrorMessage(null);
      setUsername(regUsername.trim());
      setPassword(regPassword.trim());
    }, 800);
  };
"""

content = re.sub(r'  const handleRegister = \(e: React\.FormEvent\) => \{.*?    \}, 800\);\n  \};', register_handler_new.strip(), content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
