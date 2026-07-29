const fs = require('fs');

let content = fs.readFileSync('src/server/db.ts', 'utf8');

// Ensure dbRun handles NAS insert and delete
const replacement = `
  if (sql.startsWith("INSERT INTO radcheck")) {
    db.radcheck.push({ id: Date.now(), username: params[0], attribute: 'Cleartext-Password', op: ':=', value: params[1] });
    save();
  } else if (sql.startsWith("INSERT INTO nas")) {
    db.nas.push({ id: Date.now(), nasname: params[0], shortname: params[1], type: params[2], ports: params[3], secret: params[4], description: params[5] });
    save();
  } else if (sql.startsWith("DELETE FROM nas")) {
    db.nas = db.nas.filter(r => r.nasname !== params[0]);
    save();
  } else if (sql.startsWith("INSERT INTO radreply")) {
`;

content = content.replace(/if \(sql\.startsWith\("INSERT INTO radcheck"\)\) \{[\s\S]*?\} else if \(sql\.startsWith\("INSERT INTO radreply"\)\) \{/, replacement.trim());

fs.writeFileSync('src/server/db.ts', content);
