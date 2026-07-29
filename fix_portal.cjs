const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

const target = `            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
          </div>
          {/* Quick Search Widget */}`;

const replaceWith = `            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
            </div>
          </div>
          {/* Quick Search Widget */}`;

content = content.replace(target, replaceWith);
fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
