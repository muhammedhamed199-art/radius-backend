const fs = require('fs');
let content = fs.readFileSync('src/components/FinancialReportModal.tsx', 'utf8');

const oldHeader = `                  <tr>
                    {selectedColumns.date && <th className="px-4 py-3 text-xs font-black text-slate-500 print:text-slate-800">التاريخ</th>}`;
const newHeader = `                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400 print:text-slate-800">#</th>
                    {selectedColumns.date && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">التاريخ</th>}`;
content = content.replace(oldHeader, newHeader);

content = content.replace(/colSpan=\{6\}/g, 'colSpan={7}');

const oldMapStart = `transactions.map(txn => (`
const newMapStart = `transactions.map((txn, index) => (`
content = content.replace(oldMapStart, newMapStart);

const oldRowStart = `                      <tr key={txn?.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 print:border-slate-300 print:break-inside-avoid">
                        {selectedColumns.date && (`;
const newRowStart = `                      <tr key={txn?.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 print:border-slate-300 print:break-inside-avoid">
                        <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] print:text-xs w-8">
                          {index + 1}
                        </td>
                        {selectedColumns.date && (`;
content = content.replace(oldRowStart, newRowStart);

content = content.replace(/className="px-4 py-3 /g, 'className="px-2 py-2 ');
content = content.replace(/className="px-4 py-4 /g, 'className="px-2 py-2 ');

fs.writeFileSync('src/components/FinancialReportModal.tsx', content);
