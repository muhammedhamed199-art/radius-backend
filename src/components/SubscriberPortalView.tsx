import React, { useState } from "react";
import { 
  User, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wifi, 
  Zap, 
  RefreshCw, 
  CreditCard, 
  Calendar, 
  Send, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  PhoneCall, 
  ArrowUpRight, 
  HelpCircle,
  HardDrive,
  Sliders,
  DollarSign,
  MessageSquare,
  Check,
  Receipt,
  Shield,
  Info,
  Image,
  Package
} from "lucide-react";
import { Customer, CustomerStatus, SpeedOffer, HotspotCard, GeneralSettings, ArchivedReceipt } from "../types";

interface SubscriberPortalViewProps {
  customers: Customer[];
  offers: SpeedOffer[];
  cards?: HotspotCard[];
  onUpdateCustomer: (customer: Customer) => void;
  onAddTicket: (ticket: any) => void;
  onAddNotification: (message: string, type?: "info" | "success" | "warning" | "error" | any) => void;
  settings: GeneralSettings;
  distributors?: any[];
}

export default function SubscriberPortalView({
  customers,
  offers,
  cards = [],
  onUpdateCustomer,
  onAddTicket,
  onAddNotification,
  settings,
  distributors = []
}: SubscriberPortalViewProps) {
  // Search query or selected ID
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCustomerId, setActiveCustomerId] = useState<string>(customers[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"dashboard" | "payments">("dashboard");

  // Renewal Form state
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [renewalMonths, setRenewalMonths] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "voucher" | "online" | "transfer">("transfer");
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [transferMessage, setTransferMessage] = useState<string>("");
  const [transferImage, setTransferImage] = useState<string>("");
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const [enableAutoRenew, setEnableAutoRenew] = useState<boolean>(false);

  React.useEffect(() => {
    if (customers.find(c => c?.id === activeCustomerId)?.autoRenew) {
      setEnableAutoRenew(true);
    }
  }, [activeCustomerId, customers]);

  const [renewalSuccessReceipt, setRenewalSuccessReceipt] = useState<{
    customerName: string;
    offerName: string;
    newExpiry: string;
    amount: number;
    transactionId: string;
  } | null>(null);

  // Self-service diagnostics state
  const [isReconnectingSession, setIsReconnectingSession] = useState<boolean>(false);
  const [pingTestResult, setPingTestResult] = useState<{
    testing: boolean;
    pingMs: number | null;
    jitterMs: number | null;
    status: "good" | "fair" | "poor" | null;
  }>({ testing: false, pingMs: null, jitterMs: null, status: null });


  // Payment confirmation modal
  const [showPaymentConfirmModal, setShowPaymentConfirmModal] = useState<boolean>(false);
  // Quick Support Ticket Modal
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [ticketSubject, setTicketSubject] = useState<string>("طلب دعم من بوابة المشترك الذاتية");
  const [ticketMessage, setTicketMessage] = useState<string>("");

  // Get active subscriber object
  const selectedCustomer = customers.find(c => c?.id === activeCustomerId) || customers[0];

  // Selected package for renewal
  const currentOffer = offers.find(o => o?.id === (selectedOfferId || selectedCustomer?.offerId)) || offers[0];

  // Calculate days remaining
  const calculateDaysRemaining = (expiryDateStr?: string) => {
    if (!expiryDateStr) return 0;
    const expiry = new Date(expiryDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = selectedCustomer ? calculateDaysRemaining(selectedCustomer.expiryDate) : 0;
  const isCustomerActive = selectedCustomer?.status === CustomerStatus.ACTIVE && daysRemaining > 0;
  const isCustomerExpired = !isCustomerActive;

  const isUpgrade = Boolean(currentOffer?.id && selectedCustomer?.offerId && currentOffer.id !== selectedCustomer.offerId && isCustomerActive);
  const canShowCustomerPayment = isCustomerExpired || isUpgrade;

  const oldOfferPrice = offers.find(o => o?.id === selectedCustomer?.offerId)?.price || 0;
  const remainingValue = isUpgrade ? Math.floor((oldOfferPrice / 30) * daysRemaining) : 0;
  const basePrice = (currentOffer?.price || 100) * renewalMonths;
  const finalAmount = Math.max(0, basePrice - remainingValue);

  if (settings.maintenanceModeEnabled) {
    return (
      <div className="min-h-screen bg-white dark:bg-white dark:bg-white flex flex-col items-center justify-center p-6 text-center" dir="rtl">
        <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-10 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800/50 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-white dark:bg-white dark:bg-slate-900/30 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <RefreshCw className="w-12 h-12 animate-spin-slow" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">النظام تحت التحديث</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            {settings.maintenanceModeMessage || "نحن نقوم بتحديث النظام حالياً لتقديم خدمة أفضل. نعتذر عن الإزعاج، وسنعود في أقرب وقت."}
          </p>
          <div className="text-sm font-medium text-slate-400 dark:text-slate-500">
            {settings.loginSupportPhone && (
              <span>للتواصل العاجل: <span className="font-mono text-slate-3000">{settings.loginSupportPhone}</span></span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Handle Search submit
  const handleSearchCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = customers.find(c => 
      c?.id.toLowerCase() === q ||
      c.username.toLowerCase() === q ||
      c.name.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.ipAddress && c.ipAddress.includes(q))
    );

    if (found) {
      setActiveCustomerId(found?.id);
      setSelectedOfferId(found.offerId);
      setRenewalSuccessReceipt(null);
      onAddNotification(`✅ تم العثور على حساب المشترك (${found.name}) بنجاح.`, "success");
    } else {
      onAddNotification(`❌ لم يتم العثور على مشترك يطابق: "${searchQuery}". يرجى التحقق من اسم الدخول أو رقم الهاتف.`, "danger");
    }
  };

  // Perform Direct Self Renewal
  const handleDirectRenewal = () => {
    if (!selectedCustomer) return;

    const offerToApply = offers.find(o => o?.id === (selectedOfferId || selectedCustomer.offerId)) || currentOffer;

    // Validate voucher if voucher payment method is selected
    if (paymentMethod === "voucher") {
      if (!voucherCode.trim()) {
        onAddNotification("⚠️ يرجى إدخال كود كرت الشحن التعبئة.", "warning");
        return;
      }
      const matchedCard = cards.find(c => c.code === voucherCode.trim() && c.status === "غير مستخدم");
      if (!matchedCard && voucherCode.trim().length < 4) {
        onAddNotification("❌ كود كرت الشحن غير صالح أو تم استخدامه سابقاً.", "danger");
        return;
      }
    }

    let archivedReceipts = selectedCustomer.archivedReceipts || [];

    if (paymentMethod === "transfer") {
      if (!transferImage) {
        onAddNotification("⚠️ يرجى رفع صورة إيصال التحويل البنكي بشكل إلزامي.", "warning");
        return;
      }
      if (!transferMessage.trim()) {
        onAddNotification("⚠️ يرجى إدخال اسم المحول، أو رقم هاتفه، أو آخر 5 أرقام من رقم الحساب.", "warning");
        return;
      }

      const newReceipt: ArchivedReceipt = {
        id: "REC-" + Date.now().toString().slice(-6),
        date: new Date().toISOString(),
        message: transferMessage,
        amount: finalAmount,
        status: "pending",
        offerId: offerToApply?.id,
        systemMatched: false,
        imageUrl: transferImage,
      };

      archivedReceipts = [...archivedReceipts, newReceipt];

      onUpdateCustomer({
        ...selectedCustomer,
        archivedReceipts
      });
         
      onAddNotification("⏳ تم إرسال الإيصال بنجاح. وهو الآن قيد المراجعة والتدقيق.", "info");
      setIsRenewing(false);
      setTransferMessage("");
      setTransferImage("");
      return;
    }

    setIsRenewing(true);

    setTimeout(() => {
      // Calculate new expiry date
      const baseDate = daysRemaining > 0 ? new Date(selectedCustomer.expiryDate) : new Date();
      baseDate.setDate(baseDate.getDate() + (30 * renewalMonths));
      const newExpiryStr = baseDate.toISOString().split("T")[0];

      // Update customer state
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        status: CustomerStatus.ACTIVE,
        expiryDate: newExpiryStr,
        offerId: offerToApply?.id,
        consumptionGB: 0.0, // Reset consumption on renewal
        autoRenew: paymentMethod !== "voucher" ? enableAutoRenew : selectedCustomer.autoRenew,
        archivedReceipts
      };

      onUpdateCustomer(updatedCustomer);

      const txnId = "TXN-" + Date.now().toString().slice(-6);

      setRenewalSuccessReceipt({
        customerName: selectedCustomer.name,
        offerName: offerToApply.name,
        newExpiry: newExpiryStr,
        amount: finalAmount,
        transactionId: txnId
      });

      setIsRenewing(false);
      onAddNotification(`⚡ تم تجديد باقة المشترك (${selectedCustomer.name}) بنجاح وتمديد الاشتراك حتى ${newExpiryStr}!`, "success");
    }, 1200);
  };

  const handleReportReceiptIssue = (receiptId: string) => {
    setTicketSubject(`مشكلة في إيصال الدفع #${receiptId}`);
    setTicketMessage(`مرحباً، أواجه مشكلة بخصوص إيصال التحويل البنكي رقم ${receiptId}.\n\nالتفاصيل:\n`);
    setShowSupportModal(true);
  };

  // Self-Service PPPoE Reset
  const handleResetSession = () => {
    if (!selectedCustomer) return;
    setIsReconnectingSession(true);
    setTimeout(() => {
      setIsReconnectingSession(false);
      onAddNotification(`🔄 تم إعادة تنشيط الجلسة وطرد الاتصال القديم للمشترك (${selectedCustomer.username}) من سيرفر الميكروتيك بنجاح.`, "info");
    }, 1500);
  };

  // Self Ping Test Simulation
  const handleRunSelfTest = () => {
    setPingTestResult({ testing: true, pingMs: null, jitterMs: null, status: null });
    setTimeout(() => {
      const ping = 15;
      const jitter = 2;
      setPingTestResult({
        testing: false,
        pingMs: ping,
        jitterMs: jitter,
        status: ping < 30 ? "good" : "fair"
      });
    }, 1800);
  };

  // Submit Quick Ticket
  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !ticketMessage.trim()) return;

    const newTicket = {
      id: "t_" + Date.now(),
      customerName: selectedCustomer.name,
      customerUsername: selectedCustomer.username,
      subject: ticketSubject,
      category: "صيانة وانقطاع",
      priority: "متوسطة" as const,
      status: "مفتوح" as const,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      messages: [
        {
          id: "m_1",
          sender: selectedCustomer.name,
          role: "customer" as const,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
          text: ticketMessage
        }
      ]
    };

    onAddTicket(newTicket);
    setShowSupportModal(false);
    setTicketMessage("");
    onAddNotification("📩 تم إرسال تذكرة الدعم الفني بنجاح! سيتواصل معك قسم الدعم خلال دقائق.", "success");
  };

  const myDistributor = selectedCustomer?.distributorId ? distributors.find(d => d.id === selectedCustomer.distributorId) : null;
  const currentProvider = myDistributor?.paymentGatewayProvider || settings.paymentGatewayProvider || 'Stripe';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border-indigo-500 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-4">
            {myDistributor?.logo && (
              <div className="bg-white/10 p-2 rounded-2xl w-fit backdrop-blur-md border border-white/20">
                <img src={myDistributor.logo} alt="شعار الموزع" className="h-16 w-auto object-contain rounded-xl" />
              </div>
            )}
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 text-slate-900 rounded-full text-xs font-bold border border-white/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>بوابة الدفع التلقائي والتجديد المباشر</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                بوابة الدفع التلقائي ⚡
              </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              استعلم فورياً عن حالة اشتراكك، راقب استهلاك البيانات المتبقية، وقم بتجديد باقتك مباشرة دون حاجة للانتظار أو التواصل مع الدعم الفني.
            </p>
            </div>
          </div>

          {/* Quick Search Widget */}
          {customers.length > 1 && (
            <form onSubmit={handleSearchCustomer} className="bg-white dark:bg-white/50 dark:bg-slate-900/20 backdrop-blur-md p-3 rounded-2xl border border-white/15 w-full md:w-96 shadow-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-200">
              🔍 البحث برقم المشترك / اسم الدخول / رقم الهاتف:
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="مثال: ahmed_2026 أو 050111..."
                  className="w-full bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-white placeholder-slate-400 pl-3 pr-8 py-2 rounded-xl text-xs font-bold border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-white dark:bg-slate-9500 text-white font-black text-xs rounded-xl transition-all shadow-md shrink-0"
              >
                استعلام
              </button>
            </div>
          </form>
          )}
        </div>

        {/* Quick Customer Selection Tabs for easy testing */}
        {customers.length > 1 && (
        <div className="mt-6 pt-4 border-t border-teal-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-slate-400 shrink-0">اختبار سريع لمشترك:</span>
          {customers.slice(0, 6).map((c) => (
            <button
              key={c?.id}
              onClick={() => {
                setActiveCustomerId(c?.id);
                setSelectedOfferId(c.offerId);
                setRenewalSuccessReceipt(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                c?.id === activeCustomerId
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400"
                  : "bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{c.name}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                c.status === CustomerStatus.ACTIVE ? "bg-emerald-500/20 text-emerald-300" : "bg-indigo-500/20 text-indigo-300"
              }`}>
                {c.status}
              </span>
            </button>
          ))}
        </div>
        )}
      </div>

      {selectedCustomer && (
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800/50 pb-px overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "dashboard"
                ? "border-teal-600 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            لوحة التحكم الرئيسية
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all shrink-0 ${
              activeTab === "payments"
                ? "border-teal-600 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            حالة المدفوعات والإيصالات
          </button>
        </div>
      )}

      {selectedCustomer ? (
        activeTab === "dashboard" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Primary Column (2 cols wide): Status, Data Usage, Self Renewal */}
          <div className="lg:col-col-span-2 space-y-6">
            
            {/* 1. Subscription Status Overview Card */}
            <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/50 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white dark:bg-white dark:bg-white/50 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 rounded-2xl flex items-center justify-center font-black text-xl border border-teal-100 dark:border-slate-800 shrink-0">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {selectedCustomer.name}
                      </h2>
                      <span className="text-xs font-mono bg-slate-100 dark:bg-slate-900/40 dark:bg-slate-900/40 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-bold px-2.5 py-0.5 rounded-lg">
                        @{selectedCustomer.username}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1 flex items-center gap-2">
                      <span>المنطقة: <strong>{selectedCustomer.region || "غير محددة"}</strong></span>
                      <span>•</span>
                      <span>الهاتف: <strong dir="ltr">{selectedCustomer.phone || "بدون رقم"}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm ${
                    selectedCustomer.status === CustomerStatus.ACTIVE
                      ? "bg-indigo-400/20 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300"
                      : selectedCustomer.status === CustomerStatus.EXPIRED
                      ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-300"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300"
                  }`}>
                    {selectedCustomer.status === CustomerStatus.ACTIVE ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-indigo-500" />
                    )}
                    <span>حالة الاشتراك: {selectedCustomer.status}</span>
                  </span>
                  
                  {selectedCustomer.autoRenew && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-sm bg-blue-400/20 text-indigo-600 dark:text-indigo-400 border border-teal-500/20 dark:bg-white dark:bg-slate-9500/20 dark:text-teal-300">
                        <Shield className="w-4 h-4 text-slate-3000" />
                        <span>التجديد التلقائي مفعل</span>
                      </span>
                      <button
                        onClick={() => {
                          onUpdateCustomer({ ...selectedCustomer, autoRenew: false });
                          onAddNotification("تم إيقاف خدمة التجديد التلقائي للاشتراك بنجاح", "info");
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-indigo-500 underline transition-colors"
                      >
                        إلغاء التفعيل
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
                <div className="bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">الباقة الحالية</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 dark:text-white block truncate">
                    {currentOffer?.name || "باقة غير معروفة"}
                  </span>
                  <span className="text-[11px] text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-bold block mt-0.5">
                    {currentOffer?.price || 100} ريال / شهرياً
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">تاريخ انتهاء الاشتراك</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 dark:text-white block font-mono">
                    {selectedCustomer.expiryDate}
                  </span>
                  <span className={`text-[11px] font-bold block mt-0.5 ${
                    daysRemaining > 5 ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"
                  }`}>
                    {daysRemaining > 0 ? `متبقي ${daysRemaining} يوماً` : `منتهي منذ ${Math.abs(daysRemaining)} يوماً!`}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">نوع الاتصال</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 dark:text-white block">
                    {selectedCustomer.connectionType}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400 font-mono block mt-0.5">
                    {selectedCustomer.ipAddress || "تلقائي DHCP"}
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50">
                  <span className="text-xs font-bold text-slate-400 block mb-1">الجلسات النشطة</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 dark:text-white block">
                    {selectedCustomer.concurrentLogins > 0 ? `${selectedCustomer.concurrentLogins} جهاز متصل` : "لا يوجد اتصال حالي"}
                  </span>
                  <span className={`text-[11px] font-bold block mt-0.5 ${
                    selectedCustomer.concurrentLogins > 0 ? "text-emerald-600" : "text-slate-400"
                  }`}>
                    {selectedCustomer.concurrentLogins > 0 ? "متصل بالشبكة الآن 🟢" : "غير متصل ⚪"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Data Consumption Visualizer Card */}
            <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-white dark:bg-white dark:bg-white/60 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 rounded-xl">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      استهلاك البيانات والرصيد (Data Usage)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                      متابعة كمية البيانات المستهلكة المباشرة خلال دورة الاشتراك الحالية
                    </p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                    {selectedCustomer.consumptionGB?.toFixed(1) || "0.0"} GB
                  </span>
                  <span className="text-xs text-slate-400 block">من إجمالي {currentOffer?.limitGB ? `${currentOffer.limitGB} GB` : "مفتوح بلا حدود"}</span>
                </div>
              </div>

              {/* Progress Bar */}
              {(() => {
                const used = selectedCustomer.consumptionGB || 0;
                const quota = currentOffer?.limitGB || 200; // default cap visual
                const percentage = Math.min(100, Math.round((used / quota) * 100));

                let barColor = "bg-indigo-600";
                if (percentage > 85) barColor = "bg-indigo-500";
                else if (percentage > 70) barColor = "bg-amber-500";

                return (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-300">نسبة الاستهلاك من الباقة:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-mono">{percentage}% مستهلك</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-900/40 dark:bg-slate-900/40 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>0 GB</span>
                      <span>المتبقي: ~{Math.max(0, quota - used).toFixed(1)} GB</span>
                      <span>السعة القصوى ({quota} GB)</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 3. Direct Package Renewal Card ("تجديد الباقة مباشرة") */}
            <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-teal-200 dark:border-slate-800/50 relative overflow-hidden space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                    <Zap className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      تجديد الباقة المباشر (Direct Renewal) ⚡
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                      جدد اشتراكك الآن لتفادي انقطاع الخدمة واستكمال التصفح فورياً
                    </p>
                  </div>
                </div>

                <span className="text-xs font-black bg-indigo-400/20 text-emerald-600 px-3 py-1 rounded-full border border-emerald-500/20">
                  تجديد فوري 24/7
                </span>
              </div>

              {/* Success Receipt Banner */}
              {renewalSuccessReceipt && (
                <div className="p-5 bg-indigo-400/20 border-2 border-emerald-500/30 rounded-2xl space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-base">
                    <CheckCircle2 className="w-6 h-6" />
                    <span>تم التجديد والتفعيل بنجاح! 🎉</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-white/50 dark:bg-slate-900/20 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <div>
                      <span className="text-slate-400 block">المشترك:</span>
                      <strong className="text-slate-800 dark:text-slate-100 dark:text-white">{renewalSuccessReceipt.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">الباقة المفعلة:</span>
                      <strong className="text-slate-800 dark:text-slate-100 dark:text-white">{renewalSuccessReceipt.offerName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">تاريخ الانتهاء الجديد:</span>
                      <strong className="text-emerald-600 font-mono">{renewalSuccessReceipt.newExpiry}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">رقم العملية:</span>
                      <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{renewalSuccessReceipt.transactionId}</strong>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    تم تحديث اشتراكك في قاعدة بيانات الميكروتيك مباشرة، يمكنك متابعة التصفح الآن دون الحاجة لإعادة تشغيل الروتر.
                  </p>
                </div>
              )}

              {/* Renewal Controls */}
              <div className="space-y-5">
                {/* Duration Selection */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-2">
                    1. اختر مدة التجديد المطلوبة:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { months: 1, label: "شهر واحد (30 يوماً)", discount: "" },
                      { months: 3, label: "3 أشهر (90 يوماً)", discount: "خصم 5%" },
                      { months: 6, label: "6 أشهر (180 يوماً)", discount: "خصم 10%" },
                      { months: 12, label: "سنة كاملة (365 يوماً)", discount: "شهر مجاني!" }
                    ].map((m) => (
                      <button
                        key={m.months}
                        type="button"
                        onClick={() => setRenewalMonths(m.months)}
                        className={`p-3 rounded-2xl text-xs font-black transition-all border text-center flex flex-col items-center justify-center gap-1 ${
                          renewalMonths === m.months
                            ? "bg-indigo-600 text-white border-teal-600 shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400"
                            : "bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-teal-400"
                        }`}
                      >
                        <span>{m.label}</span>
                        {m.discount && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-400 text-slate-900 rounded-full font-black">
                            {m.discount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Package Choice (Current or Change Offer) */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-2">
                    2. اختر الباقة أو قم بترقيتها:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {offers.map((off) => (
                      <button
                        key={off?.id}
                        type="button"
                        onClick={() => setSelectedOfferId(off?.id)}
                        className={`p-4 rounded-2xl text-right transition-all border relative flex flex-col justify-between gap-2 h-full ${
                          (selectedOfferId || selectedCustomer.offerId) === off?.id
                            ? "bg-white dark:bg-slate-800 border-teal-500 text-slate-900 dark:text-white shadow-sm ring-2 ring-teal-500/50"
                            : "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-700"
                        }`}
                      >
                        {(selectedOfferId || selectedCustomer.offerId) === off?.id && (
                          <div className="absolute top-2 left-2 p-1 bg-indigo-600 text-white rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <div>
                          <span className="font-extrabold text-xs block">{off.name}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400 block mt-0.5">
                            ⚡ {off.downloadSpeed} ميجا / ⬆️ {off.uploadSpeed} ميجا
                          </span>
                        </div>
                        <div className="mt-2 text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-extrabold text-xs">
                          {off.price * renewalMonths} ريال ({renewalMonths} شهر)
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                
                {canShowCustomerPayment ? (
                  <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800 animate-in fade-in">
                    {selectedCustomer.paymentLink && (
                      <div className="px-2 py-3 text-xs md:text-sm mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in">
                        <div>
                          <h4 className="text-sm font-black text-blue-900 dark:text-blue-100 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            رابط الدفع الإلكتروني المخصص
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            يمكنك دفع قيمة الاشتراك وتجديد باقتك فوراً عبر رابط الدفع الآمن الخاص بك.
                          </p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShowPaymentConfirmModal(true)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-blue-500/30 shrink-0 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          دفع الآن
                        </button>
                      </div>
                    )}

                    {/* Payment Method */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-2">
                        3. طريقة الدفع وتفعيل الاشتراك:
                      </label>
                      
                      {settings.enablePaymentGateway && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("transfer")}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'transfer' ? 'bg-indigo-600 border-teal-600 text-white shadow-md' : 'bg-white dark:bg-white/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'}`}
                          >
                            <CreditCard className="w-5 h-5" />
                            <span className="text-xs font-bold">تحويل بنكي يَدَوي</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("online")}
                            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'online' ? 'bg-indigo-600 border-teal-600 text-white shadow-md' : 'bg-white dark:bg-white/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-400'}`}
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                            <span className="text-xs font-bold">دفع إلكتروني مباشر</span>
                          </button>
                        </div>
                      )}

                      {paymentMethod === 'online' ? (
                        <div className="mt-2 p-5 bg-white dark:bg-white/50 dark:bg-slate-900/20 border border-teal-200 dark:border-teal-800 rounded-xl space-y-4">
                          <div className="flex items-center gap-3 mb-4 text-teal-700 dark:text-indigo-400">
                            <Shield className="w-6 h-6" />
                            <div>
                              <h4 className="font-bold text-sm">بوابة الدفع الآمنة ({currentProvider})</h4>
                              <p className="text-[10px]">يتم معالجة الدفع بشكل آمن وتلقائي.</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">رقم البطاقة البنكية</label>
                              <div className="relative">
                                <input type="text" placeholder="**** **** **** ****" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                <CreditCard className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">تاريخ الانتهاء</label>
                                <input type="text" placeholder="MM/YY" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">الرمز السري (CVV)</label>
                                <input type="text" placeholder="***" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono text-center focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                              </div>
                            </div>
                            <div>
                               <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">اسم حامل البطاقة</label>
                               <input type="text" placeholder="الاسم كما هو مطبوع على البطاقة" className="w-full p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 p-4 bg-white dark:bg-white dark:bg-white/40 border border-teal-200 dark:border-teal-800 rounded-xl space-y-3">
                        <label className="block text-xs font-bold text-teal-800 dark:text-teal-300">
                          للتفعيل، يرجى رفع صورة إيصال السداد وإدخال بيانات الحساب المحول منه ليتم المراجعة بدقة:
                        </label>
                        <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 p-3 rounded-lg border border-teal-100 dark:border-slate-800 mb-2">
                          <span className="block text-[10px] text-slate-500 mb-1">رقم الحساب المطلوب التحويل إليه (أو IBAN):</span>
                          <strong className="text-sm font-mono text-teal-700 dark:text-indigo-400">{settings.bankAccountNumber || "1234567890"}</strong>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">رقم الحساب المحول منه (أو آخر 5 أرقام)</label>
                          <input
                            type="text"
                            value={transferMessage}
                            onChange={(e) => setTransferMessage(e.target.value)}
                            placeholder="أدخل رقم الحساب أو اسم المحول..."
                            className="w-full bg-white dark:bg-white/50 dark:bg-slate-900/20 border border-teal-300 dark:border-teal-700 rounded-xl p-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-3 placeholder:text-slate-400"
                          />
                        </div>
                        
                        <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 border border-teal-300 dark:border-teal-700 border-dashed rounded-xl p-4 text-center">
                          {transferImage ? (
                            <div className="relative inline-block">
                              <img src={transferImage} alt="إيصال التحويل" className="max-h-32 rounded-lg object-contain" />
                              <button
                                type="button"
                                onClick={() => setTransferImage("")}
                                className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1 rounded-full shadow-md hover:bg-indigo-600"
                              >
                                <span className="sr-only">حذف الصورة</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            </div>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                id="receipt-upload"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setTransferImage(reader.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                              <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <div className="w-10 h-10 bg-teal-100 dark:bg-slate-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 dark:text-indigo-400">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                </div>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 dark:text-indigo-400">اضغط لرفع صورة إيصال التحويل</span>
                              </label>
                            </>
                          )}
                        </div>
                        
                        {/* Recent Transfer Status */}
                        {selectedCustomer?.archivedReceipts && selectedCustomer.archivedReceipts.filter(r => new Date(r.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length > 0 && (
                          <div className="space-y-2 mt-4 pt-4 border-t border-teal-200/50 dark:border-slate-800/50">
                            <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300">حالة الإيصالات المرفوعة مؤخراً (آخر 7 أيام):</h4>
                            <div className="grid gap-2">
                              {[...selectedCustomer.archivedReceipts].filter(r => new Date(r.date).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(receipt => (
                                <div key={receipt?.id} className="flex flex-col p-3 rounded-xl border border-teal-100 dark:border-slate-800/50 bg-white dark:bg-white/50 dark:bg-slate-900/20 gap-2">
                                  <div className="flex items-center gap-3">
                                    {receipt.status === "matched" ? (
                                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    ) : receipt.status === "unmatched" ? (
                                      <AlertTriangle className="w-5 h-5 text-indigo-500 shrink-0" />
                                    ) : (
                                      <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                    )}
                                    <div>
                                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex flex-wrap items-center gap-2">
                                        إيصال بقيمة {receipt.amount} ريال
                                        {receipt.status === "matched" && <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">مقبول وتم التفعيل</span>}
                                        {receipt.status === "unmatched" && <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 dark:bg-rose-900/40 dark:text-indigo-400">مرفوض</span>}
                                        {receipt.status === "pending" && <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">قيد المراجعة</span>}
                                      </div>
                                      {receipt.status === "unmatched" && receipt.rejectReason && (
                                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-bold">
                                          سبب الرفض: {receipt.rejectReason}
                                        </div>
                                      )}
                                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                                        {new Date(receipt.date).toLocaleString('ar-SA')} 
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      )}
                    </div>

                    {/* Invoice Summary and Auto Renew */}
                    <div className="bg-slate-50 dark:bg-slate-900/40/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Receipt className="w-4 h-4 text-slate-500" />
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">ملخص الفاتورة</h4>
                      </div>
                      <div className="space-y-2 text-xs font-medium">
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>الباقة الأساسية ({renewalMonths} شهر):</span>
                          <span>{basePrice} ريال</span>
                        </div>
                        {isUpgrade && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                            <span>رصيد الأيام المتبقية (مخصوم):</span>
                            <span>-{remainingValue} ريال</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-500 dark:text-slate-400">
                          <span>ضريبة القيمة المضافة (15%):</span>
                          <span>شاملة الضريبة</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white font-extrabold border-t border-slate-200 dark:border-slate-700 pt-2 text-sm">
                          <span>الإجمالي المستحق:</span>
                          <span className="text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 font-mono">{finalAmount} ريال</span>
                        </div>
                      </div>

                      {(paymentMethod === "online" || paymentMethod === "card") && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative flex items-center">
                              <input
                                type="checkbox"
                                checked={enableAutoRenew}
                                onChange={(e) => setEnableAutoRenew(e.target.checked)}
                                className="sr-only"
                              />
                              <div className={`w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors ${enableAutoRenew ? 'bg-emerald-500' : ''}`}></div>
                              <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${enableAutoRenew ? 'transform translate-x-5' : ''}`}></div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                                تفعيل التجديد التلقائي
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                سيتم خصم قيمة الاشتراك تلقائياً كل شهر قبل الانتهاء بيوم لضمان استمرار الخدمة بلا انقطاع.
                              </p>
                            </div>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Final Confirm Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <button
                        onClick={handleDirectRenewal}
                        disabled={isRenewing}
                        className="w-full px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-900 font-black text-sm rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                      >
                        {isRenewing ? (
                          <>
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>جاري تنفيذ التجديد المباشر...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5" />
                            <span>تأكيد تجديد الاشتراك الآن ⚡</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          اشتراكك الحالي نشط ومفعل (متبقي {daysRemaining} يوم)
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          خيارات وبوابات الدفع غير متاحة حالياً نظراً لأن اشتراكك نشط. تظهر بوابات واختيارات الدفع تلقائياً عند انتهاء فترة الاشتراك للتجديد، أو عند اختيار باقة مختلفة لترقية خطتك.
                        </p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between flex-wrap gap-2">
                      <span>💡 لترقية خطتك الحالية: اختر باقة أخرى من خيارات الباقات أعلاه لتفعيل بوابات الدفع.</span>
                      {offers.filter(o => o.id !== selectedCustomer?.offerId).length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const diffOffer = offers.find(o => o.id !== selectedCustomer?.offerId);
                            if (diffOffer) setSelectedOfferId(diffOffer.id);
                          }}
                          className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-xs shrink-0"
                        >
                          اختيار باقة جديدة للترقية 🚀
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column (1 col wide): Self Support & Diagnostic Tools */}
          <div className="space-y-6">
            
            {/* Quick Diagnostic Actions (Self Help) */}
            <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/50">
                <div className="p-2.5 bg-white dark:bg-white dark:bg-white text-indigo-600 dark:text-indigo-400 dark:text-indigo-400 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    حلول الصيانة الذاتية
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    أدوات لإعادة ضبط الاتصال واختبار الشبكة بنفسك
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Action 1: Reset Session */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/60 rounded-2xl border border-slate-200 dark:border-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 dark:text-slate-200">
                      1. إعادة تنشيط الجلسة (PPPoE Kick)
                    </span>
                    <RefreshCw className="w-4 h-4 text-slate-3000" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    تستعمل إذا كان الاتصال معلقاً أو الباقة لا تعمل بالشكل الصحيح بعد التجديد.
                  </p>
                  <button
                    onClick={handleResetSession}
                    disabled={isReconnectingSession}
                    className="w-full py-2 bg-white dark:bg-white hover:bg-teal-100 dark:bg-white/60 dark:hover:bg-slate-900 text-teal-700 dark:text-teal-300 font-bold text-xs rounded-xl transition-all border border-teal-200 dark:border-teal-800 flex items-center justify-center gap-2"
                  >
                    {isReconnectingSession ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري فصل وإعادة ربط الحساب...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>إعادة تنشيط الاتصال الآن</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Action 2: Self Speed/Ping Check */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40/60 rounded-2xl border border-slate-200 dark:border-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 dark:text-slate-200">
                      2. اختبار سرعة وجودة الاتصال
                    </span>
                    <Activity className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    يفحص زمن استجابة السيرفر (Ping) للتحقق من استقرار البنغ.
                  </p>

                  <button
                    onClick={handleRunSelfTest}
                    disabled={pingTestResult.testing}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2"
                  >
                    {pingTestResult.testing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري قياس استجابة الشبكة...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-3.5 h-3.5" />
                        <span>بدء فحص البنغ (Self Ping)</span>
                      </>
                    )}
                  </button>

                  {pingTestResult.pingMs !== null && (
                    <div className="p-2.5 bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-xl border border-emerald-200 text-center space-y-1 animate-in fade-in">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-200">
                        نتيجة الفحص: <span className="text-emerald-600 font-black font-mono">{pingTestResult.pingMs} ms</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        استقرار النفق ممتاز والتأخير منخفض للالعاب والمكالمات 🟢
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Support Ticket & WhatsApp Assistance */}
            <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-slate-800/50">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    الدعم الفني المباشر
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                    إذا واجهتك مشكلة لم تحلها الأدوات الذاتية
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Create Support Ticket */}
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="w-full p-3 bg-indigo-600 hover:bg-white dark:bg-slate-9500 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>فتح تذكرة دعم فني للمشترك</span>
                </button>

                {/* Direct WhatsApp button */}
                {selectedCustomer.phone && (
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `مرحباً قسم الدعم الفني، أنا المشترك: ${selectedCustomer.name} (اسم المستخدم: ${selectedCustomer.username}). أطلب المساعدة بخصوص اشتراكي رقم (${selectedCustomer?.id}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>مراسلة الدعم الفني عبر الواتساب 💬</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Checklist Guidelines for Subscriber */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <h4 className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" />
                <span>إرشادات سريعة لمعالجة انقطاع الإنترنت:</span>
              </h4>
              <ul className="text-xs space-y-2 text-slate-300 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">1.</span>
                  <span>تأكد من إضاءة لمبة PON أو Optical باللون الأخضر في جهاز الألياف.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>في حال استمرار البطء، اضغط زر "إعادة تنشيط الجلسة" بالأعلى.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">3.</span>
                  <span>عند التجديد الذاتي يتم تحديث الرصيد والسيرفر خلال 5 ثوانٍ تلقائياً.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
        ) : activeTab === "payments" ? (
          <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800/50 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                  حالة المدفوعات والإيصالات
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  تابع حالة إيصالات الدفع المرفوعة وطلبات التجديد الخاصة بك
                </p>
              </div>
            </div>

            {(!selectedCustomer.archivedReceipts || selectedCustomer.archivedReceipts.length === 0) ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900/40/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">لا توجد إيصالات سابقة</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">لم تقم برفع أي إيصالات تحويل بنكي حتى الآن.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {[...selectedCustomer.archivedReceipts]
                  .sort((a,b) => new Date(b?.date || 0).getTime() - new Date(a?.date || 0).getTime())
                  .map(receipt => {
                  const offer = offers.find(o => o?.id === receipt.offerId);
                  return (
                    <div key={receipt?.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40/20 gap-4 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          receipt.status === "matched" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400" :
                          receipt.status === "unmatched" ? "bg-indigo-100 text-indigo-600 dark:bg-rose-900/40 dark:text-indigo-400" :
                          "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                        }`}>
                          {receipt.status === "matched" ? <CheckCircle2 className="w-6 h-6" /> :
                           receipt.status === "unmatched" ? <AlertTriangle className="w-6 h-6" /> :
                           <Clock className="w-6 h-6" />}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">إيصال بقيمة {receipt.amount} ريال</span>
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                              receipt.status === "matched" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
                              receipt.status === "unmatched" ? "bg-indigo-100 text-indigo-700 dark:bg-rose-900/60 dark:text-indigo-300 border border-rose-200 dark:border-rose-800" :
                              "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                            }`}>
                              {receipt.status === "matched" ? "مقبول وتم التفعيل" :
                               receipt.status === "unmatched" ? "مرفوض" :
                               "قيد المراجعة"}
                            </span>
                          </div>
                          
                          {receipt.status === "unmatched" && receipt.rejectReason && (
                            <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mb-2 font-bold">
                              سبب الرفض: {receipt.rejectReason}
                            </div>
                          )}

                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(receipt.date).toLocaleString('ar-SA')}</span>
                            </div>
                            {offer && (
                              <div className="flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                <span>باقة التجديد: {offer.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-4 md:mt-0">
                        {receipt.imageUrl && (
                          <div className="shrink-0 relative group">
                            <img src={receipt.imageUrl} alt="الإيصال" className="w-16 h-16 rounded-lg object-cover border border-slate-200 dark:border-slate-700" />
                            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer">
                              <Image className="w-5 h-5 text-slate-900" />
                            </div>
                          </div>
                        )}
                        <button
                          onClick={() => handleReportReceiptIssue(receipt?.id)}
                          className="px-3 py-1.5 bg-rose-50 text-indigo-600 hover:bg-indigo-100 dark:bg-rose-900/30 dark:text-indigo-400 dark:hover:bg-rose-900/50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-indigo-100 dark:border-rose-900"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          إبلاغ عن مشكلة
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : null
      ) : (
        <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800/50">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">لا يوجد مشتركين في النظام للعرض.</p>
        </div>
      )}

      {/* Support Ticket Modal */}
      {showSupportModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-white/50 dark:bg-slate-900/20 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/50 p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white dark:bg-white text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">إرسال تذكرة دعم فني</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">المشترك: {selectedCustomer.name} (@{selectedCustomer.username})</p>
                </div>
              </div>
              <button
                onClick={() => setShowSupportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-slate-300 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                  عنوان البلاغ / عنوان التذكرة:
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                  شرح تفاصيل المشكلة المطلوبة:
                </label>
                <textarea
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  rows={4}
                  placeholder="اكتب هنا تفاصيل المشكلة التي تواجهها لمتابعتها من قبل فريق الصيانة..."
                  className="w-full bg-slate-50 dark:bg-slate-900/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-900/40 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-white dark:bg-slate-9500 text-white rounded-xl text-xs font-black shadow-md"
                >
                  إرسال التذكرة الآن 📩
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentConfirmModal && selectedCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mb-1">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">تأكيد الدفع الإلكتروني</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  سيتم توجيهك الآن إلى بوابة الدفع الآمنة
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">اسم المشترك:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{selectedCustomer.name}</strong>
              </div>
              {currentOffer && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">الباقة المحددة:</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{currentOffer.name}</strong>
                </div>
              )}
              {currentOffer && (
                <div className="flex justify-between items-center text-sm border-t border-slate-200 dark:border-slate-700/50 pt-3 mt-3">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">المبلغ الإجمالي:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-black text-lg">{currentOffer.price * renewalMonths} {currentOffer.currency}</strong>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPaymentConfirmModal(false)}
                className="w-full sm:w-1/2 px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition-colors"
              >
                إلغاء
              </button>
              <a
                href={selectedCustomer.paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowPaymentConfirmModal(false)}
                className="w-full sm:w-1/2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-black shadow-md shadow-blue-600/20 text-center transition-colors flex justify-center items-center gap-2"
              >
                تأكيد والانتقال
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
