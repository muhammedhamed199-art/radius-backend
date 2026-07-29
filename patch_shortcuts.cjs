const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const hookStr = `  const hasPerm = useCallback((permKey: keyof DistributorPermissions) => {
    if (!isDistributorSession) return true;
    if (!computedPermissions) return true;
    return Boolean(computedPermissions[permKey]);
  }, [isDistributorSession, computedPermissions]);`;

const replacementStr = hookStr + `

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (hasPerm("canViewDashboard")) {
          setActivePage(0);
        }
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasPerm("canManageSubscribers")) {
          setActivePage(5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPerm]);`;

content = content.replace(hookStr, replacementStr);
fs.writeFileSync('src/App.tsx', content);
