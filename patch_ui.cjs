const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldUI = `<div className="space-y-2">
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">اسم السيرفر / الموزع</span>
                        <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px]">{"{{NAME}}"}</code>
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">عنوان الـ IP الخارجي</span>
                        <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px]">{"{{IP}}"}</code>
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">آي بي نفق الـ VPN</span>
                        <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px]">{"{{VPN_IP}}"}</code>
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-150">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">كلمة سر الريديوس (Secret)</span>
                        <code className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px]">{"{{SECRET}}"}</code>
                      </div>
                    </div>`;

const newUI = `<div className="space-y-2">
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">اسم السيرفر / الموزع</span>
                        <input
                          type="text"
                          value={templateVars.name}
                          onChange={(e) => setTemplateVars({ ...templateVars, name: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">عنوان الـ IP الخارجي</span>
                        <input
                          type="text"
                          value={templateVars.ip}
                          onChange={(e) => setTemplateVars({ ...templateVars, ip: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">آي بي نفق الـ VPN</span>
                        <input
                          type="text"
                          value={templateVars.vpnIp}
                          onChange={(e) => setTemplateVars({ ...templateVars, vpnIp: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-150">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">كلمة سر الريديوس (Secret)</span>
                        <input
                          type="text"
                          value={templateVars.secret}
                          onChange={(e) => setTemplateVars({ ...templateVars, secret: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                    </div>`;

if (content.includes(oldUI)) {
  content = content.replace(oldUI, newUI);
} else {
  console.log("Could not find old UI block");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
