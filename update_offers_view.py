import re

with open('src/components/OffersView.tsx', 'r') as f:
    content = f.read()

# Update props
old_props = """interface OffersViewProps {
  offers: SpeedOffer[];
  customers: Customer[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onAddOffer: (offer: Omit<SpeedOffer, "id">) => void;
  onEditOffer: (offer: SpeedOffer) => void;
  onDeleteOffer: (id: string) => void;
}"""
new_props = """interface OffersViewProps {
  offers: SpeedOffer[];
  customers: Customer[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onAddOffer: (offer: Omit<SpeedOffer, "id">) => void;
  onEditOffer: (offer: SpeedOffer) => void;
  onDeleteOffer: (id: string) => void;
  isDistributorSession?: boolean;
  currentDistributorId?: string | null;
}"""
content = content.replace(old_props, new_props)

old_comp = """export default function OffersView({
  offers,
  customers,
  currencies = [],
  defaultCurrency = "LYD",
  onAddOffer,
  onEditOffer,
  onDeleteOffer
}: OffersViewProps) {"""
new_comp = """export default function OffersView({
  offers,
  customers,
  currencies = [],
  defaultCurrency = "LYD",
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
  isDistributorSession,
  currentDistributorId
}: OffersViewProps) {"""
content = content.replace(old_comp, new_comp)

# Find the edit and delete buttons in the table and restrict them
edit_btn_pattern = r'<button\s*onClick=\{.*?setEditingOffer\(offer\).*?\}\s*className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-2 rounded-lg transition-colors"\s*title="تعديل"\s*>\s*<Edit className="w-4 h-4" />\s*</button>'
delete_btn_pattern = r'<button\s*onClick=\{.*?setOfferToDelete\(offer\.id\).*?\}\s*className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"\s*title="حذف"\s*>\s*<Trash2 className="w-4 h-4" />\s*</button>'

# Let's verify what the buttons look like
with open('src/components/OffersView.tsx', 'w') as f:
    f.write(content)
