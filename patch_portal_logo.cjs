const fs = require('fs');
let content = fs.readFileSync('src/components/SubscriberPortalView.tsx', 'utf8');

const oldHeader = `        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>بوابة الدفع التلقائي والتجديد المباشر</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              بوابة الدفع التلقائي ⚡
            </h1>`;

const newHeader = `        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            {myDistributor?.logo && (
              <div className="bg-white/10 p-2 rounded-2xl w-fit backdrop-blur-md border border-white/20">
                <img src={myDistributor.logo} alt="شعار الموزع" className="h-16 w-auto object-contain rounded-xl" />
              </div>
            )}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بوابة الدفع التلقائي والتجديد المباشر</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                بوابة الدفع التلقائي ⚡
              </h1>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/SubscriberPortalView.tsx', content);
