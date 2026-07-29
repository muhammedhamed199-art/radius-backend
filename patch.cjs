const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Update Table NAS Icon
content = content.replace(
  '<Server className="w-4 h-4 animate-pulse" />',
  '<Server className={`w-4 h-4 ${server.vpnStatus === "متصل" ? "animate-pulse" : ""}`} />'
);

// Update Grid NAS Icon
content = content.replace(
  '<Server className="w-5 h-5 animate-pulse" />',
  '<Server className={`w-5 h-5 ${server.vpnStatus === "متصل" ? "animate-pulse" : ""}`} />'
);

// Format Table Config Switches
const oldSwitches = `<td className="px-2 py-3 text-xs md:text-sm">
                          <div className="flex flex-col gap-1.5">
                            {/* VPN Switch */}
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">نفق الـ VPN:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedStatus = server.vpnStatus === "متصل" ? "منفصل" : "متصل";
                                  onUpdateServer({ ...server, vpnStatus: updatedStatus });
                                }}
                                className={\`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out \${
                                  server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-slate-300"
                                }\`}
                              >
                                <span className={\`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition duration-200 \${
                                  server.vpnStatus === "متصل" ? "translate-x-4" : "translate-x-0"
                                }\`} />
                              </button>
                            </div>
                            {/* Auto activate config badge */}
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">تفعيل تلقائي:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = server.autoActivateOnStart ?? true;
                                  onUpdateServer({ ...server, autoActivateOnStart: !current });
                                }}
                                className={\`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out \${
                                  (server.autoActivateOnStart ?? true) ? "bg-indigo-600" : "bg-slate-300"
                                }\`}
                              >
                                <span className={\`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition duration-200 \${
                                  (server.autoActivateOnStart ?? true) ? "translate-x-4" : "translate-x-0"
                                }\`} />
                              </button>
                            </div>
                          </div>
                        </td>`;

const newSwitches = `<td className="px-2 py-3">
                          <div className="flex flex-col gap-1.5 w-28">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedStatus = server.vpnStatus === "متصل" ? "منفصل" : "متصل";
                                onUpdateServer({ ...server, vpnStatus: updatedStatus });
                              }}
                              className={\`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all shadow-sm \${
                                server.vpnStatus === "متصل" 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                              }\`}
                            >
                              <span>نفق VPN</span>
                              <div className={\`w-2 h-2 rounded-full \${server.vpnStatus === "متصل" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}\`}></div>
                            </button>
                            
                            <button
                              type="button"
                              onClick={() => {
                                const current = server.autoActivateOnStart ?? true;
                                onUpdateServer({ ...server, autoActivateOnStart: !current });
                              }}
                              className={\`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[10px] font-bold transition-all shadow-sm \${
                                (server.autoActivateOnStart ?? true)
                                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                              }\`}
                            >
                              <span>تفعيل تلقائي</span>
                              <Power className={\`w-3 h-3 \${(server.autoActivateOnStart ?? true) ? "text-indigo-500" : "text-slate-400"}\`} />
                            </button>
                          </div>
                        </td>`;

if (content.includes('نفق الـ VPN:')) {
  content = content.replace(oldSwitches, newSwitches);
} else {
  console.log("Could not find old switches block");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
