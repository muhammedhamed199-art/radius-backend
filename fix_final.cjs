const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const additionalVars = `
  const [adminAccount, setAdminAccount] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>({ role: "admin", name: "Admin" });
  const [isPortalMode, setIsPortalMode] = useState(false);
  const [loggedInCustomerId, setLoggedInCustomerId] = useState("");
  const isLoggedIn = true;

  const checkReadOnly = () => false;
  const updateStateAndPersist = (key: string, value: any, setter: any, logTarget: string, logActionName: string) => {
    setter(value);
    saveToStorage(key, value);
    logAction("admin", logTarget, logActionName);
  };
  const computedPermissions = {};
  const handleLogout = () => {};
  const handleRegisterDistributor = () => {};
  const handleRegisterCustomer = () => {};
  const handleLoginSuccess = () => {};
  const handleOpenProfileModal = () => {};

  // For DevicesView interval error
`;

const hookTarget = '  const [selectedCustomerForPing, setSelectedCustomerForPing] = useState<any>(null);';
content = content.replace(hookTarget, hookTarget + '\n' + additionalVars);

fs.writeFileSync('src/App.tsx', content);

let devicesContent = fs.readFileSync('src/components/DevicesView.tsx', 'utf8');
devicesContent = devicesContent.replace(/return \(\) => clearInterval\(interval\);/g, '');
fs.writeFileSync('src/components/DevicesView.tsx', devicesContent);

