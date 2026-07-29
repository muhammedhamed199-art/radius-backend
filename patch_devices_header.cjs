const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

const targetHeader = `<div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Radio className="w-6 h-6 text-purple-600" />
            أجهزة الشبكة المتصلة (Ubiquiti Devices)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            مستكشفة تلقائياً عبر خدمة IP Neighbors ومعاينة جودة الإشارة والـ CCQ لحظة بلحظة.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 shrink-0">`;

const replacementHeader = `<div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 overflow-hidden">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            <Radio className="w-6 h-6 text-purple-600 shrink-0" />
            <span className="whitespace-normal">أجهزة الشبكة المتصلة (Ubiquiti Devices)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 whitespace-normal">
            مستكشفة تلقائياً عبر خدمة IP Neighbors ومعاينة جودة الإشارة والـ CCQ لحظة بلحظة.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start xl:self-center">`;

content = content.replace(targetHeader, replacementHeader);
fs.writeFileSync('src/components/DevicesView.tsx', content);
console.log('Header replaced successfully');
