with open('src/components/PermissionProfilesView.tsx', 'r') as f:
    content = f.read()

import_statement = "import { getDefaultDistributorPermissions, getFullPermissionsObject } from '../mockData';"
new_imports = "import { PERMISSION_GROUPS, getDefaultDistributorPermissions, getFullPermissionsObject, getTotalPermissionsCount } from '../utils/permissions';"

content = content.replace(import_statement, new_imports)

# Now, we need to replace the form permissions section.
start_marker = "              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3\">"
end_marker = "              </div>\n            </div>\n\n            <div className=\"flex items-center justify-end gap-3 pt-6"
import re

new_permissions_form = """              <div className="space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.id} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className={`p-4 border-b flex items-start gap-3 ${group.headerBg}`}>
                        <div className={`p-2 rounded-lg shrink-0 ${group.badgeColor}`}>
                          <GroupIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">{group.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {group.permissions.map((perm) => {
                          const permKey = perm.key as keyof DistributorPermissions;
                          const isChecked = editingProfile?.permissions?.[permKey] || false;
                          return (
                            <label key={permKey} className={`flex items-start p-3 rounded-xl border cursor-pointer transition-colors ${isChecked ? 'bg-white border-indigo-200 shadow-sm dark:bg-indigo-900/10 dark:border-indigo-800/50' : 'bg-transparent border-slate-200 dark:border-slate-700/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'}`}>
                              <div className="relative flex items-center mt-0.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handlePermissionChange(permKey, e.target.checked)}
                                  className="peer sr-only"
                                />
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-600'}`}>
                                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                              </div>
                              <div className="mr-3">
                                <h5 className={`text-xs font-bold leading-tight ${isChecked ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {perm.label}
                                </h5>
                                <p className="text-[10px] text-slate-500 mt-1 leading-snug">{perm.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}"""

# Regex substitution
content = re.sub(
    r'              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">.*?              </div>',
    new_permissions_form,
    content,
    flags=re.DOTALL
)

# Also remove permissionLabels definition
content = re.sub(r'  const permissionLabels: Record<keyof DistributorPermissions, string> = \{.*?\};', '', content, flags=re.DOTALL)

with open('src/components/PermissionProfilesView.tsx', 'w') as f:
    f.write(content)
