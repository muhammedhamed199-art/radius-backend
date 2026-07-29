const fs = require('fs');
let content = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');

const targetButtons = `          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-100"
          >
            <Plus className="w-4 h-4" />
            إضافة جهاز
          </button>`;

const replacementButtons = `          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-100 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="shrink-0">إضافة جهاز</span>
          </button>`;

content = content.replace(targetButtons, replacementButtons);
fs.writeFileSync('src/components/DevicesView.tsx', content);
