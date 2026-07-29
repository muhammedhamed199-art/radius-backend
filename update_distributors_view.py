import re

with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

# Add state
state_code = """  const [filterRole, setFilterRole] = useState("all");
  const [expandedDistributors, setExpandedDistributors] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedDistributors(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };"""
content = content.replace('  const [filterRole, setFilterRole] = useState("all");', state_code)

# Add icon import
if 'Network' not in content:
    content = content.replace('UserCheck2,', 'UserCheck2, Network, ChevronDown, ChevronLeft,')

# Update filteredDistributors
old_filter = """  const filteredDistributors = listToFilter.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery);
                          
    const matchesStatus = filterStatus === "all" || d.subscriptionStatus === filterStatus || (!d.subscriptionStatus && filterStatus === "نشط");
    const matchesRole = filterRole === "all" || d.role === filterRole;
    const matchesMinBalance = minBalance === "" || d.balance >= Number(minBalance);
    const matchesMaxBalance = maxBalance === "" || d.balance <= Number(maxBalance);

    return matchesSearch && matchesStatus && matchesRole && matchesMinBalance && matchesMaxBalance;
  });"""

new_filter = """  const filteredDistributors = listToFilter.filter(d => {
    // Only show top-level distributors by default. If searching, show any that match.
    if (!searchQuery && d.parentDistributorId) return false;

    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.phone || "").includes(searchQuery);
                          
    const matchesStatus = filterStatus === "all" || d.subscriptionStatus === filterStatus || (!d.subscriptionStatus && filterStatus === "نشط");
    const matchesRole = filterRole === "all" || d.role === filterRole;
    const matchesMinBalance = minBalance === "" || d.balance >= Number(minBalance);
    const matchesMaxBalance = maxBalance === "" || d.balance <= Number(maxBalance);

    return matchesSearch && matchesStatus && matchesRole && matchesMinBalance && matchesMaxBalance;
  });"""
content = content.replace(old_filter, new_filter)

# Add tree view icon next to name
old_header = """                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 flex-wrap">
                      {dist.name}
                      {dist.role === UserRole.TECHNICAL_ADMIN"""

new_header = """                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 flex-wrap">
                      {dist.name}
                      {subDistributors.length > 0 && (
                        <button 
                          onClick={() => toggleExpand(dist.id!)}
                          className={`p-1 rounded-md transition-colors ${expandedDistributors.has(dist.id!) ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                          title="عرض الموزعين الفرعيين"
                        >
                          <Network className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {dist.role === UserRole.TECHNICAL_ADMIN"""
content = content.replace(old_header, new_header)

# Get subDistributors
old_render = """        {filteredDistributors.map((dist) => {
          const isEditing = editingId === dist?.id;
          const isTechAdmin = dist.role === UserRole.TECHNICAL_ADMIN;
          const isAdmin = dist.role === UserRole.ADMIN || isTechAdmin;
          const perms = dist.permissions || {};
          const enabledCount = getEnabledCount(perms);"""

new_render = """        {filteredDistributors.map((dist) => {
          const isEditing = editingId === dist?.id;
          const isTechAdmin = dist.role === UserRole.TECHNICAL_ADMIN;
          const isAdmin = dist.role === UserRole.ADMIN || isTechAdmin;
          const perms = dist.permissions || {};
          const enabledCount = getEnabledCount(perms);
          const subDistributors = listToFilter.filter(sub => sub.parentDistributorId === dist.id);"""
content = content.replace(old_render, new_render)

# Add sub-distributors list at the end of the card
old_footer = """                  <div className="p-2 bg-white dark:bg-slate-900 dark:bg-slate-900 text-emerald-600 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

              {/* Footer Actions */}"""

new_footer = """                  <div className="p-2 bg-white dark:bg-slate-900 dark:bg-slate-900 text-emerald-600 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

              {/* Sub-Distributors Section */}
              {subDistributors.length > 0 && expandedDistributors.has(dist.id!) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <Network className="w-4 h-4" /> الموزعون الفرعيون ({subDistributors.length}):
                  </div>
                  {subDistributors.map(sub => (
                    <div key={sub.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100">{sub.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{sub.username}</div>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs font-mono">{sub.balance.toLocaleString()} {sub.currency || defaultCurrency}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{sub.customersCount} مشترك</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}"""
content = content.replace(old_footer, new_footer)

with open('src/components/DistributorsView.tsx', 'w') as f:
    f.write(content)
