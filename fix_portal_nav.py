import re

with open("src/App.tsx", "r") as f:
    content = f.read()

target = """            <div className="flex justify-between items-center mb-6">
                <button 
                  onClick={() => {
                    handleLogout();
                    setActivePortalDistributorId("");
                    if (window.history && window.history.pushState) {
                      window.history.pushState({}, '', window.location.pathname);
                    }
                  }}
                  className="px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow hover:shadow-md text-indigo-700 dark:text-indigo-500 font-bold rounded-xl transition-all border border-indigo-100 dark:border-indigo-900"
                >
                  العودة لتسجيل الدخول
                </button>
            </div>"""

replacement = """            <div className="relative z-50 flex justify-between items-center mb-6">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                    setActivePortalDistributorId("");
                    if (window.history && window.history.replaceState) {
                      window.history.replaceState({}, '', window.location.pathname);
                    }
                  }}
                  className="relative z-50 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow hover:shadow-md text-indigo-700 dark:text-indigo-500 font-bold rounded-xl transition-all border border-indigo-100 dark:border-indigo-900 cursor-pointer touch-manipulation"
                >
                  العودة لتسجيل الدخول
                </button>
            </div>"""

content = content.replace(target, replacement)

with open("src/App.tsx", "w") as f:
    f.write(content)
