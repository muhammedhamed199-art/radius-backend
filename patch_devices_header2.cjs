const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

const targetHeader = `        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            <Radio className="w-6 h-6 text-purple-600 shrink-0" />
            <span className="whitespace-normal">أجهزة الشبكة المتصلة (Ubiquiti Devices)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-normal">
            مستكشفة تلقائياً عبر خدمة IP Neighbors ومعاينة جودة الإشارة والـ CCQ لحظة بلحظة.
          </p>
        </div>`;

const replacementHeader = `        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="p-2.5 sm:p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0 border border-purple-100 dark:border-purple-800/30">
            <Radio className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              أجهزة الشبكة المتصلة (Ubiquiti Devices)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed whitespace-normal">
              مستكشفة تلقائياً عبر خدمة IP Neighbors ومعاينة جودة الإشارة والـ CCQ لحظة بلحظة.
            </p>
          </div>
        </div>`;

content = content.replace(targetHeader, replacementHeader);
fs.writeFileSync('src/components/DevicesView.tsx', content);
console.log('DevicesView Header replaced successfully');
