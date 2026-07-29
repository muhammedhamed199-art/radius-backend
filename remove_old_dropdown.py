with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

target = """                            <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownCustomerId(activeDropdownCustomerId === customer?.id ? null : customer?.id);
                              }}
                              className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all font-bold"
                              title="قائمة خيارات وإجراءات المشترك السريعة"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {/* Dropdown Popup */}
                            {activeDropdownCustomerId === customer?.id && (
                              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 z-50 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-extrabold flex items-center justify-between">
                                  <span>خيارات المشترك السريعة</span>
                                  <span className="font-mono text-indigo-600 dark:text-indigo-400">{customer.username}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setFull360Tab("dashboard");
                                    setFull360Customer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-indigo-50 text-indigo-900 font-extrabold flex items-center gap-2"
                                >
                                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                                  1. داتابورد وداتا المشترك
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setFull360Tab("renewal");
                                    setFull360Customer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-emerald-50 text-emerald-800 font-extrabold flex items-center gap-2"
                                >
                                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                                  2. تجديد وتمديد باقة المشترك ⚡
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    if (window.confirm('هل أنت متأكد من تمديد اشتراك العميل لمدة 48 ساعة كإجراء مؤقت؟')) {
                                      const newExpiry = new Date();
                                      newExpiry.setDate(newExpiry.getDate() + 2);
                                      onUpdateCustomer({ ...customer, expiryDate: newExpiry.toISOString().split('T')[0], status: CustomerStatus.ACTIVE });
                                    }
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-amber-50 text-amber-800 font-extrabold flex items-center gap-2"
                                >
                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                  - تجديد مؤقت 48 ساعة
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setFull360Tab("usage");
                                    setFull360Customer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-white text-sky-800 font-extrabold flex items-center gap-2"
                                >
                                  <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                                  3. سجل الاستهلاك والكوتا (Usage)
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setFull360Tab("payments");
                                    setFull360Customer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-white text-teal-800 font-extrabold flex items-center gap-2"
                                >
                                  <CreditCard className="w-3.5 h-3.5 text-teal-600" />
                                  4. سجل المدفوعات والإيصالات
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setFull360Tab("debt");
                                    setFull360Customer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-white text-rose-800 font-extrabold flex items-center gap-2"
                                >
                                  <DollarSign className="w-3.5 h-3.5 text-rose-600" />
                                  5. سجل الديون والذمم
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setEditingCustomer(customer);
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800"
                                >
                                  <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                  تعديل بيانات المشترك
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdownCustomerId(null);
                                    setConfirmModal({
                                      isOpen: true,
                                      title: "تأكيد نقل المشترك إلى سلة المهملات",
                                      message: `هل أنت متأكد من نقل المشترك [${customer.name}] إلى سلة المهملات؟`,
                                      description: "سيتم إيقاف حسابه ونقله إلى سلة المهملات. يمكنك استعادته في أي وقت خلال 30 يوماً.",
                                      confirmText: "نقل إلى سلة المهملات",
                                      onConfirm: () => onDeleteCustomer(customer?.id)
                                    });
                                  }}
                                  className="w-full text-right px-3 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 border-t border-rose-100"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  نقل إلى سلة المهملات
                                </button>
                              </div>
                            )}
                            </div>"""

content = content.replace(target, "")

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
