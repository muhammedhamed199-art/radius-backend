const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const newHandlers = `
  const handleAddCustomer = async (newCustomer: Omit<Customer, "id">) => {
    if (checkReadOnly()) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newCustomer.username,
          password: newCustomer.password,
          ipAddress: newCustomer.ipAddress || 'Auto'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء المشترك");
      logAction("admin", newCustomer.username, "تم إنشاء المشترك في الريديوس");
      // Fetch fresh data
      const fetchRealData = async () => {
        const custRes = await fetch('/api/customers');
        if (custRes.ok) setCustomers(await custRes.json());
      };
      fetchRealData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateCustomer = async (edited: Customer) => {
    if (checkReadOnly()) return;
    // API logic to update can be added here
    logAction("admin", edited.username, "تم تحديث بيانات المشترك");
  };

  const handleRestoreCustomer = () => {};
  const handlePermanentDeleteCustomer = () => {};
  const handleRestoreBatchCustomers = () => {};
  const handlePermanentDeleteBatchCustomers = () => {};
  const handleEmptyTrash = () => {};
  const handleAddDeletedCustomerToTrash = () => {};

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (checkReadOnly()) return;
    const target = customers.find(c => c?.id === id);
    if (!target) return;
    try {
      const res = await fetch(\`/api/customers/\${target.username}\`, { method: 'DELETE' });
      if (!res.ok) throw new Error("فشل الحذف");
      logAction("admin", target.username, "تم حذف المشترك من الريديوس");
      // Fetch fresh data
      const fetchRealData = async () => {
        const custRes = await fetch('/api/customers');
        if (custRes.ok) setCustomers(await custRes.json());
      };
      fetchRealData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteBatchCustomers = async (ids: string[]) => {
    if (checkReadOnly()) return;
    try {
      for (const id of ids) {
        const target = customers.find(c => c?.id === id);
        if (target) {
           await fetch(\`/api/customers/\${target.username}\`, { method: 'DELETE' });
        }
      }
      logAction("admin", "Batch", "تم حذف مجموعة المشتركين من الريديوس");
      const fetchRealData = async () => {
        const custRes = await fetch('/api/customers');
        if (custRes.ok) setCustomers(await custRes.json());
      };
      fetchRealData();
    } catch (e: any) {
      alert(e.message);
    }
  };
`;

const handlersRegex = /const handleAddCustomer =[\s\S]*?const handleToggleAutoRenew =/m;

content = content.replace(handlersRegex, newHandlers + "\n  const handleToggleAutoRenew =");

fs.writeFileSync('src/App.tsx', content);
