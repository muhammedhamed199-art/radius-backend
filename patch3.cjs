const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Update dot in status pill to pulse red when disconnected
content = content.replace(
  '<span className={`w-1.5 h-1.5 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />',
  '<span className={`w-1.5 h-1.5 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />'
);

content = content.replace(
  '<div className={`w-2 h-2 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}></div>',
  '<div className={`w-2 h-2 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`}></div>'
);

fs.writeFileSync('src/components/NasServersView.tsx', content);
