import re

with open("src/App.tsx", "r") as f:
    content = f.read()

# Fix handleLogout
content = re.sub(
    r"(addNotification\(\"تم تسجيل الخروج\", \"success\"\);\s*\})",
    r"addNotification(\"تم تسجيل الخروج\", \"success\");\n    setMobileMenuOpen(false);\n  }",
    content
)

# Fix mobile drawer
content = re.sub(
    r"(<div className=\"lg:hidden fixed inset-0 top-16 bg-white/80 backdrop-blur-sm z-40 animate-in fade-in duration-200\">)\s*(<div className=\"absolute right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80 max-w-\[85vw\] h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right-10\">)",
    r"<div className=\"lg:hidden fixed inset-0 top-16 bg-white/80 backdrop-blur-sm z-40 animate-in fade-in duration-200\" onClick={() => setMobileMenuOpen(false)}>\n          <div className=\"absolute right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80 max-w-[85vw] h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right-10\" onClick={(e) => e.stopPropagation()}>",
    content
)

with open("src/App.tsx", "w") as f:
    f.write(content)
