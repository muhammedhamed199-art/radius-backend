const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldHeader = `              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-150 text-slate-500 dark:text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                  {renderSortableHeader("اسم السيرفر NAS", "name")}`;

const newHeader = `              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-150 text-slate-500 dark:text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                  <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                  {renderSortableHeader("اسم السيرفر NAS", "name")}`;

content = content.replace(oldHeader, newHeader);

const oldEmpty = `                    <td colSpan={10} className="p-12 text-center text-slate-400 font-bold">`;
const newEmpty = `                    <td colSpan={11} className="p-12 text-center text-slate-400 font-bold">`;
content = content.replace(oldEmpty, newEmpty);

const oldMapStart = `                  sortedServers.map((server) => {`;
const newMapStart = `                  sortedServers.map((server, index) => {`;
content = content.replace(oldMapStart, newMapStart);

const oldRowStart = `                      <tr key={server?.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors group">
                        {/* Name */}
                        <td className="px-4 py-3">`;

const newRowStart = `                      <tr key={server?.id} className="hover:bg-slate-50 dark:bg-slate-800/50 transition-colors group">
                        <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                          {index + 1}
                        </td>
                        {/* Name */}
                        <td className="px-2 py-2">`;
content = content.replace(oldRowStart, newRowStart);

content = content.replace(/className="px-4 py-3/g, 'className="px-2 py-2');
content = content.replace(/className="px-4 py-4/g, 'className="px-2 py-2');

const oldSortHeader = `  const renderSortableHeader = (label: string, field: string) => (
    <th
      className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors text-right"
      onClick={() => handleSort(field)}
    >`;
const newSortHeader = `  const renderSortableHeader = (label: string, field: string) => (
    <th
      className="px-2 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-right"
      onClick={() => handleSort(field)}
    >`;
content = content.replace(oldSortHeader, newSortHeader);

fs.writeFileSync('src/components/NasServersView.tsx', content);
