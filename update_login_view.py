import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# 1. Add onSubscriberLogin to props interface
content = content.replace(
    'onOpenSubscriberPortal?: () => void;',
    'onOpenSubscriberPortal?: () => void;\n  onSubscriberLogin?: (username: string, pass: string) => void;'
)

# 2. Add to props destruction
content = content.replace(
    'onOpenSubscriberPortal,\n  currentLang',
    'onOpenSubscriberPortal,\n  onSubscriberLogin,\n  currentLang'
)

# 3. Add loginMode state
content = content.replace(
    'const [password, setPassword] = useState("");',
    'const [password, setPassword] = useState("");\n  const [loginMode, setLoginMode] = useState<"admin" | "subscriber">("admin");'
)

# 4. Modify handleSubmit
submit_orig = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {"""
submit_new = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (loginMode === "subscriber") {
      if (onSubscriberLogin) {
        onSubscriberLogin(username, password);
        // Let the parent handle success/failure, we just clear loading for now if it doesn't navigate
        setTimeout(() => setIsLoading(false), 500);
      }
      return;
    }

    setTimeout(() => {"""
content = content.replace(submit_orig, submit_new)

# 5. Modify background gradient based on loginMode
bg_orig = 'className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white" dir="rtl"'
bg_new = 'className={`min-h-screen w-full ${loginMode === "subscriber" ? "bg-teal-950 selection:bg-teal-500" : "bg-slate-950 selection:bg-indigo-500"} text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:text-white transition-colors duration-500`} dir="rtl"'
content = content.replace(bg_orig, bg_new)

# 6. Orbs
orb1 = 'className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"'
orb1_new = 'className={`absolute -top-40 -right-40 w-96 h-96 ${loginMode === "subscriber" ? "bg-emerald-600/20" : "bg-indigo-600/20"} rounded-full blur-3xl pointer-events-none animate-pulse transition-colors duration-500`}'
content = content.replace(orb1, orb1_new)

orb2 = 'className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"'
orb2_new = 'className={`absolute -bottom-40 -left-40 w-96 h-96 ${loginMode === "subscriber" ? "bg-teal-600/20" : "bg-purple-600/20"} rounded-full blur-3xl pointer-events-none animate-pulse transition-colors duration-500`}'
content = content.replace(orb2, orb2_new)

orb3 = 'className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"'
orb3_new = 'className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] ${loginMode === "subscriber" ? "bg-teal-500/15" : "bg-emerald-500/10"} rounded-full blur-[120px] pointer-events-none transition-colors duration-500`}'
content = content.replace(orb3, orb3_new)

# 7. Button to toggle modes
btn_orig = """          {showSubscriberPortal && onOpenSubscriberPortal && (
            <button
              onClick={onOpenSubscriberPortal}
              className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border-0 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-900/20"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>بوابة المشتركين الذاتية</span>
            </button>
          )}"""
btn_new = """          {showSubscriberPortal && onOpenSubscriberPortal && (
            <button
              onClick={() => {
                if (loginMode === "admin") {
                  setLoginMode("subscriber");
                } else {
                  setLoginMode("admin");
                }
              }}
              className={`px-4 py-2 bg-gradient-to-r ${loginMode === "admin" ? "from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-900/20" : "from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 shadow-slate-900/20"} text-white border-0 font-extrabold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg`}
            >
              {loginMode === "admin" ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>بوابة المشتركين الذاتية</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>تسجيل دخول الإدارة</span>
                </>
              )}
            </button>
          )}"""
content = content.replace(btn_orig, btn_new)

# 8. Title and Icon
icon_orig = 'className="inline-flex p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner mb-1"'
icon_new = 'className={`inline-flex p-3.5 ${loginMode === "subscriber" ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"} border rounded-2xl shadow-inner mb-1 transition-colors duration-500`}'
content = content.replace(icon_orig, icon_new)

content = content.replace(
    '<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">تسجيل الدخول إلى النظام</h2>',
    '<h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{loginMode === "subscriber" ? "بوابة المشتركين - تسجيل الدخول" : "تسجيل الدخول إلى النظام"}</h2>'
)
content = content.replace(
    '{displayDescription}',
    '{loginMode === "subscriber" ? "أدخل اسم المستخدم وكلمة المرور الخاصة باشتراكك لتسجيل الدخول للبوابة الذاتية." : displayDescription}'
)

# 9. Main form fields glow
content = content.replace(
    'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
    '${loginMode === "subscriber" ? "focus:border-teal-500 focus:ring-teal-500/20" : "focus:border-indigo-500 focus:ring-indigo-500/20"} focus:ring-2'
)

# 10. Checkbox
content = content.replace(
    'className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/20"',
    'className={`w-4 h-4 rounded border-slate-700 bg-slate-950 ${loginMode === "subscriber" ? "text-teal-600 focus:ring-teal-500/20" : "text-indigo-600 focus:ring-indigo-500/20"}`}'
)

# 11. Submit Button
submit_btn_orig = 'className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border border-indigo-500/30 active:scale-[0.99]"'
submit_btn_new = 'className={`w-full py-3.5 bg-gradient-to-r ${loginMode === "subscriber" ? "from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-teal-600/30 border-teal-500/30" : "from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-600/30 border-indigo-500/30"} text-white font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group border active:scale-[0.99]`}'
content = content.replace(submit_btn_orig, submit_btn_new)


with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)

