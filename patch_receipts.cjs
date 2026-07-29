const fs = require('fs');
let content = fs.readFileSync('src/components/ReceiptsReviewView.tsx', 'utf8');

const oldHeader = `              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-500 dark:text-slate-400">رقم المرجع / التاريخ</th>`;
const newHeader = `              <tr>
                <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">رقم المرجع / التاريخ</th>`;
content = content.replace(oldHeader, newHeader);

const oldEmpty = `<td colSpan={6}`;
const newEmpty = `<td colSpan={7}`;
content = content.replace(oldEmpty, newEmpty);

const oldMapStart = `sortedReceipts.map((r) => (`
const newMapStart = `sortedReceipts.map((r, index) => (`
content = content.replace(oldMapStart, newMapStart);

const oldRowStart = `                  <tr key={r?.id} className={\`transition-colors relative border-r-4 \${
                    r.status === 'pending' ? 'border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50' :
                    r.status === 'approved' ? 'border-emerald-400 opacity-60 bg-slate-50 dark:bg-slate-900' :
                    'border-rose-400 opacity-60 bg-slate-50 dark:bg-slate-900'
                  }\`}>
                    <td className="px-6 py-4">`;

const newRowStart = `                  <tr key={r?.id} className={\`transition-colors relative border-r-4 \${
                    r.status === 'pending' ? 'border-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800/50' :
                    r.status === 'approved' ? 'border-emerald-400 opacity-60 bg-slate-50 dark:bg-slate-900' :
                    'border-rose-400 opacity-60 bg-slate-50 dark:bg-slate-900'
                  }\`}>
                    <td className="px-1 py-1 text-center text-slate-400 font-mono text-[10px] w-8">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2">`;
content = content.replace(oldRowStart, newRowStart);

content = content.replace(/px-6 py-4/g, 'px-2 py-2');

fs.writeFileSync('src/components/ReceiptsReviewView.tsx', content);
