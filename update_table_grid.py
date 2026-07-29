import re

with open('src/components/SubscribersView.tsx', 'r') as f:
    code = f.read()

# 1. Update renderSortableHeader to include border and justify-between
old_render_header = """  const renderSortableHeader = (label: string, field: string, hiddenClass: string = "") => {
    const isSorted = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)} 
        className={`px-2 py-3 cursor-pointer select-none hover:bg-slate-100 dark:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200 font-extrabold text-xs whitespace-normal min-w-[80px] break-words group text-right ${hiddenClass}`}
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <span className={`text-[9px] transition-all duration-200 ${isSorted ? "text-indigo-600 opacity-100 font-bold" : "text-slate-400 opacity-40 group-hover:opacity-80"}`}>
            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </div>
      </th>
    );
  };"""

new_render_header = """  const renderSortableHeader = (label: string, field: string, hiddenClass: string = "") => {
    const isSorted = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)} 
        className={`px-2.5 py-2.5 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-extrabold text-xs whitespace-normal min-w-[80px] break-words group text-right border border-slate-300 dark:border-slate-700 ${hiddenClass}`}
      >
        <div className="flex items-center gap-1 justify-between">
          <span>{label}</span>
          <span className={`text-[9px] transition-all duration-200 ${isSorted ? "text-indigo-600 opacity-100 font-bold" : "text-slate-400 opacity-40 group-hover:opacity-80"}`}>
            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </div>
      </th>
    );
  };"""

if old_render_header in code:
    code = code.replace(old_render_header, new_render_header)
    print("Updated renderSortableHeader")
else:
    print("Warning: old_render_header not found")

# 2. Unstick table header and container & add borders to header cells
old_table_head = """        <div className="table-scroll-container">
          <table className="w-full text-right border-collapse text-xs md:text-sm min-w-[1300px] sticky-table">
            <thead className="sticky-thead">
              <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-extrabold">
                <th className="px-1 py-2 text-xs md:text-sm w-8 text-center">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-1 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                {renderSortableHeader("اسم العميل", "name", "")}
                {renderSortableHeader("الاتصال", "concurrentLogins", "")}
                {renderSortableHeader("الحالة", "status", "")}
                {renderSortableHeader("طريقة الاتصال", "connectionType", "")}
                {renderSortableHeader("اسم الدخول", "username", "")}
                {renderSortableHeader("الـ IP الممنوح", "ipAddress", "")}
                
                {renderSortableHeader("العرض المأخوذ", "offer", "")}
                {renderSortableHeader("السيرفر", "serverId", "")}
                {renderSortableHeader("الاستهلاك", "consumptionGB", "")}
                {renderSortableHeader("تاريخ البدء", "startDate", "")}
                {renderSortableHeader("تاريخ الانتهاء", "expiryDate", "")}
                {renderSortableHeader("تنبيه واتساب", "autoWhatsAppAlert", "")}
                <th className="px-2 py-3 text-xs md:text-sm text-center w-36 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)] border-r border-slate-200 dark:border-slate-700">الخيارات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">"""

new_table_head = """        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] max-w-full">
          <table className="w-full text-right border-collapse border border-slate-300 dark:border-slate-700 text-xs md:text-sm min-w-[1300px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold">
                <th className="px-1 py-2 text-xs md:text-sm w-8 text-center border border-slate-300 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-1 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400 border border-slate-300 dark:border-slate-700">#</th>
                {renderSortableHeader("اسم العميل", "name", "")}
                {renderSortableHeader("الاتصال", "concurrentLogins", "")}
                {renderSortableHeader("الحالة", "status", "")}
                {renderSortableHeader("طريقة الاتصال", "connectionType", "")}
                {renderSortableHeader("اسم الدخول", "username", "")}
                {renderSortableHeader("الـ IP الممنوح", "ipAddress", "")}
                
                {renderSortableHeader("العرض المأخوذ", "offer", "")}
                {renderSortableHeader("السيرفر", "serverId", "")}
                {renderSortableHeader("الاستهلاك", "consumptionGB", "")}
                {renderSortableHeader("تاريخ البدء", "startDate", "")}
                {renderSortableHeader("تاريخ الانتهاء", "expiryDate", "")}
                {renderSortableHeader("تنبيه واتساب", "autoWhatsAppAlert", "")}
                <th className="px-2 py-3 text-xs md:text-sm text-center w-36 border border-slate-300 dark:border-slate-700">الخيارات</th>
              </tr>
            </thead>
            <tbody>"""

if old_table_head in code:
    code = code.replace(old_table_head, new_table_head)
    print("Updated table header & container")
else:
    print("Warning: old_table_head not found")

# 3. Update table row `tr` and every `td` cell to add explicit borders
# Let's check `tr` pattern
old_tr = """                    <tr 
                      key={customer?.id} 
                      onClick={(e) => handleRowClick(e, customer)}
                      className={`cursor-pointer transition-colors border-b border-slate-200 dark:border-slate-800/60 ${
                        isSelected 
                          ? "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60" 
                          : index % 2 === 0 
                            ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/60" 
                            : "bg-slate-50 dark:bg-slate-800/40 dark:bg-slate-800/20 hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-800/60"
                      }`}
                    >"""

new_tr = """                    <tr 
                      key={customer?.id} 
                      onClick={(e) => handleRowClick(e, customer)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60" 
                          : index % 2 === 0 
                            ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60" 
                            : "bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >"""

if old_tr in code:
    code = code.replace(old_tr, new_tr)
    print("Updated tr style")
else:
    print("Warning: old_tr not found")

# Now add border class to tds inside subscriber rows
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">',
    '<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap border border-slate-200 dark:border-slate-800">'
)
code = code.replace(
    '<td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">',
    '<td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8 border border-slate-200 dark:border-slate-800">'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap min-w-[200px]">',
    '<td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap min-w-[200px] border border-slate-200 dark:border-slate-800">'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap text-center">',
    '<td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap text-center border border-slate-200 dark:border-slate-800">'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px]">',
    '<td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap min-w-[120px] font-bold"',
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap min-w-[120px] font-bold border border-slate-200 dark:border-slate-800"'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[120px]"',
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[120px] border border-slate-200 dark:border-slate-800"'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap min-w-[120px]"',
    '<td className="px-2 py-2 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap min-w-[120px] border border-slate-200 dark:border-slate-800"'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px]"',
    '<td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800"'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px]">{customer.startDate}</td>',
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">{customer.startDate}</td>'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[100px]">{customer.expiryDate}</td>',
    '<td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">{customer.expiryDate}</td>'
)
code = code.replace(
    '<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap min-w-[90px]">',
    '<td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap min-w-[90px] border border-slate-200 dark:border-slate-800">'
)
# Options td (sticky left-0 replaced with standard border)
old_options_td = '<td className="px-2 py-2 text-center sticky left-0 bg-inherit z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)] border-r border-slate-200 dark:border-slate-800/60">'
new_options_td = '<td className="px-2 py-2 text-center border border-slate-200 dark:border-slate-800">'
if old_options_td in code:
    code = code.replace(old_options_td, new_options_td)
    print("Replaced options td sticky styling")

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(code)

print("Done python script execution.")
