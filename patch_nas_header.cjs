const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const targetHeader = `        <div>
          <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600" />
            سيرفرات ميكروتيك NAS (Network Access Servers)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ربط وتأمين سيرفرات الميكروتيك المنتشرة في الأحياء بصفحة الريديوس المركزية (Ubuntu Server) عبر أنفاق الـ VPN الموثوقة.
          </p>
        </div>`;

const replacementHeader = `        <div className="flex items-start gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-800/30">
            <Server className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              سيرفرات ميكروتيك NAS (Network Access Servers)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              ربط وتأمين سيرفرات الميكروتيك المنتشرة في الأحياء بصفحة الريديوس المركزية (Ubuntu Server) عبر أنفاق الـ VPN الموثوقة.
            </p>
          </div>
        </div>`;

content = content.replace(targetHeader, replacementHeader);
fs.writeFileSync('src/components/NasServersView.tsx', content);
console.log('NasServersView Header replaced successfully');
