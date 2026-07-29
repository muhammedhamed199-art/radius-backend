const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const [settings, setSettings] = useState<GeneralSettings>(initialData.settings);`;

const replacement = `  const [settings, setSettings] = useState<GeneralSettings>(initialData.settings);

  // Update document title when radiusName changes
  useEffect(() => {
    document.title = settings.radiusName || "RADIUS";
  }, [settings.radiusName]);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/App.tsx', content);
