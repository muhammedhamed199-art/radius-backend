import sys
import re

with open('src/components/SubscriberPortalView.tsx', 'r') as f:
    content = f.read()

# Hide search widget if customers.length === 1
search_widget = """          {/* Quick Search Widget */}
          <form onSubmit={handleSearchCustomer} className="bg-teal-50/50 dark:bg-teal-900/20/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 w-full md:w-96 shadow-2xl space-y-2">"""
search_widget_new = """          {/* Quick Search Widget */}
          {customers.length > 1 && (
            <form onSubmit={handleSearchCustomer} className="bg-teal-50/50 dark:bg-teal-900/20 backdrop-blur-md p-3 rounded-2xl border border-white/15 w-full md:w-96 shadow-2xl space-y-2">"""

content = content.replace(search_widget, search_widget_new)

# Close the form tag conditionally
close_form = """            </div>
          </form>
        </div>"""
close_form_new = """            </div>
          </form>
          )}
        </div>"""
content = content.replace(close_form, close_form_new)

# Hide quick selection tabs
tabs_orig = """        {/* Quick Customer Selection Tabs for easy testing */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">"""
tabs_new = """        {/* Quick Customer Selection Tabs for easy testing */}
        {customers.length > 1 && (
        <div className="mt-6 pt-4 border-t border-teal-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">"""
content = content.replace(tabs_orig, tabs_new)

tabs_close = """            </button>
          ))}
        </div>
      </div>"""
tabs_close_new = """            </button>
          ))}
        </div>
        )}
      </div>"""
content = content.replace(tabs_close, tabs_close_new)

with open('src/components/SubscriberPortalView.tsx', 'w') as f:
    f.write(content)
