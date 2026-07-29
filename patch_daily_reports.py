import os

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will insert the daily reports logic after the autoDeleteOldLogs useEffect.
split_str = "}, [logs, settings.autoDeleteOldLogs, settings.autoDeleteLogsMonths]);"

parts = content.split(split_str)
if len(parts) == 2:
    new_logic = """}, [logs, settings.autoDeleteOldLogs, settings.autoDeleteLogsMonths]);

  // Daily Reports Generation
  useEffect(() => {
    if (settings.enableDailyReports) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (settings.lastDailyReportDate !== dateStr) {
        // Delay execution slightly to ensure data is loaded
        const timer = setTimeout(() => {
          const newSubscribersToday = customers.filter(c => c.createdAt && c.createdAt.startsWith(dateStr)).length;
          const onlineCount = customers.filter(c => c.status === "متصل").length;
          const totalCount = customers.length;
          const serversCount = routers.length;
          const onlineServers = routers.filter(r => r.status === "متصل").length;
          
          const reportLog = {
            id: `log_report_${Date.now()}`,
            action: "تقارير النظام",
            details: `تقرير يومي: ${newSubscribersToday} مشترك جديد. المشتركين المتصلين: ${onlineCount}/${totalCount}. السيرفرات: ${onlineServers}/${serversCount} متصل.`,
            date: dateStr,
            time: today.toTimeString().split(' ')[0].substring(0, 5),
            user: "النظام (تلقائي)"
          };
          
          setLogs(prev => {
            const newLogs = [reportLog, ...prev];
            safeStorage.setItem("radius_logs", JSON.stringify(newLogs));
            return newLogs;
          });
          
          setSettings(prev => {
            const newSettings = { ...prev, lastDailyReportDate: dateStr };
            safeStorage.setItem("radius_settings", JSON.stringify(newSettings));
            return newSettings;
          });
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [settings.enableDailyReports, settings.lastDailyReportDate, customers, routers]);
"""
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(parts[0] + new_logic + parts[1])
    print("Added daily reports logic")
else:
    print("Could not find insertion point")
