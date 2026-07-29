import re

with open('src/components/LoginView.tsx', 'r') as f:
    content = f.read()

props_interface = """
interface LoginViewProps {
  distributors: Distributor[];
  radiusName?: string;
  settings?: GeneralSettings;
  adminUser?: { name: string; role: string; username: string; password?: string };
  onLoginSuccess: (user: {
    id?: string;
    name: string;
    role: string;
    username: string;
    distributorId?: string;
    permissions?: any;
  }, forcePaymentPage?: boolean) => void;
  onOpenSubscriberPortal?: () => void;
  customers?: any[];
  onSubscriberLoginSuccess?: (customer: any) => void;
  distributorOffers?: any[];
  onRegisterDistributor?: (distributor: any) => void;
}
"""

content = re.sub(r'interface LoginViewProps \{.*?\n\}', props_interface.strip(), content, flags=re.DOTALL)

with open('src/components/LoginView.tsx', 'w') as f:
    f.write(content)
