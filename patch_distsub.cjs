const fs = require('fs');
let content = fs.readFileSync('src/components/DistributorSubscriptionsView.tsx', 'utf8');

// Table 1
const oldHeader1 = `              <tr>
                <th className="px-4 py-3 text-xs font-black text-slate-500">الموزع</th>`;
const newHeader1 = `              <tr>
                <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500">الموزع</th>`;
content = content.replace(oldHeader1, newHeader1);

const oldMap1 = `distributors.map(dist => (`
const newMap1 = `distributors.map((dist, index) => (`
content = content.replace(oldMap1, newMap1);

const oldRow1 = `                <tr key={dist?.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="px-4 py-3 font-bold text-sm text-slate-800 dark:text-slate-200">{dist.name}</td>`;
const newRow1 = `                <tr key={dist?.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 font-bold text-sm text-slate-800 dark:text-slate-200">{dist.name}</td>`;
content = content.replace(oldRow1, newRow1);

// Table 2
const oldHeader2 = `                  <tr>
                    <th className="p-3 font-black text-slate-600 dark:text-slate-300">التاريخ</th>`;
const newHeader2 = `                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 font-black text-slate-600 dark:text-slate-300">التاريخ</th>`;
content = content.replace(oldHeader2, newHeader2);

const oldMap2 = `distributor.archivedReceipts.map(receipt => (`
const newMap2 = `distributor.archivedReceipts.map((receipt, index) => (`
content = content.replace(oldMap2, newMap2);

const oldRow2 = `                    <tr key={receipt.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{new Date(receipt.date).toLocaleDateString('ar-SA')}</td>`;
const newRow2 = `                    <tr key={receipt.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 font-bold text-slate-700 dark:text-slate-300">{new Date(receipt.date).toLocaleDateString('ar-SA')}</td>`;
content = content.replace(oldRow2, newRow2);

content = content.replace(/px-4 py-3/g, 'px-2 py-2');
content = content.replace(/p-3 font/g, 'px-2 py-2 font');
content = content.replace(/className="p-3"/g, 'className="px-2 py-2"');
content = content.replace(/className="p-3 /g, 'className="px-2 py-2 ');

fs.writeFileSync('src/components/DistributorSubscriptionsView.tsx', content);
