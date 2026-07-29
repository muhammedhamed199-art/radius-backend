const lucide = require('lucide-react');
const icons = [
  "LayoutDashboard", "Wifi", "Radio", "BarChart3", "Percent", "Users", "Server", 
  "History", "CreditCard", "UserCheck", "UserCheck2", "MessageSquare", "Settings", 
  "Shield", "Menu", "X", "Lock", "User", "LogOut", "Signal", "Moon", "Sun", 
  "Zap", "Globe", "DollarSign", "Eye", "EyeOff", "Key", "Edit", "Check", "FileText"
];

let ok = true;
for (const icon of icons) {
  if (!lucide[icon]) {
    console.error("Missing icon:", icon);
    ok = false;
  }
}
if (ok) console.log("All icons exist");
