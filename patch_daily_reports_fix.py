import os

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace 'routers' with 'servers' in the new logic
content = content.replace("const serversCount = routers.length;", "const serversCount = servers.length;")
content = content.replace('const onlineServers = routers.filter(r => r.status === "متصل").length;', 'const onlineServers = servers.filter(r => r.status === "متصل").length;')
content = content.replace("}, [settings.enableDailyReports, settings.lastDailyReportDate, customers, routers]);", "}, [settings.enableDailyReports, settings.lastDailyReportDate, customers, servers]);")

with open("src/App.tsx", "w", encoding="utf-8") as f:
    f.write(content)

