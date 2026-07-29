const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `  const [isPortalMode, setIsPortalMode] = useState<boolean>(false);
  const [loggedInCustomerId, setLoggedInCustomerId] = useState<string>("");`;

const replacement1 = `  const [isPortalMode, setIsPortalMode] = useState<boolean>(() => {
    return localStorage.getItem("radius_is_portal_mode") === "true";
  });
  const [loggedInCustomerId, setLoggedInCustomerId] = useState<string>(() => {
    return localStorage.getItem("radius_logged_in_customer_id") || "";
  });`;

content = content.replace(target1, replacement1);

const target2 = `        onSubscriberLoginSuccess={(customer) => {
          setLoggedInCustomerId(customer.id);
          setIsPortalMode(true);
          window.history.pushState({}, '', '?portal=true');
        }}`;

const replacement2 = `        onSubscriberLoginSuccess={(customer) => {
          setLoggedInCustomerId(customer.id);
          setIsPortalMode(true);
          localStorage.setItem("radius_is_portal_mode", "true");
          localStorage.setItem("radius_logged_in_customer_id", customer.id);
          window.history.pushState({}, '', '?portal=true');
        }}`;

content = content.replace(target2, replacement2);

const target3 = `                    setIsPortalMode(false);
                    setActivePortalDistributorId("");
                    setLoggedInCustomerId("");
                    setIsLoggedIn(false);
                    localStorage.removeItem("radius_is_logged_in");`;

const replacement3 = `                    setIsPortalMode(false);
                    setActivePortalDistributorId("");
                    setLoggedInCustomerId("");
                    setIsLoggedIn(false);
                    localStorage.removeItem("radius_is_logged_in");
                    localStorage.removeItem("radius_is_portal_mode");
                    localStorage.removeItem("radius_logged_in_customer_id");`;

content = content.replace(target3, replacement3);

fs.writeFileSync('src/App.tsx', content);
