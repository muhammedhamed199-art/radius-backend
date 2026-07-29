import re

with open('src/components/SubscriberFinancialsView.tsx', 'r') as f:
    content = f.read()

target = """      {reportEntity && (
        <FinancialReportModal 
          entity={reportEntity.entity}
          type={reportEntity.type}
          onClose={() => setReportEntity(null)}
          defaultCurrency={defaultCurrency}
        />
      )}"""

replacement = """      {reportEntity && (
        <FinancialReportModal 
          entity={reportEntity.entity}
          type={reportEntity.type}
          onClose={() => setReportEntity(null)}
          defaultCurrency={defaultCurrency}
        />
      )}
      
      <WhatsAppReminderModal
        isOpen={!!reminderCustomer}
        onClose={() => setReminderCustomer(null)}
        customer={reminderCustomer}
        onSendManual={handleSendManual}
        onSchedule={handleSchedule}
      />"""

content = content.replace(target, replacement)

with open('src/components/SubscriberFinancialsView.tsx', 'w') as f:
    f.write(content)
