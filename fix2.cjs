const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

const oldStr = `            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
          </div>
          {/* Quick Search Widget */}`;

const newStr = `            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
            </div>
          </div>
          {/* Quick Search Widget */}`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
  console.log("Fixed!");
} else {
  console.log("String not found");
}
