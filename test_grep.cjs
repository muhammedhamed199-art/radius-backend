const fs = require('fs');
let content = fs.readFileSync('src/components/LoginView.tsx', 'utf8');
let lines = content.split('\n');
lines.forEach((line, i) => {
  if (line.includes('onLoginSuccess(') || line.includes('onSubscriberLoginSuccess(')) {
    console.log((i+1) + ': ' + line);
  }
});
