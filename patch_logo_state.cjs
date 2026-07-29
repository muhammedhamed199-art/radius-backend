const fs = require('fs');
let content = fs.readFileSync('src/components/DistributorsView.tsx', 'utf8');

content = content.replace(
  '  const [password, setPassword] = useState("123456");',
  '  const [password, setPassword] = useState("123456");\n  const [logo, setLogo] = useState<string>("");'
);

content = content.replace(
  '      password: password || "123456",\n      phone,',
  '      password: password || "123456",\n      phone,\n      logo,'
);

fs.writeFileSync('src/components/DistributorsView.tsx', content);
