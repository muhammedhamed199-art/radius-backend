import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """          {activePage === 9 && (
            <DistributorsView
              distributors={displayDistributors}
              distributorOffers={distributorOffers}
              currencies={currencies}
              defaultCurrency={settings.defaultCurrency}
              onAddDistributor={handleAddDistributor}
              onDeleteDistributor={handleDeleteDistributor}
              servers={displayServers}
              onUpdateDistributor={handleUpdateDistributor}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                saveToStorage("settings", newSettings);
              }}
            />
          )}"""

replacement = """          {activePage === 9 && (
            <DistributorsView
              distributors={displayDistributors}
              distributorOffers={distributorOffers}
              currencies={currencies}
              defaultCurrency={settings.defaultCurrency}
              onAddDistributor={handleAddDistributor}
              onDeleteDistributor={handleDeleteDistributor}
              servers={displayServers}
              onUpdateDistributor={handleUpdateDistributor}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                saveToStorage("settings", newSettings);
              }}
            />
          )}

          {activePage === 17 && isDistributorSession && (
            <SubDistributorsView
              parentDistributorId={loggedInDistributorId || ""}
              distributors={displayDistributors}
              distributorOffers={distributorOffers}
              currencies={currencies}
              defaultCurrency={settings.defaultCurrency}
              onAddDistributor={handleAddDistributor}
              onDeleteDistributor={handleDeleteDistributor}
              onUpdateDistributor={handleUpdateDistributor}
              settings={settings}
              onUpdateSettings={(newSettings) => {
                setSettings(newSettings);
                saveToStorage("settings", newSettings);
              }}
            />
          )}"""

content = content.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
