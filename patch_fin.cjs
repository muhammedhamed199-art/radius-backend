const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberFinancialsView.tsx', 'utf8');

// Table 1
let oldHeader1 = `                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400">المشترك</th>`;
let newHeader1 = `                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">المشترك</th>`;
content = content.replace(oldHeader1, newHeader1);

content = content.replace(/colSpan=\{5\}/g, 'colSpan={6}');

let oldMap1 = `filteredCustomers.map((customer) => (`
let newMap1 = `filteredCustomers.map((customer, index) => (`
content = content.replace(oldMap1, newMap1);

let oldRow1 = `<tr key={customer?.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">`;
let newRow1 = `<tr key={customer?.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-1 py-1 text-center text-slate-400 font-mono text-[10px] w-8">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2">`;
content = content.replace(oldRow1, newRow1);

// Table 2
let oldHeader2 = `                  <tr>
                    <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400">الموزع</th>`;
let newHeader2 = `                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الموزع</th>`;
content = content.replace(oldHeader2, newHeader2);

content = content.replace(/colSpan=\{4\}/g, 'colSpan={5}');

let oldMap2 = `filteredDistributors.map((distributor) => (`
let newMap2 = `filteredDistributors.map((distributor, index) => (`
content = content.replace(oldMap2, newMap2);

let oldRow2 = `<tr key={distributor?.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">`;
let newRow2 = `<tr key={distributor?.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-1 py-1 text-center text-slate-400 font-mono text-[10px] w-8">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2">`;
content = content.replace(oldRow2, newRow2);

content = content.replace(/px-6 py-4/g, 'px-2 py-2');

fs.writeFileSync('src/components/SubscriberFinancialsView.tsx', content);
