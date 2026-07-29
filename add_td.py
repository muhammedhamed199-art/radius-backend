with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

target = """                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px]">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          {customer.status === CustomerStatus.ACTIVE ? ("""

replacement = """                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap text-center">
                        {customer.concurrentLogins > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 px-2 py-1 rounded-md text-[10px] font-black w-max mx-auto shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            أونلاين
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md text-[10px] font-black w-max mx-auto">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            أوفلاين
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px]">
                        <div className="flex flex-col gap-1.5 items-center justify-center">
                          {customer.status === CustomerStatus.ACTIVE ? ("""

content = content.replace(target, replacement)

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
