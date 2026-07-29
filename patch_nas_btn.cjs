const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldBtns = `          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>`;

const newBtns = `          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>`;

content = content.replace(oldBtns, newBtns);
fs.writeFileSync('src/components/NasServersView.tsx', content);
