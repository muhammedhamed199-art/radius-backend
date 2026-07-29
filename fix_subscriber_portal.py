import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

# Fix the receipts tab crash and text color issue
target_receipts = """                {[...selectedCustomer.archivedReceipts]
                  .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())"""
replacement_receipts = """                {[...selectedCustomer.archivedReceipts]
                  .sort((a,b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime())"""
content = content.replace(target_receipts, replacement_receipts)

# Fix double classes and text visibility for offers cards
target_offers = """                        className={`p-3.5 rounded-2xl text-right transition-all border relative flex flex-col justify-between ${
                          (selectedOfferId || selectedCustomer.offerId) === off?.id
                            ? "bg-white dark:bg-white/80 dark:bg-white/50 border-teal-500 text-slate-900 dark:text-white shadow-sm ring-2 ring-teal-500/50"
                            : "bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:border-slate-300"
                        }`}"""
replacement_offers = """                        className={`p-4 rounded-2xl text-right transition-all border relative flex flex-col justify-between gap-2 h-full ${
                          (selectedOfferId || selectedCustomer.offerId) === off?.id
                            ? "bg-white dark:bg-slate-800 border-teal-500 text-slate-900 dark:text-white shadow-sm ring-2 ring-teal-500/50"
                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700"
                        }`}"""
content = content.replace(target_offers, replacement_offers)

target_icon = """<Receipt className="w-5 h-5 text-slate-3000" />"""
replacement_icon = """<Receipt className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />"""
content = content.replace(target_icon, replacement_icon)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
