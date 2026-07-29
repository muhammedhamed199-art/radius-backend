const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeader = `<div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Signal className="w-5 h-5 text-indigo-500 animate-pulse" />
          <span className="font-extrabold text-sm truncate">{settings.radiusName || "RADIUS"}</span>
        </div>
        <div className="flex items-center gap-2">`;

const replacementHeader = `<div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-40 flex items-center justify-between px-2 sm:px-4 border-b border-slate-800 gap-1">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <Signal className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
          <span className="font-extrabold text-xs sm:text-sm truncate">{settings.radiusName || "RADIUS"}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">`;

if (content.includes(targetHeader)) {
  content = content.replace(targetHeader, replacementHeader);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Fixed mobile header!");
} else {
  console.log("Mobile header not found!");
}
