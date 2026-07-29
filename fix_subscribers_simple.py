import re

with open("src/components/SubscribersView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# I will just regex replace the broken injected td.
# The injected td starts at `<td className="px-2 py-2 text-center sticky left-0` and ends at `</td></tr>`

injected_start_match = re.search(r'<td className="px-2 py-2 text-center sticky left-0.*?>', content)
if injected_start_match:
    injected_start = injected_start_match.start()
    injected_end = content.find('</td></tr>\n                  );', injected_start)
    
    injected_content = content[injected_start:injected_end]
    
    # Let's cleanly rebuild the injected content.
    # Quick actions start:
    quick_start = injected_content.find('<div className="flex items-center gap-1 shrink-0">')
    # Quick actions end (it ends right after the last `</button>` of dropdown or the `</div>` closing `activeDropdownCustomerId`)
    # The dropdown block is:
    # {activeDropdownCustomerId === customer?.id && (
    #   <div ...>
    #     ...
    #   </div>
    # )}
    # Let's find `)}`
    dropdown_end_match = re.search(r'\}\)\s*</div>\s*</div>\s*</div>', injected_content)
    
    # Wait, instead of regex, let's just find the debt block and remove it from injected, and fix the closing divs.
    debt_start = injected_content.find('<div className="flex flex-col gap-1 mt-0.5">')
    if debt_start != -1:
        # Debt block goes from debt_start up to the last `</span>`
        debt_end = injected_content.rfind('</span>') + 7
        debt_block = injected_content[debt_start:debt_end]
        
        # The quick actions block is everything before `debt_start`, but we need to remove the two extra `</div>`s
        quick_actions_block = injected_content[quick_start:debt_start]
        # Remove the last two `</div>` from quick_actions_block
        lines = quick_actions_block.split('\n')
        # filter out the last two `</div>`
        div_count = 0
        new_lines = []
        for line in reversed(lines):
            if '</div>' in line and div_count < 2:
                div_count += 1
            else:
                new_lines.append(line)
        quick_actions_block = '\n'.join(reversed(new_lines))
        
        # Now let's fix the name td
        content = content.replace('\n                        </div></td>', f'\n                        </div>\n                        {debt_block}\n                      </td>')
        
        # Now build the new injected td
        new_injected_td = injected_content[:quick_start] + quick_actions_block + '\n                      </td>'
        content = content[:injected_start] + new_injected_td + content[injected_end:]

with open("src/components/SubscribersView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("done")
