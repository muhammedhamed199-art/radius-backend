import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Make displayOffers include global offers for distributors
old_display_offers = """  const displayOffers = isDistributorSession && currentDistributorId
    ? offers.filter(o => o.distributorId === currentDistributorId)
    : offers;"""
new_display_offers = """  const displayOffers = isDistributorSession && currentDistributorId
    ? offers.filter(o => o.distributorId === currentDistributorId || !o.distributorId)
    : offers;"""
content = content.replace(old_display_offers, new_display_offers)

# Add isDistributorSession and currentDistributorId to OffersView
old_offers_view = """            <OffersView
              offers={displayOffers}
              customers={displayCustomers}
              currencies={currencies}
              defaultCurrency={settings.defaultCurrency}
              onAddOffer={handleAddOffer}
              onEditOffer={handleEditOffer}
              onDeleteOffer={handleDeleteOffer}
            />"""
new_offers_view = """            <OffersView
              offers={displayOffers}
              customers={displayCustomers}
              currencies={currencies}
              defaultCurrency={settings.defaultCurrency}
              onAddOffer={handleAddOffer}
              onEditOffer={handleEditOffer}
              onDeleteOffer={handleDeleteOffer}
              isDistributorSession={isDistributorSession}
              currentDistributorId={currentDistributorId}
            />"""
content = content.replace(old_offers_view, new_offers_view)

with open('src/App.tsx', 'w') as f:
    f.write(content)
