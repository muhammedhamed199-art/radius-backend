/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  Percent,
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Wifi, 
  Clock, 
  Database, 
  Coins, 
  Users, 
  Check, 
  X,
  ArrowUp,
  ArrowDown,
  Infinity as InfinityIcon,
  Calendar,
  Gift,
  HelpCircle,
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  Building2,
  Tag,
  Globe,
  Zap
} from "lucide-react";
import { SpeedOffer, Customer, Currency, COUNTRIES, Distributor } from "../types";

interface OffersViewProps {
  offers: SpeedOffer[];
  customers: Customer[];
  distributors?: Distributor[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onAddOffer: (offer: Omit<SpeedOffer, "id">) => void;
  onEditOffer: (offer: SpeedOffer) => void;
  onDeleteOffer: (id: string) => void;
  isDistributorSession?: boolean;
  currentDistributorId?: string | null;
  canManageOffers?: boolean;
}

export default function OffersView({
  offers,
  customers,
  distributors = [],
  currencies = [],
  defaultCurrency = "LYD",
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
  isDistributorSession,
  currentDistributorId,
  canManageOffers = true
}: OffersViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search & Filter state
  const [distributorFilter, setDistributorFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [speedTierFilter, setSpeedTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("subscribers_desc");

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

  // Form states
  const [name, setName] = useState("");
  const [speed, setSpeed] = useState("10M/2M");
  const [downloadSpeed, setDownloadSpeed] = useState("10 Mbps");
  const [uploadSpeed, setUploadSpeed] = useState("2 Mbps");
  const [price, setPrice] = useState(15000);
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  const [country, setCountry] = useState<string>("الكل");
  const [isFree, setIsFree] = useState(false);
  const [durationDays, setDurationDays] = useState(30);
  const [isUnlimitedDuration, setIsUnlimitedDuration] = useState(false);
  const [limitGB, setLimitGB] = useState(100);
  const [isUnlimitedQuota, setIsUnlimitedQuota] = useState(false);
  const [startTrigger, setStartTrigger] = useState<"now" | "first_login" | "custom_duration">("now");
  const [startTriggerDaysOffset, setStartTriggerDaysOffset] = useState(0);
  const [addDistributorId, setAddDistributorId] = useState<string>(
    isDistributorSession ? (currentDistributorId || "") : ""
  );

  // Edit states
  const [editName, setEditName] = useState("");
  const [editSpeed, setEditSpeed] = useState("");
  const [editDownloadSpeed, setEditDownloadSpeed] = useState("");
  const [editUploadSpeed, setEditUploadSpeed] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editCurrency, setEditCurrency] = useState<string>(defaultCurrency);
  const [editCountry, setEditCountry] = useState<string>("الكل");
  const [editIsFree, setEditIsFree] = useState(false);
  const [editDurationDays, setEditDurationDays] = useState(30);
  const [editIsUnlimitedDuration, setEditIsUnlimitedDuration] = useState(false);
  const [editLimitGB, setEditLimitGB] = useState(100);
  const [editIsUnlimitedQuota, setEditIsUnlimitedQuota] = useState(false);
  const [editStartTrigger, setEditStartTrigger] = useState<"now" | "first_login" | "custom_duration">("now");
  const [editStartTriggerDaysOffset, setEditStartTriggerDaysOffset] = useState(0);
  const [editDistributorId, setEditDistributorId] = useState<string>("");

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !speed) return;
    
    onAddOffer({
      name,
      speed,
      downloadSpeed: downloadSpeed || undefined,
      uploadSpeed: uploadSpeed || undefined,
      price: isFree ? 0 : price,
      currency: currency || defaultCurrency,
      country,
      isFree,
      durationDays: isUnlimitedDuration ? 0 : durationDays,
      isUnlimitedDuration,
      limitGB: isUnlimitedQuota ? 0 : limitGB,
      isUnlimitedQuota,
      startTrigger,
      startTriggerDaysOffset: startTrigger === "custom_duration" ? startTriggerDaysOffset : undefined,
      distributorId: addDistributorId || (isDistributorSession ? (currentDistributorId || undefined) : undefined)
    });

    // Reset
    setName("");
    setSpeed("10M/2M");
    setDownloadSpeed("10 Mbps");
    setUploadSpeed("2 Mbps");
    setPrice(15000);
    setIsFree(false);
    setDurationDays(30);
    setIsUnlimitedDuration(false);
    setLimitGB(100);
    setIsUnlimitedQuota(false);
    setStartTrigger("now");
    setStartTriggerDaysOffset(0);
    setAddDistributorId(isDistributorSession ? (currentDistributorId || "") : "");
    setShowAddForm(false);
  };

  const startEdit = (offer: SpeedOffer) => {
    setEditingId(offer?.id);
    setEditName(offer.name);
    setEditSpeed(offer.speed);
    setEditDownloadSpeed(offer.downloadSpeed || "");
    setEditUploadSpeed(offer.uploadSpeed || "");
    setEditPrice(offer.price);
    setEditCurrency(offer.currency || defaultCurrency);
    setEditCountry(offer.country || "الكل");
    setEditIsFree(offer.isFree || offer.price === 0);
    setEditDurationDays(offer.durationDays);
    setEditIsUnlimitedDuration(offer.isUnlimitedDuration || offer.durationDays === 0);
    setEditLimitGB(offer.limitGB);
    setEditIsUnlimitedQuota(offer.isUnlimitedQuota || false);
    setEditStartTrigger(offer.startTrigger || "now");
    setEditStartTriggerDaysOffset(offer.startTriggerDaysOffset || 0);
    setEditDistributorId(offer.distributorId || "");
  };

  const saveEdit = (id: string) => {
    const original = offers.find(o => o.id === id);
    if (!original) return;
    
    onEditOffer({
      ...original,
      id,
      name: editName,
      speed: editSpeed,
      downloadSpeed: editDownloadSpeed || undefined,
      uploadSpeed: editUploadSpeed || undefined,
      price: editIsFree ? 0 : editPrice,
      currency: editCurrency || defaultCurrency,
      country: editCountry,
      isFree: editIsFree,
      durationDays: editIsUnlimitedDuration ? 0 : editDurationDays,
      isUnlimitedDuration: editIsUnlimitedDuration,
      limitGB: editIsUnlimitedQuota ? 0 : editLimitGB,
      isUnlimitedQuota: editIsUnlimitedQuota,
      startTrigger: editStartTrigger,
      startTriggerDaysOffset: editStartTrigger === "custom_duration" ? editStartTriggerDaysOffset : undefined,
      distributorId: editDistributorId || undefined
    });
    setEditingId(null);
  };

  const handleResetFilters = () => {
    setDistributorFilter("all");
    setSearchQuery("");
    setSpeedTierFilter("all");
    setTypeFilter("all");
    setCountryFilter("all");
    setSortBy("subscribers_desc");
  };

  const hasActiveFilters = 
    distributorFilter !== "all" ||
    searchQuery.trim() !== "" ||
    speedTierFilter !== "all" ||
    typeFilter !== "all" ||
    countryFilter !== "all" ||
    sortBy !== "subscribers_desc";

  const parseSpeedMbps = (offer: SpeedOffer): number => {
    if (offer.downloadSpeed) {
      const match = offer.downloadSpeed.match(/(\d+(\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    }
    if (offer.speed) {
      const match = offer.speed.match(/(\d+(\.\d+)?)/);
      if (match) return parseFloat(match[1]);
    }
    return 0;
  };

  const filteredOffers = useMemo(() => {
    let result = offers.filter(offer => {
      // 1. Distributor Filter
      if (distributorFilter === "admin" && offer.distributorId) return false;
      if (distributorFilter !== "all" && distributorFilter !== "admin" && offer.distributorId !== distributorFilter) return false;

      // 2. Type Filter
      if (typeFilter === "free" && !(offer.isFree || offer.price === 0)) return false;
      if (typeFilter === "paid" && (offer.isFree || offer.price === 0)) return false;
      if (typeFilter === "unlimited_quota" && !offer.isUnlimitedQuota) return false;
      if (typeFilter === "limited_quota" && offer.isUnlimitedQuota) return false;

      // 3. Country Filter
      if (countryFilter !== "all" && offer.country && offer.country !== "الكل" && offer.country !== countryFilter) return false;

      // 4. Speed Tier Filter
      const speedVal = parseSpeedMbps(offer);
      if (speedTierFilter === "high" && speedVal < 20) return false;
      if (speedTierFilter === "mid" && (speedVal < 10 || speedVal >= 20)) return false;
      if (speedTierFilter === "low" && (speedVal >= 10 || speedVal === 0)) return false;

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const dist = distributors.find(d => d.id === offer.distributorId);
        const distName = dist?.name || "إدارة النظام";
        const distUsername = dist?.username || "";

        const matchName = offer.name.toLowerCase().includes(q);
        const matchSpeed = offer.speed.toLowerCase().includes(q);
        const matchDown = (offer.downloadSpeed || "").toLowerCase().includes(q);
        const matchUp = (offer.uploadSpeed || "").toLowerCase().includes(q);
        const matchDist = distName.toLowerCase().includes(q) || distUsername.toLowerCase().includes(q);
        const matchCountry = (offer.country || "").toLowerCase().includes(q);
        const matchPrice = `${offer.price}`.includes(q);

        if (!matchName && !matchSpeed && !matchDown && !matchUp && !matchDist && !matchCountry && !matchPrice) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    return [...result].sort((a, b) => {
      if (sortBy === "subscribers_desc") {
        const countA = customers.filter(c => c.offerId === a.id).length;
        const countB = customers.filter(c => c.offerId === b.id).length;
        return countB - countA;
      }
      if (sortBy === "name_asc") {
        return a.name.localeCompare(b.name, "ar");
      }
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      if (sortBy === "speed_desc") {
        return parseSpeedMbps(b) - parseSpeedMbps(a);
      }
      return 0;
    });
  }, [offers, customers, distributors, distributorFilter, typeFilter, countryFilter, speedTierFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Percent className="w-6 h-6 text-emerald-600" />
            عروض وباقات سرعات الإنترنت
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            إعداد أسعار عروض السرعات والكوتة المتاحة للعملاء، وتتبع العروض الأكثر مبيعاً على السيرفر لتوجيه الحصص.
          </p>
        </div>
        {(!isDistributorSession || canManageOffers) && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-100 shrink-0"
          >
            <Plus className="w-4 h-4" />
            إضافة عرض جديد
          </button>
        )}
      </div>

      {/* Add Offer Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSubmitAdd} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 border-b pb-2">
            <Plus className="w-5 h-5 text-emerald-600" />
            إنشاء عرض سرعة إنترنت جديد
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم الباقة (العرض العربي):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: باقة 20 ميجا المنزلي"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">السرعة المبرمجة بالـ Mikrotik:</label>
              <input
                type="text"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="مثال: 20M/5M"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ArrowDown className="w-3.5 h-3.5 text-emerald-600" /> سرعة التنزيل (Download Speed):
              </label>
              <input
                type="text"
                value={downloadSpeed}
                onChange={(e) => setDownloadSpeed(e.target.value)}
                placeholder="مثال: 20 Mbps"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ArrowUp className="w-3.5 h-3.5 text-indigo-600" /> سرعة الرفع (Upload Speed):
              </label>
              <input
                type="text"
                value={uploadSpeed}
                onChange={(e) => setUploadSpeed(e.target.value)}
                placeholder="مثال: 5 Mbps"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">سعر الباقة والعملة:</label>
                <label className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  هذه الباقة مجانية 🎁
                </label>
              </div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={isFree ? 0 : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={isFree}
                  className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 font-mono font-black"
                  required={!isFree}
                />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {currencies && currencies.length > 0 ? (
                    currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.symbol} ({c.code})</option>
                    ))
                  ) : (
                    <option value={defaultCurrency}>{defaultCurrency}</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الدولة</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="الكل">الكل (متاح لجميع الدول)</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {!isDistributorSession && distributors && distributors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الموزع المنشئ / المالك للباقة:</label>
                <select
                  value={addDistributorId}
                  onChange={(e) => setAddDistributorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">إدارة النظام الرئيسية (المدير العام)</option>
                  {distributors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.username})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">سعة الاستهلاك (جيجابايت):</label>
                <label className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUnlimitedQuota}
                    onChange={(e) => setIsUnlimitedQuota(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  كوتة غير محدودة (مفتوح) ♾️
                </label>
              </div>
              <input
                type="number"
                value={isUnlimitedQuota ? 0 : limitGB}
                onChange={(e) => setLimitGB(Number(e.target.value))}
                disabled={isUnlimitedQuota}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 font-black"
                required={!isUnlimitedQuota}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">مدة الباقة (أيام):</label>
                <label className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isUnlimitedDuration}
                    onChange={(e) => setIsUnlimitedDuration(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  بدون وقت محدد (صلاحية مفتوحة) ♾️
                </label>
              </div>
              <input
                type="number"
                value={isUnlimitedDuration ? 0 : durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                disabled={isUnlimitedDuration}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60 font-black"
                required={!isUnlimitedDuration}
              />
            </div>
          </div>

          {/* Customer Subscription Start Timing Policy */}
          <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3 mt-4">
            <h4 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              سياسة بدء احتساب صلاحية العميل (تاريخ التفعيل)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                startTrigger === "now" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-1 ring-indigo-50" : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900"
              }`}>
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="startTrigger"
                    checked={startTrigger === "now"}
                    onChange={() => setStartTrigger("now")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100">من الآن مباشرة ⚡</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">يبدأ عداد الأيام التنازلي للمشترك فوراً من لحظة تفعيل الحساب أو شرائه.</p>
                  </div>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                startTrigger === "custom_duration" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-1 ring-indigo-50" : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900"
              }`}>
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="startTrigger"
                    checked={startTrigger === "custom_duration"}
                    onChange={() => setStartTrigger("custom_duration")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100">بأثر رجعي (مسبق الصنع) ⏳</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">بدء الاحتساب قبل تاريخ التفعيل الحالي بمدة (مثال: خصم يومين من الباقة للتعويض).</p>
                  </div>
                </div>
                {startTrigger === "custom_duration" && (
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold whitespace-normal break-words">بدء قبل:</span>
                    <input
                      type="number"
                      value={startTriggerDaysOffset}
                      onChange={(e) => setStartTriggerDaysOffset(Number(e.target.value))}
                      className="w-16 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs text-center font-mono font-bold"
                      placeholder="أيام"
                    />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">أيام</span>
                  </div>
                )}
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                startTrigger === "first_login" ? "bg-white dark:bg-slate-900 border-indigo-600 ring-1 ring-indigo-50" : "bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:bg-slate-900"
              }`}>
                <div className="flex items-start gap-2">
                  <input
                    type="radio"
                    name="startTrigger"
                    checked={startTrigger === "first_login"}
                    onChange={() => setStartTrigger("first_login")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="block text-xs font-extrabold text-slate-800 dark:text-slate-100">عند أول اتصال بالإنترنت (البرودباند) 🔌</span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">لا تحتسب أي أيام ضائعة؛ يبدأ المؤقت فقط حين يتصل يوزر البرودباند أو الهوتسبوت بالسيرفر لأول مرة.</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-emerald-200"
            >
              حفظ العرض الجديد
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Top Header & Quick Chips for Distributors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              بحث وتصفية السرعات للباقة والموزع
            </span>
            <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-black px-2 py-0.5 rounded-full">
              {filteredOffers.length} من {offers.length} باقة
            </span>
          </div>

          {/* Quick Distributor Chips */}
          {!isDistributorSession && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">الموزع:</span>
              <button
                type="button"
                onClick={() => setDistributorFilter("all")}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
                  distributorFilter === "all"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                الكل ({offers.length})
              </button>
              <button
                type="button"
                onClick={() => setDistributorFilter("admin")}
                className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
                  distributorFilter === "admin"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                🏛️ الإدارة ({offers.filter(o => !o.distributorId).length})
              </button>
              {distributors.map(d => {
                const count = offers.filter(o => o.distributorId === d.id).length;
                const isSelected = distributorFilter === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDistributorFilter(d.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    👤 {d.name} ({count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Live Search Input */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، السرعة، السعر..."
              className="w-full pr-9 pl-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Distributor Dropdown Filter */}
          {!isDistributorSession && (
            <div>
              <select
                value={distributorFilter}
                onChange={(e) => setDistributorFilter(e.target.value)}
                className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">🌐 جميع الموزعين والإدارة ({offers.length})</option>
                <option value="admin">🏛️ إدارة النظام فقط ({offers.filter(o => !o.distributorId).length})</option>
                {distributors.map(d => {
                  const count = offers.filter(o => o.distributorId === d.id).length;
                  return (
                    <option key={d.id} value={d.id}>
                      👤 {d.name} ({count} باقة)
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Speed Tier Filter */}
          <div>
            <select
              value={speedTierFilter}
              onChange={(e) => setSpeedTierFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">⚡ جميع السرعات (فائقة/عادية)</option>
              <option value="high">🚀 سرعات عالية (20 Mbps فأعلى)</option>
              <option value="mid">⚡ سرعات متوسطة (10 - 20 Mbps)</option>
              <option value="low">🌐 سرعات اقتصادية (أقل من 10 Mbps)</option>
            </select>
          </div>

          {/* Package Type & Price Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">🏷️ جميع أنواع الباقات</option>
              <option value="paid">💳 الباقات المدفوعة</option>
              <option value="free">🎁 الباقات المجانية</option>
              <option value="unlimited_quota">♾️ كوتة مفتوحة (غير محدودة)</option>
              <option value="limited_quota">📊 كوتة محدودة (جيجابايت)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="subscribers_desc">👥 الأكثر استخداماً (مشتركين)</option>
              <option value="speed_desc">⚡ الأسرع أولاً</option>
              <option value="price_asc">💵 الأقل سعراً أولاً</option>
              <option value="price_desc">💰 الأعلى سعراً أولاً</option>
              <option value="name_asc">🔤 أبجدي حسب الاسم</option>
            </select>
          </div>
        </div>

        {/* Active Filters Bar & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              <span>تم تطبيق الفلاتر:</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                نتائج التصفية ({filteredOffers.length})
              </span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-rose-600 dark:text-rose-400 hover:underline font-extrabold flex items-center gap-1 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              إعادة ضبط جميع الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Offers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOffers.map((offer) => {
          const activeUsersInOffer = customers.filter(c => c.offerId === offer?.id).length;
          const isEditing = editingId === offer?.id;

          return (
            <div 
              key={offer?.id} 
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-6 flex flex-col justify-between transition-all duration-200 ${
                isEditing ? "border-emerald-500 ring-2 ring-emerald-100" : "border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-slate-200 dark:border-slate-700"
              }`}
            >
              {isEditing ? (
                /* EDITING STATE */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">تعديل باقة [ {offer.name} ]</h4>
                    <span className="text-[10px] font-mono text-slate-400">ID: {offer?.id}</span>
                  </div>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">اسم الباقة:</label>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold animate-pulse-once"
                      />
                    </div>
                    {!isDistributorSession && distributors && distributors.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">الموزع المنشئ / المالك للباقة:</label>
                        <select
                          value={editDistributorId}
                          onChange={(e) => setEditDistributorId(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100"
                        >
                          <option value="">إدارة النظام الرئيسية (المدير العام)</option>
                          {distributors.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">السرعة المبرمجة بالـ Mikrotik:</label>
                      <input
                        type="text"
                        value={editSpeed}
                        onChange={(e) => setEditSpeed(e.target.value)}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-0.5">
                          <ArrowDown className="w-3 h-3 text-emerald-600" /> تنزيل (Download):
                        </label>
                        <input
                          type="text"
                          value={editDownloadSpeed}
                          onChange={(e) => setEditDownloadSpeed(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-0.5">
                          <ArrowUp className="w-3 h-3 text-indigo-600" /> رفع (Upload):
                        </label>
                        <input
                          type="text"
                          value={editUploadSpeed}
                          onChange={(e) => setEditUploadSpeed(e.target.value)}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">سعر الاشتراك والعملة:</label>
                        <label className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editIsFree}
                            onChange={(e) => setEditIsFree(e.target.checked)}
                            className="rounded scale-75 text-emerald-600"
                          />
                          مجاني 🎁
                        </label>
                      </div>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={editIsFree ? 0 : editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          disabled={editIsFree}
                          className="flex-1 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50 font-mono font-bold"
                        />
                        <select
                          value={editCurrency}
                          onChange={(e) => setEditCurrency(e.target.value)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-100"
                        >
                          {currencies && currencies.length > 0 ? (
                            currencies.map(c => (
                              <option key={c.code} value={c.code}>{c.symbol} ({c.code})</option>
                            ))
                          ) : (
                            <option value={defaultCurrency}>{defaultCurrency}</option>
                          )}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">الدولة:</label>
                      <select
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-800 dark:text-slate-100"
                      >
                        <option value="الكل">الكل</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">البيانات (GB):</label>
                          <label className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsUnlimitedQuota}
                              onChange={(e) => setEditIsUnlimitedQuota(e.target.checked)}
                              className="rounded scale-75 text-indigo-600"
                            />
                            مفتوح ♾️
                          </label>
                        </div>
                        <input
                          type="number"
                          value={editIsUnlimitedQuota ? 0 : editLimitGB}
                          onChange={(e) => setEditLimitGB(Number(e.target.value))}
                          disabled={editIsUnlimitedQuota}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50 font-bold"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">الصلاحية (أيام):</label>
                          <label className="flex items-center gap-0.5 text-[9px] font-bold text-indigo-600 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editIsUnlimitedDuration}
                              onChange={(e) => setEditIsUnlimitedDuration(e.target.checked)}
                              className="rounded scale-75 text-indigo-600"
                            />
                            مفتوح ♾️
                          </label>
                        </div>
                        <input
                          type="number"
                          value={editIsUnlimitedDuration ? 0 : editDurationDays}
                          onChange={(e) => setEditDurationDays(Number(e.target.value))}
                          disabled={editIsUnlimitedDuration}
                          className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs disabled:opacity-50 font-bold"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <span className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-300">سياسة بدء التفعيل:</span>
                      <select
                        value={editStartTrigger}
                        onChange={(e) => setEditStartTrigger(e.target.value as any)}
                        className="w-full p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-bold text-slate-700 dark:text-slate-200"
                      >
                        <option value="now">تفعيل مباشر (الآن) ⚡</option>
                        <option value="custom_duration">تفعيل بأثر رجعي ⏳</option>
                        <option value="first_login">أول اتصال للسيرفر (البرودباند) 🔌</option>
                      </select>
                      {editStartTrigger === "custom_duration" && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">تاريخ البدء يسبق بـ:</span>
                          <input
                            type="number"
                            value={editStartTriggerDaysOffset}
                            onChange={(e) => setEditStartTriggerDaysOffset(Number(e.target.value))}
                            className="w-12 p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center text-xs font-mono font-bold"
                          />
                          <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold">أيام</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 justify-end border-t border-slate-200 dark:border-slate-800">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> إلغاء
                    </button>
                    <button 
                      onClick={() => saveEdit(offer?.id)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> حفظ التغييرات
                    </button>
                  </div>
                </div>
              ) : (
                /* REGULAR CARD VIEW */
                <>
                  <div>
                    {/* Badge / Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] bg-slate-100 text-slate-700 dark:text-slate-200 font-extrabold px-2 py-0.5 rounded-full font-mono">
                            {offer.speed}
                          </span>
                          {(offer.downloadSpeed || offer.uploadSpeed) && (
                            <div className="flex gap-1">
                              {offer.downloadSpeed && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                                  <ArrowDown className="w-2.5 h-2.5" /> {offer.downloadSpeed}
                                </span>
                              )}
                              {offer.uploadSpeed && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                                  <ArrowUp className="w-2.5 h-2.5" /> {offer.uploadSpeed}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-2 flex items-center gap-1.5 flex-wrap">
                          {offer.name}
                          {(offer.isFree || offer.price === 0) && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                              <Gift className="w-3 h-3" /> مجاني
                            </span>
                          )}
                        </h3>

                        {/* اسم الموزع المنشئ للباقة */}
                        <div className="flex items-center gap-1.5 mt-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                          <Users className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>الموزع المنشئ:</span>
                          <button
                            type="button"
                            onClick={() => setDistributorFilter(offer.distributorId || "admin")}
                            title="انقر لتصفية باقات هذا الموزع فقط"
                            className="font-extrabold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/80 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/60 inline-flex items-center gap-1 transition-all cursor-pointer"
                          >
                            {offer.distributorId ? (
                              distributors?.find(d => d.id === offer.distributorId)?.name || `موزع (${offer.distributorId})`
                            ) : (
                              "إدارة النظام (المدير العام)"
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Wifi className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Price and duration */}
                    <div className="my-5 pb-5 border-b border-slate-200 dark:border-slate-800">
                      <div className="flex items-baseline gap-1">
                        {(offer.isFree || offer.price === 0) ? (
                          <span className="text-2xl font-black text-emerald-600 flex items-center gap-1">
                            مجاناً بالكامل 🎁
                          </span>
                        ) : (
                          <>
                            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{(offer.price).toLocaleString()}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                              {currencies.find(c => c.code === (offer.currency || defaultCurrency))?.symbol || (offer.currency || defaultCurrency)}
                            </span>
                          </>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium block mt-1">
                        {(offer.isUnlimitedDuration || offer.durationDays === 0) ? (
                          <span className="text-indigo-600 font-bold flex items-center gap-1">
                            <InfinityIcon className="w-3.5 h-3.5" /> صلاحية مفتوحة (بدون وقت محدد)
                          </span>
                        ) : (
                          `صالحة لمدة ${offer.durationDays} يوماً بالكامل`
                        )}
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Gift className="w-4 h-4 text-emerald-500" />
                        <span>الدولة: <strong className="text-slate-800 dark:text-white">{offer.country || "الكل"}</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Database className="w-4 h-4 text-emerald-500" />
                        <span>
                          كوتة الاستهلاك: {(offer.isUnlimitedQuota || offer.limitGB === 0) ? (
                            <span className="text-indigo-600 inline-flex items-center gap-0.5 font-bold">غير محدودة <InfinityIcon className="w-3 h-3" /></span>
                          ) : (
                            `${offer.limitGB} جيجابايت`
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        <span>
                          مدة صلاحية الباقة: {(offer.isUnlimitedDuration || offer.durationDays === 0) ? (
                            <span className="text-indigo-600 inline-flex items-center gap-0.5 font-bold">بدون وقت محدد <InfinityIcon className="w-3 h-3" /></span>
                          ) : (
                            `${offer.durationDays} يوم`
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-emerald-500" />
                        <span>
                          بدء التفعيل: {
                            offer.startTrigger === "first_login" ? "عند أول اتصال بالإنترنت (البرودباند) 🔌" :
                            offer.startTrigger === "custom_duration" ? `مسبق الصنع (قبل ${offer.startTriggerDaysOffset || 0} أيام) ⏳` :
                            "من لحظة التفعيل مباشرة (الآن) ⚡"
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span>عدد المشتركين الفعليين: <strong className="text-slate-800 dark:text-slate-100">{activeUsersInOffer}</strong></span>
                      </div>
                    </div>
                  </div>


                  {/* Card Footer Actions */}
                  {((!isDistributorSession || offer.distributorId === currentDistributorId) && canManageOffers) ? (
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <button
                      onClick={() => startEdit(offer)}
                      className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:text-slate-100 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" /> تعديل الأسعار
                    </button>

                    <button
                      onClick={() => {
                        if (activeUsersInOffer > 0) {
                          alert("لا يمكن حذف هذه الباقة لأن هناك عملاء متصلين عليها حالياً!");
                          return;
                        }
                        setConfirmModal({
                          isOpen: true,
                          title: "تأكيد حذف الباقة",
                          message: `هل أنت متأكد من حذف الباقة [${offer.name}]؟`,
                          description: "سيتم إزالة الباقة من قائمة الباقات المتاحة للمشتركين.",
                          confirmText: "حذف الباقة",
                          onConfirm: () => onDeleteOffer(offer?.id)
                        });
                      }}
                      className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                      title="حذف الباقة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  ) : (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50 text-xs font-bold text-slate-400">
                      <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> باقة عامة - للقراءة فقط</span>
                    </div>
                  )}

                </>
              )}
            </div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
              لا توجد باقات سرعة تطابق شروط البحث الفعالية
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              جرّب تغيير كلمات البحث أو اختيار موزع آخر أو إعادة ضبط الفلاتر لعرض كافة باقات وسرعات السيرفر.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-md shadow-emerald-200 dark:shadow-none"
            >
              <RotateCcw className="w-4 h-4" />
              إعادة ضبط جميع الفلاتر
            </button>
          )}
        </div>
      )}

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
