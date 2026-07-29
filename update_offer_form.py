import re

with open('src/components/DistributorSubscriptionsView.tsx', 'r') as f:
    content = f.read()

# Update initial form state
content = content.replace('name: "", price: 0, durationMonths: 1, maxCustomers: 0, description: ""', 'name: "", price: 0, durationMonths: 1, maxCustomers: 0, maxNasServers: 0, pricePerNasServer: 0, description: ""')

new_fields = """
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الحد الأقصى لسيرفرات NAS (0 = غير محدود)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxNasServers || ""}
                  onChange={(e) => setFormData({ ...formData, maxNasServers: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">سعر كل سيرفر إضافي / متصل (اختياري)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerNasServer || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerNasServer: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">
"""

content = content.replace('<div className="md:col-span-2">', new_fields)

# Let's also update the display of the offers.
display_offer = """
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {offer.maxCustomers ? offer.maxCustomers : "غير محدود"} مشترك</span>
                    <span className="flex items-center gap-1"><Server className="w-4 h-4"/> {offer.maxNasServers ? offer.maxNasServers : "غير محدود"} سيرفر NAS</span>
                  </div>
"""

content = re.sub(r'<div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">\s*<span className="flex items-center gap-1"><Users className="w-4 h-4"/> \{offer\.maxCustomers \? offer\.maxCustomers : "غير محدود"\} مشترك</span>\s*</div>', display_offer, content)

with open('src/components/DistributorSubscriptionsView.tsx', 'w') as f:
    f.write(content)
