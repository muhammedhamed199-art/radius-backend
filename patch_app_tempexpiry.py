import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """  useEffect(() => {
    let hasChanges = false;
    const now = new Date();
    // Normalize now to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const updatedDistributors = distributors.map(dist => {
      if (!dist.subscriptionEndDate) return dist;
      
      const endDate = new Date(dist.subscriptionEndDate);
      // Normalize end date
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (endDay < today && dist.subscriptionStatus === "نشط") {
        hasChanges = true;
        return {
          ...dist,
          subscriptionStatus: "منتهي" as const
        };
      }
      return dist;
    });

    if (hasChanges) {
      setDistributors(updatedDistributors);
      saveToStorage("distributors", updatedDistributors);
    }
  }, [distributors]);"""

replacement = """  useEffect(() => {
    let hasChangesDist = false;
    let hasChangesCust = false;
    const now = new Date();
    // Normalize now to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const updatedDistributors = distributors.map(dist => {
      if (!dist.subscriptionEndDate) return dist;
      
      const endDate = new Date(dist.subscriptionEndDate);
      // Normalize end date
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      if (endDay < today && dist.subscriptionStatus === "نشط") {
        hasChangesDist = true;
        return {
          ...dist,
          subscriptionStatus: "منتهي" as const
        };
      }
      return dist;
    });

    if (hasChangesDist) {
      setDistributors(updatedDistributors);
      saveToStorage("distributors", updatedDistributors);
    }
    
    const updatedCustomers = customers.map(cust => {
      if (!cust.temporaryOfferExpiry) return cust;
      
      const expiryDate = new Date(cust.temporaryOfferExpiry);
      const expiryDay = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
      
      if (expiryDay < today) {
        hasChangesCust = true;
        return {
          ...cust,
          temporaryOfferId: undefined,
          temporaryOfferExpiry: undefined
        };
      }
      return cust;
    });
    
    if (hasChangesCust) {
      setCustomers(updatedCustomers);
      saveToStorage("customers", updatedCustomers);
    }
  }, [distributors, customers]);"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
