/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  X, 
  User, 
  Wifi, 
  Clock, 
  CreditCard, 
  History, 
  DollarSign, 
  Trash2, 
  RefreshCw, 
  Activity, 
  FileText, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Plus, 
  Calendar, 
  ShieldAlert, 
  Edit, 
  Smartphone, 
  Server, 
  Download, 
  Upload, 
  Zap, 
  CheckCircle2,
  Lock,
  RotateCcw,
  ImageIcon,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { Customer, SpeedOffer, NasServer, CustomerStatus, PaymentRecord, ModificationRecord, UsageRecord } from "../types";

interface Subscriber360ModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  offers: SpeedOffer[];
  servers: NasServer[];
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onAddNotification?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  language?: "ar" | "en";
  initialTab?: "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions" | "special_offer";
  defaultWhatsAppAlertMessage?: string;
  defaultWhatsAppDelayMessage?: string;
}

export default function Subscriber360Modal({
  isOpen,
  onClose,
  customer,
  offers,
  servers,
  onUpdateCustomer,
  onDeleteCustomer,
  onAddNotification,
  language = "ar",
  initialTab = "dashboard",
  defaultWhatsAppAlertMessage = "عزيزي المشترك {name}، نذكرك باقتراب موعد انتهاء اشتراكك في باقة {offer} بتاريخ {expiry}. يرجى التجديد لضمان استمرار الخدمة.",
  defaultWhatsAppDelayMessage = "عزيزي المشترك {name}، تم إيقاف الخدمة بسبب تأخر الدفع، الرجاء السداد."
}: Subscriber360ModalProps) {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions" | "special_offer"
  >(initialTab);

  React.useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
    if (isOpen && customer) {
      setSpecialOfferId(customer.temporaryOfferId || "");
      setSpecialOfferExpiry(customer.temporaryOfferExpiry || "");
    }
  }, [isOpen, initialTab, customer]);

  // Renewal form state
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [additionalMonths, setAdditionalMonths] = useState<number>(1);
  const [renewalPaymentMethod, setRenewalPaymentMethod] = useState<string>("نقدي (Cash)");

  // Payment form state
  const [newPaymentAmount, setNewPaymentAmount] = useState<string>("");
  const [newPaymentMethod, setNewPaymentMethod] = useState<string>("نقدي (Cash)");
  const [newPaymentDesc, setNewPaymentDesc] = useState<string>("دفعة اشتراك شهري");

  // Debt settlement state
  const [settleAmount, setSettleAmount] = useState<string>("");
  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Special Offer State
  const [specialOfferId, setSpecialOfferId] = useState<string>("");
  const [specialOfferExpiry, setSpecialOfferExpiry] = useState<string>("");

  if (!isOpen || !customer) return null;

  const currentOffer = offers.find(o => o?.id === (selectedOfferId || customer.offerId)) || offers[0];
  const currentServer = servers.find(s => s?.id === customer.serverId);

  // Default initializers for mock arrays if empty
  const payments: PaymentRecord[] = customer.payments && customer.payments.length > 0 ? customer.payments : [
    {
      id: "pay-1",
      date: customer.startDate || "2026-07-01",
      amount: currentOffer?.price || 150,
      method: "نقدي (Cash)",
      description: `تنسيق تجديد الباقة (${currentOffer?.name || "باقة النطاق العريض"})`,
      invoiceNumber: `INV-${customer.username.toUpperCase()}-001`,
      processedBy: "مدير النظام الرئيسي"
    },
    {
      id: "pay-2",
      date: "2026-06-01",
      amount: currentOffer?.price || 150,
      method: "تحويل إلكتروني (Online)",
      description: "سداد الاشتراك السابق",
      invoiceNumber: `INV-${customer.username.toUpperCase()}-002`,
      processedBy: "الموزع الرئيسي"
    }
  ];

  const modifications: ModificationRecord[] = customer.modifications && customer.modifications.length > 0 ? customer.modifications : [
    {
      id: "mod-1",
      timestamp: "2026-07-20 14:30",
      action: "تحديث السرعة والباقة",
      performedBy: "مدير النظام (Admin)",
      details: `تم تعديل السرعة إلى ${currentOffer?.speed || "20M/20M"} مع حد سعة ${currentOffer?.limitGB || 100} GB.`
    },
    {
      id: "mod-2",
      timestamp: "2026-07-10 11:15",
      action: "تغيير عنوان IP الممنوح",
      performedBy: "النظام التلقائي (DHCP Pool)",
      details: `تخصيص عنوان IP ثابت جديد (${customer.ipAddress}).`
    },
    {
      id: "mod-3",
      timestamp: "2026-06-15 09:00",
      action: "إنشاء حساب المشترك",
      performedBy: "الموزع (Distributor)",
      details: `إنشاء الحساب وتفعيل اتصال ${customer.connectionType}.`
    }
  ];

  const usageLogs: UsageRecord[] = customer.usageLogs && customer.usageLogs.length > 0 ? customer.usageLogs : [
    {
      id: "use-1",
      date: "2026-07-22",
      downloadMB: Math.round((customer.consumptionGB * 0.35) * 1024),
      uploadMB: Math.round((customer.consumptionGB * 0.05) * 1024),
      sessionHours: 12.5,
      ipAssigned: customer.ipAddress,
      nasServer: currentServer?.name || "MikroTik Core Router"
    },
    {
      id: "use-2",
      date: "2026-07-21",
      downloadMB: Math.round((customer.consumptionGB * 0.25) * 1024),
      uploadMB: Math.round((customer.consumptionGB * 0.04) * 1024),
      sessionHours: 18.2,
      ipAssigned: customer.ipAddress,
      nasServer: currentServer?.name || "MikroTik Core Router"
    },
    {
      id: "use-3",
      date: "2026-07-20",
      downloadMB: Math.round((customer.consumptionGB * 0.20) * 1024),
      uploadMB: Math.round((customer.consumptionGB * 0.03) * 1024),
      sessionHours: 9.0,
      ipAssigned: customer.ipAddress,
      nasServer: currentServer?.name || "MikroTik Core Router"
    }
  ];

  // Renew / Extend handler
  const handlePerformRenewal = () => {
    const offerToApply = offers.find(o => o?.id === selectedOfferId) || currentOffer;
    const baseExpiry = customer.expiryDate ? new Date(customer.expiryDate) : new Date();
    const now = new Date();
    const startFrom = baseExpiry > now ? baseExpiry : now;
    
    // Calculate new expiration date by adding months
    const newExpiryDate = new Date(startFrom);
    newExpiryDate.setMonth(newExpiryDate.getMonth() + (additionalMonths || 1));
    const expiryStr = newExpiryDate.toISOString().split("T")[0];

    const renewalPrice = (offerToApply.price || 100) * additionalMonths;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: renewalPrice,
      method: renewalPaymentMethod,
      description: `تجديد اشتراك لمدّة ${additionalMonths} شهر (${offerToApply.name})`,
      invoiceNumber: `INV-${customer.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      processedBy: "مدير النظام"
    };

    const newMod: ModificationRecord = {
      id: `mod-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-EG"),
      action: "تجديد وتمديد الاشتراك",
      performedBy: "مدير النظام (Admin)",
      details: `تم تمديد الاشتراك لمدّة ${additionalMonths} شهر. تاريخ الانتهاء الجديد: ${expiryStr}. المبلغ: ${renewalPrice} $.`
    };

    const updatedCustomer: Customer = {
      ...customer,
      status: CustomerStatus.ACTIVE,
      offerId: offerToApply?.id,
      expiryDate: expiryStr,
      consumptionGB: 0, // reset quota upon renewal
      payments: [newPayment, ...payments],
      modifications: [newMod, ...modifications]
    };

    onUpdateCustomer(updatedCustomer);
    if (onAddNotification) {
      onAddNotification(`⚡ تم تجديد اشتراك العميل (${customer.name}) بنجاح حتى تاريخ ${expiryStr}!`, "success");
    }
    setActiveTab("dashboard");
  };

  // Add new payment entry handler
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newPaymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: amountNum,
      method: newPaymentMethod,
      description: newPaymentDesc || "تسجيل دفعة جديدة",
      invoiceNumber: `INV-${customer.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      processedBy: "مدير النظام"
    };

    // If customer has debt, deduct from debt
    let currentDebt = customer.debt || 0;
    if (currentDebt > 0) {
      currentDebt = Math.max(0, currentDebt - amountNum);
    }

    const updatedCustomer: Customer = {
      ...customer,
      debt: currentDebt,
      payments: [newPayment, ...payments]
    };

    onUpdateCustomer(updatedCustomer);
    setNewPaymentAmount("");
    if (onAddNotification) {
      onAddNotification(`💰 تم تسجيل الدفعة بقيمة ${amountNum} بنجاح للعميل (${customer.name})!`, "success");
    }
  };

  // Send WhatsApp Reminder Handler
  const handleSendWhatsAppReminder = () => {
    if (!customer?.phone) {
      if (onAddNotification) {
        onAddNotification("لا يوجد رقم هاتف مسجل للمشترك لإرسال التذكير.", "warning");
      }
      return;
    }
    
    // Determine the template
    let messageText = "";
    if (customer.status === CustomerStatus.EXPIRED || customer.status === CustomerStatus.SUSPENDED) {
      messageText = defaultWhatsAppDelayMessage;
    } else {
      messageText = defaultWhatsAppAlertMessage;
    }
    
    // Replace variables
    const offerObj = offers.find(o => o?.id === customer.offerId);
    messageText = messageText
      .replace(/{name}/g, customer.name)
      .replace(/{username}/g, customer.username)
      .replace(/{offer}/g, offerObj?.name || "الباقة الأساسية")
      .replace(/{expiry}/g, customer.expiryDate);

    const encodedMessage = encodeURIComponent(messageText);
    const phoneStr = customer.phone.replace(/\D/g, ''); // Remove non-numeric
    const whatsappUrl = `https://wa.me/${phoneStr}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    if (onAddNotification) {
      onAddNotification(`تم تجهيز رسالة التذكير للمشترك ${customer.name} وفتح الواتساب.`, "success");
    }
  };

  // Settle Debt Handler
  const handleSettleDebt = () => {
    const amountToSettle = parseFloat(settleAmount) || (customer.debt || 0);
    if (amountToSettle <= 0) return;

    const remainingDebt = Math.max(0, (customer.debt || 0) - amountToSettle);

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      amount: amountToSettle,
      method: "تسوية ديون (Debt Settlement)",
      description: "تسداد وتسوية الدين المترتب على الحساب",
      invoiceNumber: `INV-DEBT-${customer.username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      processedBy: "مدير النظام"
    };

    const newMod: ModificationRecord = {
      id: `mod-${Date.now()}`,
      timestamp: new Date().toLocaleString("ar-EG"),
      action: "تسوية الدين المترتب",
      performedBy: "مدير النظام",
      details: `تم سداد مبلغ ${amountToSettle} من الدين المترتب. المتبقي: ${remainingDebt}.`
    };

    const updatedCustomer: Customer = {
      ...customer,
      debt: remainingDebt,
      payments: [newPayment, ...payments],
      modifications: [newMod, ...modifications]
    };

    onUpdateCustomer(updatedCustomer);
    setSettleAmount("");
    if (onAddNotification) {
      onAddNotification(`✅ تم تسوية مبلغ ${amountToSettle} من ذمة العميل (${customer.name})!`, "success");
    }
  };

  // Single Delete Handler
  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDeleteExecution = () => {
    onDeleteCustomer(customer?.id);
    onClose();
    if (onAddNotification) {
      onAddNotification(`🗑️ تم نقل المشترك (${customer.name}) إلى سلة المهملات!`, "warning");
    }
  };

  const handleApplySpecialOffer = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedCustomer = {
      ...customer,
      temporaryOfferId: specialOfferId || undefined,
      temporaryOfferExpiry: specialOfferExpiry || undefined,
    };
    
    onUpdateCustomer(updatedCustomer);
    if (onAddNotification) {
      if (specialOfferId) {
        onAddNotification(`تم تخصيص باقة مؤقتة للعميل (${customer.name}) بنجاح!`, "success");
      } else {
        onAddNotification(`تم إزالة الباقة المؤقتة للعميل.`, "info");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-900 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1.5 bg-indigo-600/30 border border-indigo-400/30 rounded-2xl text-indigo-400">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold">{customer.name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  customer.status === CustomerStatus.ACTIVE
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                }`}>
                  {customer.status}
                </span>
                {customer.concurrentLogins > 0 && (
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded-full border border-indigo-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-300 animate-pulse" /> متصل
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 dir-ltr flex items-center gap-3">
                <span>@{customer.username}</span>
                <span>• IP: {customer.ipAddress}</span>
                <span>• MAC: {customer.macAddress || "غير مسجل"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* Navigation Tabs (7 Required Features) */}
        <div className="bg-slate-100 dark:bg-slate-800/80 px-4 pt-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "dashboard"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>1. داتابورد وداتا المشترك</span>
          </button>

          <button
            onClick={() => setActiveTab("renewal")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "renewal"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-emerald-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>2. تجديد وتمديد الباقة ⚡</span>
          </button>

          <button
            onClick={() => setActiveTab("usage")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "usage"
                ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 border-sky-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>3. سجل الاستهلاك والكوتا</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "payments"
                ? "bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 border-purple-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>4. سجل المدفوعات والفواتير</span>
          </button>

          <button
            onClick={() => setActiveTab("modifications")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "modifications"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <History className="w-4 h-4" />
            <span>5. سجل التعديلات والعمليات</span>
          </button>

          <button
            onClick={() => setActiveTab("debt")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "debt"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-indigo-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>6. الذمم والديون المترتبة</span>
            {customer.debt && customer.debt > 0 ? (
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {customer.debt}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab("actions")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "actions"
                ? "bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 border-red-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>7. إدارة وحذف المشترك</span>
          </button>

          <button
            onClick={() => setActiveTab("special_offer")}
            className={`px-4 py-3 rounded-t-2xl font-black text-xs transition-all flex items-center gap-2 border-t-2 ${
              activeTab === "special_offer"
                ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 border-amber-600 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>8. باقة مؤقتة (خاصة)</span>
          </button>
        </div>


        {/* Modal Main Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: DASHBOARD DATA */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${customer.temporaryOfferId ? "bg-amber-50/60 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50" : "bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900/50"}`}>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {customer.temporaryOfferId ? <Sparkles className="w-3.5 h-3.5 text-amber-500" /> : null}
                    {customer.temporaryOfferId ? "باقة مؤقتة نشطة" : "الباقة الأساسية"}
                  </span>
                  <div className={`text-lg font-black mt-1 ${customer.temporaryOfferId ? "text-amber-700 dark:text-amber-300" : "text-indigo-700 dark:text-indigo-300"}`}>
                    {customer.temporaryOfferId ? (offers.find(o => o.id === customer.temporaryOfferId)?.name || "باقة غير معروفة") : (currentOffer?.name || "باقة النطاق العريض")}
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono font-extrabold block mt-0.5">
                    السرعة: {customer.temporaryOfferId ? (offers.find(o => o.id === customer.temporaryOfferId)?.speed || "غير متوفر") : (currentOffer?.speed || "10M/10M")}
                  </span>
                  {customer.temporaryOfferExpiry && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
                      تنتهي في: {customer.temporaryOfferExpiry}
                    </span>
                  )}
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">تاريخ الانتهاء</span>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1 font-mono">{customer.expiryDate}</div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-emerald-600 font-extrabold">الحالة: {customer.status}</span>
                    <button 
                      onClick={handleSendWhatsAppReminder}
                      className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 rounded-md shadow-sm flex items-center gap-1 transition-colors"
                      title="إرسال تذكير فوراً عبر واتساب بناءً على إعدادات القالب"
                    >
                      <MessageSquare className="w-3 h-3" />
                      إرسال تذكير
                    </button>
                  </div>
                </div>

                <div className="bg-white/60 dark:bg-sky-950/40 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">إجمالي الاستهلاك</span>
                  <div className="text-lg font-black text-sky-700 dark:text-sky-300 mt-1 font-mono">{customer.consumptionGB?.toFixed(2) || "0.00"} GB</div>
                  <span className="text-[11px] text-slate-500 font-extrabold block mt-0.5">
                    من أصل {currentOffer?.isUnlimitedQuota ? "مفتوح" : `${currentOffer?.limitGB || 100} GB`}
                  </span>
                </div>

                <div className="bg-rose-50/60 dark:bg-rose-950/40 p-4 rounded-2xl border border-indigo-100 dark:border-rose-900/50">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الديون والذمم</span>
                  <div className="text-lg font-black text-indigo-700 dark:text-indigo-300 mt-1 font-mono">
                    {customer.debt ? `${customer.debt} $` : "لا يوجد ديون (0 $)"}
                  </div>
                  <span className="text-[11px] text-slate-500 font-extrabold block mt-0.5">الرصيد المتبقي: {customer.balance || 0} $</span>
                </div>
              </div>

              {/* Detailed Technical Specs Table */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  المواصفات والبيانات التقنية للحساب السيرفري
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">طريقة الاتصال:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{customer.connectionType}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">اسم الدخول (Username):</span>
                    <span className="font-extrabold font-mono text-indigo-600">{customer.username}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">كلمة المرور (Password):</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white">{customer.password || "••••••"}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">اسم دخول اللوحة:</span>
                    <span className="font-extrabold font-mono text-indigo-600">{customer.portalUsername || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">رقم سري اللوحة:</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white">{customer.portalPassword || "غير محدد"}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">عنوان IP الثابت:</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white">{customer.ipAddress}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">عنوان MAC Address:</span>
                    <span className="font-extrabold font-mono text-slate-900 dark:text-white">{customer.macAddress || "غير مقترن"}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">السيرفر المرتبط (NAS):</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{currentServer?.name || "MikroTik Core Router"}</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">رقم الهاتف والمنطقة:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{customer.phone || "غير محدد"} ({customer.region || "المنطقة الرئيسية"})</span>
                  </div>

                  <div className="flex justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-500">تاريخ بدء الاشتراك:</span>
                    {customer.startDate === "عند أول اتصال" || customer.startDateMode === "first_connect" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        ⚡ عند أول اتصال
                      </span>
                    ) : (
                      <span className="font-extrabold font-mono text-slate-900 dark:text-white">{customer.startDate || "غير محدد"}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PACKAGE RENEWAL & EXTENSION */}
          {activeTab === "renewal" && (
            <div className="space-y-6">
              <div className="px-2 py-3 text-xs md:text-sm bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-bold">
                <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>قم بتحديد عدد الأشهر والباقة المطلوبة لتمديد صلاحية الحساب وتصفير الكوتا تلقائياً.</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Select Offer */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    1. اختر الباقة المراد التجديد عليها:
                  </label>
                  <select
                    value={selectedOfferId || customer.offerId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  >
                    {offers.map(o => (
                      <option key={o?.id} value={o?.id}>
                        {o.name} - ({o.speed}) - بسعر {o.price} $ / شهر
                      </option>
                    ))}
                  </select>
                </div>

                {/* Additional Duration */}
                <div className="space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    2. مدّة التجديد والتمديد (بالأشهر):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={additionalMonths}
                    onChange={(e) => setAdditionalMonths(parseInt(e.target.value) || 1)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-extrabold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-2 md:col-span-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    3. طريقة استلام قيمة التجديد:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["نقدي (Cash)", "تحويل إلكتروني", "كرت شحن / قسيمة", "خصم من رصيد الموزع"].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRenewalPaymentMethod(m)}
                        className={`p-3 rounded-xl border text-xs font-extrabold transition-all ${
                          renewalPaymentMethod === m
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                            : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Invoice & Confirm */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-500 font-bold block">إجمالي تكلفة التجديد:</span>
                  <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {((offers.find(o => o?.id === selectedOfferId)?.price || currentOffer?.price || 100) * additionalMonths).toLocaleString()} $
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePerformRenewal}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-200" />
                  تأكيد التجديد والتمديد الآن ⚡
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: USAGE HISTORY */}
          {activeTab === "usage" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  سجل استهلاك البيانات والجلسات السابقة (Usage History)
                </h3>
                <span className="text-xs text-slate-500 font-mono font-bold">
                  إجمالي الاستهلاك الحالي: {customer.consumptionGB.toFixed(2)} GB
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm table-scroll-container">
                <table className="w-full text-right text-xs min-w-[650px] sticky-table">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold sticky-thead">
                    <tr>
                      <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                      <th className="px-2 py-1.5">التاريخ</th>
                      <th className="px-2 py-1.5">حجم التنزيل (Download)</th>
                      <th className="px-2 py-1.5">حجم الرفع (Upload)</th>
                      <th className="px-2 py-1.5">ساعات الاتصال</th>
                      <th className="px-2 py-1.5">عنوان IP</th>
                      <th className="px-2 py-1.5">السيرفر NAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {usageLogs.map((log) => (
                      <tr key={log?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1.5 font-mono font-extrabold text-slate-800 dark:text-slate-200">{log.date}</td>
                        <td className="px-2 py-1.5 font-mono font-bold text-emerald-600 flex items-center gap-1">
                          <Download className="w-3 h-3" /> {(log.downloadMB / 1024).toFixed(2)} GB
                        </td>
                        <td className="px-2 py-1.5 font-mono font-bold text-sky-600 flex items-center gap-1">
                          <Upload className="w-3 h-3" /> {(log.uploadMB / 1024).toFixed(2)} GB
                        </td>
                        <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">{log.sessionHours} ساعة</td>
                        <td className="px-2 py-1.5 font-mono text-indigo-600 dark:text-indigo-400">{log.ipAssigned}</td>
                        <td className="px-2 py-1.5 text-slate-600 dark:text-slate-400">{log.nasServer}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT HISTORY */}
          {activeTab === "payments" && (
            <div className="space-y-6">
              {/* Form to record a new payment */}
              <form onSubmit={handleAddPayment} className="px-2 py-3 text-xs md:text-sm bg-purple-50/50 dark:bg-purple-950/30 rounded-2xl border border-purple-200 dark:border-purple-900/50 space-y-3">
                <h4 className="text-xs font-black text-purple-900 dark:text-purple-200 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-600" />
                  تسجيل دفعة إيصال جديدة (Record Payment)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder="المبلغ ($)..."
                    value={newPaymentAmount}
                    onChange={(e) => setNewPaymentAmount(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono font-extrabold focus:ring-2 focus:ring-purple-500"
                    required
                  />

                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="نقدي (Cash)">نقدي (Cash)</option>
                    <option value="تحويل بنكي">تحويل بنكي</option>
                    <option value="بطاقة ائتمان">بطاقة ائتمان</option>
                    <option value="رصيد موزع">رصيد موزع</option>
                  </select>

                  <input
                    type="text"
                    placeholder="بيان / ملاحظات الدفعة..."
                    value={newPaymentDesc}
                    onChange={(e) => setNewPaymentDesc(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-extrabold text-xs rounded-xl shadow-sm transition-all"
                >
                  حفظ وتسجيل الدفعة 💰
                </button>
              </form>

              {/* Payments List */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                    <tr>
                      <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                      <th className="px-2 py-1.5">رقم الفاتورة</th>
                      <th className="px-2 py-1.5">التاريخ</th>
                      <th className="px-2 py-1.5">المبلغ</th>
                      <th className="px-2 py-1.5">طريقة الدفع</th>
                      <th className="px-2 py-1.5">البيان والتفاصيل</th>
                      <th className="px-2 py-1.5">المعالج</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map((p) => (
                      <tr key={p?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1.5 font-mono font-extrabold text-purple-600">{p.invoiceNumber}</td>
                        <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">{p.date}</td>
                        <td className="px-2 py-1.5 font-mono font-black text-emerald-600">{p.amount} $</td>
                        <td className="px-2 py-1.5 font-bold text-slate-800 dark:text-slate-200">{p.method}</td>
                        <td className="px-2 py-1.5 text-slate-600 dark:text-slate-400">{p.description}</td>
                        <td className="px-2 py-1.5 text-slate-500 text-[11px]">{p.processedBy || "الآدمن"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Archived Receipts List */}
              <div className="mt-8 space-y-3">
                <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  سجل إيصالات التجديد الذاتي (أرشيف التحويلات)
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {customer.archivedReceipts && customer.archivedReceipts.length > 0 ? (
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold">
                        <tr>
                          <th className="px-2 py-1.5 text-[10px] w-8 text-center text-slate-400">#</th>
                          <th className="px-2 py-1.5">رقم المرجع</th>
                          <th className="px-2 py-1.5">التاريخ</th>
                          <th className="px-2 py-1.5">نص الرسالة / الإيصال</th>
                          <th className="px-2 py-1.5">المبلغ المستحق</th>
                          <th className="px-2 py-1.5">حالة المطابقة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {customer.archivedReceipts.map((receipt, index) => (
                          <tr key={receipt?.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-2 py-1.5 font-mono font-extrabold text-purple-600">{receipt?.id}</td>
                            <td className="px-2 py-1.5 font-mono font-bold text-slate-700 dark:text-slate-300">{new Date(receipt.date).toLocaleString()}</td>
                            <td className="px-2 py-1.5">
                              <div className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-w-xs line-clamp-2">{receipt.message}</div>
                              {receipt.imageUrl && (
                                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <ImageIcon className="w-3 h-3" />
                                  <span>مرفق صورة إيصال</span>
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5 font-mono font-black text-slate-800 dark:text-slate-200">{receipt.amount} ريال</td>
                            <td className="px-2 py-1.5">
                              <div className="flex flex-col gap-2 items-start">
                                {receipt.status === "matched" ? (
                                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-black inline-flex items-center gap-1">
                                    ✓ مطابق وتم التفعيل
                                  </span>
                                ) : receipt.status === "unmatched" ? (
                                  <span className="bg-indigo-100 text-indigo-700 dark:bg-rose-900/30 dark:text-indigo-400 px-2 py-1 rounded-md text-[10px] font-black inline-flex items-center gap-1">
                                    ✗ غير مطابق (مرفوض)
                                  </span>
                                ) : (
                                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-black inline-flex items-center gap-1">
                                    ⏳ قيد المراجعة
                                  </span>
                                )}
                                
                                {receipt.systemMatched !== undefined && (
                                  receipt.systemMatched ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                                      ✓ مطابق برمجياً
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                      ⚠ يحتاج تحقق يدوي
                                    </span>
                                  )
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-xs font-bold">
                      لا توجد إيصالات سداد ذاتي مؤرشفة لهذا المشترك
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MODIFICATION AUDIT HISTORY */}
          {activeTab === "modifications" && (
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                سجل التعديلات والعمليات على حساب المشترك (Audit Log)
              </h3>

              <div className="space-y-3">
                {modifications.map((m) => (
                  <div key={m?.id} className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
                      <Edit className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">{m.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">{m.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">{m.details}</p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold block">
                        بواسطة: {m.performedBy}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: OUTSTANDING DEBT & BALANCE */}
          {activeTab === "debt" && (
            <div className="space-y-6">
              <div className="p-5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-extrabold text-rose-800 dark:text-rose-200 block">إجمالي الذمم والديون المترتبة:</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                    {customer.debt ? `${customer.debt} $` : "0 $ (حساب مسدد بالكامل)"}
                  </div>
                </div>

                {customer.debt && customer.debt > 0 ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="مبلغ التسوية..."
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      className="p-2.5 rounded-xl border border-indigo-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs font-mono font-extrabold w-32 focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSettleDebt}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0"
                    >
                      تسديد وسداد الدين ⚡
                    </button>
                  </div>
                ) : (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> لا يوجد أي ديون مترتبة
                  </span>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: DELETE & ACCOUNT ACTIONS */}
          {activeTab === "actions" && (
            <div className="space-y-6">
              <div className="p-5 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-xl">
                    <Trash2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-red-900 dark:text-red-200">حذف المشترك ونقله لسلة المهملات (Delete Subscriber)</h4>
                    <p className="text-xs text-red-700 dark:text-red-300 font-medium mt-1">
                      سيتم نقل الحساب إلى سلة المهملات مع الاحتفاظ ببياناته لمدة 30 يوماً قبل الحذف النهائي، ويمكن استعادته بضغطة زر واحدة.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  تأكيد نقل المشترك لسلة المهملات
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: SPECIAL TEMPORARY OFFER */}
          {activeTab === "special_offer" && (
            <div className="space-y-6">
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2.5 bg-amber-100 dark:bg-amber-900/40 text-amber-600 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">تخصيص باقة سرعة مؤقتة (Temporary Speed Offer)</h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1">
                      قم بتحديد باقة خاصة مؤقتة لتعمل بدلاً من الباقة الأساسية لهذا العميل. ستنتهي صلاحية هذه الباقة تلقائياً في التاريخ المحدد.
                    </p>
                  </div>
                </div>
                
                <form onSubmit={handleApplySpecialOffer} className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">اختر الباقة المؤقتة:</label>
                      <select
                        value={specialOfferId}
                        onChange={(e) => setSpecialOfferId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- بدون باقة مؤقتة (الرجوع للأساسية) --</option>
                        {offers.map(o => (
                          <option key={o.id} value={o.id}>{o.name} ({o.speed})</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">تاريخ انتهاء الباقة المؤقتة:</label>
                      <input
                        type="date"
                        value={specialOfferExpiry}
                        onChange={(e) => setSpecialOfferExpiry(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                        required={!!specialOfferId}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                    {customer.temporaryOfferId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSpecialOfferId("");
                          setSpecialOfferExpiry("");
                        }}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                      >
                        إلغاء الباقة المؤقتة
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-900 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      حفظ وتطبيق الباقة
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-2 py-3 text-xs md:text-sm bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-bold">
            معرف المشترك: {customer?.id}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold rounded-xl transition-all"
          >
            إغلاق Window
          </button>
        </div>


      </div>

      <ConfirmModal
        isOpen={showConfirmDelete}
        title="تأكيد نقل المشترك إلى سلة المهملات"
        message={`هل أنت متأكد من نقل المشترك (${customer.name}) إلى سلة المهملات؟`}
        description="سيتم تعطيل حسابه ونقله إلى سلة المهملات، ويمكنك استعادته في أي وقت خلال 30 يوماً."
        confirmText="نقل إلى السلة"
        onConfirm={confirmDeleteExecution}
        onClose={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}
