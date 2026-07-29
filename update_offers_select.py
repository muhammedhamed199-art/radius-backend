import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

new_select = """
            {loginMode === "register_subscriber" && offers && offers.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold text-slate-300">اختيار باقة الإنترنت</label>
                <select value={regOfferId} onChange={e => setRegOfferId(e.target.value)} className="w-full bg-slate-950/90 text-white px-4 py-3 rounded-2xl border border-slate-800 focus:border-amber-500 focus:ring-amber-500/20 focus:ring-2 text-sm outline-none transition-all" required>
                  <option value="" disabled>اختر الباقة</option>
                  
                  {/* Global Offers */}
                  {offers.filter(o => !o.distributorId).length > 0 && (
                    <optgroup label="باقات الإدارة الرئيسية">
                      {offers.filter(o => !o.distributorId).map(offer => (
                        <option key={offer.id} value={offer.id}>{offer.name} - {offer.price} {offer.currency || "ريال"}</option>
                      ))}
                    </optgroup>
                  )}
                  
                  {/* Distributor Specific Offers */}
                  {distributors.map(dist => {
                    const distOffers = offers.filter(o => o.distributorId === dist.id);
                    if (distOffers.length === 0) return null;
                    return (
                      <optgroup key={dist.id} label={`باقات الموزع: ${dist.name}`}>
                        {distOffers.map(offer => (
                          <option key={offer.id} value={offer.id}>{offer.name} - {offer.price} {offer.currency || "ريال"}</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            )}
"""

content = re.sub(r'\{loginMode === "register_subscriber".*?\}\)', new_select.strip(), content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
