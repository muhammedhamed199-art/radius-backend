import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

# 1. Add imports
if 'import { PERMISSION_GROUPS, getFullPermissionsObject }' not in content:
    content = content.replace(
        'import { DEFAULT_CURRENCIES } from "../mockData";',
        'import { DEFAULT_CURRENCIES } from "../mockData";\nimport { PERMISSION_GROUPS, getFullPermissionsObject } from "../utils/permissions";'
    )

# 2. Add activeTab state
if 'const [activeTab, setActiveTab]' not in content:
    content = content.replace(
        'const [savedSuccess, setSavedSuccess] = useState(false);',
        'const [savedSuccess, setSavedSuccess] = useState(false);\n  const [activeTab, setActiveTab] = useState<"general" | "owner">("general");'
    )

# 3. Define the Tabs UI
tabs_ui = """
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-px mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          الإعدادات العامة
        </button>
        {(!currentUser.distributorId) && (
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'owner'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            إدارة المالك المسئول للنظام
          </button>
        )}
      </div>
"""

# Insert tabs after Header (Header ends with </div> just before SCHEDULED TASKS)
# Let's find:
header_end = """        </div>
      </div>"""

scheduled_tasks_start = """            {/* 1. SCHEDULED TASKS & CRON AUTOMATION ENGINE CARD */}"""

# We'll replace the space between them
content = content.replace(
    header_end + '\n\n' + scheduled_tasks_start,
    header_end + '\n\n' + tabs_ui + '\n\n      {activeTab === "general" && (\n        <div className="space-y-6">\n' + scheduled_tasks_start
)

# 4. Now we need to wrap the rest of the general settings in this div, and cut out the Engineer card.
# The engineer card starts with:
engineer_card = """          {/* Engineer details card */}
          {(!currentUser.distributorId) && (
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">"""

# It ends just before:
login_settings = """          {/* Login Page External Branding & Settings Card */}"""

# Let's extract the engineer card
import re
engineer_match = re.search(r'          \{/\* Engineer details card \*/\}.*?          \{/\* Login Page External Branding & Settings Card \*/\}', content, re.DOTALL)
if engineer_match:
    extracted_engineer = engineer_match.group(0).replace('          {/* Login Page External Branding & Settings Card */}', '').strip()
    # Remove it from content
    content = content.replace(extracted_engineer, '')
else:
    print("Engineer card not found")

save_button = """          {/* Form Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700 dark:border-slate-800 mt-6 lg:col-span-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-black rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <Save className="w-5 h-5" />
              حفظ جميع الإعدادات
            </button>
            {savedSuccess && (
              <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in fade-in slide-in-from-right-4">
                <Check className="w-5 h-5" />
                تم حفظ الإعدادات بنجاح
              </span>
            )}
          </div>"""

owner_tab_ui = f"""
      {{activeTab === "owner" && (
        <div className="space-y-6">
          <form onSubmit={{handleSave}} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {extracted_engineer}
              
              {{/* Permissions Display */}}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base border-b border-slate-100 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  الصلاحيات الكلية للنظام
                </h3>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-sm">
                  بصفتك المالك المسئول للنظام (أو مدير تقني)، أنت تمتلك كافة الصلاحيات المتاحة في النظام لجميع الوحدات والإعدادات بشكل افتراضي، ولا يمكن تقييدها.
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 pl-1 mt-4">
                  {{PERMISSION_GROUPS.map((group) => {{
                    const GroupIcon = group.icon;
                    return (
                      <div key={{group?.id}} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm opacity-80">
                        <div className={{`p-3 border-b dark:border-slate-800 flex items-center justify-between ${{group.headerBg}}`}}>
                          <div className="flex items-center gap-2">
                            <div className={{`p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200`}}>
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{{group.title}}</span>
                          </div>
                          <span className="text-[10px] font-black bg-white/60 dark:bg-slate-900/60 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {{group.permissions.length}} / {{group.permissions.length}}
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {{group.permissions.map((perm) => (
                            <label
                              key={{perm.key}}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-not-allowed bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                            >
                              <div className="relative flex items-center mt-0.5">
                                <input type="checkbox" checked readOnly className="sr-only" />
                                <div className="w-4 h-4 rounded-md border flex items-center justify-center transition-all bg-emerald-500 border-emerald-500">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="flex-1 space-y-1">
                                <span className="font-extrabold text-slate-800 dark:text-slate-100 block line-clamp-1 text-[11px] leading-tight">{{perm.label}}</span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-relaxed opacity-90">{{perm.desc}}</span>
                              </div>
                            </label>
                          )))}}
                        </div>
                      </div>
                    );
                  }})}}
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Save className="w-5 h-5" />
                  حفظ بيانات المالك
                </button>
                {{savedSuccess && (
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in fade-in slide-in-from-right-4">
                    <Check className="w-5 h-5" />
                    تم حفظ البيانات بنجاح
                  </span>
                )}}
              </div>
            </div>
          </form>
        </div>
      )}}
"""

# Close the general tab wrapping div just before the ConfirmModal
# We find the ConfirmModal:
confirm_modal = """      <ConfirmModal"""
content = content.replace(
    confirm_modal,
    '        </div>\n      )}\n\n' + owner_tab_ui + '\n\n' + confirm_modal
)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
