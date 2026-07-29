import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_logic = """
  const handleRegisterCustomer = (newCustomer: Customer) => {
    // Generate a new ID
    const customerToAdd = {
      ...newCustomer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    // If there is an offer, set price and GB accordingly, and assign distributor if applicable
    const offer = offers.find(o => o.id === customerToAdd.offerId);
    if (offer) {
      customerToAdd.subscriptionPrice = offer.price;
      customerToAdd.totalGB = offer.quotaGB;
      if (offer.distributorId) {
        customerToAdd.distributorId = offer.distributorId;
      }
    }

    const updated = [customerToAdd, ...customers];
    updateStateAndPersist(
      "customers", 
      updated, 
      setCustomers, 
      customerToAdd.username, 
      `تسجيل حساب مشترك جديد من البوابة: ${customerToAdd.username}`
    );
    addNotification("تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول للبوابة ودفع الاشتراك.", "success");
  };
"""

content = re.sub(r'  const handleRegisterCustomer = \(newCustomer: Customer\) => \{.*?    addNotification\("تم إنشاء حسابك بنجاح\. يمكنك الآن تسجيل الدخول للبوابة ودفع الاشتراك\.", "success"\);\n  \};', new_logic.strip(), content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
