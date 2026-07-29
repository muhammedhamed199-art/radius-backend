import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

target = """                <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الباقة الحالية</span>
                  <div className="text-lg font-black text-indigo-700 dark:text-indigo-300 mt-1">{currentOffer?.name || "باقة النطاق العريض"}</div>
                  <span className="text-[11px] text-slate-500 font-mono font-extrabold block mt-0.5">السرعة: {currentOffer?.speed || "10M/10M"}</span>
                </div>"""

replacement = """                <div className={`p-4 rounded-2xl border ${customer.temporaryOfferId ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50" : "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50"}`}>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {customer.temporaryOfferId ? <Sparkles className="w-3.5 h-3.5 text-amber-500" /> : null}
                    {customer.temporaryOfferId ? "باقة مؤقتة نشطة" : "الباقة الأساسية"}
                  </span>
                  <div className={`text-lg font-black mt-1 ${customer.temporaryOfferId ? "text-amber-700 dark:text-amber-300" : "text-indigo-700 dark:text-indigo-300"}`}>
                    {customer.temporaryOfferId ? (offers.find(o => o.id === customer.temporaryOfferId)?.name || "باقة غير معروفة") : (currentOffer?.name || "باقة النطاق العريض")}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono font-extrabold block mt-0.5">
                    السرعة: {customer.temporaryOfferId ? (offers.find(o => o.id === customer.temporaryOfferId)?.speed || "غير متوفر") : (currentOffer?.speed || "10M/10M")}
                  </span>
                  {customer.temporaryOfferExpiry && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
                      تنتهي في: {customer.temporaryOfferExpiry}
                    </span>
                  )}
                </div>"""

content = content.replace(target, replacement)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
