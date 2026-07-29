const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Remove useEffect for unifiedTemplate
content = content.replace(
  `  // Sync to localStorage\n  React.useEffect(() => {\n    localStorage.setItem("unified_terminal_template", unifiedTemplate);\n  }, [unifiedTemplate]);`,
  ``
);

// Add Save Button
const oldButtons = `<div className="flex justify-end pb-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("هل أنت متأكد من رغبتك في استعادة القالب الافتراضي للمصنع؟ سيتم إلغاء تعديلاتك الحالية.")) {`;

const newButtons = `<div className="flex justify-end gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem("unified_terminal_template", unifiedTemplate);
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("هل أنت متأكد من رغبتك في استعادة القالب الافتراضي للمصنع؟ سيتم إلغاء تعديلاتك الحالية.")) {`;

if (content.includes(oldButtons)) {
  content = content.replace(oldButtons, newButtons);
} else {
  console.log("Could not find buttons");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
