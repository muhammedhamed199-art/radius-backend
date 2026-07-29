const fs = require('fs');
let content = fs.readFileSync('src/components/DistributorsView.tsx', 'utf8');

const oldPhoneInput = `            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رقم الجوال (WhatsApp):</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 966540000000"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>`;

const newPhoneInput = oldPhoneInput + `
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">شعار الموزع (اختياري):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogo(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {logo && <img src={logo} alt="شعار الموزع" className="mt-2 h-10 w-auto rounded border" />}
            </div>`;

content = content.replace(oldPhoneInput, newPhoneInput);
fs.writeFileSync('src/components/DistributorsView.tsx', content);
