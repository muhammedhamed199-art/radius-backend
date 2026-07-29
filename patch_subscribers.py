import re

with open("src/components/SubscribersView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Add header
header_insertion = r'(\{renderSortableHeader\("تنبيه واتساب", "autoWhatsAppAlert", ""\)\})'
content = re.sub(header_insertion, r'\1\n                <th className="px-2 py-3 text-xs md:text-sm text-center w-36 sticky left-0 bg-slate-100 dark:bg-slate-800 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)] border-r border-slate-200 dark:border-slate-700">الخيارات</th>', content)

# Change MoreVertical button style
content = content.replace(
    'className="p-1 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all"',
    'className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all font-bold"'
)

# Extract and move the actions block
start_idx = content.find("{/* Quick Actions Dropdown Menu next to Name */}")
if start_idx != -1:
    # Find the end of this block. It ends with a </div> that closes `<div className="flex items-center gap-1 shrink-0">`
    # and then another </div> for the `flex items-center justify-between gap-1` wrapper
    # Let's just use string finding.
    end_td = content.find("</td>", start_idx)
    # The block we want to extract is from start_idx to end_td - a few divs
    block = content[start_idx:end_td]
    
    # We want to extract just the `div` containing the quick actions.
    # It starts with:
    # {/* Quick Actions Dropdown Menu next to Name */}
    # <div className="flex items-center gap-1 shrink-0">
    # And ends before the closing </div> of the parent wrapper.
    # Let's find the parent wrapper closing </div>
    last_div = block.rfind("</div>")
    quick_actions_code = block[:last_div].strip()
    
    # Replace in original text
    content = content[:start_idx] + "\n                        </div>" + content[end_td:]
    
    # Now we need to insert the `quick_actions_code` at the end of the <tr>
    # The end of the <tr> is just before `</tr>` that comes after this </td>
    tr_end = content.find("</tr>", start_idx)
    
    # Create the new td
    new_td = f"""
                      <td className="px-2 py-2 text-center sticky left-0 bg-inherit z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)] border-r border-slate-200 dark:border-slate-800/60">
                        {quick_actions_code}
                      </td>
"""
    content = content[:tr_end] + new_td + content[tr_end:]

with open("src/components/SubscribersView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("patched")
