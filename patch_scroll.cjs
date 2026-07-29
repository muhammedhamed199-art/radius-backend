const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `<div className="h-[100dvh] w-full overflow-hidden bg-teal-50 dark:bg-teal-950 text-slate-800 dark:text-slate-100 font-sans flex selection:bg-teal-100 selection:text-teal-900 transition-colors duration-200" dir={currentLang === "en" ? "ltr" : "rtl"}>
      <AutoTranslator currentLang={currentLang} />
        <div className="flex-1 flex flex-col min-h-screen w-full mx-auto p-4 sm:p-6 w-full">`;

const replacement = `<div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-teal-50 dark:bg-teal-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900 transition-colors duration-200" dir={currentLang === "en" ? "ltr" : "rtl"}>
      <AutoTranslator currentLang={currentLang} />
        <div className="flex-1 flex flex-col w-full mx-auto p-4 sm:p-6">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Fixed!");
} else {
  console.log("Not found!");
}
