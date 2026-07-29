import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

# 1. 48 hours renewal: add to dropdown menu
target_48h = """                                  2. تجديد وتمديد باقة المشترك ⚡
                                </button>"""
replacement_48h = """                                  2. تجديد وتمديد باقة المشترك ⚡
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
                                </button>"""
content = content.replace(target_48h, replacement_48h)

# 2. Add Three dots next to the name, and make the name open Edit page.
target_name = """                      <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap min-w-[200px]">
                        <div className="flex flex-col gap-1 mt-0.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setFull360Customer(customer); }}
                            className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-right transition-all flex items-center gap-2"
                            title={`عرض البيانات الكاملة والتجديد والاستهلاك والديون للمشترك (${customer.name})`}
                          >
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-base sm:text-lg">{customer.name}</span>"""
replacement_name = """                      <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap min-w-[200px]">
                        <div className="flex flex-col gap-1 mt-0.5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdownCustomerId(activeDropdownCustomerId === customer?.id ? null : customer?.id);
                              }}
                              className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-md transition-all font-bold"
                              title="قائمة خيارات وإجراءات المشترك السريعة"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                              className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-right transition-all flex items-center gap-2"
                              title={`تعديل بيانات المشترك (${customer.name})`}
                            >
                              <div className="flex flex-col gap-1 items-start">
                                <span className="text-base sm:text-lg">{customer.name}</span>"""
content = content.replace(target_name, replacement_name)

# 3. Connection Type -> Inline editable
target_connection_type = """                      <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-center">
                          {customer.connectionType === ConnectionType.PPPOE ? <Globe className="w-4 h-4 text-sky-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                          <span className="font-extrabold text-slate-700 dark:text-slate-300 text-[10px]">{customer.connectionType}</span>
                        </div>
                      </td>"""
replacement_connection_type = """                      <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px]">
                        <div className="flex items-center gap-1.5 justify-center" onClick={e => e.stopPropagation()}>
                          {customer.connectionType === ConnectionType.PPPOE ? <Globe className="w-4 h-4 text-sky-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                          <select
                            value={customer.connectionType}
                            onChange={(e) => onUpdateCustomer({ ...customer, connectionType: e.target.value as ConnectionType })}
                            className="bg-transparent font-extrabold text-slate-700 dark:text-slate-300 text-[10px] outline-none cursor-pointer focus:ring-0 appearance-none text-center"
                            title="تغيير طريقة الاتصال"
                          >
                            <option value={ConnectionType.PPPOE}>{ConnectionType.PPPOE}</option>
                            <option value={ConnectionType.HOTSPOT}>{ConnectionType.HOTSPOT}</option>
                            <option value={ConnectionType.MIXED}>{ConnectionType.MIXED}</option>
                            <option value={ConnectionType.STATIC_IP}>{ConnectionType.STATIC_IP}</option>
                            <option value={ConnectionType.MAC_BINDING}>{ConnectionType.MAC_BINDING}</option>
                            <option value={ConnectionType.BYPASS}>{ConnectionType.BYPASS}</option>
                          </select>
                        </div>
                      </td>"""
content = content.replace(target_connection_type, replacement_connection_type)

# 4. Offer -> Inline editable
target_offer = """                      <td className="px-2 py-2 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap min-w-[120px]">
                        {offer ? offer.name : "-"}
                      </td>"""
replacement_offer = """                      <td className="px-2 py-2 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap min-w-[120px]" onClick={e => e.stopPropagation()}>
                        <select
                          value={customer.offerId || ""}
                          onChange={(e) => onUpdateCustomer({ ...customer, offerId: e.target.value })}
                          className="bg-transparent outline-none cursor-pointer focus:ring-0 max-w-[100px] text-ellipsis appearance-none text-center"
                          title="تغيير السرعة والباقة"
                        >
                          <option value="">غير محدد</option>
                          {offers.map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                      </td>"""
content = content.replace(target_offer, replacement_offer)

# 5. Server -> Inline editable
target_server = """                      <td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px]">
                        {servers.find(s => s?.id === customer.serverId)?.name || "غير محدد"}
                      </td>"""
replacement_server = """                      <td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px]" onClick={e => e.stopPropagation()}>
                        <select
                          value={customer.serverId || ""}
                          onChange={(e) => onUpdateCustomer({ ...customer, serverId: e.target.value })}
                          className="bg-transparent outline-none cursor-pointer focus:ring-0 max-w-[90px] text-ellipsis appearance-none text-center"
                          title="نقل إلى سيرفر آخر"
                        >
                          <option value="">غير محدد</option>
                          {servers.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </td>"""
content = content.replace(target_server, replacement_server)


with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)

