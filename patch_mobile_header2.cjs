const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\{\/\* 2\. Mobile Header & Drawer \*\/\}([\s\S]*?)\{\/\* Mobile Drawer Menu overlay \*\/\}/m;

const replacement = `{/* 2. Mobile Header & Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white z-40 flex items-center justify-between px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800 gap-1">
        
        {/* Right Side (Start in RTL) - Menu and Quick Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-1 sm:pr-2">
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 rounded-xl"
            title="تبديل الوضع المظلم"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          <button
            onClick={handleToggleLanguage}
            className="p-1.5 px-2 bg-slate-100 dark:bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60"
            title={currentLang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{currentLang === "ar" ? "EN" : "عربي"}</span>
          </button>
          
          {/* Quick Currency Selector Mobile */}
          <select
            value={settings.defaultCurrency}
            onChange={(e) => {
              const updatedSettings = { ...settings, defaultCurrency: e.target.value };
              setSettings(updatedSettings);
              saveToStorage("settings", updatedSettings);
            }}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 focus:outline-none appearance-none"
            title={currentLang === "ar" ? "تغيير العملة الافتراضية" : "Change Default Currency"}
          >
            {DEFAULT_CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code}</option>
            ))}
          </select>
        </div>

        {/* Left Side (End in RTL) - Logo and App Name */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="font-extrabold text-xs sm:text-sm truncate" dir="auto">{settings.radiusName || "RADIUS"}</span>
          <Signal className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
        </div>
      </div>
      {/* Mobile Drawer Menu overlay */}`;

const newContent = content.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', newContent);
console.log('Mobile header patched successfully.');
