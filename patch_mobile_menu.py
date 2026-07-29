import re

with open("src/App.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# The mobile header block
# find the start of Mobile Header & Drawer
start_marker = "{/* 2. Mobile Header & Drawer */}"
if start_marker in content:
    start_idx = content.find(start_marker)
    # Extract the mobile menu button
    btn_regex = r'(\s*<button\s+onClick=\{\(\) => setMobileMenuOpen\(!mobileMenuOpen\)\}[\s\S]*?<\/button>)'
    
    # Let's search inside the mobile header area
    match = re.search(btn_regex, content[start_idx:start_idx+3000])
    if match:
        btn_code = match.group(1)
        # Remove it from its original place
        content = content[:start_idx] + content[start_idx:start_idx+3000].replace(btn_code, "") + content[start_idx+3000:]
        
        # Insert it before the Signal icon
        signal_regex = r'(<div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 pr-1 sm:pr-2">)'
        match2 = re.search(signal_regex, content[start_idx:start_idx+3000])
        if match2:
            insert_pos = start_idx + match2.end()
            content = content[:insert_pos] + btn_code + content[insert_pos:]
            with open("src/App.tsx", "w", encoding="utf-8") as f:
                f.write(content)
            print("Patched menu button to the right.")
        else:
            print("Could not find signal regex.")
    else:
        print("Could not find btn regex.")
else:
    print("Could not find start marker.")
