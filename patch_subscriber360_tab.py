import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

target = """          {/* TAB 7: DELETE & ACCOUNT ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-red-900 dark:text-red-200">حذف المشترك ونقله لسلة المهملات (Delete Subscriber)</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">
                      سيتم نقل الحساب إلى سلة المهملات مع الاحتفاظ ببياناته لمدة 30 يوماً قبل الحذف النهائي، ويمكن استعادته بضغطة زر واحدة.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  تأكيد نقل المشترك لسلة المهملات
                </button>
              </div>
            </div>
          )}

        </div>"""

replacement = """          {/* TAB 7: DELETE & ACCOUNT ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-red-900 dark:text-red-200">حذف المشترك ونقله لسلة المهملات (Delete Subscriber)</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">
                      سيتم نقل الحساب إلى سلة المهملات مع الاحتفاظ ببياناته لمدة 30 يوماً قبل الحذف النهائي، ويمكن استعادته بضغطة زر واحدة.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  تأكيد نقل المشترك لسلة المهملات
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: SPECIAL TEMPORARY OFFER */}
          {activeTab === "special_offer" && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">تخصيص باقة سرعة مؤقتة (Temporary Speed Offer)</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1">
                      قم بتحديد باقة خاصة مؤقتة لتعمل بدلاً من الباقة الأساسية لهذا العميل. ستنتهي صلاحية هذه الباقة تلقائياً في التاريخ المحدد.
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleApplySpecialOffer} className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">اختر الباقة المؤقتة:</label>
                      <select
                        value={specialOfferId}
                        onChange={(e) => setSpecialOfferId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- بدون باقة مؤقتة (الرجوع للأساسية) --</option>
                        {offers.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.speed})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">تاريخ انتهاء الباقة المؤقتة:</label>
                      <input
                        type="date"
                        value={specialOfferExpiry}
                        onChange={(e) => setSpecialOfferExpiry(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        required={!!specialOfferId}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    {customer.temporaryOfferId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialOfferId("");
                          setSpecialOfferExpiry("");
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                      >
                        إلغاء الباقة المؤقتة
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      حفظ وتطبيق الباقة
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>"""

content = content.replace(target, replacement)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
