with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

modals = """
      {/* -------------------- MODALS -------------------- */}

      {full360Customer && (
        <Subscriber360Modal
          isOpen={!!full360Customer}
          onClose={() => setFull360Customer(null)}
          customer={full360Customer}
          offers={offers}
          servers={servers}
          onUpdateCustomer={onUpdateCustomer}
          onDeleteCustomer={onDeleteCustomer}
          initialTab={full360Tab}
        />
      )}

      {showMessagingGatewayModal && (
        <MessagingGatewayModal
          isOpen={showMessagingGatewayModal}
          onClose={() => setShowMessagingGatewayModal(false)}
          customers={customers}
          offers={offers}
          selectedCustomerIds={selectedCustomerIds}
          singleCustomer={messagingSingleCustomer}
        />
      )}

      {showImportExportModal && (
        <SubscriberImportExportModal
          isOpen={showImportExportModal}
          onClose={() => setShowImportExportModal(false)}
          customers={customers}
          offers={offers}
          servers={servers}
          distributors={distributors}
          selectedCustomerIds={selectedCustomerIds}
          filteredCustomers={filteredCustomers}
          onImportCustomers={onImportCustomers}
        />
      )}

      {autoRenewModalCustomer && (
        <AutoRenewSettingsModal
          isOpen={!!autoRenewModalCustomer}
          onClose={() => setAutoRenewModalCustomer(null)}
          customer={autoRenewModalCustomer}
          onUpdateCustomer={onUpdateCustomer}
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          title={confirmModal.title}
          message={confirmModal.message}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          onConfirm={confirmModal.onConfirm}
          isDanger={true}
        />
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                تعديل بيانات المشترك: {editingCustomer.name}
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم العميل الثلاثي:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مستخدم الدخول (Username):</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة المرور (Password):</label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>
                  <select
                    value={editOfferId}
                    onChange={(e) => setEditOfferId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  >
                    {offers.map(o => (
                      <option key={o?.id} value={o?.id}>{o.name} ({o.speed})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">تصنيف المشترك:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="عادي">عادي</option>
                    <option value="برونزي">برونزي</option>
                    <option value="فضي">فضي</option>
                    <option value="ذهبي">ذهبي</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditingCustomer(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2">
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

target = """              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}"""

replacement = """              </div>
            </form>
          </div>
        </div>
      )}
""" + modals + """
    </div>
  );
}"""

new_content = content.replace(target, replacement)

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(new_content)
