import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

target = """  const confirmDeleteExecution = () => {
    onDeleteCustomer(customer?.id);
    onClose();
    if (onAddNotification) {
      onAddNotification(`🗑️ تم نقل المشترك (${customer.name}) إلى سلة المهملات!`, "warning");
    }
  };"""

replacement = """  const confirmDeleteExecution = () => {
    onDeleteCustomer(customer?.id);
    onClose();
    if (onAddNotification) {
      onAddNotification(`🗑️ تم نقل المشترك (${customer.name}) إلى سلة المهملات!`, "warning");
    }
  };

  const handleApplySpecialOffer = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCustomer = {
      ...customer,
      temporaryOfferId: specialOfferId || undefined,
      temporaryOfferExpiry: specialOfferExpiry || undefined,
    };
    
    onUpdateCustomer(updatedCustomer);
    if (onAddNotification) {
      if (specialOfferId) {
        onAddNotification(`تم تخصيص باقة مؤقتة للعميل (${customer.name}) بنجاح!`, "success");
      } else {
        onAddNotification(`تم إزالة الباقة المؤقتة للعميل.`, "info");
      }
    }
  };"""

content = content.replace(target, replacement)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
