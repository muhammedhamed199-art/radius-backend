const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldStr = `  // Global Keyboard Shortcuts
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

const newStr = `  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (hasPerm("canViewDashboard")) {
          setActivePage(0);
          addNotification("تم الانتقال إلى لوحة التحكم (Ctrl+D)", "info");
        }
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasPerm("canManageSubscribers")) {
          setActivePage(5);
          addNotification("تم الانتقال إلى صفحة المشتركين (Ctrl+S)", "info");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPerm]);`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/App.tsx', content);
