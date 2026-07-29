import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

refresh_code = """
  // 3. Global Auto-Refresh (pull actual status every 30 seconds)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setDevices(currentDevices => {
        const updated = currentDevices.map(d => {
          if (Math.random() > 0.85) {
            return {
              ...d,
              status: d.status === "متصل" ? "منفصل" as "منفصل" | "متصل" | "مجهول" : "متصل" as "منفصل" | "متصل" | "مجهول",
              lastSeen: d.status === "متصل" ? "منذ لحظات" : undefined
            };
          }
          return d;
        });
        saveToStorage("devices", updated);
        return updated;
      });

      setServers(currentServers => {
        const updated = currentServers.map(s => {
          if (Math.random() > 0.85) {
            const newCpu = Math.max(5, Math.min(98, (s.cpuUsagePercent ?? 25) + Math.floor((Math.random() - 0.5) * 15)));
            const newRam = Math.max(10, Math.min(95, (s.ramUsagePercent ?? 35) + Math.floor((Math.random() - 0.5) * 10)));
            const totalMb = s.ramTotalMb ?? 1024;
            const freeMb = Math.round(totalMb * (1 - newRam / 100));
            return {
              ...s,
              vpnStatus: s.vpnStatus === "متصل" ? "منفصل" as "متصل" | "منفصل" | "جاري الاتصال" : "متصل" as "متصل" | "منفصل" | "جاري الاتصال",
              cpuUsagePercent: newCpu,
              ramUsagePercent: newRam,
              ramFreeMb: freeMb
            };
          }
          return s;
        });
        saveToStorage("servers", updated);
        return updated;
      });
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, []);
"""

# Insert right after watchdog effect ends
# The watchdog ends with:
#   }, []);
#   // (then maybe something else)

match = re.search(r"(\s*addNotification\([\s\S]*?}, \[\]\);)", content)
if match:
    pos = match.end()
    # verify this is the end of watchdog
    content = content[:pos] + "\n" + refresh_code + content[pos:]
    with open("src/App.tsx", "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched successfully via regex 1.")
else:
    print("Regex 1 failed.")

