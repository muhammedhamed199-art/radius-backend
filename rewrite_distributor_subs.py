import re

with open('src/components/DistributorSubscriptionsView.tsx', 'r') as f:
    content = f.read()

imports = """import React, { useState, useRef } from "react";
import { Distributor, DistributorOffer, ArchivedReceipt } from "../types";
import { CreditCard, Calendar, Server, Plus, Edit, Trash2, CheckCircle, Shield, Users, Image, Receipt, Send, Check } from "lucide-react";"""

content = re.sub(r'import React,.*?from "lucide-react";', imports, content, flags=re.DOTALL)

# Add states inside the component
states = """  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DistributorOffer | null>(null);
  const [formData, setFormData] = useState<Partial<DistributorOffer>>({
    name: "", price: 0, durationMonths: 1, maxCustomers: 0, description: ""
  });
  
  // States for Distributor Renewal View
  const [activeTab, setActiveTab] = useState<"dashboard" | "payments">("dashboard");
  const [paymentMethod, setPaymentMethod] = useState<"balance" | "transfer">("balance");
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [transferMessage, setTransferMessage] = useState<string>("");
  const [transferImage, setTransferImage] = useState<string>("");
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
"""
content = re.sub(r'  const \[showOfferForm.*?\n  \}\);', states, content, flags=re.DOTALL)

with open('src/components/DistributorSubscriptionsView.tsx', 'w') as f:
    f.write(content)
