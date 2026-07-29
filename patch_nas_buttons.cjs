const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const targetButtons = `        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center">
                    <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800" title="تصدير إلى Excel">
            <FileSpreadsheet className="w-3.5 h-3.5" /> إكسيل
          </button>
          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => setShowResourceMonitor(!showResourceMonitor)}
            className={\`px-3 py-2 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 border shadow-sm \${
              showResourceMonitor
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-100"
                : "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
            }\`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>مراقبة استهلاك الموارد (CPU/RAM)</span>
            {highLoadServers.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-bounce">
                {highLoadServers.length} ضغط!
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            إضافة سيرفر NAS جديد
          </button>
        </div>`;

const replacementButtons = `        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center">
          <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap" title="تصدير إلى Excel">
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> إكسيل
          </button>
          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 shrink-0 whitespace-nowrap" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5 shrink-0" /> PDF
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 shrink-0 whitespace-nowrap" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5 shrink-0" /> CSV
          </button>
          <button
            onClick={() => setShowResourceMonitor(!showResourceMonitor)}
            className={\`px-3 py-2 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 border shadow-sm shrink-0 whitespace-nowrap \${
              showResourceMonitor
                ? "bg-amber-500 text-slate-950 border-amber-600 shadow-amber-100"
                : "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
            }\`}
          >
            <Gauge className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
            <span className="shrink-0">مراقبة استهلاك الموارد (CPU/RAM)</span>
            {highLoadServers.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-bounce shrink-0">
                {highLoadServers.length} ضغط!
              </span>
            )}
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            إضافة سيرفر NAS جديد
          </button>
        </div>`;

content = content.replace(targetButtons, replacementButtons);
fs.writeFileSync('src/components/NasServersView.tsx', content);
