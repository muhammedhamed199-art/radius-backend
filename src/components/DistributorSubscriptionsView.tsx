import React, { useState, useRef } from "react";
import { Distributor, DistributorOffer, ArchivedReceipt, COUNTRIES, Currency } from "../types";
import { CreditCard, Calendar, Server, Plus, Edit, Trash2, CheckCircle, Shield, Users, Image, Receipt, Send, Check, RefreshCw } from "lucide-react";

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
  isRootAdmin?: boolean;
  currencies?: Currency[];
  defaultCurrency?: string;

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
  isDistributorSession,
  isRootAdmin,
  currencies = [],
  defaultCurrency = "LYD"
}: DistributorSubscriptionsViewProps) {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DistributorOffer | null>(null);
  const [formData, setFormData] = useState<Partial<DistributorOffer>>({
    name: "", price: 10, durationMonths: 1, maxCustomers: 0, maxNasServers: 0, pricePerNasServer: 0, description: "", country: "الكل"
  });
  
  // States for Distributor Renewal View
  const [activeTab, setActiveTab] = useState<"dashboard" | "payments">("dashboard");
  const [paymentMethod, setPaymentMethod] = useState<"balance" | "transfer">("balance");
  const [selectedOfferId, setSelectedOfferId] = useState<string>(distributor?.subscriptionOfferId || "");
  const [transferMessage, setTransferMessage] = useState<string>("");
  const [transferImage, setTransferImage] = useState<string>("");
  const [isRenewing, setIsRenewing] = useState<boolean>(false);

  const isDistributorActive = distributor?.subscriptionStatus === "نشط" && distributor?.subscriptionEndDate && new Date(distributor.subscriptionEndDate) > new Date();
  const isDistributorExpired = !isDistributorActive;
  const isDistributorUpgrade = Boolean(selectedOfferId && distributor?.subscriptionOfferId && selectedOfferId !== distributor.subscriptionOfferId);
  const canShowDistributorPayment = isDistributorExpired || isDistributorUpgrade;

  // Helper to calculate total price based on base price and extra servers
  const getCalculatedPrice = (offer: DistributorOffer, dist: Distributor) => {
    let basePrice = offer.price;
    if (dist.country && offer.countryPrices && offer.countryPrices[dist.country] !== undefined) {
      basePrice = offer.countryPrices[dist.country];
    }
    let total = basePrice;
    if (offer.pricePerNasServer && offer.pricePerNasServer > 0) {
      const activeNasCount = servers.filter(s => s.distributorId === dist.id).length;
      total += (activeNasCount * offer.pricePerNasServer);
    }
    return total;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleSaveOffer = () => {
    if (!formData.name?.trim() || formData.price === undefined || formData.durationMonths === undefined) {
      onAddNotification("يرجى تعبئة الحقول المطلوبة", "error");
      return;
    }
    
    if (!isRootAdmin && formData.price < 1) {
      onAddNotification("عذراً، يجب أن يكون سعر الباقة أكبر من صفر. الإتاحة المجانية مخصصة للمديرين فقط.", "error");
      return;
    }

    if (editingOffer) {
      onUpdateOffer({ ...editingOffer, ...formData } as DistributorOffer);
    } else {
      onAddOffer({
        ...formData,
        id: `doffer_${Date.now()}`
      } as DistributorOffer);
    }
    setShowOfferForm(false);
    setEditingOffer(null);
  };


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributor) return;
    
    const offer = offers.find(o => o.id === selectedOfferId) || offers[0];
    if (!offer) {
      onAddNotification("يرجى اختيار باقة تجديد صالحة", "error");
      return;
    }

    if (paymentMethod === "balance") {
      handleSubscribe(offer, distributor);
    } else {
      if (!transferImage) {
        onAddNotification("يرجى إرفاق صورة إيصال التحويل بشكل إلزامي", "warning");
        return;
      }
      if (!transferMessage.trim()) {
        onAddNotification("يرجى إدخال اسم المحول أو رقمه أو آخر 5 أرقام من الحساب", "warning");
        return;
      }
      
      setIsRenewing(true);
      setTimeout(() => {
        const newReceipt: ArchivedReceipt = {
          id: `rec_${Date.now()}_${Date.now().toString(36)}`,
          date: new Date().toISOString(),
          amount: getCalculatedPrice(offer, distributor),
          status: "pending",
          message: transferMessage,
          imageUrl: transferImage,
          rejectReason: "",
          
          offerId: offer.id
        };
        
        const updatedDistributor = {
          ...distributor,
          archivedReceipts: [newReceipt, ...(distributor.archivedReceipts || [])]
        };
        
        onUpdateDistributor(updatedDistributor);
        onAddNotification("تم رفع طلب التجديد والإيصال لمدير النظام بنجاح، قيد المراجعة.", "success");
        setIsRenewing(false);
        setActiveTab("payments");
        setTransferMessage("");
        setTransferImage("");
        setSelectedOfferId("");
      }, 1500);
    }
  };

  const handleSubscribe = (offer: DistributorOffer, targetDistributor: Distributor) => {
    const calculatedPrice = getCalculatedPrice(offer, targetDistributor);
    if (targetDistributor.balance < calculatedPrice) {
      onAddNotification("الرصيد غير كافٍ للاشتراك في هذه الباقة", "error");
      return;
    }

    const now = new Date();
    // If active, extend from end date, otherwise start from now
    let startDate = now;
    if (targetDistributor.subscriptionStatus === "نشط" && targetDistributor.subscriptionEndDate) {
      const currentEnd = new Date(targetDistributor.subscriptionEndDate);
      if (currentEnd > now) {
        startDate = currentEnd;
      }
    }

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (offer.durationMonths === 0 ? 1200 : offer.durationMonths));

    const updatedDistributor = {
      ...targetDistributor,
      balance: targetDistributor.balance - calculatedPrice,
      subscriptionOfferId: offer?.id,
      subscriptionStartDate: now.toISOString(),
      subscriptionEndDate: endDate.toISOString(),
      subscriptionStatus: "نشط" as const
    };

    onUpdateDistributor(updatedDistributor);
    onAddNotification(`تم تفعيل/تجديد الاشتراك بنجاح حتى ${endDate.toLocaleDateString('ar-SA')}`, "success");
  };

  // If Admin, show distributor list and offer management
  if (!isDistributorSession) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-indigo-600" />
              إدارة اشتراكات السيرفرات وعروض الموزعين
            </h2>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
              إعداد باقات اشتراك الموزعين ومتابعة صلاحية سيرفراتهم
            </p>
          </div>
          <button
            onClick={() => {
              setEditingOffer(null);
              setFormData({ name: "", price: 0, durationMonths: 1, maxCustomers: 0, maxNasServers: 0, pricePerNasServer: 0, description: "", country: "الكل", countryPrices: {} });
              setShowOfferForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة عرض موزعين
          </button>
        </div>

        {showOfferForm && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4">
              {editingOffer ? "تعديل العرض" : "عرض جديد"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">اسم العرض</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">السعر {isRootAdmin ? "(0 = مجاني)" : ""}</label>
                <input
                  type="number"
                  min={isRootAdmin ? 0 : 1}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">المدة بالأشهر (0 = مفتوح / غير محدود)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  placeholder="مثال: 1 = شهر، 2 = شهرين، 0 = مفتوح"
                />
                {formData.durationMonths !== undefined ? (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    تاريخ الانتهاء المتوقع: {formData.durationMonths === 0 ? "مدى الحياة (غير محدود)" : new Date(new Date().setMonth(new Date().getMonth() + formData.durationMonths)).toLocaleDateString('ar-SA')}
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الدولة</label>
                <select
                  value={formData.country || "الكل"}
                  onChange={(e) => {
                    const selectedCountry = e.target.value;
                    const defaultCurr = selectedCountry !== "الكل" ? defaultCurrency : "";
                    setFormData({ ...formData, country: selectedCountry, currency: defaultCurr });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                >
                  <option value="الكل">الكل (متاح لجميع الدول)</option>
                  {COUNTRIES.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              {formData.country && formData.country !== "الكل" && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">العملة</label>
                  <select
                    value={formData.currency || defaultCurrency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                  >
                    <option value="">-- اختر العملة --</option>
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">أقصى عدد للمشتركين (0 = غير محدود)</label>
                <input
                  type="number"
                  value={formData.maxCustomers}
                  onChange={(e) => setFormData({ ...formData, maxCustomers: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              
              {(!formData.country || formData.country === "الكل") && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 mb-2">أسعار مخصصة حسب الدولة (اختياري - يترك فارغاً لاعتماد السعر الأساسي)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {COUNTRIES.map(country => (
                      <div key={country} className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-1">{country}</label>
                        <input
                          type="number"
                          min={0}
                          placeholder="الأساسي"
                          value={formData.countryPrices?.[country] ?? ""}
                          onChange={(e) => {
                            const val = e.target.value ? Number(e.target.value) : undefined;
                            const newCountryPrices = { ...(formData.countryPrices || {}) };
                            if (val !== undefined) {
                              newCountryPrices[country] = val;
                            } else {
                              delete newCountryPrices[country];
                            }
                            setFormData({ ...formData, countryPrices: newCountryPrices });
                          }}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">الحد الأقصى لسيرفرات NAS (0 = غير محدود)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.maxNasServers || ""}
                  onChange={(e) => setFormData({ ...formData, maxNasServers: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">سعر كل سيرفر إضافي / متصل (اختياري)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerNasServer || ""}
                  onChange={(e) => setFormData({ ...formData, pricePerNasServer: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                />
              </div>
              <div className="md:col-span-2">

                <label className="block text-xs font-bold text-slate-500 mb-1">وصف العرض</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-20"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowOfferForm(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveOffer}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
              >
                حفظ العرض
              </button>
            </div>
          </div>
        )}

        {/* Offers List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map(offer => (
            <div key={offer?.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group">
              <div className="absolute top-4 left-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingOffer(offer);
                    setFormData(offer);
                    setShowOfferForm(true);
                  }}
                  className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteOffer(offer?.id)}
                  className="p-1.5 bg-rose-50 text-indigo-600 rounded-lg hover:bg-indigo-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{offer.name}</h3>
              <div className="flex items-end gap-2 mb-2">
                <div className="text-2xl font-black text-indigo-600">{offer.price === 0 ? "مجاني" : `${offer.price} ${offer.currency || defaultCurrency}`}</div>
                {offer.countryPrices && Object.keys(offer.countryPrices).length > 0 && (
                  <span className="text-[10px] text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded-md mb-1">+ أسعار مخصصة</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-4 h-10">{offer.description}</p>
              
              <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>الدولة</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{offer.country || "الكل"}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>المدة</span>
                  <span>{offer.durationMonths === 0 ? "مفتوح (غير محدود)" : `${offer.durationMonths} شهر`}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>أقصى عدد للمشتركين</span>
                  <span>{offer.maxCustomers ? offer.maxCustomers : "غير محدود"} مشترك</span>
                </div>
                <div className="flex justify-between">
                  <span>أقصى عدد للسيرفرات</span>
                  <span>{offer.maxNasServers ? offer.maxNasServers : "غير محدود"} سيرفر</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Distributors Subscriptions List */}
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-8 mb-4">حالة اشتراكات الموزعين</h3>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 table-scroll-container">
          <table className="w-full text-right min-w-[600px] sticky-table">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky-thead">
              <tr>
                <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500">الموزع</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500">الرصيد المتاح</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500">حالة الاشتراك</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((dist, index) => (
                <tr key={dist?.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0">
                  <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                    {index + 1}
                  </td>
                  <td className="px-2 py-2 font-bold text-sm text-slate-800 dark:text-slate-200">{dist.name}</td>
                  <td className="px-2 py-2 font-bold text-sm text-emerald-600">{dist.balance}</td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                      dist.subscriptionStatus === "نشط" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {dist.subscriptionStatus === "نشط" ? "نشط" : "منتهي/غير مفعل"}
                    </span>
                  </td>
                  <td className="px-2 py-2 font-mono text-sm text-slate-600 dark:text-slate-400">
                    {dist.subscriptionEndDate ? new Date(dist.subscriptionEndDate).toLocaleDateString('ar-SA') : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Distributor View
  if (!distributor) return null;

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Server className="w-8 h-8 text-indigo-600" />
            بوابة الدفع التلقائي لتجديد الاشتراك
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            إدارة اشتراكك ودفع رسوم السيرفر للاستمرار في تقديم الخدمة
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white dark:bg-slate-900 rounded-xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-auto overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-normal break-words ${
            activeTab === "dashboard"
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-800"
              : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>تجديد الاشتراك</span>
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-normal break-words ${
            activeTab === "payments"
              ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-800"
              : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>سجل الإيصالات</span>
        </button>
      </div>

      {activeTab === "dashboard" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 dark:bg-slate-950 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden h-fit border border-slate-800">
            
            
            <h3 className="text-sm font-bold text-slate-400 mb-6">حالة السيرفر الحالي</h3>
            
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                distributor.subscriptionStatus === "نشط" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
              }`}>
                <Server className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-black">
                  {distributor.subscriptionStatus === "نشط" ? "السيرفر مفعل ونشط" : "السيرفر متوقف (يرجى التجديد)"}
                </div>
                <div className="text-slate-400 font-bold flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  صالح حتى: <span className="font-mono text-white">{distributor.subscriptionEndDate ? new Date(distributor.subscriptionEndDate).toLocaleDateString('ar-SA') : "غير محدد"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 mt-4">
              <div className="text-xs font-bold text-slate-400 mb-1">الرصيد المتوفر في محفظتك</div>
              <div className="text-2xl font-black text-white">{distributor.balance} <span className="text-sm font-bold text-slate-500">رصيد</span></div>
            </div>
          </div>

          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">اختر باقة التجديد</h3>
              {distributor?.subscriptionOfferId && offers.some(o => o.id === distributor.subscriptionOfferId) && (
                <button
                  onClick={() => setSelectedOfferId(distributor.subscriptionOfferId!)}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1 border border-indigo-200 dark:border-indigo-800"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> اختيار تجديد الاشتراك الحالي
                </button>
              )}
            </div>
            <div className="space-y-4">
              {offers.filter(o => !o.country || o.country === "الكل" || o.country === distributor?.country).map(offer => {
                const isSelected = selectedOfferId === offer.id;
                return (
                <div 
                  key={offer?.id} 
                  onClick={() => setSelectedOfferId(offer.id)}
                  className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-all ${
                    isSelected ? "border-indigo-600 ring-1 ring-indigo-600/50 bg-indigo-50/30 dark:bg-indigo-900/10" : "border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex-1 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{offer.name}</h4>
                      {distributor?.subscriptionOfferId === offer.id && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-200 dark:border-emerald-800">
                          الباقة الحالية
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {offer.durationMonths === 0 ? "غير محدود" : `${offer.durationMonths} شهر`}</span>
                      {offer.maxCustomers > 0 && <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> أقصى حد: {offer.maxCustomers}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <div className="text-2xl font-black text-indigo-600 mb-2">
                      {((distributor?.country && offer.countryPrices && offer.countryPrices[distributor.country] !== undefined) ? offer.countryPrices[distributor.country] : offer.price) === 0 ? "مجاني" : `${((distributor?.country && offer.countryPrices && offer.countryPrices[distributor.country] !== undefined) ? offer.countryPrices[distributor.country] : offer.price)} ${offer.currency || defaultCurrency}`}
                    </div>
                    {isSelected && <div className="text-xs font-bold text-indigo-500 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> تم الاختيار</div>}
                  </div>
                </div>
              )})}
            </div>

            {selectedOfferId && (
              canShowDistributorPayment ? (
                <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                    <span>طريقة الدفع وبوابة السداد</span>
                    {isDistributorUpgrade && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold px-2.5 py-1 rounded-lg">
                        ⚡ ترقية إلى باقة جديدة
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("balance")}
                      className={`p-4 rounded-xl border flex flex-col items-start justify-center gap-2 transition-all relative overflow-hidden ${
                        paymentMethod === "balance"
                          ? "bg-white dark:bg-slate-900 border-indigo-600 ring-1 ring-indigo-600/50"
                          : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-lg ${paymentMethod === "balance" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        {paymentMethod === "balance" && <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-right mt-2">
                        <span className={`block font-bold text-sm ${paymentMethod === "balance" ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"}`}>من الرصيد المتاح</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">الدفع فوراً من محفظتك</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("transfer")}
                      className={`p-4 rounded-xl border flex flex-col items-start justify-center gap-2 transition-all relative overflow-hidden ${
                        paymentMethod === "transfer"
                          ? "bg-white dark:bg-slate-900 border-indigo-600 ring-1 ring-indigo-600/50"
                          : "bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className={`p-2 rounded-lg ${paymentMethod === "transfer" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                          <Receipt className="w-5 h-5" />
                        </div>
                        {paymentMethod === "transfer" && <CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                      <div className="text-right mt-2">
                        <span className={`block font-bold text-sm ${paymentMethod === "transfer" ? "text-indigo-900 dark:text-indigo-100" : "text-slate-700 dark:text-slate-300"}`}>تحويل بنكي / إيصال</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">رفع صورة الإيصال</span>
                      </div>
                    </button>
                  </div>

                  <form onSubmit={handleSubmitRenewal} className="space-y-4">
                    {paymentMethod === "transfer" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">رقم الحساب المحول منه (أو آخر 5 أرقام)</label>
                          <input
                            type="text"
                            value={transferMessage}
                            onChange={(e) => setTransferMessage(e.target.value)}
                            placeholder="أدخل رقم الحساب أو اسم المحول..."
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-sm transition-all shadow-sm placeholder:text-slate-400"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">صورة الإيصال (إلزامي)</label>
                          <div 
                            className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleImageUpload}
                            />
                            
                            {transferImage ? (
                              <div className="space-y-4">
                                <div className="relative inline-block">
                                  <img src={transferImage} alt="إيصال التحويل" className="max-h-40 rounded-xl object-contain mx-auto shadow-sm border border-slate-200 dark:border-slate-700" />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">تغيير الصورة</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
                                  <Image className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">انقر هنا لرفع صورة الإيصال</div>
                                  <p className="text-[10px] text-slate-500 mt-1">JPG, PNG بحد أقصى 5MB</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isRenewing || (paymentMethod === "balance" && distributor.balance < (offers.find(o => o.id === selectedOfferId)?.price || 0))}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:shadow-none mt-6"
                    >
                      {isRenewing ? (
                        <span className="flex items-center gap-2">جاري التنفيذ...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {paymentMethod === "balance" ? "تأكيد التجديد بالرصيد" : "إرسال طلب التجديد والإيصال"}
                        </>
                      )}
                    </button>
                    {paymentMethod === "balance" && distributor.balance < (offers.find(o => o.id === selectedOfferId)?.price || 0) && (
                      <p className="text-xs text-indigo-500 text-center font-bold mt-2">عذراً، رصيدك الحالي لا يكفي لتجديد هذه الباقة.</p>
                    )}
                  </form>
                </div>
              ) : (
                <div className="mt-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0 mt-0.5">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        حساب الموزع نشط ومفعل
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        خيارات وبوابات الدفع لتجديد الاشتراك غير متاحة حالياً نظراً لأن حسابك الموزع نشط. تظهر بوابات الدفع تلقائياً عند انتهاء الاشتراك للتجديد، أو عند اختيار باقة مختلفة لترقية خطتك.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between flex-wrap gap-2">
                    <span>💡 لترقية حساب الموزع: انقر على باقة أخرى مختلفة من القائمة أعلاه لتفعيل بوابات الدفع.</span>
                    {offers.filter(o => o.id !== distributor?.subscriptionOfferId).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const diffOffer = offers.find(o => o.id !== distributor?.subscriptionOfferId);
                          if (diffOffer) setSelectedOfferId(diffOffer.id);
                        }}
                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-xs shrink-0"
                      >
                        ترقية الباقة 🚀
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      ) : (
        /* Payments & Receipts Tab */
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">سجل الإيصالات والطلبات</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">تابع حالة إيصالات الدفع وطلبات التجديد المرفوعة للإدارة</p>
            </div>
          </div>
          
          <div className="table-scroll-container">
            {(!distributor.archivedReceipts || distributor.archivedReceipts.length === 0) ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">لا توجد إيصالات سابقة</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">لم تقم برفع أي طلبات تجديد بنكية حتى الآن.</p>
              </div>
            ) : (
              <table className="w-full text-right text-sm min-w-[650px] sticky-table">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 sticky-thead">
                                    <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">التاريخ</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">القيمة</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">الباقة المطلوبة</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">تاريخ المعالجة</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">حالة الطلب</th>
                    <th className="px-2 py-2 font-bold text-xs text-slate-500 dark:text-slate-400">ملاحظات الإدارة</th>
                  </tr>
                </thead>
                <tbody>
                  {distributor.archivedReceipts.map((receipt, index) => (
                    <tr key={receipt.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8">
                        {index + 1}
                      </td>
                      <td className="px-2 py-2 font-bold text-slate-700 dark:text-slate-300">{new Date(receipt.date).toLocaleDateString('ar-SA')}</td>
                      <td className="px-2 py-2 font-bold text-slate-800 dark:text-slate-200">{receipt.amount} <span className="text-xs text-slate-500">ر.س</span></td>
                                            <td className="px-2 py-2 text-slate-600 dark:text-slate-400">{offers.find(o => o.id === receipt.offerId)?.name || "-"}</td>
                      <td className="px-2 py-2 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {receipt.processedDate ? new Date(receipt.processedDate).toLocaleDateString('ar-SA') : "-"}
                      </td>
                      <td className="px-2 py-2">
                        {receipt.status === "matched" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <Check className="w-3 h-3" />
                            مقبول ومفعل
                          </span>
                        ) : receipt.status === "unmatched" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">
                            مرفوض
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                            قيد المراجعة
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-slate-600 dark:text-slate-400 text-xs">{receipt.rejectReason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
