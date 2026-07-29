const fs = require('fs');
let content = fs.readFileSync('src/components/SubscribersView.tsx', 'utf8');

// 1. Add distributorFilter state
content = content.replace(
  'const [categoryFilter, setCategoryFilter] = useState<string>("all");',
  'const [categoryFilter, setCategoryFilter] = useState<string>("all");\n  const [distributorFilter, setDistributorFilter] = useState<string>("all");'
);

// 2. Update activeFiltersCount
content = content.replace(
  '    expiryFilter !== "all",\n    !!searchQuery.trim()\n  ]',
  '    expiryFilter !== "all",\n    categoryFilter !== "all",\n    distributorFilter !== "all",\n    !!searchQuery.trim()\n  ]'
);

// 3. Update handleResetFilters
content = content.replace(
  '    setRegionFilter("all");\n    setOnlineFilter("all");',
  '    setRegionFilter("all");\n    setOnlineFilter("all");\n    setCategoryFilter("all");\n    setDistributorFilter("all");'
);

// 4. Update filtering logic
content = content.replace(
  '    // Region Filter\n    if (regionFilter !== "all" && c.region !== regionFilter) {\n      return false;\n    }',
  '    // Region Filter\n    if (regionFilter !== "all" && c.region !== regionFilter) {\n      return false;\n    }\n\n    // Distributor Filter\n    if (distributorFilter !== "all") {\n      if (distributorFilter === "unassigned") {\n        if (c.distributorId) return false;\n      } else if (c.distributorId !== distributorFilter) {\n        return false;\n      }\n    }'
);

// 5. Update Quick Filters UI
const quickFiltersTarget = `        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل الحالات</option>
            <option value={CustomerStatus.ACTIVE}>نشط 🟢</option>
            <option value={CustomerStatus.SUSPENDED}>موقف 🟡</option>
            <option value={CustomerStatus.EXPIRED}>منتهي 🔴</option>
          </select>`;

const quickFiltersReplacement = `        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3 mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل الحالات</option>
            <option value={CustomerStatus.ACTIVE}>نشط 🟢</option>
            <option value={CustomerStatus.SUSPENDED}>موقف 🟡</option>
            <option value={CustomerStatus.EXPIRED}>منتهي 🔴</option>
          </select>
          <select
            value={distributorFilter}
            onChange={(e) => setDistributorFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل الموزعين</option>
            <option value="unassigned">بدون موزع (مباشر)</option>
            {distributors.map(dist => (
              <option key={dist.id} value={dist.id}>{dist.name}</option>
            ))}
          </select>`;

content = content.replace(quickFiltersTarget, quickFiltersReplacement);

fs.writeFileSync('src/components/SubscribersView.tsx', content);
