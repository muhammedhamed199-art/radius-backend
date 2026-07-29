const fs = require('fs');
let content = fs.readFileSync('src/components/Subscriber360Modal.tsx', 'utf8');

// Table 1
const oldHead1 = `                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold sticky-thead">
                    <tr>
                      <th className="p-3">التاريخ</th>`;
const newHead1 = `                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold sticky-thead">
                    <tr>
                      <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                      <th className="px-2 py-1.5">التاريخ</th>`;
content = content.replace(oldHead1, newHead1);

const oldRow1 = `                          <tr key={index} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-mono font-bold text-slate-800 dark:text-slate-200">`;
const newRow1 = `                          <tr key={index} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-1 py-1 text-center font-mono text-[10px] text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">`;
content = content.replace(oldRow1, newRow1);

// Table 2
const oldHead2 = `                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                    <tr>
                      <th className="p-3">رقم الفاتورة</th>`;
const newHead2 = `                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                    <tr>
                      <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                      <th className="px-2 py-1.5">رقم الفاتورة</th>`;
content = content.replace(oldHead2, newHead2);

const oldMap2 = `transactions.map((tx) => (`
const newMap2 = `transactions.map((tx, index) => (`
content = content.replace(oldMap2, newMap2);

const oldRow2 = `                      <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold font-mono text-slate-600 dark:text-slate-400">`;
const newRow2 = `                      <tr key={tx.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-1 py-1 text-center font-mono text-[10px] text-slate-400">
                          {index + 1}
                        </td>
                        <td className="px-2 py-1.5 font-bold font-mono text-slate-600 dark:text-slate-400">`;
content = content.replace(oldRow2, newRow2);


// Table 3
const oldHead3 = `                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                        <tr>
                          <th className="p-3">رقم المرجع</th>`;
const newHead3 = `                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                        <tr>
                          <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                          <th className="px-2 py-1.5">رقم المرجع</th>`;
content = content.replace(oldHead3, newHead3);

const oldMap3 = `customer.archivedReceipts.map((receipt) => (`
const newMap3 = `customer.archivedReceipts.map((receipt, index) => (`
content = content.replace(oldMap3, newMap3);

const oldRow3 = `                          <tr key={receipt.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="p-3 font-bold font-mono text-slate-600 dark:text-slate-400 text-[10px]">`;
const newRow3 = `                          <tr key={receipt.id} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="px-1 py-1 text-center font-mono text-[10px] text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1.5 font-bold font-mono text-slate-600 dark:text-slate-400 text-[10px]">`;
content = content.replace(oldRow3, newRow3);


content = content.replace(/className="p-3/g, 'className="px-2 py-1.5');
content = content.replace(/colSpan=\{7\}/g, 'colSpan={8}');
content = content.replace(/colSpan=\{5\}/g, 'colSpan={6}');
content = content.replace(/colSpan=\{4\}/g, 'colSpan={5}');

fs.writeFileSync('src/components/Subscriber360Modal.tsx', content);
