import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

old_btn = """                    <a 
                      href={selectedCustomer.paymentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 shrink-0 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      دفع الآن
                    </a>"""

new_btn = """                    <button 
                      type="button"
                      onClick={() => setShowPaymentConfirmModal(true)}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 shrink-0 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      دفع الآن
                    </button>"""

content = content.replace(old_btn, new_btn)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
