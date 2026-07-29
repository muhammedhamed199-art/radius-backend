import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Let's see the current container start
register_ui = """
      {/* Login Container Box */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300 my-16">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className={`inline-flex p-3.5 ${loginMode === "subscriber" ? "bg-teal-500/10 border-teal-500/20 text-teal-400" : (loginMode === "register" || loginMode === "register_subscriber") ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"} border rounded-2xl shadow-inner mb-1 transition-colors duration-500`}>
            {(loginMode === "register" || loginMode === "register_subscriber") ? <UserPlus className="w-7 h-7" /> : <Lock className="w-7 h-7" />}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {loginMode === "subscriber" ? "بوابة الدفع التلقائي - تسجيل الدخول" : 
             loginMode === "register" ? "إنشاء حساب موزع جديد" : 
             loginMode === "register_subscriber" ? "تسجيل مشترك جديد" : 
             "تسجيل الدخول إلى النظام"}
          </h2>
          <p className="text-xs text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed">
            {loginMode === "subscriber" ? "أدخل اسم المستخدم وكلمة المرور الخاصة باشتراكك لتسجيل الدخول للبوابة الذاتية." : 
             loginMode === "register" ? "قم بتعبئة بياناتك لإنشاء حساب موزع جديد في النظام." : 
             loginMode === "register_subscriber" ? "قم بتعبئة بياناتك لإنشاء حساب مشترك جديد واختيار باقتك." : 
             displayDescription}
          </p>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-rose-300 font-bold animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {(loginMode === "register" || loginMode === "register_subscriber") ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-300">الاسم الكامل *</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 text-sm outline-none transition-all placeholder:text-slate-600" placeholder="الاسم" />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-300">رقم الهاتف</label>
              <input type="text" value={regPhone} onChange={e => setRegPhone(e.target.value)} dir="ltr" className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600" placeholder="05xxxxxxxx" />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-300">اسم المستخدم (للدخول) *</label>
              <input type="text" value={regUsername} onChange={e => setRegUsername(e.target.value)} dir="ltr" required className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600" placeholder="username" />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-300">كلمة المرور *</label>
              <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} dir="ltr" required className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 font-mono text-sm outline-none transition-all placeholder:text-slate-600" placeholder="••••••••" />
            </div>
            
            {loginMode === "register" && distributorOffers && distributorOffers.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-300">اختيار خطة الاشتراك</label>
                <select value={regOfferId} onChange={e => setRegOfferId(e.target.value)} className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 text-sm outline-none transition-all">
                  <option value="">بدون خطة حالياً</option>
                  {distributorOffers.map(offer => (
                    <option key={offer.id} value={offer.id}>{offer.name} - {offer.price} {offer.currency || "ريال"}</option>
                  ))}
                </select>
              </div>
            )}
            
            {loginMode === "register_subscriber" && offers && offers.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-300">اختيار باقة الإنترنت</label>
                <select value={regOfferId} onChange={e => setRegOfferId(e.target.value)} className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 text-sm outline-none transition-all" required>
                  <option value="" disabled>اختر الباقة</option>
                  {offers.map(offer => (
                    <option key={offer.id} value={offer.id}>{offer.name} - {offer.price} ريال</option>
                  ))}
                </select>
              </div>
            )}
            
            <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-sm rounded-2xl shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>تسجيل الحساب</span>
            </button>
            
            <div className="text-center mt-4">
              <button type="button" onClick={() => setLoginMode(loginMode === "register_subscriber" ? "subscriber" : "admin")} className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                لديك حساب بالفعل؟ تسجيل الدخول
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
"""

content = re.sub(r'\{/\* Login Container Box \*/\}.*?<form onSubmit=\{handleSubmit\} className="space-y-4">', register_ui, content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
