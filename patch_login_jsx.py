import re

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The user wants an amazing login page.
# I will use a very elegant, dark, high-contrast aesthetic.
# Deep slate/blue background, sharp typography, subtle glow.

new_jsx = """
  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">
      
      {/* Abstract Ambient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.15)_0%,rgba(0,0,0,0)_70%)] blur-3xl mix-blend-screen" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.1)_0%,rgba(0,0,0,0)_70%)] blur-3xl mix-blend-screen" />
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.05)_0%,rgba(0,0,0,0)_70%)] blur-3xl mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] mx-auto">
        
        {/* Top Floating Header */}
        <div className="flex flex-col items-center justify-center mb-8 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-1 ring-white/10">
            <Signal className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">{displaySystemName}</h1>
            <p className="text-xs font-medium text-slate-400 tracking-wide">{displayTagline}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#13131a]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
          
          {/* Mode Selector */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-8 ring-1 ring-white/5">
            <button
              onClick={() => { setLoginMode("admin"); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                loginMode === "admin" 
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              مدير نظام / موزع
            </button>
            <button
              onClick={() => { setLoginMode("subscriber"); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                loginMode === "subscriber" || loginMode === "register_subscriber"
                  ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              مشترك إنترنت
            </button>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-red-200 leading-relaxed">{error}</p>
            </div>
          )}

          {loginMode === "register" || loginMode === "register_subscriber" ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="الاسم الثلاثي..."
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">رقم الهاتف المحمول</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-400">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              {loginMode === "register" && distributorOffers && distributorOffers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400">خطة الاشتراك</label>
                  <select 
                    value={regOfferId || (distributorOffers?.[0]?.id || "")} 
                    onChange={e => setRegOfferId(e.target.value)} 
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                  >
                    {distributorOffers.map(offer => (
                      <option key={offer.id} value={offer.id} className="bg-slate-900">{offer.name} - {offer.price} {offer.currency || "ريال"}</option>
                    ))}
                  </select>
                </div>
              )}

              {loginMode === "register_subscriber" && offers && offers.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400">باقة الإنترنت</label>
                  <select 
                    value={regOfferId} 
                    onChange={e => setRegOfferId(e.target.value)} 
                    className="w-full bg-black/40 text-white px-4 py-3 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="bg-slate-900">اختر الباقة</option>
                    {offers.map(offer => (
                      <option key={offer.id} value={offer.id} className="bg-slate-900">{offer.name} - {offer.price} ريال</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3.5 mt-4 bg-white text-black hover:bg-slate-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)]"
              >
                {isLoading ? <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>إنشاء حساب جديد</span>
              </button>

              <div className="text-center mt-4 pt-2 border-t border-white/5">
                <button type="button" onClick={() => setLoginMode(loginMode === "register_subscriber" ? "subscriber" : "admin")} className="text-xs font-medium text-slate-400 hover:text-white transition-colors">
                  لديك حساب بالفعل؟ <span className="text-indigo-400 underline underline-offset-4 decoration-indigo-400/30">تسجيل الدخول</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5 group">
                <label className="block text-xs font-bold text-slate-400 transition-colors group-focus-within:text-indigo-400">
                  اسم المستخدم أو الهاتف
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} 
                    autoComplete="off" 
                    autoCorrect="off" 
                    autoCapitalize="none" 
                    spellCheck={false}
                    placeholder="Username"
                    dir="ltr"
                    className="w-full bg-black/40 text-white pl-4 pr-11 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-black/60 font-mono text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg text-slate-500 pointer-events-none transition-colors group-focus-within:text-indigo-400 group-focus-within:bg-indigo-500/10">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 group">
                <label className="block text-xs font-bold text-slate-400 transition-colors group-focus-within:text-indigo-400">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    autoComplete="current-password" 
                    autoCorrect="off" 
                    autoCapitalize="none" 
                    spellCheck={false}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-black/40 text-white pl-11 pr-11 py-3.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-black/60 font-mono text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white/5 rounded-lg text-slate-500 pointer-events-none transition-colors group-focus-within:text-indigo-400 group-focus-within:bg-indigo-500/10">
                    <Key className="w-4 h-4" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title={showPassword ? "إخفاء" : "إظهار"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-4 h-4 rounded border border-slate-600 bg-black/40 group-hover:border-indigo-400 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    {rememberMe && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />}
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">تذكر بياناتي</span>
                </label>
                <span className="text-[10px] font-bold text-slate-600 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">RADIUS v4.8</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-[0_0_20px_rgba(79,70,229,0.2)] hover:shadow-[0_0_25px_rgba(79,70,229,0.3)]"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <LogIn className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>
          )}

          {displaySupportPhone && (
            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-3">
              <div className="p-2 rounded-full bg-white/5 ring-1 ring-white/10 text-slate-400">
                <PhoneCall className="w-3.5 h-3.5" />
              </div>
              <div className="text-center">
                <p className="text-[10px] text-slate-500 font-medium mb-1">للدعم الفني والاستفسارات</p>
                <p className="font-mono text-xs text-slate-300 tracking-wider">{displaySupportPhone}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
"""

# Extract the existing code up to the 'return (' line
start_idx = content.find("  return (")
if start_idx != -1:
    final_code = content[:start_idx] + new_jsx + "\n}\n"
    with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
        f.write(final_code)
        
