import re

with open('src/components/SubscriberFinancialsView.tsx', 'r') as f:
    content = f.read()

target = """  const [reportEntity, setReportEntity] = useState<{entity: Customer | Distributor, type: 'customer'|'distributor'} | null>(null);"""
replacement = """  const [reportEntity, setReportEntity] = useState<{entity: Customer | Distributor, type: 'customer'|'distributor'} | null>(null);
  const [reminderCustomer, setReminderCustomer] = useState<Customer | null>(null);

  const handleSendManual = (customer: Customer, message: string) => {
    // In a real app this would call an API, here we just simulate
    alert(`تم إرسال رسالة الواتساب إلى ${customer.name}:\n\n${message}`);
  };

  const handleSchedule = (customer: Customer, datetime: string, message: string) => {
    // In a real app this would save to the DB, here we simulate by alerting
    alert(`تم جدولة رسالة تذكير للعميل ${customer.name} في ${datetime}`);
    const updated = {
      ...customer,
      autoWhatsAppAlert: true,
      autoWhatsAppAlertLogs: [
        ...(customer.autoWhatsAppAlertLogs || []),
        { date: datetime, status: "pending" as const, message }
      ]
    };
    onUpdateCustomer(updated);
  };"""

content = content.replace(target, replacement)

with open('src/components/SubscriberFinancialsView.tsx', 'w') as f:
    f.write(content)
