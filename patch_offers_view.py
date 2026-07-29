import re

with open('src/components/OffersView.tsx', 'r') as f:
    content = f.read()

# Add a badge for distributor offers vs global offers
card_header_regex = r'(<h3 className="font-black text-lg text-slate-800 line-clamp-1">)(.*?)(</h3>)'
def badge_replacer(match):
    return match.group(1) + match.group(2) + match.group(3) + """
                    {isDistributorSession && !offer.distributorId && (
                      <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full mr-2 shrink-0">باقة عامة</span>
                    )}
                    {isDistributorSession && offer.distributorId === currentDistributorId && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full mr-2 shrink-0">باقتك الخاصة</span>
                    )}"""
content = re.sub(card_header_regex, badge_replacer, content)

actions_regex = r'(                  \{/\* Card Footer Actions \*/\}\n                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">.*?<Trash2 className="w-4 h-4" />\n                    </button>\n                  </div>)'

def actions_replacer(match):
    original = match.group(1)
    # We will wrap it with a condition
    return """
                  {/* Card Footer Actions */}
                  {(!isDistributorSession || offer.distributorId === currentDistributorId) ? (
""" + original.replace('                  {/* Card Footer Actions */}\n', '') + """
                  ) : (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> باقة عامة - للقراءة فقط</span>
                    </div>
                  )}
"""
content = re.sub(actions_regex, actions_replacer, content, flags=re.DOTALL)

with open('src/components/OffersView.tsx', 'w') as f:
    f.write(content)
