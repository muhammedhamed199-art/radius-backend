import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

# Fix the first form end which should just be </form> followed by ) : (
content = content.replace("          </form>\n        )}\n        ) : (", "          </form>\n        ) : (")

# The second form end is fine with </form>\n        )}

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
