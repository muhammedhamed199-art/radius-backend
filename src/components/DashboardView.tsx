/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  ShieldAlert,
  Wifi,
  Clock,
  Coins,
  CheckCircle,
  UserX,
  CreditCard,
  TrendingUp,
  Activity,
  Database,
  Search,
  ArrowLeft,
  Server,
  GripVertical,
  RotateCcw,
  Move,
  Check
} from "lucide-react";
import { Customer, CustomerStatus, ConnectionType, HotspotCard, NetworkDevice, NasServer } from "../types";
import { safeStorage } from "../utils/storage";

interface DashboardViewProps {
  customers: Customer[];
  devices: NetworkDevice[];
  cards: HotspotCard[];
  distributors: any[];
  servers?: NasServer[];
  isDistributorSession?: boolean;
  currentDistributorName?: string;
  currentDistributorObj?: any;
  tickets?: any[];
  onNavigate: (index: number, filters?: Record<string, any>) => void;
  onSearchSelectCustomer: (customer: Customer) => void;
}

const DEFAULT_WIDGET_IDS = [
  "premium",
  "subscribers",
  "distributors",
  "managers",
  "connected",
  "expired",
  "debtors",
  "active",
  "suspended",
  "hotspot_cards",
  "consumption",
  "hotspot_consumption",
  "distribution"
];

export default function DashboardView({
  customers,
  devices,
  cards,
  distributors,
  servers = [],
  isDistributorSession = false,
  currentDistributorName = "",
  currentDistributorObj,
  tickets = [],
  onNavigate,
  onSearchSelectCustomer
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try {
      const saved = safeStorage.getItem("radius_dashboard_widget_order");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === DEFAULT_WIDGET_IDS.length) {
          // Verify all default keys exist
          const hasAllKeys = DEFAULT_WIDGET_IDS.every(id => parsed.includes(id));
          if (hasAllKeys) return parsed;
        }
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_WIDGET_IDS;
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Save order changes
  const saveWidgetOrder = (newOrder: string[]) => {
    setWidgetOrder(newOrder);
    safeStorage.setItem("radius_dashboard_widget_order", JSON.stringify(newOrder));
  };

  const handleResetOrder = () => {
    saveWidgetOrder(DEFAULT_WIDGET_IDS);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newOrder = [...widgetOrder];
    const [movedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(dropIndex, 0, movedItem);

    saveWidgetOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveWidget = (currentIndex: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= widgetOrder.length) return;

    const newOrder = [...widgetOrder];
    const temp = newOrder[currentIndex];
    newOrder[currentIndex] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    saveWidgetOrder(newOrder);
  };

  // Calculate statistics
  const totalSubscribers = customers.length;
  const activeCount = customers.filter(c => c.status === CustomerStatus.ACTIVE).length;
  const expiredCount = customers.filter(c => c.status === CustomerStatus.EXPIRED).length;
  const suspendedCount = customers.filter(c => c.status === CustomerStatus.SUSPENDED).length;
  
  const distributorsCount = (isDistributorSession && currentDistributorObj)
    ? distributors.filter(d => d.parentDistributorId === currentDistributorObj.id).length
    : distributors.filter(d => d.role === "موزع").length;
  const managersCount = distributors.filter(d => d.role === "مدير").length;
  
  const connectedCount = customers.filter(c => c.concurrentLogins > 0).length;
  const debtorsCount = customers.filter(c => (c.debt && c.debt > 0)).length;
  const premiumCount = customers.filter(c => c.category === "ذهبي" || c.category === "فضي").length;
  
  const hotspotCardsCount = cards.length;
  const unusedHotspotCount = cards.filter(c => c.status === "غير مستخدم").length;
  
  // Consumption sums
  const totalConsumption = customers.reduce((sum, c) => sum + c.consumptionGB, 0).toFixed(1);
  const hotspotConsumption = cards.reduce((sum, c) => sum + c.consumptionGB, 0).toFixed(1);

  // Global search filtering across customers, devices, and cards
  const searchResults = {
    customers: searchQuery ? customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (c.phone && c.phone.includes(searchQuery))
    ) : [],
    devices: searchQuery ? devices.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      d.ipAddress.includes(searchQuery) || 
      d.type.toLowerCase().includes(searchQuery.toLowerCase())
    ) : [],
    cards: searchQuery ? cards.filter(c => 
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) : []
  };

  const hasSearchResults = searchQuery && (
    searchResults.customers.length > 0 || 
    searchResults.devices.length > 0 || 
    searchResults.cards.length > 0
  );

  // Widget definitions mapping
  const widgetsMap: Record<string, {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconBg: string;
    hoverBorder: string;
    linkText: string;
    linkTextColor: string;
    badgeBg: string;
    navPage: number;
    navFilters?: Record<string, any>;
  }> = {
    subscribers: {
      title: "إجمالي العملاء المشتركين",
      value: totalSubscribers,
      icon: <Users className="w-6 h-6" />,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
      hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
      linkText: "عرض المشتركين",
      linkTextColor: "text-indigo-500",
      badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
      navPage: 5,
      navFilters: { statusFilter: "all", onlineFilter: "all", debtFilter: "all", expiryFilter: "all" }
    },
    distributors: {
      title: isDistributorSession ? "الموزعون الفرعيون" : "الموزعون النشطون",
      value: distributorsCount,
      icon: <UserCheck className="w-6 h-6" />,
      iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
      hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
      linkText: isDistributorSession ? "عرض الموزعين الفرعيين" : "عرض الموزعين",
      linkTextColor: "text-emerald-500",
      badgeBg: "bg-emerald-50 dark:bg-emerald-950/50",
      navPage: isDistributorSession ? 17 : 9
    },
    managers: {
      title: "المديرون والمسؤولون",
      value: managersCount,
      icon: <ShieldAlert className="w-6 h-6" />,
      iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
      hoverBorder: "hover:border-purple-300 dark:hover:border-purple-700",
      linkText: "عرض الصلاحيات",
      linkTextColor: "text-purple-500",
      badgeBg: "bg-purple-50 dark:bg-purple-950/50",
      navPage: 9
    },
    currencies: {
      title: "أداة تحويل العملات",
      value: "الأسعار اللحظية",
      icon: <Coins className="w-6 h-6" />,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
      linkText: "الذهاب للمحول",
      linkTextColor: "text-amber-500",
      badgeBg: "bg-amber-50 dark:bg-amber-950/50",
      navPage: 12
    },
    connected: {
      title: "المتصلون بالشبكة حالياً",
      value: connectedCount,
      icon: <Wifi className="w-6 h-6" />,
      iconBg: "bg-white text-sky-600 dark:bg-sky-950 dark:text-sky-400",
      hoverBorder: "hover:border-sky-300 dark:hover:border-sky-700",
      linkText: "المستخدمون النشطون",
      linkTextColor: "text-sky-500",
      badgeBg: "bg-white dark:bg-sky-950/50",
      navPage: 5,
      navFilters: { onlineFilter: "online", statusFilter: "all", debtFilter: "all", expiryFilter: "all" }
    },
    expired: {
      title: "المنتهية اشتراكاتهم",
      value: expiredCount,
      icon: <Clock className="w-6 h-6" />,
      iconBg: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
      hoverBorder: "hover:border-red-300 dark:hover:border-red-700",
      linkText: "إرسال إشعار تذكير",
      linkTextColor: "text-red-500",
      badgeBg: "bg-red-50 dark:bg-red-950/50",
      navPage: 5,
      navFilters: { statusFilter: CustomerStatus.EXPIRED, expiryFilter: "expired", onlineFilter: "all", debtFilter: "all" }
    },
    debtors: {
      title: "المدينون (المطالبون بمال)",
      value: debtorsCount,
      icon: <Coins className="w-6 h-6" />,
      iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
      hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
      linkText: "كشف المديونيات",
      linkTextColor: "text-amber-500",
      badgeBg: "bg-amber-50 dark:bg-amber-950/50",
      navPage: 5,
      navFilters: { debtFilter: "debtors", statusFilter: "all", onlineFilter: "all", expiryFilter: "all" }
    },
    active: {
      title: "العملاء المتاحون للخدمة",
      value: activeCount,
      icon: <CheckCircle className="w-6 h-6" />,
      iconBg: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
      hoverBorder: "hover:border-green-300 dark:hover:border-green-700",
      linkText: "المشتركون النشطون",
      linkTextColor: "text-green-500",
      badgeBg: "bg-green-50 dark:bg-green-950/50",
      navPage: 5,
      navFilters: { statusFilter: CustomerStatus.ACTIVE, onlineFilter: "all", debtFilter: "all", expiryFilter: "all" }
    },
    suspended: {
      title: "الذين تم إيقافهم مؤقتاً",
      value: suspendedCount,
      icon: <UserX className="w-6 h-6" />,
      iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
      hoverBorder: "hover:border-slate-300 dark:hover:border-slate-700",
      linkText: "الموقوفون مؤقتاً",
      linkTextColor: "text-slate-500",
      badgeBg: "bg-slate-100 dark:bg-slate-800/50",
      navPage: 5,
      navFilters: { statusFilter: CustomerStatus.SUSPENDED, onlineFilter: "all", debtFilter: "all", expiryFilter: "all" }
    },
    hotspot_cards: {
      title: "كروت الهوت سبوت الإجمالية",
      value: (
        <span>
          {hotspotCardsCount} <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({unusedHotspotCount} متاح)</span>
        </span>
      ),
      icon: <CreditCard className="w-6 h-6" />,
      iconBg: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
      hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
      linkText: "إنشاء وإدارة الكروت",
      linkTextColor: "text-indigo-500",
      badgeBg: "bg-indigo-50 dark:bg-indigo-950/50",
      navPage: 8,
      navFilters: { statusFilter: "all" }
    },
    consumption: {
      title: "استهلاك العملاء الإجمالي",
      value: (
        <span>
          {totalConsumption} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">جيجابايت</span>
        </span>
      ),
      icon: <Activity className="w-6 h-6" />,
      iconBg: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400",
      hoverBorder: "hover:border-orange-300 dark:hover:border-orange-700",
      linkText: "كشف الاستهلاك والسرعات",
      linkTextColor: "text-orange-500",
      badgeBg: "bg-orange-50 dark:bg-orange-950/50",
      navPage: 3
    },
    hotspot_consumption: {
      title: "استهلاك كروت الهوت سبوت",
      value: (
        <span>
          {hotspotConsumption} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">جيجابايت</span>
        </span>
      ),
      icon: <Database className="w-6 h-6" />,
      iconBg: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400",
      hoverBorder: "hover:border-pink-300 dark:hover:border-pink-700",
      linkText: "معدل استهلاك الهوت سبوت",
      linkTextColor: "text-pink-500",
      badgeBg: "bg-pink-50 dark:bg-pink-950/50",
      navPage: 8,
      navFilters: { statusFilter: "used" }
    },
    distribution: {
      title: "توزيع المشتركين على الباقات",
      value: "مفصل بالباقة",
      icon: <TrendingUp className="w-6 h-6" />,
      iconBg: "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400",
      hoverBorder: "hover:border-violet-300 dark:hover:border-violet-700",
      linkText: "إحصائيات التوزيع بيانياً",
      linkTextColor: "text-violet-500",
      badgeBg: "bg-violet-50 dark:bg-violet-950/50",
      navPage: 3
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full filter blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-600 rounded-full filter blur-2xl opacity-10 -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">مرحباً بك في لوحة تحكم ريديوس المتكاملة 👋</h1>
            <p className="text-slate-300 mt-2 text-sm md:text-base max-w-xl">
              النظام الشامل لإدارة وتدقيق شبكات الميكروتيك، الموزعين، المشتركين، أجهزة اليوبيكيتي، وعمليات الفحص والتحكم الفوري.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button 
              onClick={() => onNavigate(1)} 
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/30 flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              أداة فحص العميل
            </button>
            <button 
              onClick={() => onNavigate(5)} 
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              إدارة المشتركين
            </button>
          </div>
        </div>
      </div>

      {/* Global Filter Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 relative">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث سريع في النظام (ابحث عن اسم المشترك، كلمة السر، الآي بي، أو الماك أدرس لجهاز يوبيكيتي)..."
            className="w-full pl-4 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm transition-all font-bold"
          />
          <Search className="w-5 h-5 text-slate-400 absolute right-4 top-3.5" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute left-4 top-3 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 dark:bg-slate-700/60 dark:bg-slate-700 px-2 py-1 rounded"
            >
              مسح
            </button>
          )}
        </div>

        {/* Live Search Results Drops */}
        {searchQuery && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 max-h-96 overflow-y-auto p-4 space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-xs border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <span>نتائج البحث الفوري لـ &quot;{searchQuery}&quot;</span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full text-[10px]">
                {searchResults.customers.length + searchResults.devices.length + searchResults.cards.length} نتيجة
              </span>
            </h3>

            {!hasSearchResults && (
              <p className="text-center py-6 text-sm text-slate-400">لا توجد نتائج مطابقة لبحثك، يرجى المحاولة بكلمات أخرى.</p>
            )}

            {searchResults.customers.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> المشتركون
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.customers.map(c => (
                    <div 
                      key={c?.id} 
                      onClick={() => onSearchSelectCustomer(c)}
                      className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{c.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{c.username} | {c.ipAddress}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          c.status === CustomerStatus.ACTIVE ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                          c.status === CustomerStatus.EXPIRED ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}>{c.status}</span>
                        <ArrowLeft className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.devices.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Server className="w-3.5 h-3.5" /> أجهزة الشبكة (يوبيكيتي)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.devices.map(d => (
                    <div 
                      key={d?.id} 
                      onClick={() => onNavigate(2)}
                      className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{d.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{d.type} | IP: {d.ipAddress}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          d.status === "متصل" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                        }`}>{d.status}</span>
                        <ArrowLeft className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searchResults.cards.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" /> كروت الهوت سبوت
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {searchResults.cards.map(c => (
                    <div 
                      key={c?.id} 
                      onClick={() => onNavigate(8)}
                      className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-800 dark:text-slate-100 font-mono">{c.code}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-sans">السعر: {c.price.toLocaleString()} د.ل</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          c.status === "غير مستخدم" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                        }`}>{c.status}</span>
                        <ArrowLeft className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAG & DROP CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Move className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              ترتيب مربعات الإحصائيات (Drag & Drop Widgets)
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-mono">
                12 مربع إحصائي
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
              اسحب المربع وأسقطه في المكان المناسب لتخصيص الواجهة حسب رغبتك الشخصية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 border ${
              isReorderMode
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse"
                : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            {isReorderMode ? (
              <>
                <Check className="w-4 h-4" />
                حفظ الترتيب الحالي
              </>
            ) : (
              <>
                <GripVertical className="w-4 h-4 text-indigo-500" />
                تفعيل وضع إعادة الترتيب
              </>
            )}
          </button>

          <button
            onClick={handleResetOrder}
            title="إعادة الترتيب الافتراضي"
            className="px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">الترتيب الافتراضي</span>
          </button>
        </div>
      </div>

      {/* Grid containing the 12 metrics with Drag & Drop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {widgetOrder.map((widgetId, index) => {
          // Hide managers widget for distributors
          if (widgetId === 'managers' && isDistributorSession) return null;
          
          const widget = widgetsMap[widgetId];
          if (!widget) return null;

          const isDragging = draggedIndex === index;
          const isDragOver = dragOverIndex === index;

          return (
            <div
              key={widgetId}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden select-none ${
                isDragging ? "opacity-30 scale-95 border-dashed border-indigo-500" : ""
              } ${
                isDragOver ? "ring-2 ring-indigo-500 border-indigo-500 scale-[1.02] shadow-xl" : "border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
              } ${widget.hoverBorder} ${
                isReorderMode ? "cursor-grab active:cursor-grabbing border-indigo-200 dark:border-indigo-800" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!isReorderMode && widget.navPage !== undefined) {
                  onNavigate(widget.navPage, widget.navFilters);
                }
              }}
            >
              {/* Corner decorative badge */}
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110 ${widget.badgeBg}`}></div>

              {/* Drag Handle Overlay */}
              <div className="flex items-center justify-between relative z-10 mb-3">
                <div className={`p-3 rounded-xl w-fit ${widget.iconBg}`}>
                  {widget.icon}
                </div>

                {/* Drag Handle & Touch Shift Controls */}
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono font-black text-slate-400 px-1">
                    #{index + 1}
                  </span>

                  {isReorderMode && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveWidget(index, "prev");
                        }}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-30"
                        title="تحريك للأعلى / لليوم"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveWidget(index, "next");
                        }}
                        disabled={index === widgetOrder.length - 1}
                        className="p-1 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 disabled:opacity-30"
                        title="تحريك للأسفل / لليسار"
                      >
                        →
                      </button>
                    </div>
                  )}

                  <div className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                    <GripVertical className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Widget Content */}
              <div className="relative z-10">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs">{widget.title}</p>
                <h3 className="text-xl md:text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-2">
                  {widget.value}
                </h3>
              </div>

              {/* Link Footer */}
              <div className="relative z-10 mt-4 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <span className={`${widget.linkTextColor} text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all`}>
                  {widget.linkText} <ArrowLeft className="w-3.5 h-3.5" />
                </span>

                {isReorderMode && (
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
                    اسحب للنقل
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of secondary data lists for rapid view on dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection status and VPN info */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            حالة اتصال سيرفرات NAS VPN
          </h3>
          <div className="space-y-3">
            {servers && servers.length > 0 ? (
              servers.map(s => (
                <div key={s?.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border border-slate-200 dark:border-slate-700">
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.name}</p>
                    <p className="text-xs text-slate-400 font-mono">IP: {s.ipAddress} | VPN: {s.vpnIp || "10.10.10.x"}</p>
                  </div>
                  <span className={`px-2.5 py-1 font-bold text-xs rounded-full flex items-center gap-1 ${
                    s.vpnStatus === "متصل" ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${s.vpnStatus === "متصل" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span> {s.vpnStatus || "منفصل"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-3 text-center">لا توجد سيرفرات NAS مسجلة لحسابك حالياً.</p>
            )}
          </div>
          <button 
            onClick={() => onNavigate(6)} 
            className="w-full text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 mt-4 block"
          >
            إدارة سيرفرات ميكروتيك NAS
          </button>
        </div>

        {/* Quick Help & Ticket Desk */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            التنبيهات الفنية السريعة
          </h3>
          <div className="space-y-3">
            <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl text-red-800 dark:text-red-300">
              <Clock className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">اشتراكات منتهية تحتاج إلى مراجعة وسداد</p>
                <p className="text-[11px] text-red-700 dark:text-red-400 mt-0.5">يوجد حالياً {expiredCount} اشتراك منتهي بالكامل. يوصى بإرسال رسالة تذكير فورية بالواتساب.</p>
              </div>
            </div>
            <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">أجهزة يوبيكيتي خارج الخدمة (Disconnected)</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">سيكتور Omni_Sector_South غير قادر على الاتصال بسيرفر ميكروتيك. يرجى مراجعة صفحة أجهزة الشبكة.</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(2)} 
            className="w-full text-center text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 mt-4 block"
          >
            فحص أجهزة اليوبيكيتي والشبكة
          </button>
        </div>
      </div>
    </div>
  );
}
