const fs = require('fs');
let lines = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8').split('\n');
let content = lines.join('\n');

const oldCheckboxHeader = `                <th className="px-2 py-3 text-xs md:text-sm w-10 text-center">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                {renderSortableHeader("اسم العميل", "name", "")}`;

const newCheckboxHeader = `                <th className="px-1 py-2 text-xs md:text-sm w-8 text-center">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-1 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                {renderSortableHeader("اسم العميل", "name", "")}`;

content = content.replace(oldCheckboxHeader, newCheckboxHeader);

// Now in the tbody
const oldRowStart = `              {paginatedCustomers.map((c) => {
                const serverObj = servers.find((s) => s.id === c.serverId);
                const offerObj = offers.find((o) => o?.id === c.offerId);
                const isSelected = selectedCustomerIds.includes(c?.id || "");

                return (
                  <tr
                    key={c?.id}
                    className={\`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 \${
                      isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }\`}
                  >
                    <td className="px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectCustomer(c.id, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-3 py-3">`;

const newRowStart = `              {paginatedCustomers.map((c, index) => {
                const serverObj = servers.find((s) => s.id === c.serverId);
                const offerObj = offers.find((o) => o?.id === c.offerId);
                const isSelected = selectedCustomerIds.includes(c?.id || "");
                const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr
                    key={c?.id}
                    className={\`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800 \${
                      isSelected ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }\`}
                  >
                    <td className="px-1 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectCustomer(c.id, e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px]">
                      {globalIndex}
                    </td>
                    <td className="px-2 py-1.5">`;

content = content.replace(oldRowStart, newRowStart);

// Reduce padding on all <td> and <th> inside the table
// Let's just do a global replace for common padding patterns inside table cells if we can, or just do specific ones.
// In the current file, we can replace 'px-3 py-3' with 'px-2 py-1.5' for td and th.

content = content.replace(/className="px-3 py-3"/g, 'className="px-2 py-1.5"');
content = content.replace(/className="px-4 py-3/g, 'className="px-2 py-1.5');
content = content.replace(/className="px-4 py-4/g, 'className="px-2 py-2');

// Also update renderSortableHeader
const oldSortableHeader = `  const renderSortableHeader = (label: string, field: string, className: string = "") => (
    <th
      className={\`px-3 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors \${className}\`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">`;

const newSortableHeader = `  const renderSortableHeader = (label: string, field: string, className: string = "") => (
    <th
      className={\`px-2 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors \${className}\`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">`;

content = content.replace(oldSortableHeader, newSortableHeader);

fs.writeFileSync('src/components/SubscribersView.tsx', content);
