import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_logic = """
  const handleAddServer = (newServer: Omit<NasServer, "id">) => {
    const targetDistributorId = isDistributorSession ? currentDistributorId : (newServer.distributorId || undefined);
    
    // Check limits if it's assigned to a distributor
    if (targetDistributorId) {
      const dist = distributors.find(d => d.id === targetDistributorId);
      if (dist && dist.subscriptionOfferId) {
        const offer = distributorOffers.find(o => o.id === dist.subscriptionOfferId);
        if (offer && offer.maxNasServers && offer.maxNasServers > 0) {
          const currentCount = servers.filter(s => s.distributorId === targetDistributorId).length;
          if (currentCount >= offer.maxNasServers) {
            addNotification(`لا يمكن إضافة سيرفر NAS. الخطة الحالية للموزع (${dist.name}) تسمح بحد أقصى ${offer.maxNasServers} سيرفر فقط.`, "error");
            return;
          }
        }
      }
    }
    
    const fresh: NasServer = {
      ...newServer,
      id: `nas_${Date.now()}`,
      distributorId: targetDistributorId
    };
    const updated = [...servers, fresh];
    updateStateAndPersist(
      "servers", 
      updated, 
      setServers, 
      fresh.name, 
      `تسجيل ميكروتك NAS جديد بالـ IP (${fresh.ipAddress}) ومفتاح سري مشفر.`
    );
  };
"""

content = re.sub(r'  const handleAddServer = \(newServer: Omit<NasServer, "id">\) => \{.*?    \);\n  \};', new_logic.strip(), content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
