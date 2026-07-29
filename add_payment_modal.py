import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

modal_code = """
      {/* Payment Confirmation Modal */}
      {showPaymentConfirmModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-1">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد الدفع الإلكتروني</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  سيتم توجيهك الآن إلى بوابة الدفع الآمنة
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">اسم المشترك:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{selectedCustomer.name}</strong>
              </div>
              {currentOffer && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">الباقة المحددة:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{currentOffer.name}</strong>
                </div>
              )}
              {currentOffer && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">المبلغ الإجمالي:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-black text-lg">{currentOffer.price * renewalMonths} {currentOffer.currency}</strong>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentConfirmModal(false)}
                className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
              >
                إلغاء
              </button>
              <a
                href={selectedCustomer.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPaymentConfirmModal(false)}
                className="w-full sm:w-1/2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-md shadow-blue-600/20 text-center transition-colors flex justify-center items-center gap-2"
              >
                تأكيد والانتقال
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
"""

content = content.replace(
    '    </div>\n  );\n}',
    modal_code + '\n    </div>\n  );\n}'
)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
