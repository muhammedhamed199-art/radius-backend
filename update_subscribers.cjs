const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

// Update Table Header
const oldHeader = `                <th className="px-2 py-3 text-xs md:text-sm w-10 text-center">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                {renderSortableHeader("اسم العميل", "name", "")}`;

const newHeader = `                <th className="px-2 py-3 text-xs md:text-sm w-8 text-center">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-2 py-3 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                {renderSortableHeader("اسم العميل", "name", "")}`;

content = content.replace(oldHeader, newHeader);

// Update colSpan for empty row
content = content.replace('colSpan={13}', 'colSpan={14}');

// Update Table Body
const oldBody = `                    >
                      <td className="px-2 py-3 text-xs md:text-sm text-center whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-3 text-xs md:text-sm font-medium whitespace-nowrap">`;

const newBody = `                    >
                      <td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 font-mono text-[10px]">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm font-medium whitespace-nowrap">`;

content = content.replace(oldBody, newBody);

// Reduce padding in renderSortableHeader
const oldSortHeaderFn = `  const renderSortableHeader = (label: string, field: string, className: string = "") => (
    <th 
      className={\`px-2 py-3 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors \${className}\`}
      onClick={() => handleSort(field)}
    >`;
const newSortHeaderFn = `  const renderSortableHeader = (label: string, field: string, className: string = "") => (
    <th 
      className={\`px-2 py-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors \${className}\`}
      onClick={() => handleSort(field)}
    >`;
content = content.replace(oldSortHeaderFn, newSortHeaderFn);

// Reduce padding across all tds in the table body
// We can do a string replace for common padding classes within the table body section
// Wait, I can just replace `className="px-2 py-3` with `className="px-2 py-2` everywhere, except we want to be safe. Let's do it carefully.
content = content.replace(/className="px-2 py-3/g, 'className="px-2 py-2');
content = content.replace(/className="px-3 py-3/g, 'className="px-3 py-2');

fs.writeFileSync('src/components/SubscribersView.tsx', content);
