const fs = require('fs');
let content = fs.readFileSync('src/components/LoginView.tsx', 'utf8');

const target1 = `  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);`;

const replacement1 = `  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("radius_remember_me") !== "false";
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (rememberMe) {
      const savedUser = localStorage.getItem("radius_saved_username");
      const savedPass = localStorage.getItem("radius_saved_password");
      if (savedUser) setUsername(savedUser);
      if (savedPass) setPassword(savedPass);
    }
  }, []);

  const handleRememberMeSave = () => {
    if (rememberMe) {
      localStorage.setItem("radius_saved_username", username.trim());
      localStorage.setItem("radius_saved_password", password.trim());
      localStorage.setItem("radius_remember_me", "true");
    } else {
      localStorage.removeItem("radius_saved_username");
      localStorage.removeItem("radius_saved_password");
      localStorage.setItem("radius_remember_me", "false");
    }
  };`;

content = content.replace(target1, replacement1);

const target2 = `            if (onSubscriberLoginSuccess) {
              onSubscriberLoginSuccess(foundCustomer);
            }`;
const replacement2 = `            if (onSubscriberLoginSuccess) {
              handleRememberMeSave();
              onSubscriberLoginSuccess(foundCustomer);
            }`;
content = content.replace(target2, replacement2);

const target3 = `        if (cleanPass === expectedAdminPassword || cleanPass.toLowerCase() === expectedAdminPassword.toLowerCase()) {
          onLoginSuccess({
            name: adminUser?.name || "المالك المسئول للنظام",`;
const replacement3 = `        if (cleanPass === expectedAdminPassword || cleanPass.toLowerCase() === expectedAdminPassword.toLowerCase()) {
          handleRememberMeSave();
          onLoginSuccess({
            name: adminUser?.name || "المالك المسئول للنظام",`;
content = content.replace(target3, replacement3);

const target4 = `          if (cleanPass === expectedPass || cleanPass.toLowerCase() === expectedPass.toLowerCase()) {
            onLoginSuccess({
              id: foundDist?.id,
              name: foundDist.name,
              role: foundDist.role || "موزع معتمد",`;
const replacement4 = `          if (cleanPass === expectedPass || cleanPass.toLowerCase() === expectedPass.toLowerCase()) {
            handleRememberMeSave();
            onLoginSuccess({
              id: foundDist?.id,
              name: foundDist.name,
              role: foundDist.role || "موزع معتمد",`;
content = content.replace(target4, replacement4);

const target5 = `        if (cleanPass === expectedPass || cleanPass.toLowerCase() === expectedPass.toLowerCase()) {
          onLoginSuccess({
            id: foundDist?.id,
            name: foundDist.name,
            role: foundDist.role || (isTechAdmin ? "مالك النظام" : "موزع معتمد"),`;
const replacement5 = `        if (cleanPass === expectedPass || cleanPass.toLowerCase() === expectedPass.toLowerCase()) {
          handleRememberMeSave();
          onLoginSuccess({
            id: foundDist?.id,
            name: foundDist.name,
            role: foundDist.role || (isTechAdmin ? "مالك النظام" : "موزع معتمد"),`;
content = content.replace(target5, replacement5);

fs.writeFileSync('src/components/LoginView.tsx', content);
