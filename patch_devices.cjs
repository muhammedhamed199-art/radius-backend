const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

const oldHeader = `              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="px-2 py-3 text-xs md:text-sm">اسم الجهاز (Identity)</th>`;
const newHeader = `              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                  <th className="px-2 py-2 text-xs md:text-sm">اسم الجهاز (Identity)</th>`;
content = content.replace(oldHeader, newHeader);

content = content.replace(/colSpan=\{10\}/g, 'colSpan={11}');
content = content.replace(/className="px-2 py-3/g, 'className="px-2 py-2');
content = content.replace(/className="px-4 py-3/g, 'className="px-2 py-2');

const oldMapStart = `filteredDevices.map((device) => {`
const newMapStart = `filteredDevices.map((device, index) => {`
content = content.replace(oldMapStart, newMapStart);

const oldRowStart = `                  <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-2 py-2">`;
const newRowStart = `                  <tr key={device.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2">`;
content = content.replace(oldRowStart, newRowStart);

fs.writeFileSync('src/components/DevicesView.tsx', content);
