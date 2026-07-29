const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldText = `<div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-indigo-600 font-black flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                      يتم الحفظ تلقائياً في ذاكرة المتصفح المحلية
                    </span>
                  </div>`;

const newText = ``;

if (content.includes(oldText)) {
  content = content.replace(oldText, newText);
} else {
  console.log("Could not find auto-save text");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
