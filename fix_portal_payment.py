import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

# Add payment link button after the selected offer section or somewhere prominent
# Let's see where to inject it. We can put it right before "3. طريقة الدفع وتفعيل الاشتراك:"
pattern = r'(\{\/\* Payment Method \*\/\})'

payment_link_ui = """
                {selectedCustomer.paymentLink && (
                  <div className="p-4 mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                    <div>
                      <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        رابط الدفع الإلكتروني المخصص
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        يمكنك دفع قيمة الاشتراك وتجديد باقتك فوراً عبر رابط الدفع الآمن الخاص بك.
                      </p>
                    </div>
                    <a 
                      href={selectedCustomer.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 shrink-0 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      دفع الآن
                    </a>
                  </div>
                )}
"""

content = content.replace('{/* Payment Method */}', payment_link_ui + '\n                {/* Payment Method */}')

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
