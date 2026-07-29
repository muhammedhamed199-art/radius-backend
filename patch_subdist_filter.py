import re

with open('src/components/SubDistributorsView.tsx', 'r') as f:
    content = f.read()

target = """  const filteredDistributors = distributors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery);"""

replacement = """  const filteredDistributors = distributors.filter(d => {
    if (d.parentDistributorId !== parentDistributorId) return false;
    
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery);"""

content = content.replace(target, replacement)

with open('src/components/SubDistributorsView.tsx', 'w') as f:
    f.write(content)
