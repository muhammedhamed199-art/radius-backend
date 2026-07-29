/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  CreditCard, 
  Plus, 
  Search, 
  Printer, 
  Check, 
  Database, 
  Clock, 
  Coins, 
  QrCode, 
  Grid,
  Filter,
  Trash2,
  ListFilter
} from "lucide-react";
import { HotspotCard, SpeedOffer } from "../types";

interface HotspotCardsViewProps {
  cards: HotspotCard[];
  offers: SpeedOffer[];
  onGenerateCards: (offerId: string, prefix: string, length: number, price: number, quantity: number) => void;
  onDeleteCard: (id: string) => void;
  onClearUsedCards: () => void;
  initialFilters?: {
    statusFilter?: "all" | "unused" | "used";
  } | null;
}

export default function HotspotCardsView({
  cards,
  offers,
  onGenerateCards,
  onDeleteCard,
  onClearUsedCards,
  initialFilters
}: HotspotCardsViewProps) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unused" | "used">(initialFilters?.statusFilter || "all");
  const [offerFilter, setOfferFilter] = useState<string>("all");

  React.useEffect(() => {
    if (initialFilters?.statusFilter !== undefined) {
      setStatusFilter(initialFilters.statusFilter);
    }
  }, [initialFilters]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Generator form state
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [prefix, setPrefix] = useState("H-");
  const [length, setLength] = useState(6);
  const [customPrice, setCustomPrice] = useState(0);
  const [quantity, setQuantity] = useState(10);

  // Auto-fill price from selected offer
  React.useEffect(() => {
    if (offers.length > 0) {
      const defaultOffer = offers[0];
      if (!selectedOfferId) {
        setSelectedOfferId(defaultOffer?.id);
        setCustomPrice(defaultOffer.price);
      } else {
        const selectedOffer = offers.find(o => o?.id === selectedOfferId);
        if (selectedOffer) setCustomPrice(selectedOffer.price);
      }
    }
  }, [selectedOfferId, offers]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId || quantity <= 0) return;

    onGenerateCards(selectedOfferId, prefix, length, customPrice, quantity);
    
    // Reset quantities and close
    setShowGenerator(false);
    alert(`🎉 تم بنجاح توليد ${quantity} كرت هوت سبوت للباقة المحددة!`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter Cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (card.usedBy && card.usedBy.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "unused" && card.status === "غير مستخدم") ||
      (statusFilter === "used" && card.status === "مستخدم");

    const matchesOffer = offerFilter === "all" || card.offerId === offerFilter;

    return matchesSearch && matchesStatus && matchesOffer;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-600" />
            إدارة وتوليد كروت الهوت سبوت (Hotspot Coupons)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            توليد كروت هوت سبوت عشوائية مشفرة بكميات كبيرة وبصورة فورية، وتصديرها للطباعة الحرارية المباشرة للمشتركين.
          </p>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            طباعة الكروت الفلترة
          </button>
          
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            <Plus className="w-4 h-4" />
            توليد كروت (توليد كميات)
          </button>
        </div>
      </div>

      {/* Bulk Generator Form (Collapsible) */}
      {showGenerator && (
        <form onSubmit={handleGenerate} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 border-b pb-2">
            <Grid className="w-5 h-5 text-indigo-600" />
            توليد كروت هوت سبوت تلقائياً (Bulk Card Engine)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">باقة السرعة (السعة):</label>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {offers.map(o => (
                  <option key={o?.id} value={o?.id}>{o.name} ({o.speed} / {o.limitGB}GB)</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">البادئة قبل الكود (Prefix):</label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="مثال: H-"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">طول كود الكرت (عدد الأرقام):</label>
              <input
                type="number"
                min={4}
                max={12}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">سعر الكرت النهائي (ل.س):</label>
              <input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الكمية الإجمالية للتوليد:</label>
              <input
                type="number"
                min={1}
                max={200}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowGenerator(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-200"
            >
              توليد وحفظ في الأرشيف
            </button>
          </div>
        </form>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الكود أو المستخدم..."
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 text-xs transition-all font-mono"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="unused">كروت غير مستخدمة (متاحة)</option>
              <option value="used">كروت مستخدمة مسبقاً</option>
            </select>
          </div>

          {/* Offer Filter */}
          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="all">كل الباقات</option>
            {offers.map(o => (
              <option key={o?.id} value={o?.id}>{o.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => {
              setConfirmModal({
                isOpen: true,
                title: "تصفية ومسح الكروت المستخدمة",
                message: "هل ترغب في مسح أرشيف الكروت التي تم استهلاكها بالكامل لتسريع النظام؟",
                description: "سيتم حذف جميع الكروت المستعملة التي تم تفعيلها سابقاً.",
                confirmText: "تصفية الأرشيف",
                onConfirm: () => onClearUsedCards()
              });
            }}
            className="px-3 py-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all"
          >
            تصفية الكروت المستخدمة
          </button>
        </div>
      </div>

      {/* Grid containing Printable Hotspot Card Designs */}
      <div>
        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base mb-4 flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-indigo-500" />
          معاينة وتصدير الكروت للطباعة ({filteredCards.length} كرت مطابق للفلترة)
        </h3>

        {/* This ID is targeted by the print stylesheet inside src/index.css */}
        <div id="print-area" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCards.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-2xl border text-center text-slate-400 font-bold">
              لا توجد كروت هوت سبوت مطابقة للبحث أو للخيارات المختارة.
            </div>
          ) : (
            filteredCards.map((card) => {
              const offer = offers.find(o => o?.id === card.offerId);
              const isUsed = card.status === "مستخدم";

              return (
                <div 
                  key={card?.id}
                  className={`bg-white dark:bg-slate-900 rounded-xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden ${
                    isUsed ? "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 opacity-60" : "border-indigo-100 ring-1 ring-indigo-50/50"
                  }`}
                >
                  {/* Decorative edge circles like real tickets */}
                  <div className="absolute -left-2 top-1/2 -mt-2 w-4 h-4 bg-slate-50 dark:bg-slate-800 rounded-full border-r border-slate-200 dark:border-slate-700"></div>
                  <div className="absolute -right-2 top-1/2 -mt-2 w-4 h-4 bg-slate-50 dark:bg-slate-800 rounded-full border-l border-slate-200 dark:border-slate-700"></div>

                  <div className="space-y-3">
                    {/* Header: Speed */}
                    <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-200 bg-indigo-50 px-2 py-0.5 rounded">
                        {offer ? offer.name : "باقة عامة"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold font-mono">
                        {offer?.speed}
                      </span>
                    </div>

                    {/* QR Code and Credentials */}
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-100 shrink-0">
                        <QrCode className="w-8 h-8" />
                      </div>
                      <div className="font-mono">
                        <span className="block text-[9px] text-slate-400 font-sans font-semibold">كود التفعيل (رمز الدخول):</span>
                        <strong className="text-sm font-black text-slate-900 tracking-wider">
                          {card.code}
                        </strong>
                      </div>
                    </div>

                    {/* Details Quota & Expiry */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1 font-semibold">
                        <Database className="w-3 h-3 text-slate-400" />
                        <span>{card.limitGB} GB كوتة</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{card.durationDays} يوم</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and card Status */}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 mt-3">
                    <span className="text-xs font-black text-indigo-600 font-mono">
                      {card.price.toLocaleString()} ل.س
                    </span>

                    {isUsed ? (
                      <span className="text-[8px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold">
                        تم استخدامه ({card.usedBy})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            isOpen: true,
                            title: "تأكيد حذف كرت الهوتسبوت",
                            message: `هل ترغب بحذف كود الكرت [${card.code}] نهائياً؟`,
                            description: "سيتم مسح الكرت ولن يمكن استخدامه للتسجيل بالنظام.",
                            confirmText: "حذف الكرت",
                            onConfirm: () => onDeleteCard(card?.id)
                          });
                        }}
                        className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded"
                        title="حذف الكرت"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
