with open('src/components/SubscribersView.tsx', 'r') as f:
    code = f.read()

# 1. First inline dropdown block in Name cell:
# From `{/* Dropdown Popup */}` down to before `<button\n                              onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}`
idx1 = code.find('{/* Dropdown Popup */}')
idx2 = code.find('<button\n                              onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}')

if idx1 != -1 and idx2 != -1 and idx1 < idx2:
    code = code[:idx1] + code[idx2:]

# 2. Second inline dropdown block in Options cell:
# In options cell, the button was:
# onClick={(e) => {
#   e.stopPropagation();
#   setActiveDropdownCustomerId(activeDropdownCustomerId === customer?.id ? null : customer?.id);
# }}
# We replace it with onClick={(e) => handleOpenDropdown(e, customer)}
# And remove the dropdown block after it up to `</div>\n                            </div>` or similar.

old_options_cell = """                             <div className="relative">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveDropdownCustomerId(activeDropdownCustomerId === customer?.id ? null : customer?.id);
                               }}
                               className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all font-bold"
                               title="قائمة خيارات وإجراءات المشترك السريعة"
                             >
                               <MoreVertical className="w-4 h-4" />
                             </button>"""

new_options_cell = """                             <div>
                             <button
                               onClick={(e) => handleOpenDropdown(e, customer)}
                               className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all font-bold"
                               title="قائمة خيارات وإجراءات المشترك السريعة"
                             >
                               <MoreVertical className="w-4 h-4" />
                             </button>"""

if old_options_cell in code:
    code = code.replace(old_options_cell, new_options_cell)
else:
    print("Warning: old_options_cell not found")

# Now remove the remaining `{/* Dropdown Popup */}` block in options cell
idx_pop2 = code.find('{/* Dropdown Popup */}')
if idx_pop2 != -1:
    # find where this dropdown popup closes. It ends before `</div>\n                          </div>\n                        </td>`
    idx_td_end = code.find('</td>', idx_pop2)
    # The last div inside the td before </td>
    # Let's inspect text around idx_pop2
    sub = code[idx_pop2:idx_td_end]
    # The popup ends at `)}`
    last_brace = sub.rfind(')}')
    if last_brace != -1:
        code = code[:idx_pop2] + code[idx_pop2 + last_brace + 2:]

# Floating dropdown JSX to insert before the last `</div>\n  );\n}`
floating_dropdown_jsx = """
      {/* Floating Quick Options Dropdown Overlay & Menu */}
      {activeDropdownCustomer && dropdownPosition && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={() => {
              setActiveDropdownCustomer(null);
              setDropdownPosition(null);
            }}
          />

          {/* Floating Dropdown Menu */}
          <div
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            className="fixed w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[70] py-2 text-xs font-bold text-slate-700 dark:text-slate-200 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-extrabold flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <span>خيارات المشترك السريعة</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{activeDropdownCustomer.username}</span>
            </div>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("dashboard");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-extrabold flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              1. داتابورد وداتا المشترك
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("renewal");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              2. تجديد وتمديد باقة المشترك ⚡
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                if (window.confirm('هل أنت متأكد من تمديد اشتراك العميل لمدة 48 ساعة كإجراء مؤقت؟')) {
                  const newExpiry = new Date();
                  newExpiry.setDate(newExpiry.getDate() + 2);
                  onUpdateCustomer({ ...c, expiryDate: newExpiry.toISOString().split('T')[0], status: CustomerStatus.ACTIVE });
                }
              }}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-2"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              - تجديد مؤقت 48 ساعة
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("usage");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-extrabold flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              3. سجل الاستهلاك والكوتا (Usage)
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("payments");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-extrabold flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              4. سجل المدفوعات والفواتير
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("modifications");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-2"
            >
              <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              5. سجل التعديلات والعمليات
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("debt");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-extrabold flex items-center gap-2"
            >
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              6. الذمم والديون المترتبة
              {activeDropdownCustomer.debt && activeDropdownCustomer.debt > 0 ? (
                <span className="mr-auto text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-black">
                  {activeDropdownCustomer.debt} $
                </span>
              ) : null}
            </button>

            {activeDropdownCustomer.concurrentLogins > 0 && (
              <button
                onClick={() => {
                  const c = activeDropdownCustomer;
                  setActiveDropdownCustomer(null);
                  handleKickSubscriber(c);
                }}
                className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-t border-slate-200 dark:border-slate-800"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                طرد العميل من الأكتيف (PoD)
              </button>
            )}

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                handleToggleStatus(c);
              }}
              className={`w-full text-right px-3 py-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 ${
                activeDropdownCustomer.status === CustomerStatus.ACTIVE ? "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400" : "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {activeDropdownCustomer.status === CustomerStatus.ACTIVE ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-500" />
                  إيقاف الخدمة وتعطيل الحساب
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  تفعيل وإعادة تشغيل الخدمة
                </>
              )}
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setMessagingSingleCustomer(c);
                setShowMessagingGatewayModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 text-blue-700 dark:text-blue-400"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              إرسال إشعار (WhatsApp/SMS)
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setAutoRenewModalCustomer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800"
            >
              <CalendarClock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              إعدادات التجديد التلقائي
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setEditingCustomer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              تعديل بيانات المشترك
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setConfirmModal({
                  isOpen: true,
                  title: "تأكيد نقل المشترك إلى سلة المهملات",
                  message: `هل أنت متأكد من نقل المشترك [${c.name}] إلى سلة المهملات؟`,
                  description: "سيتم إيقاف حسابه ونقله إلى سلة المهملات. يمكنك استعادته في أي وقت خلال 30 يوماً.",
                  confirmText: "نقل إلى سلة المهملات",
                  onConfirm: () => onDeleteCustomer(c?.id)
                });
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 border-t border-rose-100 dark:border-slate-800 font-extrabold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              نقل إلى سلة المهملات
            </button>
          </div>
        </>
      )}
"""

last_div_idx = code.rfind('</div>')
if last_div_idx != -1:
    code = code[:last_div_idx] + floating_dropdown_jsx + "\n    </div>" + code[last_div_idx + 6:]

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(code)

print("Successfully replaced dropdowns and added floating menu!")
