const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

const targetHeader = `          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              إدارة العملاء والمشتركين في الريديوس
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              إضافة وتعديل المشتركين، مراجعة وتعديل بيانات الاتصال (العنوان والمنطقة والهاتف)، مع محرك إرسال الرسائل الجماعية عبر WhatsApp.
            </p>
          </div>`;

const replacementHeader = `          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-800/30 mt-1">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1 pt-0.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                إدارة العملاء والمشتركين في الريديوس
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-normal">
                إضافة وتعديل المشتركين، مراجعة وتعديل بيانات الاتصال (العنوان والمنطقة والهاتف)، مع محرك إرسال الرسائل الجماعية عبر WhatsApp.
              </p>
            </div>
          </div>`;

content = content.replace(targetHeader, replacementHeader);
fs.writeFileSync('src/components/SubscribersView.tsx', content);
console.log('SubscribersView Header replaced successfully');
