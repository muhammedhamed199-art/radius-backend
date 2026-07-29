const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  '            <SubscriberPortalView\n              customers={portalCustomers}\n              offers={portalOffers}\n              cards={portalCards}\n              onUpdateCustomer={handleUpdateCustomer}\n              onAddTicket={handleAddTicket}\n              onAddNotification={addNotification}\n              settings={settings}\n            />',
  '            <SubscriberPortalView\n              customers={portalCustomers}\n              offers={portalOffers}\n              cards={portalCards}\n              onUpdateCustomer={handleUpdateCustomer}\n              onAddTicket={handleAddTicket}\n              onAddNotification={addNotification}\n              settings={settings}\n              distributors={displayDistributors}\n            />'
);

content = content.replace(
  '                <SubscriberPortalView\n                  customers={displayCustomers}\n                  offers={displayOffers}\n                  cards={displayCards}\n                  onUpdateCustomer={handleUpdateCustomer}\n                  onAddTicket={handleAddTicket}\n                  onAddNotification={addNotification}\n                  settings={settings}\n                    />',
  '                <SubscriberPortalView\n                  customers={displayCustomers}\n                  offers={displayOffers}\n                  cards={displayCards}\n                  onUpdateCustomer={handleUpdateCustomer}\n                  onAddTicket={handleAddTicket}\n                  onAddNotification={addNotification}\n                  settings={settings}\n                  distributors={displayDistributors}\n                />'
);

fs.writeFileSync('src/App.tsx', content);
