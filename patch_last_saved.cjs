const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

const oldTemplateVars = `  const [templateVars, setTemplateVars] = useState(() => {
    try {
      const saved = localStorage.getItem("unified_template_vars");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { name: "{{NAME}}", ip: "{{IP}}", vpnIp: "{{VPN_IP}}", secret: "{{SECRET}}" };
  });

  React.useEffect(() => {
    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
  }, [templateVars]);`;

const newTemplateVars = `  const [templateVars, setTemplateVars] = useState(() => {
    try {
      const saved = localStorage.getItem("unified_template_vars");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { name: "{{NAME}}", ip: "{{IP}}", vpnIp: "{{VPN_IP}}", secret: "{{SECRET}}" };
  });
  const [lastSavedTemplateVars, setLastSavedTemplateVars] = useState(templateVars);

  React.useEffect(() => {
    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
  }, [templateVars]);`;

if (content.includes(oldTemplateVars)) {
  content = content.replace(oldTemplateVars, newTemplateVars);
} else {
  console.log("Could not find oldTemplateVars");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
