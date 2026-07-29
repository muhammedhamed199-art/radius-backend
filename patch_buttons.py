import re

with open('src/components/SubscriberFinancialsView.tsx', 'r') as f:
    content = f.read()

target = """                        <td className="px-6 py-4">
                          <button
                            onClick={() => setReportEntity({ entity: customer, type: 'customer' })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            كشف حساب
                          </button>
                        </td>"""

replacement = """                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setReportEntity({ entity: customer, type: 'customer' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              كشف حساب
                            </button>
                            {(customer.debt || 0) > 0 && (
                              <button
                                onClick={() => setReminderCustomer(customer)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                                title="تنبيه بالدفع"
                              >
                                <MessageSquare className="w-4 h-4" />
                                تنبيه
                              </button>
                            )}
                          </div>
                        </td>"""

content = content.replace(target, replacement)

with open('src/components/SubscriberFinancialsView.tsx', 'w') as f:
    f.write(content)
