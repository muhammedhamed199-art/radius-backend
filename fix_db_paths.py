import re
import glob

files_to_fix = ["server.ts", "src/server/db.ts"]

for file in files_to_fix:
    with open(file, "r") as f:
        content = f.read()
    
    # Replace path.join(process.cwd(), "data") with path.join(process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(), "data")
    content = content.replace('path.join(process.cwd(), "data")', 'path.join(process.env.NODE_ENV === "production" ? "/tmp" : process.cwd(), "data")')
    
    with open(file, "w") as f:
        f.write(content)

