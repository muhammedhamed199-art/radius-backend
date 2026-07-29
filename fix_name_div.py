with open('src/components/SubscribersView.tsx', 'r') as f:
    content = f.read()

target = """                              )}
                            </div>
                          </button>
                          {customer.debt && customer.debt > 0 ? ("""

replacement = """                              )}
                            </div>
                          </button>
                          </div>
                          {customer.debt && customer.debt > 0 ? ("""

content = content.replace(target, replacement)

with open('src/components/SubscribersView.tsx', 'w') as f:
    f.write(content)
