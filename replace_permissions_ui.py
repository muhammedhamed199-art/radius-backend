import re

with open('src/components/DistributorsView.tsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace(
    'import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer } from "../types";\n',
    'import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer } from "../types";\nimport { DistributorPermissionsFilterable } from "./DistributorPermissionsFilterable";\n'
)

# Replace the inline UI in Add form
# It starts at: {/* RADIUS & System Permissions Customizer */}
# And ends before: </div>\n        </form>\n      )}

add_form_pattern = r'\{\/\* RADIUS & System Permissions Customizer \*\/\}.*?<\/label>\n.*?<\/div>\n.*?<\/div>\n.*?<\/div>\n\s*\}\)\}\n\s*<\/div>\n\s*<\/div>'
add_form_replacement = r'''{/* RADIUS & System Permissions Customizer */}
          <DistributorPermissionsFilterable 
            permissions={newPermissions} 
            onChange={setNewPermissions} 
          />'''

content = re.sub(add_form_pattern, add_form_replacement, content, flags=re.DOTALL)


# Now for the modal
# Look for: {/* Edit Permissions Modal */}
# And inside it, look for: {/* Quick Action Toolbar */} ... down to ... </label>\n                          );\n                        })}\n                      </div>\n                    </div>\n                  );\n                })}\n              </div>

modal_pattern = r'\{\/\* Quick Action Toolbar \*\/\}.*?<\/label>\n.*?<\/div>\n.*?<\/div>\n.*?<\/div>\n\s*\}\)\}\n\s*<\/div>'
modal_replacement = r'''<DistributorPermissionsFilterable 
              permissions={modalPermissions} 
              onChange={setModalPermissions} 
              isModal={true}
            />'''

content = re.sub(modal_pattern, modal_replacement, content, flags=re.DOTALL)

with open('src/components/DistributorsView.tsx', 'w') as f:
    f.write(content)

