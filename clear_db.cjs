const fs = require('fs');
const path = require('path');
const dbFile = path.join(process.cwd(), "data", "radius_db.json");
fs.writeFileSync(dbFile, JSON.stringify({ lastUpdated: Date.now(), data: {} }, null, 2), "utf-8");
console.log("Database cleared.");
