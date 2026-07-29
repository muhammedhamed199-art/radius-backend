import re

with open('src/components/Subscriber360Modal.tsx', 'r') as f:
    content = f.read()

new_btn = """
          <button
            onClick={() => setActiveTab("special_offer")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "special_offer"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>8. باقة مؤقتة (خاصة)</span>
          </button>
        </div>
"""

content = content.replace("          </button>\n        </div>", "          </button>\n" + new_btn)

with open('src/components/Subscriber360Modal.tsx', 'w') as f:
    f.write(content)
