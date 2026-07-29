import re

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

new_jsx = """
  return (
    <div className="min-h-[100dvh] w-full bg-[#09090b] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200" dir="rtl">
      
      {/* Subtle Glow behind logo */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-[440px] mx-auto">
        
        {/* Top Floating Header */}
        <div className="flex flex-col items-center justify-center mb-10 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.3)] ring-1 ring-white/10">
            <Signal className="w-8 h-8 text-white" />
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-[1.75rem] font-black tracking-tight text-white">{displaySystemName}</h1>
            <p className="text-sm font-medium text-slate-400">{displayTagline}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#121214] border border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both">
          
          {/* Mode Selector */}
          <div className="flex bg-[#09090b] p-1.5 rounded-2xl mb-8 ring-1 ring-white/5">
            <button
              onClick={() => { setLoginMode("admin"); setErrorMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                loginMode === "admin" 
                  ? "bg-[#27272a] text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              مدير نظام / موزع
            </button>
            <button
              onClick={() => { setLoginMode("subscriber"); setErrorMessage(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                loginMode === "subscriber" || loginMode === "register_subscriber"
                  ? "bg-[#27272a] text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              مشترك إنترنت
            </button>
          </div>

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm font-bold text-red-200 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          {loginMode === "register" || loginMode === "register_subscriber" ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="الاسم الثلاثي..."
                    className="w-full bg-[#09090b] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans text-sm outline-none transition-all placeholder:text-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">رقم الهاتف المحمول</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    className="w-full bg-[#09090b] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600 text-right"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    dir="ltr"
                    className="w-full bg-[#09090b] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm outline-none transition-all placeholder:text-slate-600 text-right"
                    required
                  />
                </div>
              </div>

              {loginMode === "register" && distributorOffers && distributorOffers.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">خطة الاشتراك</label>
                  <select 
                    value={regOfferId || (distributorOffers?.[0]?.id || "")} 
                    onChange={e => setRegOfferId(e.target.value)} 
                    className="w-full bg-[#09090b] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                  >
                    {distributorOffers.map(offer => (
                      <option key={offer.id} value={offer.id} className="bg-[#121214]">{offer.name} - {offer.price} {offer.currency || "ريال"}</option>
                    ))}
                  </select>
                </div>
              )}

              {loginMode === "register_subscriber" && offers && offers.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-300">باقة الإنترنت</label>
                  <select 
                    value={regOfferId} 
                    onChange={e => setRegOfferId(e.target.value)} 
                    className="w-full bg-[#09090b] text-white px-5 py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm outline-none transition-all appearance-none"
                    required
                  >
                    <option value="" disabled className="bg-[#121214]">اختر الباقة</option>
                    {offers.map(offer => (
                      <option key={offer.id} value={offer.id} className="bg-[#121214]">{offer.name} - {offer.price} ريال</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-5 h-5" />}
                <span>إنشاء حساب جديد</span>
              </button>

              <div className="text-center mt-6">
                <button type="button" onClick={() => setLoginMode(loginMode === "register_subscriber" ? "subscriber" : "admin")} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                  لديك حساب بالفعل؟ <span className="text-indigo-400">تسجيل الدخول</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-2 group">
                <label className="block text-[13px] font-bold text-slate-300 pr-1">
                  اسم المستخدم أو الهاتف
                </label>
                <div className="relative flex items-center">
                  <div className="absolute right-4 p-1.5 bg-[#1a1a1e] rounded-xl text-slate-400 border border-white/5 pointer-events-none z-10">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))} 
                    autoComplete="off" 
                    autoCorrect="off" 
                    autoCapitalize="none" 
                    spellCheck={false}
                    dir="ltr"
                    className="w-full bg-[#09090b] text-white pl-4 pr-[3.5rem] py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-base outline-none transition-all placeholder:text-slate-600 text-left"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="block text-[13px] font-bold text-slate-300 pr-1">
                  كلمة المرور
                </label>
                <div className="relative flex items-center">
                  <div className="absolute right-4 p-1.5 bg-[#1a1a1e] rounded-xl text-slate-400 border border-white/5 pointer-events-none z-10">
                    <Key className="w-4 h-4" />
                  </div>
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
                    className="w-full bg-[#09090b] text-white pl-12 pr-[3.5rem] py-4 rounded-2xl border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-base outline-none transition-all placeholder:text-slate-600 text-left tracking-widest"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 p-1.5 text-slate-500 hover:text-white transition-all z-10"
                    title={showPassword ? "إخفاء" : "إظهار"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-bold text-slate-500 bg-[#09090b] px-2.5 py-1 rounded-lg border border-white/5">RADIUS v4.8</span>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <span className="text-[13px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors">تذكر بياناتي</span>
                  <div className="relative flex items-center justify-center w-5 h-5 rounded-md border border-slate-700 bg-[#09090b] group-hover:border-indigo-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    {rememberMe && <div className="w-3 h-3 bg-indigo-500 rounded-sm" />}
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait shadow-[0_0_20px_rgba(79,70,229,0.2)]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <span>تسجيل الدخول</span>
                )}
              </button>
            </form>
          )}

        </div>
        
        {displaySupportPhone && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <PhoneCall className="w-4 h-4" />
              <span>للدعم الفني: </span>
              <span className="font-mono text-slate-400 tracking-wider" dir="ltr">{displaySupportPhone}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
"""

start_idx = content.find("  return (")
if start_idx != -1:
    final_code = content[:start_idx] + new_jsx + "\n}\n"
    with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
        f.write(final_code)
