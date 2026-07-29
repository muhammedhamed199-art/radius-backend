const fs = require('fs');
const path = require('path');
const dbFile = path.join(process.cwd(), "data", "radius_db.json");
const wipeData = {
  customers: [],
  deletedCustomers: [],
  distributors: [],
  devices: [],
  devices_ubnt: [],
  offers: [],
  cards: [],
  servers: [],
  tickets: [],
  distributorOffers: [],
  logs: [],
  financial_transactions: [],
  support_tickets: [],
  scheduled_tasks: [],
  scheduled_logs: []
};
fs.writeFileSync(dbFile, JSON.stringify({ lastUpdated: Date.now(), data: wipeData }, null, 2), "utf-8");
console.log("Database wiped with ALL empty arrays.");
