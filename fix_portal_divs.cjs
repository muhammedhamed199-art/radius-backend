const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

const target = `            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بوابة الدفع التلقائي والتجديد المباشر</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                بوابة الدفع التلقائي ⚡
              </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
          </div>
          {/* Quick Search Widget */}`;

const replaceWith = `            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بوابة الدفع التلقائي والتجديد المباشر</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                بوابة الدفع التلقائي ⚡
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
              </p>
            </div>
          </div>
          {/* Quick Search Widget */}`;

content = content.replace(target, replaceWith);
fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
