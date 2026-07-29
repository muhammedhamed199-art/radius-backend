import os

with open("src/components/LoginView.tsx", "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("setError(", "setErrorMessage(")
content = content.replace("{error && (", "{errorMessage && (")
content = content.replace(">{error}</p>", ">{errorMessage}</p>")

with open("src/components/LoginView.tsx", "w", encoding="utf-8") as f:
    f.write(content)

