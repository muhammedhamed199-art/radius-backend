const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

const targetButtons = `        <div className="flex flex-wrap gap-2 shrink-0">
          {/* Signal Diagnostic Tool Button */}
          <button
            type="button"
            onClick={() => setShowSignalTool(!showSignalTool)}
            className={\`px-4 py-2 font-extrabold text-sm rounded-xl transition-all border flex items-center gap-2 relative \${
              showSignalTool
                ? "bg-purple-700 text-white border-purple-800 shadow-md"
                : weakDevices.length > 0
                ? "bg-gradient-to-r from-amber-500 via-rose-600 to-rose-700 hover:from-amber-600 hover:to-rose-800 text-white border-rose-500 shadow-lg shadow-rose-200/60 animate-pulse"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
            }\`}
          >
            <Signal className="w-4 h-4 shrink-0" />
            <span>أداة فحص الإشارة (Signal Quality)</span>
            {weakDevices.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-900 text-rose-700 shadow-sm">
                {weakDevices.length} تنبيه
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            بيانات الدخول (Credentials)
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={\`px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 \${
              isRefreshing ? "opacity-65 cursor-not-allowed" : ""
            }\`}
          >
            <RefreshCw className={\`w-4 h-4 \${isRefreshing ? "animate-spin" : ""}\`} />
            تحديث القائمة (Neighbors)
          </button>`;

const replacementButtons = `        <div className="flex flex-wrap gap-2 shrink-0">
          {/* Signal Diagnostic Tool Button */}
          <button
            type="button"
            onClick={() => setShowSignalTool(!showSignalTool)}
            className={\`px-4 py-2 font-extrabold text-sm rounded-xl transition-all border flex items-center gap-2 relative shrink-0 whitespace-nowrap \${
              showSignalTool
                ? "bg-purple-700 text-white border-purple-800 shadow-md"
                : weakDevices.length > 0
                ? "bg-gradient-to-r from-amber-500 via-rose-600 to-rose-700 hover:from-amber-600 hover:to-rose-800 text-white border-rose-500 shadow-lg shadow-rose-200/60 animate-pulse"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400"
            }\`}
          >
            <Signal className="w-4 h-4 shrink-0" />
            <span className="shrink-0">أداة فحص الإشارة (Signal Quality)</span>
            {weakDevices.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-900 text-rose-700 shadow-sm shrink-0">
                {weakDevices.length} تنبيه
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span className="shrink-0">بيانات الدخول (Credentials)</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={\`px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 whitespace-nowrap \${
              isRefreshing ? "opacity-65 cursor-not-allowed" : ""
            }\`}
          >
            <RefreshCw className={\`w-4 h-4 shrink-0 \${isRefreshing ? "animate-spin" : ""}\`} />
            <span className="shrink-0">تحديث القائمة (Neighbors)</span>
          </button>`;

content = content.replace(targetButtons, replacementButtons);

// Check if it worked
if (content.includes('shrink-0 whitespace-nowrap')) {
  fs.writeFileSync('src/components/DevicesView.tsx', content);
  console.log('Success');
} else {
  console.log('Target not found');
}
