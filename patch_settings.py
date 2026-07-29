import re
with open("src/components/SettingsView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add state
content = content.replace(
    'const [autoDeleteOldLogs, setAutoDeleteOldLogs] = useState(settings.autoDeleteOldLogs ?? true);',
    'const [autoDeleteOldLogs, setAutoDeleteOldLogs] = useState(settings.autoDeleteOldLogs ?? true);\n  const [enableDailyReports, setEnableDailyReports] = useState(settings.enableDailyReports ?? false);'
)

# Add to save (part 1)
content = content.replace(
    'autoDeleteOldLogs, autoDeleteLogsMonths, showAccountSwitcher,',
    'autoDeleteOldLogs, autoDeleteLogsMonths, showAccountSwitcher, enableDailyReports,'
)

# Add UI
ui_to_add = """
              {/* Daily Reports Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">تقارير يومية تلقائية</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">جدولة تقارير يومية تلقائية تُرسل إلى سجل العمليات (Audit Logs) تلخص عدد المشتركين الجدد وحالة السيرفرات</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={enableDailyReports} onChange={(e) => setEnableDailyReports(e.target.checked)} />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                </label>
              </div>
"""
# Find where to put it. Let's put it after the autoDeleteOldLogs UI.
content = content.replace(
    '<h4 className="font-bold text-slate-900 dark:text-white text-sm">حذف السجلات القديمة تلقائياً</h4>',
    ui_to_add + '\n              <h4 className="font-bold text-slate-900 dark:text-white text-sm">حذف السجلات القديمة تلقائياً</h4>'
)

# import FileText if not there
if 'FileText' not in content:
    content = content.replace('FileText,', '').replace('} from "lucide-react";', ', FileText } from "lucide-react";')


with open("src/components/SettingsView.tsx", "w", encoding="utf-8") as f:
    f.write(content)
