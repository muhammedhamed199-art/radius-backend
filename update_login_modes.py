import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const [loginMode, setLoginMode] = useState<"admin" | "subscriber">("admin");',
    'const [loginMode, setLoginMode] = useState<"admin" | "subscriber" | "register">("admin");\n  const [regName, setRegName] = useState("");\n  const [regUsername, setRegUsername] = useState("");\n  const [regPhone, setRegPhone] = useState("");\n  const [regPassword, setRegPassword] = useState("");\n  const [regOfferId, setRegOfferId] = useState("");'
)

# Replace props destructuring to include new props
content = content.replace(
    'customers = [],',
    'customers = [],\n  distributorOffers = [],\n  onRegisterDistributor,'
)
content = content.replace(
    'onSubscriberLoginSuccess\n}: LoginViewProps)',
    'onSubscriberLoginSuccess,\n  distributorOffers = [],\n  onRegisterDistributor\n}: LoginViewProps)'
)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
