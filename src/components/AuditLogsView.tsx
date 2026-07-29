/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  History, 
  Search, 
  Trash2, 
  User, 
  Clock, 
  Activity,
  Filter,
  Users,
  Server,
  CreditCard,
  ShieldCheck,
  Download,
  Wallet,
  CheckCircle2,
  XCircle,
  Table,
  ListFilter,
  Tag,
  BadgeCheck,
  FileText,
  RotateCcw,
  UserCheck,
  Calendar,
  X,
  SlidersHorizontal,
  ArrowUpDown
} from "lucide-react";
import { AuditLog, Distributor } from "../types";

interface AuditLogsViewProps {
  logs: AuditLog[];
  distributors?: Distributor[];
  onClearLogs: () => void;
  isDistributorSession?: boolean;
}

export default function AuditLogsView({ 
  logs, 
  distributors = [], 
  onClearLogs, 
  isDistributorSession = false 
}: AuditLogsViewProps) {
  const [activeTab, setActiveTab] = useState<"distributors" | "dedicated_table" | "all" | "admin">("distributors");
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>("all");
  const [distributorFilter, setDistributorFilter] = useState<string>("all");
  const [actionCategoryFilter, setActionCategoryFilter] = useState<string>("all");
  const [operationTypeFilter, setOperationTypeFilter] = useState<string>("all");
  const [datePreset, setDatePreset] = useState<"all" | "today" | "7days" | "30days" | "custom">("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [distributorSearchQuery, setDistributorSearchQuery] = useState("");
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

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

  // Helper to check if a log belongs to a specific distributor or any distributor
  const isDistributorLog = (log: AuditLog, dist?: Distributor) => {
    if (dist) {
      return (
        (log.distributorId && log.distributorId === dist?.id) ||
        log.user.toLowerCase() === dist.username.toLowerCase() ||
        log.user.toLowerCase() === dist.name.toLowerCase() ||
        log.user.toLowerCase().includes(dist.name.toLowerCase()) ||
        log.user.toLowerCase().includes(dist.username.toLowerCase()) ||
        log.user.toLowerCase().includes(dist?.id.toLowerCase())
      );
    }
    return (
      !!log.distributorId ||
      distributors.some(d => 
        (log.distributorId && log.distributorId === d?.id) ||
        log.user.toLowerCase().includes(d.name.toLowerCase()) ||
        log.user.toLowerCase().includes(d.username.toLowerCase()) ||
        log.user.toLowerCase().includes(d?.id.toLowerCase())
      )
    );
  };

  // Helper to categorize log action type
  const getActionCategory = (action: string) => {
    if (action.includes("سيرفر") || action.includes("NAS") || action.includes("ميكروتيك")) {
      return { id: "nas", label: "سيرفرات NAS", icon: Server, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200" };
    }
    if (action.includes("كرت") || action.includes("كروت") || action.includes("هوتسبوت")) {
      return { id: "cards", label: "كروت هوتسبوت", icon: CreditCard, color: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200" };
    }
    if (action.includes("ديون") || action.includes("ذمم") || action.includes("رصيد") || action.includes("سداد") || action.includes("استلام") || action.includes("شحن") || action.includes("مبلغ") || action.includes("مالي")) {
      return { id: "financial", label: "معاملات مالية", icon: Wallet, color: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200" };
    }
    if (action.includes("مشترك") || action.includes("عميل") || action.includes("باقة") || action.includes("تجديد") || action.includes("تسجيل")) {
      return { id: "subscribers", label: "إدارة المشتركين", icon: Users, color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200" };
    }
    return { id: "settings", label: "إعدادات عامة", icon: Activity, color: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700" };
  };

  // Helper counters for filtering options
  const countForCategory = (catId: string) => {
    return logs.filter(l => {
      if (catId === "all") return true;
      if (catId === "deletion") return l.action.includes("حذف") || l.action.includes("إيقاف") || l.action.includes("تفريغ") || l.action.includes("مسح");
      return getActionCategory(l.action)?.id === catId;
    }).length;
  };

  const countForDistributor = (distId: string) => {
    return logs.filter(l => {
      if (distId === "all") return true;
      if (distId === "admin_only") return !isDistributorLog(l);
      const dist = distributors.find(d => d?.id === distId);
      return dist ? isDistributorLog(l, dist) : false;
    }).length;
  };

  // Helper to match operation nature
  const isLogMatchingOperationType = (action: string) => {
    if (operationTypeFilter === "all") return true;
    if (operationTypeFilter === "add") {
      return action.includes("إضافة") || action.includes("إنشاء") || action.includes("توليد") || action.includes("تسجيل");
    }
    if (operationTypeFilter === "renew") {
      return action.includes("تجديد") || action.includes("شحن") || action.includes("تسديد") || action.includes("رصيد") || action.includes("تحويل");
    }
    if (operationTypeFilter === "update") {
      return action.includes("تعديل") || action.includes("تحديث") || action.includes("ربط") || action.includes("تغيير") || action.includes("تعيين");
    }
    if (operationTypeFilter === "delete") {
      return action.includes("حذف") || action.includes("إيقاف") || action.includes("تفريغ") || action.includes("مسح") || action.includes("فصل");
    }
    return true;
  };

  // Helper for date filtering
  const isLogInDateRange = (logDate: string) => {
    if (datePreset === "all") return true;

    const todayStr = new Date().toISOString().split("T")[0];
    if (datePreset === "today") {
      return logDate === todayStr;
    }

    if (datePreset === "7days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const sevenDaysAgoStr = d.toISOString().split("T")[0];
      return logDate >= sevenDaysAgoStr && logDate <= todayStr;
    }

    if (datePreset === "30days") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const thirtyDaysAgoStr = d.toISOString().split("T")[0];
      return logDate >= thirtyDaysAgoStr && logDate <= todayStr;
    }

    if (datePreset === "custom") {
      if (startDateFilter && logDate < startDateFilter) return false;
      if (endDateFilter && logDate > endDateFilter) return false;
      return true;
    }

    return true;
  };

  // Filter distributors by name, ID, username, or phone
  const filteredDistributorsList = distributors.filter(dist => {
    if (!distributorSearchQuery.trim()) return true;
    const q = distributorSearchQuery.toLowerCase().trim();
    return (
      dist.name.toLowerCase().includes(q) ||
      dist?.id.toLowerCase().includes(q) ||
      dist.username.toLowerCase().includes(q) ||
      dist.phone.toLowerCase().includes(q)
    );
  });

  // Filter logs based on activeTab, distributor, action category, operation type, date range, and text search
  const filteredLogs = logs.filter(log => {
    // 1. Tab filter
    if (activeTab === "distributors" || activeTab === "dedicated_table") {
      if (!isDistributorLog(log)) return false;
      if (selectedDistributorId !== "all" && distributorFilter === "all") {
        const selectedDist = distributors.find(d => d?.id === selectedDistributorId);
        if (selectedDist && !isDistributorLog(log, selectedDist)) return false;
      }
    } else if (activeTab === "admin") {
      if (isDistributorLog(log)) return false;
    }

    // 2. Distributor dropdown filter
    if (distributorFilter !== "all") {
      if (distributorFilter === "admin_only") {
        if (isDistributorLog(log)) return false;
      } else {
        const dist = distributors.find(d => d?.id === distributorFilter);
        if (dist && !isDistributorLog(log, dist)) return false;
        if (!dist && log.distributorId !== distributorFilter) return false;
      }
    }

    // 3. Action category filter
    if (actionCategoryFilter !== "all") {
      if (actionCategoryFilter === "deletion") {
        const isDelete = log.action.includes("حذف") || log.action.includes("إيقاف") || log.action.includes("تفريغ") || log.action.includes("مسح");
        if (!isDelete) return false;
      } else {
        const category = getActionCategory(log.action);
        if (category?.id !== actionCategoryFilter) return false;
      }
    }

    // 4. Operation Type filter
    if (!isLogMatchingOperationType(log.action)) return false;

    // 5. Date filter
    if (!isLogInDateRange(log.date)) return false;

    // 6. Search query filter
    if (!logSearchQuery.trim()) return true;
    const q = logSearchQuery.toLowerCase().trim();
    return (
      log.user.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.date.includes(q) ||
      log.time.includes(q) ||
      log?.id.toLowerCase().includes(q) ||
      (log.distributorId && log.distributorId.toLowerCase().includes(q))
    );
  });

  // Sorted Filtered Logs
  const sortedFilteredLogs = [...filteredLogs].sort((a, b) => {
    const dateTimeA = `${a.date} ${a.time}`;
    const dateTimeB = `${b.date} ${b.time}`;
    return sortOrder === "newest"
      ? dateTimeB.localeCompare(dateTimeA)
      : dateTimeA.localeCompare(dateTimeB);
  });

  const resetAllFilters = () => {
    setDistributorFilter("all");
    setActionCategoryFilter("all");
    setOperationTypeFilter("all");
    setDatePreset("all");
    setStartDateFilter("");
    setEndDateFilter("");
    setLogSearchQuery("");
    setSelectedDistributorId("all");
    setDistributorSearchQuery("");
    setSortOrder("newest");
  };

  const hasActiveFilters = 
    distributorFilter !== "all" ||
    actionCategoryFilter !== "all" ||
    operationTypeFilter !== "all" ||
    datePreset !== "all" ||
    startDateFilter !== "" ||
    endDateFilter !== "" ||
    logSearchQuery.trim() !== "" ||
    selectedDistributorId !== "all";

  // Selected Distributor Object
  const selectedDistributor = distributors.find(d => d?.id === selectedDistributorId);

  // Logs for the current distributor filter selection
  const currentDistributorLogs = logs.filter(l => 
    selectedDistributorId === "all"
      ? isDistributorLog(l)
      : selectedDistributor ? isDistributorLog(l, selectedDistributor) : false
  );

  const subscriberActionsCount = currentDistributorLogs.filter(l => l.action.includes("مشترك") || l.action.includes("تجديد") || l.action.includes("تسجيل")).length;
  const financialActionsCount = currentDistributorLogs.filter(l => l.action.includes("رصيد") || l.action.includes("ديون") || l.action.includes("مبلغ")).length;
  const cardActionsCount = currentDistributorLogs.filter(l => l.action.includes("كرت") || l.action.includes("كروت")).length;
  const nasActionsCount = currentDistributorLogs.filter(l => l.action.includes("سيرفر") || l.action.includes("NAS")).length;

  // Export CSV function
  const exportLogCSV = () => {
    const headers = ["المعرف", "التاريخ", "الوقت", "اسم الموزع/المستخدم", "رقم الموزع ID", "المستهدف", "تفاصيل الإجراء"];
    const rows = sortedFilteredLogs.map(l => [
      l?.id, 
      l.date, 
      l.time, 
      l.user, 
      l.distributorId || "-", 
      l.target, 
      l.action
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Audit_Logs_${selectedDistributor ? selectedDistributor.name : "All"}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            سجل العمليات وتدقيق الموزعين (Distributor Audit Trail)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1 font-bold">
            تتبع كامل لكافة تصرفات الموزعين أثناء تصفحهم للوحة، مع إمكانية التصفية بالاسم أو رقم التعريف (ID).
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportLogCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            تصدير السجل (CSV)
          </button>

          {!isDistributorSession && (
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: "تفرغ ومسح سجل العمليات",
                  message: "هل أنت متأكد من تفريغ سجل العمليات بالكامل؟",
                  description: "تحذير: لا يمكن التراجع عن مسح السجل أو استعادته بعد ذلك.",
                  confirmText: "تفريغ السجل بالكامل",
                  onConfirm: () => onClearLogs()
                });
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-indigo-100 border border-rose-200 text-indigo-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              تفريغ السجل
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("distributors")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "distributors"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            تصفية الموزعين ({distributors.length})
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white dark:bg-slate-900/20 text-slate-900 font-mono">
              {logs.filter(l => isDistributorLog(l)).length} عملية
            </span>
          </button>

          <button
            onClick={() => setActiveTab("dedicated_table")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "dedicated_table"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <Table className="w-4 h-4 text-emerald-400" />
            جدول سجلات الموزع الخاص
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" />
            كافة عمليات النظام ({logs.length})
          </button>

          {!isDistributorSession && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-600 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              عمليات الإدارة العليا ({logs.filter(l => !isDistributorLog(l)).length})
            </button>
          )}
        </div>
      </div>

      {/* ADVANCED AUDIT LOG FILTERS TOOLBAR */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Primary Dropdowns & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Distributor Filter Dropdown */}
          {!isDistributorSession && (
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                الموزع / الفاعل:
              </label>
              <select
                value={distributorFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setDistributorFilter(val);
                  if (val !== "admin_only") {
                    setSelectedDistributorId(val);
                  }
                }}
                className="w-full p-2 bg-indigo-50/70 dark:bg-slate-800 border border-indigo-200/80 dark:border-slate-700 text-indigo-950 dark:text-indigo-200 font-extrabold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">👥 جميع الموزعين والمدراء ({logs.length})</option>
                <option value="admin_only">👑 الإدارة الرئيسية والمدير العام ({countForDistributor("admin_only")})</option>
                {distributors.map((dist) => (
                  <option key={dist?.id} value={dist?.id}>
                    👤 الموزع: {dist.name} ({countForDistributor(dist?.id)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 2. Action Category Filter Dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              تصنيف القسم:
            </label>
            <select
              value={actionCategoryFilter}
              onChange={(e) => setActionCategoryFilter(e.target.value)}
              className="w-full p-2 bg-emerald-50/70 dark:bg-slate-800 border border-emerald-200/80 dark:border-slate-700 text-emerald-950 dark:text-emerald-200 font-extrabold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">📋 كافة الأقسام والتصنيفات ({logs.length})</option>
              <option value="subscribers">👥 إدارة المشتركين والتجديدات ({countForCategory("subscribers")})</option>
              <option value="financial">💰 معاملات مالية وشحن رصيد/ديون ({countForCategory("financial")})</option>
              <option value="cards">🎟️ كروت هوتسبوت وتوليد ({countForCategory("cards")})</option>
              <option value="nas">🖥️ سيرفرات NAS وميكروتيك ({countForCategory("nas")})</option>
              <option value="deletion">🗑️ عمليات الحذف والإيقاف ({countForCategory("deletion")})</option>
              <option value="settings">⚙️ إعدادات عامة ونظام ({countForCategory("settings")})</option>
            </select>
          </div>

          {/* 3. Operation Nature Filter */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              طبيعة الإجراء:
            </label>
            <select
              value={operationTypeFilter}
              onChange={(e) => setOperationTypeFilter(e.target.value)}
              className="w-full p-2 bg-blue-50/70 dark:bg-slate-800 border border-blue-200/80 dark:border-slate-700 text-blue-950 dark:text-blue-200 font-extrabold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">⚡ جميع الأنماط والإجراءات</option>
              <option value="add">➕ إضافة / إنشاء جديد</option>
              <option value="renew">🔄 تجديد / شحن / سداد</option>
              <option value="update">✏️ تعديل / تحديث بيانات</option>
              <option value="delete">🗑️ حذف / إيقاف / مسح</option>
            </select>
          </div>

          {/* 4. Date Filter Dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold text-slate-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              الفترة الزمنية:
            </label>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as any)}
              className="w-full p-2 bg-purple-50/70 dark:bg-slate-800 border border-purple-200/80 dark:border-slate-700 text-purple-950 dark:text-purple-200 font-extrabold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">📅 كافة التواريخ والأرشيف</option>
              <option value="today">☀️ عمليات اليوم فقط</option>
              <option value="7days">📆 أخر 7 أيام</option>
              <option value="30days">🗓️ أخر 30 يوم</option>
              <option value="custom">🔍 تحديد تاريخ مخصص...</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Controls (If selected) */}
        {datePreset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/60 rounded-xl text-xs font-bold">
            <span className="text-purple-900 dark:text-purple-300 font-extrabold flex items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-600" /> Nنطاق التاريخ المخصص:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">من:</span>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[10px]">إلى:</span>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="p-1.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
            {(startDateFilter || endDateFilter) && (
              <button
                onClick={() => { setStartDateFilter(""); setEndDateFilter(""); }}
                className="px-2 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md text-[10px] font-bold"
              >
                مسح التواريخ
              </button>
            )}
          </div>
        )}

        {/* Row 2: Search Input, Sorting, and Counter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          {/* Live Search Input with Clear Button */}
          <div className="relative flex-1 max-w-md">
            <label className="block text-[10px] font-extrabold text-slate-400 mb-0.5">البحث المباشر في سجلات العمليات:</label>
            <div className="relative">
              <input
                type="text"
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                placeholder="ابحث باسم الموزع، المستخدم، المستهدف، أو نص العملية..."
                className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 dark:text-slate-100 font-bold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5" />
              {logSearchQuery && (
                <button
                  onClick={() => setLogSearchQuery("")}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="مسح نص البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Sort Order & Results Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
              title="تغيير ترتيب العرض"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span>{sortOrder === "newest" ? "الأحدث أولاً" : "الأقدم أولاً"}</span>
            </button>

            {/* Matching Counter Badge */}
            <div className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 rounded-xl text-xs font-mono font-bold">
              النتائج: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{sortedFilteredLogs.length}</strong> / {logs.length}
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="px-3 py-2 bg-rose-50 hover:bg-indigo-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-indigo-700 dark:text-indigo-300 border border-rose-200/80 dark:border-rose-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
                title="إعادة ضبط كافة خيارات الفلترة والبحث"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">إعادة ضبط</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Active Filters Summary Pills (When filters are active) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold">
            <span className="text-slate-400 text-[10px] font-extrabold ml-1">الفلاتر النشطة حالياً:</span>

            {logSearchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 text-[10px]">
                بحث: "{logSearchQuery}"
                <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setLogSearchQuery("")} />
              </span>
            )}

            {distributorFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 text-[10px]">
                الموزع: {distributorFilter === "admin_only" ? "الإدارة العامة" : (distributors.find(d => d?.id === distributorFilter)?.name || distributorFilter)}
                <X className="w-3 h-3 cursor-pointer hover:text-indigo-950" onClick={() => setDistributorFilter("all")} />
              </span>
            )}

            {actionCategoryFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 text-[10px]">
                القسم: {actionCategoryFilter}
                <X className="w-3 h-3 cursor-pointer hover:text-emerald-950" onClick={() => setActionCategoryFilter("all")} />
              </span>
            )}

            {operationTypeFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 text-[10px]">
                الإجراء: {
                  operationTypeFilter === "add" ? "إضافة" :
                  operationTypeFilter === "renew" ? "تجديد/شحن" :
                  operationTypeFilter === "update" ? "تعديل" : "حذف/إيقاف"
                }
                <X className="w-3 h-3 cursor-pointer hover:text-blue-950" onClick={() => setOperationTypeFilter("all")} />
              </span>
            )}

            {datePreset !== "all" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 text-[10px]">
                الفترة: {
                  datePreset === "today" ? "اليوم" :
                  datePreset === "7days" ? "أخر 7 أيام" :
                  datePreset === "30days" ? "أخر 30 يوم" : "نطاق مخصص"
                }
                <X className="w-3 h-3 cursor-pointer hover:text-purple-950" onClick={() => setDatePreset("all")} />
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-[10px] text-indigo-600 hover:underline font-extrabold mr-2"
            >
              مسح الكل
            </button>
          </div>
        )}

        {/* Quick Action Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold">
          <span className="text-slate-400 text-[10px] font-extrabold ml-1">اختصار سريع للتصنيف:</span>
          
          <button
            onClick={() => setActionCategoryFilter("all")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "all"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
            }`}
          >
            الكل ({logs.length})
          </button>

          <button
            onClick={() => setActionCategoryFilter("subscribers")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "subscribers"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-indigo-50/60 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-slate-700 hover:bg-indigo-100"
            }`}
          >
            👥 المشتركين ({countForCategory("subscribers")})
          </button>

          <button
            onClick={() => setActionCategoryFilter("financial")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "financial"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-blue-50/60 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-slate-700 hover:bg-blue-100"
            }`}
          >
            💰 المالي والرصيد ({countForCategory("financial")})
          </button>

          <button
            onClick={() => setActionCategoryFilter("cards")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "cards"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-amber-50/60 dark:bg-slate-800 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-slate-700 hover:bg-amber-100"
            }`}
          >
            🎟️ كروت هوتسبوت ({countForCategory("cards")})
          </button>

          <button
            onClick={() => setActionCategoryFilter("nas")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "nas"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-emerald-50/60 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border-emerald-200/80 dark:border-slate-700 hover:bg-emerald-100"
            }`}
          >
            🖥️ سيرفرات NAS ({countForCategory("nas")})
          </button>

          <button
            onClick={() => setActionCategoryFilter("deletion")}
            className={`px-2.5 py-1 rounded-lg border transition-all ${
              actionCategoryFilter === "deletion"
                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                : "bg-rose-50/60 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-rose-200/80 dark:border-slate-700 hover:bg-indigo-100"
            }`}
          >
            🗑️ الحذف والإيقاف ({countForCategory("deletion")})
          </button>
        </div>
      </div>

      {/* DISTRIBUTOR SEARCH & SELECTOR SECTION */}
      {(activeTab === "distributors" || activeTab === "dedicated_table") && (
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-500" />
                تصفية وتحديد الموزع المُراد عرض سجل عملياته:
              </h3>
              <p className="text-xs text-slate-400 font-bold mt-0.5">
                يمكنك التصفية بكتابة اسم الموزع، رقم التعريف (ID)، اسم المستخدم (@username)، أو رقم الهاتف
              </p>
            </div>

            {/* Live Search Input for Distributors */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={distributorSearchQuery}
                onChange={(e) => setDistributorSearchQuery(e.target.value)}
                placeholder="ابحث باسم الموزع أو رقم التعريف (ID)..."
                className="w-full pl-4 pr-10 py-2 bg-indigo-50/50 dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs text-slate-800 dark:text-slate-100 dark:text-slate-100 font-bold"
              />
              <Search className="w-4 h-4 text-indigo-500 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Distributor Pills Bar */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setSelectedDistributorId("all");
                setDistributorFilter("all");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${
                selectedDistributorId === "all" && distributorFilter === "all"
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <span>🌐 كافة الموزعين</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-mono">
                {logs.filter(l => isDistributorLog(l)).length}
              </span>
            </button>

            {filteredDistributorsList.length === 0 ? (
              <p className="text-xs text-slate-400 font-bold py-2">لا يوجد موزع يطابق نتائج البحث.</p>
            ) : (
              filteredDistributorsList.map(dist => {
                const distLogsCount = logs.filter(l => isDistributorLog(l, dist)).length;
                const isSelected = selectedDistributorId === dist?.id || distributorFilter === dist?.id;

                return (
                  <button
                    key={dist?.id}
                    onClick={() => {
                      setSelectedDistributorId(dist?.id);
                      setDistributorFilter(dist?.id);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:border-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 hover:bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <div className="text-right">
                      <span className="block">{dist.name}</span>
                      <span className="block text-[9px] opacity-80 font-mono">ID: {dist?.id}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isSelected ? "bg-white dark:bg-slate-900/20 text-slate-900" : "bg-slate-200 dark:bg-slate-700 dark:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300"
                    }`}>
                      {distLogsCount} عملية
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Distributor Overview Header */}
          {selectedDistributor && (
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 text-xl font-black">
                    {selectedDistributor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      {selectedDistributor.name}
                      <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full text-[10px] font-mono">
                        @{selectedDistributor.username}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-mono">
                        رقم التعريفي: {selectedDistributor?.id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-300 font-bold mt-1">
                      رقم الهاتف: {selectedDistributor.phone} | الرصيد المتاح: <span className="text-emerald-400 font-mono">{selectedDistributor.balance.toLocaleString()} د.ل</span>
                    </p>
                  </div>
                </div>

                {/* Quick Stats Counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="bg-white dark:bg-slate-900/10 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-slate-300">إجمالي العمليات</span>
                    <span className="text-base font-black text-slate-900 font-mono">{currentDistributorLogs.length}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/10 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-indigo-300">المشتركين والتجديد</span>
                    <span className="text-base font-black text-indigo-200 font-mono">{subscriberActionsCount}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/10 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-amber-300">كروت الهوتسبوت</span>
                    <span className="text-base font-black text-amber-200 font-mono">{cardActionsCount}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-900/10 p-2.5 rounded-xl border border-white/10">
                    <span className="block text-[10px] text-emerald-300">سيرفرات NAS</span>
                    <span className="text-base font-black text-emerald-200 font-mono">{nasActionsCount}</span>
                  </div>
                </div>
              </div>

              {/* Assigned Permissions Audit Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  صلاحيات الموزع المعينة في النظام (Custom Permissions Audit):
                </h4>
                <div className="flex flex-wrap gap-2 text-[11px] font-extrabold">
                  <span className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    selectedDistributor.permissions?.canManageNasServers
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 line-through opacity-60"
                  }`}>
                    {selectedDistributor.permissions?.canManageNasServers ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    سيرفرات ميكروتيك NAS
                  </span>

                  <span className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    selectedDistributor.permissions?.canManageSubscribers !== false
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 line-through opacity-60"
                  }`}>
                    {selectedDistributor.permissions?.canManageSubscribers !== false ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    إدارة المشتركين
                  </span>

                  <span className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    selectedDistributor.permissions?.canManageCards
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 line-through opacity-60"
                  }`}>
                    {selectedDistributor.permissions?.canManageCards ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    توليد كروت الهوتسبوت
                  </span>

                  <span className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    selectedDistributor.permissions?.canManageDebt
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 line-through opacity-60"
                  }`}>
                    {selectedDistributor.permissions?.canManageDebt ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    تسديد وتتبع الذمم
                  </span>

                  <span className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    selectedDistributor.permissions?.canManageOffers
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-indigo-500/10 text-indigo-300 border-indigo-500/20 line-through opacity-60"
                  }`}>
                    {selectedDistributor.permissions?.canManageOffers ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    باقات السرعة
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE TOGGLE & LOGS CONTAINER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            {selectedDistributor 
              ? `جدول سجل العمليات الخاص بالموزع: (${selectedDistributor.name})`
              : `جدول سجلات العمليات الأرشيفية (${sortedFilteredLogs.length} عملية)`}
          </h3>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                عرض جدول منظم
              </button>
              <button
                onClick={() => setViewMode("timeline")}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === "timeline"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                عرض خط زمني
              </button>
            </div>
          </div>
        </div>

        {/* DEDICATED TABLE VIEW */}
        {viewMode === "table" ? (
          <div className="table-scroll-container rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right border-collapse min-w-[850px] sticky-table">
              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-black border-b border-slate-200 dark:border-slate-700">
                  <th className="px-2 py-1.5">#</th>
                  <th className="px-2 py-1.5">معرف العملية (Log ID)</th>
                  <th className="px-2 py-1.5">التاريخ والوقت</th>
                  <th className="px-2 py-1.5">الموزع / المستخدم</th>
                  <th className="px-2 py-1.5">رقم التعريف (ID)</th>
                  <th className="px-2 py-1.5">المستهدف</th>
                  <th className="px-2 py-1.5">التصنيف</th>
                  <th className="px-2 py-1.5">تفاصيل الإجراء والملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                {sortedFilteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400 font-bold">
                      <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      لا توجد أي تعديلات أو عمليات مسجلة مطابقة لخيارات الفلترة الحالية.
                    </td>
                  </tr>
                ) : (
                  sortedFilteredLogs.map((log, idx) => {
                    const category = getActionCategory(log.action);
                    const CategoryIcon = category.icon;
                    const isDist = isDistributorLog(log);

                    return (
                      <tr key={`${log?.id}_${idx}`} className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-2 py-1.5 font-mono text-slate-400 text-[11px]">{idx + 1}</td>
                        <td className="px-2 py-1.5 font-mono text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">
                          {log?.id}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-slate-600 dark:text-slate-300 whitespace-normal break-words text-[11px]">
                          {log.date} <span className="text-slate-400 font-normal">| {log.time}</span>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center gap-1.5 font-black text-slate-800 dark:text-slate-100">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            {log.user}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                          {log.distributorId || (isDist ? "موزع" : "مدير")}
                        </td>
                        <td className="px-2 py-1.5 font-black text-slate-800 dark:text-slate-200">
                          {log.target}
                        </td>
                        <td className="px-2 py-1.5 whitespace-normal break-words">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border inline-flex items-center gap-1 ${category.color}`}>
                            <CategoryIcon className="w-3 h-3" />
                            {category.label}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-slate-700 dark:text-slate-200 font-extrabold leading-relaxed">
                          {log.action}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* TIMELINE VIEW */
          <div className="relative border-r-2 border-slate-200 dark:border-slate-800 pr-6 space-y-6">
            {sortedFilteredLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold space-y-2">
                <History className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                <p>لا توجد أي تعديلات أو عمليات مسجلة مطابقة لخيارات الفلترة الحالية.</p>
              </div>
            ) : (
              sortedFilteredLogs.map((log, idx) => {
                const category = getActionCategory(log.action);
                const CategoryIcon = category.icon;
                const isDist = isDistributorLog(log);

                const isDanger = log.action.includes("حذف") || log.action.includes("إيقاف");
                const isSuccess = log.action.includes("تجديد") || log.action.includes("إضافة") || log.action.includes("توليد") || log.action.includes("تسديد");
                const isPrimary = log.action.includes("تحديث") || log.action.includes("تعديل");

                return (
                  <div key={`${log?.id}_${idx}`} className="relative group">
                    {/* Circle Marker on timeline */}
                    <span className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 transition-transform group-hover:scale-125 ${
                      isDanger ? "bg-indigo-500" :
                      isSuccess ? "bg-emerald-500" :
                      isPrimary ? "bg-indigo-500" : "bg-slate-400"
                    }`} />

                    {/* Log Card */}
                    <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800/80 group-hover:bg-slate-100 dark:bg-slate-800 dark:group-hover:bg-slate-800 p-4 rounded-2xl transition-all border border-slate-200 dark:border-slate-800 dark:border-slate-700/80 shadow-sm space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <div className="flex flex-wrap items-center gap-2 font-bold">
                          <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 dark:text-slate-100 font-extrabold">
                            <User className="w-3.5 h-3.5 text-indigo-500" />
                            المسؤول: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{log.user}</strong>
                          </span>

                          {isDist && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 font-extrabold border border-indigo-200">
                              👤 موزع معتمد
                            </span>
                          )}

                          <span className="text-slate-300 dark:text-slate-600 dark:text-slate-300">|</span>
                          
                          <span className="text-slate-600 dark:text-slate-300 dark:text-slate-300">
                            المستهدف: <span className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-200">{log.target}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Category Badge */}
                          <span className={`px-2.5 py-0.5 rounded-xl text-[10px] font-black border flex items-center gap-1 ${category.color}`}>
                            <CategoryIcon className="w-3 h-3" />
                            {category.label}
                          </span>

                          <div className="flex items-center gap-1 font-mono font-bold text-slate-400 text-[11px]">
                            <Clock className="w-3.5 h-3.5" />
                            {log.date} - {log.time}
                          </div>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 leading-relaxed pr-1">
                        {log.action}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
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

