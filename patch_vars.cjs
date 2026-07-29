const fs = require('fs');
let content = fs.readFileSync('src/components/NasServersView.tsx', 'utf8');

// Add templateVars state
content = content.replace(
  'const [showTemplateEditor, setShowTemplateEditor] = useState(false);',
  `const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateVars, setTemplateVars] = useState(() => {
    try {
      const saved = localStorage.getItem("unified_template_vars");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { name: "{{NAME}}", ip: "{{IP}}", vpnIp: "{{VPN_IP}}", secret: "{{SECRET}}" };
  });

  React.useEffect(() => {
    localStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
  }, [templateVars]);`
);

// Update getCustomizedScript
const oldScriptFunc = `const getCustomizedScript = (server: NasServer | null, isAuto: boolean = true) => {
    if (!server) return unifiedTemplate;
    if (!isAuto) return unifiedTemplate;

    let result = unifiedTemplate;
    const replacements = [
      { keys: ["{{NAME}}", "[NAME]", "{{name}}", "[name]"], value: server.name },
      { keys: ["{{IP}}", "[IP]", "{{ip}}", "[ip]", "{{IP_ADDRESS}}", "[IP_ADDRESS]"], value: server.ipAddress },
      { keys: ["{{VPN_IP}}", "[VPN_IP]", "{{vpn_ip}}", "[vpn_ip]"], value: server.vpnIp },
      { keys: ["{{SECRET}}", "[SECRET]", "{{secret}}", "[secret]"], value: server.secret },
    ];`;

const newScriptFunc = `const getCustomizedScript = (server: NasServer | null, isAuto: boolean = true) => {
    if (!server) return unifiedTemplate;
    if (!isAuto) return unifiedTemplate;

    let result = unifiedTemplate;
    const replacements = [
      { keys: ["{{NAME}}", "[NAME]", "{{name}}", "[name]"].concat(templateVars.name ? [templateVars.name] : []), value: server.name },
      { keys: ["{{IP}}", "[IP]", "{{ip}}", "[ip]", "{{IP_ADDRESS}}", "[IP_ADDRESS]"].concat(templateVars.ip ? [templateVars.ip] : []), value: server.ipAddress },
      { keys: ["{{VPN_IP}}", "[VPN_IP]", "{{vpn_ip}}", "[vpn_ip]"].concat(templateVars.vpnIp ? [templateVars.vpnIp] : []), value: server.vpnIp },
      { keys: ["{{SECRET}}", "[SECRET]", "{{secret}}", "[secret]"].concat(templateVars.secret ? [templateVars.secret] : []), value: server.secret },
    ];`;

if (content.includes(oldScriptFunc)) {
  content = content.replace(oldScriptFunc, newScriptFunc);
} else {
  console.log("Could not find getCustomizedScript");
}

fs.writeFileSync('src/components/NasServersView.tsx', content);
