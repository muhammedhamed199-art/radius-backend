import re

with open('src/components/DistributorSubscriptionsView.tsx', 'r') as f:
    content = f.read()

props = """
interface DistributorSubscriptionsViewProps {
  distributor?: Distributor;
  distributors: Distributor[];
  offers: DistributorOffer[];
  servers: any[];
  onUpdateDistributor: (d: Distributor) => void;
  onAddOffer: (offer: DistributorOffer) => void;
  onUpdateOffer: (offer: DistributorOffer) => void;
  onDeleteOffer: (id: string) => void;
  onAddNotification: (msg: string, type: "success" | "error" | "warning" | "info") => void;
  isDistributorSession: boolean;
}

export default function DistributorSubscriptionsView({
  distributor,
  distributors,
  offers,
  servers,
  onUpdateDistributor,
  onAddOffer,
  onUpdateOffer,
  onDeleteOffer,
  onAddNotification,
  isDistributorSession
}: DistributorSubscriptionsViewProps) {
"""

content = re.sub(r'interface DistributorSubscriptionsViewProps \{.*?\}: DistributorSubscriptionsViewProps\) \{', props.strip(), content, flags=re.DOTALL)

# Add helper to calculate total price
helper = """
  // Helper to calculate total price based on base price and extra servers
  const getCalculatedPrice = (offer: DistributorOffer, dist: Distributor) => {
    let total = offer.price;
    if (offer.pricePerNasServer && offer.pricePerNasServer > 0) {
      const activeNasCount = servers.filter(s => s.distributorId === dist.id).length;
      total += (activeNasCount * offer.pricePerNasServer);
    }
    return total;
  };
"""
content = content.replace('const [isRenewing, setIsRenewing] = useState<boolean>(false);', 'const [isRenewing, setIsRenewing] = useState<boolean>(false);\n' + helper)

# Update price in handleSubscribe
content = content.replace(
    'if (targetDistributor.balance < offer.price) {',
    'const calculatedPrice = getCalculatedPrice(offer, targetDistributor);\n    if (targetDistributor.balance < calculatedPrice) {'
)
content = content.replace(
    'balance: targetDistributor.balance - offer.price,',
    'balance: targetDistributor.balance - calculatedPrice,'
)
content = content.replace(
    'amount: offer.price,',
    'amount: getCalculatedPrice(offer, distributor),'
)

# Render calculated price in UI
content = content.replace(
    'قيمة التجديد: {offers.find(o => o.id === selectedOfferId)?.price}',
    'قيمة التجديد: {getCalculatedPrice(offers.find(o => o.id === selectedOfferId) || offers[0], distributor)}'
)
content = content.replace(
    'سعر الباقة: {distributorOffer?.price}',
    'سعر الباقة (الأساسي): {distributorOffer?.price}'
)

with open('src/components/DistributorSubscriptionsView.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    app_content = f.read()

app_content = app_content.replace(
    'onUpdateDistributor={handleUpdateDistributor}',
    'servers={displayServers}\n              onUpdateDistributor={handleUpdateDistributor}'
)

with open('src/App.tsx', 'w') as f:
    f.write(app_content)
