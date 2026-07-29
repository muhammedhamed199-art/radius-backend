const fs = require('fs');
const content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const updated = content.replace(
  '<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">',
  `<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-6">`
).replace(
  'ربط وتأمين سيرفرات الميكروتيك المنتشرة في الأحياء بصفحة الريديوس المركزية (Ubuntu Server) عبر أنفاق الـ VPN الموثوقة.\n          </p>\n        </div>',
  `ربط وتأمين سيرفرات الميكروتيك المنتشرة في الأحياء بصفحة الريديوس المركزية (Ubuntu Server) عبر أنفاق الـ VPN الموثوقة.
          </p>
        </div>
        <div className="relative w-full sm:w-64 xl:w-80 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث سريع بالاسم أو الـ IP..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 text-sm transition-all shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        </div>
        </div>`
);

fs.writeFileSync('src/components/NasServersView.tsx', updated);
