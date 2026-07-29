import re

with open('src/components/SettingsView.tsx', 'r') as f:
    content = f.read()

target = """          {/* Engineer details card */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">"""

replacement = """          {/* Engineer details card */}
          {(!currentUser.distributorId) && (
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">"""

content = content.replace(target, replacement)

target2 = """                  />
                  <button
                    type="button"
                    onClick={() => setShowEngineerPassword(!showEngineerPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showEngineerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>"""

replacement2 = """                  />
                  <button
                    type="button"
                    onClick={() => setShowEngineerPassword(!showEngineerPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showEngineerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}"""

content = content.replace(target2, replacement2)

with open('src/components/SettingsView.tsx', 'w') as f:
    f.write(content)
