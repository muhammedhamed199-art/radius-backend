import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

register_customer_handler = """
  const handleRegisterCustomer = (newCustomer: Customer) => {
    // Generate a new ID
    const customerToAdd = {
      ...newCustomer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
    };

    // If there is an offer, set price and GB accordingly
    const offer = offers.find(o => o.id === customerToAdd.offerId);
    if (offer) {
      customerToAdd.subscriptionPrice = offer.price;
      customerToAdd.totalGB = offer.quotaGB;
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

  const handleRegisterDistributor = (dist: Distributor) => {
"""

content = content.replace("  const handleRegisterDistributor = (dist: Distributor) => {", register_customer_handler)


# Also add offers and onRegisterCustomer to LoginView props
login_props = """
      <LoginView
        distributors={displayDistributors}
        radiusName={settings.radiusName}
        settings={settings}
        adminUser={adminAccount}
        customers={customers}
        distributorOffers={distributorOffers}
        offers={offers}
        onRegisterDistributor={handleRegisterDistributor}
        onRegisterCustomer={handleRegisterCustomer}
        onLoginSuccess={handleLoginSuccess}
"""
content = re.sub(r'<LoginView\n\s*distributors=\{displayDistributors\}\n\s*radiusName=\{settings\.radiusName\}\n\s*settings=\{settings\}\n\s*adminUser=\{adminAccount\}\n\s*customers=\{customers\}\n\s*distributorOffers=\{distributorOffers\}\n\s*onRegisterDistributor=\{handleRegisterDistributor\}\n\s*onLoginSuccess=\{handleLoginSuccess\}', login_props.strip(), content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
