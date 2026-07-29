const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Add state
const oldStateBlock = `  const [lastSavedTemplateVars, setLastSavedTemplateVars] = useState(templateVars);`;
const newStateBlock = `  const [lastSavedTemplateVars, setLastSavedTemplateVars] = useState(templateVars);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);`;

if (content.includes(oldStateBlock)) {
  content = content.replace(oldStateBlock, newStateBlock);
} else {
  console.log("Could not find oldStateBlock");
}

// Update button
const oldButton = `                    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  حفظ التعديلات
                </button>`;

const newButton = `                    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
                    
                    setIsTemplateSaved(true);
                    setTimeout(() => setIsTemplateSaved(false), 2000);
                    
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className={\`px-4 py-1.5 font-extrabold text-xs rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm \${
                    isTemplateSaved 
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 animate-pulse" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }\`}
                >
                  {isTemplateSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isTemplateSaved ? "تم الحفظ بنجاح!" : "حفظ التعديلات"}
                </button>`;

if (content.includes(oldButton)) {
  content = content.replace(oldButton, newButton);
} else {
  console.log("Could not find oldButton");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
