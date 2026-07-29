import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

register_button_logic = """
          <button
            onClick={() => {
              if (loginMode === "subscriber" || loginMode === "register_subscriber") {
                setLoginMode("register_subscriber");
              } else {
                setLoginMode("register");
              }
            }}
            className={`px-4 py-2 bg-gradient-to-r ${(loginMode === "register" || loginMode === "register_subscriber") ? "from-amber-600 to-orange-600 shadow-amber-900/20" : "from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-900/20"} text-white border-0 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg`}
          >
            <UserPlus className={`w-3.5 h-3.5 ${(loginMode === "register" || loginMode === "register_subscriber") ? "text-white" : "text-amber-400"}`} />
            <span className="hidden sm:inline">حساب جديد</span>
          </button>
"""

content = re.sub(r'<button\s*onClick=\{.*?\}\s*className=\{`px-4 py-2 bg-gradient-to-r.*?`\}\s*>\s*<UserPlus className=\{`w-3\.5 h-3\.5.*?`\} />\s*<span className="hidden sm:inline">حساب جديد</span>\s*</button>', register_button_logic.strip(), content, flags=re.DOTALL)


# Also, let's update the text below the regular login form to allow registering a subscriber.
login_form_footer = """
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 bg-gradient-to-r ${loginMode === "subscriber" ? "from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/30 border-teal-500/30" : "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30 border-indigo-500/30"} text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border active:scale-[0.99]`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            )}
            <span>{isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}</span>
          </button>
          
          <div className="text-center mt-4">
            <button 
              type="button" 
              onClick={() => {
                if (loginMode === "subscriber") setLoginMode("register_subscriber");
                else setLoginMode("register");
              }} 
              className={`text-xs font-bold ${loginMode === "subscriber" ? "text-teal-400 hover:text-teal-300" : "text-indigo-400 hover:text-indigo-300"} transition-colors`}
            >
              ليس لديك حساب؟ إنشاء حساب جديد
            </button>
          </div>
"""

content = re.sub(r'<button\s*type="submit"\s*disabled=\{isLoading\}\s*className=\{`w-full py-3\.5 bg-gradient-to-r.*?`\}\s*>.*?<span>\{isLoading \? "جاري تسجيل الدخول\.\.\." : "تسجيل الدخول"\}</span>\s*</button>', login_form_footer.strip(), content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
