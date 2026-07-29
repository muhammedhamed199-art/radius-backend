/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  UserCheck, 
  Plus, 
  Search, Download, 
  Coins, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  X,
  XCircle,
  CreditCard,
  UserCheck2, Network, ChevronDown, ChevronLeft,
  Users,
  Server,
  Archive,
  Undo2,
  Zap,
  Key,
  Sliders,
  ShieldAlert,
  BarChart3,
  Radio,
  History,
  DollarSign,
  Edit,
  Terminal,
  Cpu,
  Layers,
  Crown,
  CheckSquare,
  Square,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  FileText, FileSpreadsheet,
  Calendar, MoreVertical, Play, Pause, LogOut, Lock, Unlock, Shield
} from "lucide-react";
import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer, PermissionProfile, COUNTRIES } from "../types";
import { DistributorPermissionsFilterable } from "./DistributorPermissionsFilterable";
import PermissionProfilesModal from "./PermissionProfilesModal";
import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";

import { PERMISSION_GROUPS, getFullPermissionsObject, getDefaultDistributorPermissions, getEnabledCount, getTotalPermissionsCount } from "../utils/permissions";



interface DistributorsViewProps {
  servers?: any;
  distributors: Distributor[];
  archivedDistributors?: Distributor[];
  distributorOffers?: DistributorOffer[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onAddDistributor: (dist: Omit<Distributor, "id">) => void;
  onDeleteDistributor: (id: string, permanent?: boolean) => void;
  onRestoreDistributor?: (id: string) => void;
  onUpdateDistributor: (dist: Distributor) => void;
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
}

export default function DistributorsView({
  distributors,
  archivedDistributors = [],
  distributorOffers = [],
  currencies = [],
  defaultCurrency = "LYD",
  onAddDistributor,
  onDeleteDistributor,
  onRestoreDistributor,
  onUpdateDistributor,
  settings,
  onUpdateSettings
}: DistributorsViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfilesModal, setShowProfilesModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "نشط" | "منتهي">("all");
  const [filterRole, setFilterRole] = useState<"all" | UserRole>("all");
  const [minBalance, setMinBalance] = useState<number | "">("");
  const [maxBalance, setMaxBalance] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedDistributors, setExpandedDistributors] = useState<Set<string>>(new Set());
  const toggleExpand = (id: string) => {
    setExpandedDistributors(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  // Edit Permissions Modal State
  const [editingPermissionsDistributor, setEditingPermissionsDistributor] = useState<Distributor | null>(null);
  const [modalPermissions, setModalPermissions] = useState<DistributorPermissions>({});

  // Edit Full Distributor Modal State
  const [editingFullDistributor, setEditingFullDistributor] = useState<Distributor | null>(null);
  const [showFullEditPassword, setShowFullEditPassword] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);

  // Quick Options Dropdown
  const [activeDropdownDistributor, setActiveDropdownDistributor] = useState<Distributor | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number, right: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeDropdownDistributor) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdownDistributor(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [activeDropdownDistributor]);

  // Add form state
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.DISTRIBUTOR);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [logo, setLogo] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>("الكل");
  const [manageBalanceDistributor, setManageBalanceDistributor] = useState<Distributor | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [balanceAction, setBalanceAction] = useState<"add" | "deduct">("add");
  const [balanceNotes, setBalanceNotes] = useState<string>("");
  
  const [viewingHistoryDistributor, setViewingHistoryDistributor] = useState<Distributor | null>(null);
  const [historyFilterType, setHistoryFilterType] = useState<"all" | "payment" | "deduction">("all");
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  const getAllDistributorTransactions = (dist: Distributor) => {
    const rawTxns = dist.transactions || [];
    const rawReceipts = dist.archivedReceipts || [];

    const receiptTxns = rawReceipts.map(r => ({
      id: r.id,
      date: r.date,
      type: (r.offerId === "deduction" ? "deduction" : "payment") as "payment" | "deduction",
      amount: r.amount,
      description: r.message || (r.offerId === "deduction" ? "خصم رصيد إداري" : "شحن رصيد إداري"),
      processedBy: "الإدارة"
    }));

    const existingIds = new Set(rawTxns.map(t => t.id));
    const merged = [...rawTxns];
    for (const rt of receiptTxns) {
      if (!existingIds.has(rt.id)) {
        merged.push(rt);
      }
    }

    return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleSaveBalanceManagement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manageBalanceDistributor || balanceAmount <= 0) return;
    
    const amount = balanceAmount;
    const isAdding = balanceAction === "add";
    
    setConfirmModal({
      isOpen: true,
      title: isAdding ? "تأكيد شحن الرصيد" : "تأكيد خصم الرصيد",
      message: `هل أنت متأكد من ${isAdding ? "إضافة" : "خصم"} مبلغ ${amount} ${manageBalanceDistributor.currency || defaultCurrency} من رصيد الموزع ${manageBalanceDistributor.name}؟`,
      description: balanceNotes ? `ملاحظات: ${balanceNotes}` : "الرجاء المراجعة قبل التأكيد.",
      confirmText: isAdding ? "تأكيد الشحن" : "تأكيد الخصم",
      onConfirm: () => {
        const newReceipt = {
          id: `rcpt_dist_${Date.now()}`,
          date: new Date().toISOString(),
          amount: amount,
          message: `${isAdding ? 'شحن رصيد إداري' : 'خصم رصيد إداري'}${balanceNotes ? ' - ' + balanceNotes : ''}`,
          status: "matched" as const,
          offerId: isAdding ? "topup" : "deduction"
        };

        const newTxn = {
          id: `txn_dist_${Date.now()}`,
          date: new Date().toISOString(),
          type: (isAdding ? "payment" : "deduction") as "payment" | "deduction",
          amount: amount,
          description: `${isAdding ? 'شحن رصيد إداري' : 'خصم رصيد إداري'}${balanceNotes ? ' - ' + balanceNotes : ''}`,
          processedBy: "الإدارة (المالك)"
        };

        const updatedDistributor = {
          ...manageBalanceDistributor,
          balance: isAdding 
            ? manageBalanceDistributor.balance + amount 
            : Math.max(0, manageBalanceDistributor.balance - amount),
          transactions: [newTxn, ...(manageBalanceDistributor.transactions || [])],
          archivedReceipts: [newReceipt, ...(manageBalanceDistributor.archivedReceipts || [])]
        };
        
        onUpdateDistributor(updatedDistributor);
        setManageBalanceDistributor(null);
      }
    });
  };

  const [balance, setBalance] = useState(100000);
  const [currency, setCurrency] = useState<string>("");
  const [subscriptionOfferId, setSubscriptionOfferId] = useState<string>("");
  const [maxNasServers, setMaxNasServers] = useState<number>(0);

  // Default permissions for new distributor
  const [newPermissions, setNewPermissions] = useState<DistributorPermissions>(getDefaultDistributorPermissions());
  const [newProfileId, setNewProfileId] = useState<string>("");

  // Edit form state
  const [editBalance, setEditBalance] = useState(0);
  const [modalProfileId, setModalProfileId] = useState<string>("");

  
  const handleApplyProfile = (profileId: string, isEdit = false) => {
    if (!settings?.permissionProfiles) return;
    const profile = settings.permissionProfiles.find((p: PermissionProfile) => p.id === profileId);
    if (profile) {
      if (isEdit) {
        setModalPermissions({ ...profile.permissions });
        setModalProfileId(profile.id);
      } else {
        setNewPermissions({ ...profile.permissions });
        setNewProfileId(profile.id);
      }
    } else if (profileId === "") {
      if (isEdit) setModalProfileId("");
      else setNewProfileId("");
    }
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !phone) return;

    onAddDistributor({
      name,
      role,
      username,
      password: password || "123456",
      phone,
      country,
      logo,
      balance,
      currency: currency || defaultCurrency,
      customersCount: 0,
      salesCount: 0,
      permissions: newPermissions,
      permissionProfileId: newProfileId || undefined,
      subscriptionOfferId: subscriptionOfferId || undefined,
      subscriptionStatus: subscriptionOfferId ? "نشط" : undefined,
      maxNasServers: maxNasServers || undefined
    });

    setName("");
    setUsername("");
    setPassword("123456");
    setPhone("");
    setLogo("");
    setBalance(100000);
    setRole(UserRole.DISTRIBUTOR);
    setCurrency("");
    setNewPermissions(getDefaultDistributorPermissions());
    setNewProfileId("");
    setSubscriptionOfferId("");
    setMaxNasServers(0);
    setShowAddForm(false);
  };

  const startEditBalance = (dist: Distributor) => {
    setEditingId(dist?.id);
    setEditBalance(dist.balance);
  };

  const saveBalance = (dist: Distributor) => {
    onUpdateDistributor({
      ...dist,
      balance: editBalance
    });
    setEditingId(null);
  };

  const openPermissionsModal = (dist: Distributor) => {
    setEditingPermissionsDistributor(dist);
    setModalProfileId(dist.permissionProfileId || "");
    if (dist.role === UserRole.TECHNICAL_ADMIN || dist.role === UserRole.ADMIN) {
      setModalPermissions(getFullPermissionsObject());
    } else {
      setModalPermissions(dist.permissions || getDefaultDistributorPermissions());
    }
  };

  const savePermissions = () => {
    if (!editingPermissionsDistributor) return;
    onUpdateDistributor({
      ...editingPermissionsDistributor,
      permissions: modalPermissions,
      permissionProfileId: modalProfileId || undefined
    });
    setEditingPermissionsDistributor(null);
  };

  const grantAllModalPermissions = () => {
    setModalPermissions(getFullPermissionsObject());
  };

  const revokeAllModalPermissions = () => {
    setModalPermissions({});
  };

  const activeDistList = distributors.filter(d => !d.isArchived && d.status !== 'أرشيف');
  const archivedDistList = (archivedDistributors && archivedDistributors.length > 0 ? archivedDistributors : distributors).filter(d => d.isArchived || d.status === 'أرشيف');
  const listToFilter = showArchived ? archivedDistList : activeDistList;
  const filteredDistributors = listToFilter.filter(d => {
    // Only show top-level distributors by default. If searching, show any that match.
    if (!searchQuery && d.parentDistributorId) return false;

    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (d.phone || "").includes(searchQuery);
                          
    const matchesStatus = filterStatus === "all" || d.subscriptionStatus === filterStatus || (!d.subscriptionStatus && filterStatus === "نشط");
    const matchesRole = filterRole === "all" || d.role === filterRole;
    const matchesMinBalance = minBalance === "" || d.balance >= Number(minBalance);
    const matchesMaxBalance = maxBalance === "" || d.balance <= Number(maxBalance);

    return matchesSearch && matchesStatus && matchesRole && matchesMinBalance && matchesMaxBalance;
  });

  const totalPermsCount = getTotalPermissionsCount();
  const exportExcel = () => {
    const exportData = filteredDistributors.map(dist => ({
      "الاسم": dist.name,
      "اسم المستخدم": dist.username,
      "رقم الهاتف": dist.phone || "-",
      "الرصيد": dist.balance.toLocaleString(),
      "العملة": dist.currency || defaultCurrency,
      "عدد المشتركين": dist.customersCount,
      "عدد المبيعات": dist.salesCount,
      "الرتبة": dist.role === UserRole.TECHNICAL_ADMIN ? "مدير تقني" : dist.role === UserRole.ADMIN ? "مدير نظام" : "موزع",
      "المنطقة": dist.region || "-",
      "الدولة": dist.country || "الكل",
      "حالة الاشتراك": dist.subscriptionStatus || "نشط",
      "تاريخ الانتهاء": dist.subscriptionEndDate ? new Date(dist.subscriptionEndDate).toLocaleDateString('ar-SA') : "-"
    }));
    exportToExcel(exportData, `تصدير_الموزعين_${new Date().toISOString().split("T")[0]}`);
  };

  const exportCSV = () => {
    const exportData = filteredDistributors.map(dist => ({
      "الاسم": dist.name,
      "اسم المستخدم": dist.username,
      "رقم الهاتف": dist.phone || "-",
      "الرصيد": dist.balance.toLocaleString(),
      "العملة": dist.currency || defaultCurrency,
      "عدد المشتركين": dist.customersCount,
      "عدد المبيعات": dist.salesCount,
      "الرتبة": dist.role === UserRole.TECHNICAL_ADMIN ? "مدير تقني" : dist.role === UserRole.ADMIN ? "مدير نظام" : "موزع",
      "المنطقة": dist.region || "-",
      "الدولة": dist.country || "الكل",
      "حالة الاشتراك": dist.subscriptionStatus || "نشط",
      "تاريخ الانتهاء": dist.subscriptionEndDate ? new Date(dist.subscriptionEndDate).toLocaleDateString('ar-SA') : "-"
    }));
    exportToCSV(exportData, `تصدير_الموزعين_${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              إدارة الموزعين، المدير التقني، وتخصيص أوامر الريديوس
            </h2>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-slate-900 font-black text-xs rounded-full shadow-sm flex items-center gap-1">
              <Crown className="w-3.5 h-3.5" />
              دعم "مدير تقني" بصلاحيات المنشئ
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1 font-bold leading-relaxed">
            يمكن للمدير إضافة **مدير تقني** يتمتع بكافة صلاحيات المنشئ المطلقة، وتخصيص أوامر FreeRADIUS (CoA, Disconnect, radtest, VSA) لكل موزع بشكل فريد.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-[11px] md:text-xs transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap" title="تصدير إلى Excel">
            <FileSpreadsheet className="w-3.5 h-3.5" /> <span className="hidden md:inline">إكسيل</span>
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] md:text-xs transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 shrink-0 whitespace-nowrap" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5" /> <span className="hidden md:inline">CSV</span>
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`px-4 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-sm shrink-0 border ${showArchived ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
          >
            <Archive className="w-4 h-4" />
            {showArchived ? "العودة للنشطين" : "أرشيف الموزعين"}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            إضافة موزع / مدير تقني جديد
          </button>
        </div>
      </div>

      {/* Add Distributor / Technical Admin Form */}
      {showAddForm && (
        <form onSubmit={handleSubmitAdd} className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base flex items-center gap-2">
              <UserCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              تسجيل حساب جديد وتحديد الرتبة والأوامر المتاحة
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="p-1 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم الموظف / الموزع:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: م. أحمد الخالد"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">نوع الحساب (الرتبة):</label>
              <select
                value={role}
                onChange={(e) => {
                  const newRole = e.target.value as UserRole;
                  setRole(newRole);
                  if (newRole === UserRole.TECHNICAL_ADMIN || newRole === UserRole.ADMIN) {
                    setNewPermissions(getFullPermissionsObject());
                  } else {
                    setNewPermissions(getDefaultDistributorPermissions());
                  }
                }}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={UserRole.DISTRIBUTOR}>موزع</option>
                <option value={UserRole.TECHNICAL_ADMIN}>مدير تقني</option>
                <option value={UserRole.ADMIN}>مدير نظام</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم الدخول (Username):</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: tech_ahmed"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">كلمة المرور (Password):</label>
              <div className="relative">
                <input
                  type={showAddPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="افتراضي: 123456"
                  className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowAddPassword(!showAddPassword)}
                  className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
                >
                  {showAddPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رقم الجوال (WhatsApp):</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 966540000000"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-400 mb-1">الدولة</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="الكل">الكل (متاح لجميع الدول)</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">شعار الموزع (اختياري):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setLogo(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {logo && <img src={logo} alt="شعار الموزع" className="mt-2 h-10 w-auto rounded border" />}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">الرصيد الافتتاحي:</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">العملة الافتراضية:</label>
              <select
                value={currency || defaultCurrency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">باقة الاشتراك:</label>
              <select
                value={subscriptionOfferId}
                onChange={(e) => setSubscriptionOfferId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">بدون باقة</option>
                {distributorOffers?.map(offer => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} - {offer.price === 0 ? "مجاني" : `${offer.price} ${currency}`} / {offer.durationMonths === 0 ? "مفتوح (غير محدود)" : `${offer.durationMonths} شهر`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">الحد الأقصى للسيرفرات (0 = غير محدود):</label>
              <input
                type="number"
                min="0"
                value={maxNasServers}
                onChange={(e) => setMaxNasServers(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">يُحدد أقصى عدد سيرفرات NAS يُسمح للموزع بإضافتها.</p>
            </div>
          </div>

          {/* Technical Admin Banner */}
          {/* RADIUS & System Permissions Customizer */}
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 dark:border-slate-700 pb-2">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                <span>تخصيص صلاحيات وأوامر الريديوس الممنوحة لهذا الحساب:</span>
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 rounded-md text-[10px] font-black">
                  {getEnabledCount(newPermissions)} من {totalPermsCount} أصل مفعّل
                </span>
              </h4>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 ml-4">
                  <select
                    className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
                    onChange={(e) => handleApplyProfile(e.target.value, false)}
                    value={newProfileId}
                  >
                    <option value="">تطبيق قالب جاهز...</option>
                    {settings?.permissionProfiles?.map((p: PermissionProfile) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => setShowProfilesModal(true)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors" title="إدارة قوالب الصلاحيات">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
                
                <button
                  type="button"
                  onClick={() => setNewPermissions(getFullPermissionsObject())}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <CheckSquare className="w-3 h-3" />
                  منح كافة أوامر وصلاحيات المنشئ
                </button>
                <button
                  type="button"
                  onClick={() => setNewPermissions({})}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-indigo-100 dark:bg-rose-950/60 text-indigo-700 dark:text-indigo-300 border border-rose-200 dark:border-rose-800 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                >
                  <Square className="w-3 h-3" />
                  إلغاء الكل
                </button>
              </div>
            </div>

            {/* Permission Groups Accordion / Grid */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pl-1 pr-1">
              {PERMISSION_GROUPS.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group?.id} className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className={`p-3 border-b dark:border-slate-800 flex items-center justify-between ${group.headerBg}`}>
                      <div className="flex items-center gap-2">
                        <GroupIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100 dark:text-slate-100 block">{group.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 dark:text-slate-400 font-semibold">{group.description}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border ${group.badgeColor}`}>
                        {group.permissions.filter(p => !!(newPermissions as any)[p.key]).length} / {group.permissions.length}
                      </span>
                    </div>

                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {group.permissions.map((perm) => {
                        const isChecked = !!(newPermissions as any)[perm.key];
                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200"
                                : "bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/80"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                setNewPermissions({
                                  ...newPermissions,
                                  [perm.key]: e.target.checked
                                });
                              }}
                              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                            />
                            <div>
                              <span className="font-black block text-[11px] leading-tight mb-0.5">{perm.label}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 dark:text-slate-400 font-semibold block leading-tight">{perm.desc}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-200 dark:shadow-none flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              حفظ الحساب وتنشيط الأوامر المحددة
            </button>
          </div>
        </form>
      )}

      {/* Filter Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex items-center gap-2">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث باسم الموظف، اسم المستخدم، أو رقم الهاتف..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-2.5 rounded-xl border transition-all flex-shrink-0 ${
                showAdvancedFilters 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/30 dark:border-emerald-800" 
                  : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700"
              }`}
              title="فلترة متقدمة"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs text-slate-400 font-bold flex items-center gap-2">
            <span>إجمالي الموزعين والمدراء:</span>
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg font-mono font-black">
              {filteredDistributors.length} حساب
            </span>
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">نوع الحساب (الرتبة):</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">الكل (موزعين ومدراء)</option>
                <option value={UserRole.DISTRIBUTOR}>موزع فقط</option>
                <option value={UserRole.TECHNICAL_ADMIN}>مدير تقني فقط</option>
                <option value={UserRole.ADMIN}>مدير نظام فقط</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">حالة الاشتراك:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">الكل (نشط ومنتهي)</option>
                <option value="نشط">🟢 نشط فقط</option>
                <option value="منتهي">🔴 منتهي أو موقوف</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الرصيد المالي (الحد الأدنى):</label>
              <input
                type="number"
                value={minBalance}
                onChange={(e) => setMinBalance(e.target.value ? Number(e.target.value) : "")}
                placeholder="0.00"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">الرصيد المالي (الحد الأقصى):</label>
              <input
                type="number"
                value={maxBalance}
                onChange={(e) => setMaxBalance(e.target.value ? Number(e.target.value) : "")}
                placeholder="1000.00"
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Distributors & Technical Admins Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDistributors.map((dist) => {
          const isEditing = editingId === dist?.id;
          const isTechAdmin = dist.role === UserRole.TECHNICAL_ADMIN;
          const isAdmin = dist.role === UserRole.ADMIN || isTechAdmin;
          const perms = dist.permissions || {};
          const enabledCount = getEnabledCount(perms);
          const subDistributors = listToFilter.filter(sub => sub.parentDistributorId === dist.id);

          return (
            <div key={dist?.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-800/50 shadow-inner">
                    {isTechAdmin ? <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" /> : <UserCheck2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5 flex-wrap">
                      <span>{dist.name}</span>
                      <button
                        onClick={() => {
                          setViewingHistoryDistributor(dist);
                          setHistoryFilterType("all");
                          setHistorySearchQuery("");
                        }}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 transition-all flex items-center gap-1 text-[10px] font-black shadow-xs hover:scale-105"
                        title="عرض سجل عمليات الشحن والخصومات الخاصة بالموزع"
                      >
                        <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>سجل الشحن</span>
                      </button>
                      {subDistributors.length > 0 && (
                        <button 
                          onClick={() => toggleExpand(dist.id!)}
                          className={`p-1 rounded-md transition-colors ${expandedDistributors.has(dist.id!) ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                          title="عرض الموزعين الفرعيين"
                        >
                          <Network className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {dist.role === UserRole.TECHNICAL_ADMIN && <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[9px] rounded-md border border-purple-200 dark:border-purple-800/50">مدير تقني</span>}
                      {dist.role === UserRole.ADMIN && <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[9px] rounded-md border border-blue-200 dark:border-blue-800/50">مدير نظام</span>}
                      {(!dist.role || dist.role === UserRole.DISTRIBUTOR) && <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] rounded-md border border-emerald-200 dark:border-emerald-800/50">موزع</span>}
                      {dist.subscriptionStatus === "منتهي" ? (
                        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[9px] rounded-md border border-rose-200 dark:border-rose-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> موقوف</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] rounded-md border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> نشط</span>
                      )}
                      {dist.permissionProfileId && (() => {
                        const prof = settings?.permissionProfiles?.find((p: PermissionProfile) => p.id === dist.permissionProfileId);
                        return prof ? (
                          <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] rounded-md border border-indigo-200 dark:border-indigo-800/50 flex items-center gap-1 font-bold" title="مربوط بقالب صلاحيات يتحدث تلقائياً">
                            <Shield className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" /> قالب: {prof.name}
                          </span>
                        ) : null;
                      })()}
                      {dist.isLocked && (
                        <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[9px] rounded-md border border-amber-300 dark:border-amber-800/60 flex items-center gap-1 font-extrabold" title="حساب الموزع مقفل لمنع التعديلات العشوائية">
                          <Lock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" /> مقفل
                        </span>
                      )}
                      {dist.country && dist.country !== "الكل" && <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] rounded-md border border-slate-200 dark:border-slate-700">{dist.country}</span>}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">{dist.username}</span>
                  </div>
                <div className="relative">
                  <button
                    onClick={() => {
                      if (activeDropdownDistributor?.id === dist.id) {
                         setActiveDropdownDistributor(null);
                      } else {
                         setActiveDropdownDistributor(dist);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/50 rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700"
                    title="قائمة الخيارات السريعة للموزع"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {activeDropdownDistributor?.id === dist.id && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 top-full mt-2 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[90] p-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 overflow-y-auto max-h-[380px] scroll-smooth overscroll-contain touch-pan-y animate-in fade-in zoom-in-95 duration-150"
                    >
                        <div className="px-3 py-2 border-b border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 font-extrabold flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 rounded-t-xl mb-1">
                          <span className="flex items-center gap-1.5">
                            <MoreVertical className="w-3.5 h-3.5 text-indigo-500" />
                            خيارات الموزع
                          </span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full text-[10px]">
                            {dist.username}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              setEditingFullDistributor(dist);
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-indigo-100/70 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                              <Edit className="w-4 h-4" />
                            </div>
                            <span>1. تعديل بيانات الموزع كاملة</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              setBalanceAmount(0);
                              setBalanceAction("add");
                              setBalanceNotes("");
                              setManageBalanceDistributor(dist);
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-emerald-100/70 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                              <Coins className="w-4 h-4" />
                            </div>
                            <span>2. إدارة الرصيد المالي (شحن / خصم)</span>
                          </button>

                          {/* خيار إيقاف الموزع / تنشيط الحساب */}
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              const isCurrentlyActive = dist.subscriptionStatus === "نشط";
                              const newStatus = isCurrentlyActive ? "موقوف" : "نشط";
                              if (window.confirm(`هل أنت متأكد من ${isCurrentlyActive ? "إيقاف الموزع مؤقتاً (موقوف)" : "تنشيط حساب الموزع"} [${dist.name}]؟`)) {
                                onUpdateDistributor({ ...dist, subscriptionStatus: newStatus });
                                window.alert(`تم ${newStatus === "نشط" ? "تنشيط" : "إيقاف (موقوف)"} الموزع ${dist.name} بنجاح.`);
                              }
                            }}
                            className={`w-full text-right px-3 py-2.5 rounded-xl font-extrabold flex items-center gap-2.5 transition-colors group ${
                              dist.subscriptionStatus === "نشط" 
                                ? "hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-300" 
                                : "hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300"
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg group-hover:scale-105 transition-transform ${
                              dist.subscriptionStatus === "نشط"
                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                            }`}>
                              {dist.subscriptionStatus === "نشط" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </div>
                            <span>
                              {dist.subscriptionStatus === "نشط" ? "3. إيقاف الموزع مؤقتاً" : "3. تنشيط حساب الموزع"}
                            </span>
                          </button>

                          {/* خيار إنهاء اشتراك الموزع */}
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              if (window.confirm(`⛔ هل أنت متأكد من إنهاء اشتراك الموزع [${dist.name}] وتصفير الأيام المتبقية؟`)) {
                                const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                                onUpdateDistributor({ ...dist, subscriptionStatus: "منتهي", expiryDate: yesterdayStr });
                                window.alert(`تم إنهاء اشتراك الموزع [${dist.name}] وتصفير الأيام بنجاح.`);
                              }
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-800 dark:text-rose-300 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                              <XCircle className="w-4 h-4" />
                            </div>
                            <span>إنهاء اشتراك الموزع (تصفير الأيام)</span>
                          </button>

                          {/* خيار طرد الموزع من الجلسة */}
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              if (window.confirm(`هل أنت متأكد من طرد الموزع [${dist.name}] من الجلسة (تسجيل خروج إجباري)؟`)) {
                                window.alert(`تم طرد الموزع ${dist.name} وإغلاق الجلسة النشطة بنجاح.`);
                              }
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/50 text-orange-900 dark:text-orange-300 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-orange-100/70 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 group-hover:scale-105 transition-transform">
                              <LogOut className="w-4 h-4" />
                            </div>
                            <span>4. طرد الموزع من الجلسة</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              openPermissionsModal(dist);
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/50 text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-purple-100/70 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <span>5. إدارة الصلاحيات والأوامر</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              setViewingHistoryDistributor(dist);
                              setHistoryFilterType("all");
                              setHistorySearchQuery("");
                            }}
                            className="w-full text-right px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-800 dark:text-slate-200 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1.5 rounded-lg bg-teal-100/70 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
                              <History className="w-4 h-4" />
                            </div>
                            <span>6. سجل عمليات الشحن والخصومات</span>
                          </button>

                          {/* خيار قفل الحساب والتعديلات */}
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              const newLockedState = !dist.isLocked;
                              onUpdateDistributor({ ...dist, isLocked: newLockedState });
                              window.alert(`تم ${newLockedState ? "قفل" : "فك قفل"} حساب الموزع [${dist.name}] بنجاح لمنع التعديلات العشوائية.`);
                            }}
                            className={`w-full text-right px-3 py-2.5 rounded-xl font-extrabold flex items-center gap-2.5 transition-colors group ${
                              dist.isLocked 
                                ? "hover:bg-amber-50 dark:hover:bg-amber-950/50 text-amber-900 dark:text-amber-300" 
                                : "hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-800 dark:text-slate-200"
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg group-hover:scale-105 transition-transform ${
                              dist.isLocked
                                ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
                                : "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                            }`}>
                              {dist.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            </div>
                            <span>
                              {dist.isLocked ? "7. فك قفل الحساب والتعديلات" : "7. قفل الحساب (منع التعديل العشوائي)"}
                            </span>
                          </button>
                        </div>

                        <div className="my-1.5 border-t border-slate-200/80 dark:border-slate-800"></div>

                        <div className="space-y-0.5">
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              setConfirmModal({
                                isOpen: true,
                                title: "نقل للأرشيف",
                                message: `هل أنت متأكد من تعطيل ونقل حساب الموزع [${dist.name}] للأرشيف؟`,
                                description: "سيتم إيقاف صلاحياته فوراً ويمكنك استعادته خلال عام.",
                                confirmText: "نقل للأرشيف",
                                onConfirm: () => onDeleteDistributor(dist?.id)
                              });
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1 rounded-lg bg-rose-100/60 dark:bg-rose-900/30 text-rose-500">
                              <Archive className="w-3.5 h-3.5" />
                            </div>
                            <span>نقل حساب الموزع للأرشيف</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              setActiveDropdownDistributor(null);
                              setConfirmModal({
                                isOpen: true,
                                title: "حذف نهائي",
                                message: `هل أنت متأكد من حذف الموزع [${dist.name}] نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
                                confirmText: "حذف نهائي",
                                onConfirm: () => onDeleteDistributor(dist?.id, true)
                              });
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold flex items-center gap-2.5 transition-colors group"
                          >
                            <div className="p-1 rounded-lg bg-rose-200/70 dark:bg-rose-900/50 text-rose-600">
                              <Trash2 className="w-3.5 h-3.5" />
                            </div>
                            <span>حذف نهائي من النظام</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>

                </div>
              </div>
              
              {/* Details */}
              <div className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">المشتركين</span>
                    <strong className="text-slate-700 dark:text-slate-200 text-sm font-black">{dist.customersCount}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold block mb-1">المبيعات</span>
                    <strong className="text-slate-700 dark:text-slate-200 text-sm font-black">{dist.salesCount}</strong>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  {dist.phone}
                </div>
                
                {dist.subscriptionStatus && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold px-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    حالة الاشتراك: <span className={dist.subscriptionStatus === "نشط" ? "text-emerald-500" : "text-indigo-500"}>{dist.subscriptionStatus}</span>
                  </div>
                )}
              </div>
              
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Terminal className="w-3.5 h-3.5 text-purple-500" />
                    أوامر وصلاحيات الممنوحة:
                  </span>
                  <button
                    onClick={() => openPermissionsModal(dist)}
                    className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-md text-[10px] font-black transition-all flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800"
                  >
                    <Sliders className="w-3 h-3" />
                    تعديل
                  </button>
                </div>
                <div className="p-2.5 bg-indigo-50/50 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <div>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-200 block text-[11px]">
                          {isTechAdmin || isAdmin ? "صلاحيات المنشئ ورئيس القسم كاملة" : `${enabledCount} من أصل ${totalPermsCount} أمر مفعّل`}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold block">
                          {perms.canCmdSendCoA ? "أمر CoA مفعّل" : "CoA معطل"} • {perms.canCmdSendDisconnectRequest ? "أمر PoD مفعّل" : "PoD معطل"} • {perms.canCmdRadtestAuth ? "radtest مفعّل" : ""}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black font-mono border ${
                      enabledCount === totalPermsCount 
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {enabledCount}/{totalPermsCount}
                    </span>
                  </div>
                </div>

                {/* Balance Section */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-slate-700 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="block text-[10px] text-slate-400 font-bold">رصيد الشحن الحالي:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editBalance}
                        onChange={(e) => setEditBalance(Number(e.target.value))}
                        className="w-28 p-1 text-xs font-mono font-bold border border-emerald-400 rounded focus:outline-none"
                      />
                    ) : (
                      <strong className="text-base font-black text-emerald-800 dark:text-emerald-300 font-mono">
                        {dist.balance.toLocaleString()} {currencies.find(c => c.code === (dist.currency || defaultCurrency))?.symbol || (dist.currency || defaultCurrency)}
                      </strong>
                    )}
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 dark:bg-slate-900 text-emerald-600 rounded-xl border border-emerald-100 dark:border-slate-800">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>

              {/* Sub-Distributors Section */}
              {subDistributors.length > 0 && expandedDistributors.has(dist.id!) && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                    <Network className="w-4 h-4" /> الموزعون الفرعيون ({subDistributors.length}):
                  </div>
                  {subDistributors.map(sub => (
                    <div key={sub.id} className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <div className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{sub.name}</span>
                          <button
                            onClick={() => {
                              setViewingHistoryDistributor(sub);
                              setHistoryFilterType("all");
                              setHistorySearchQuery("");
                            }}
                            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800 transition-colors"
                            title="عرض سجل الشحن والخصومات"
                          >
                            <History className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{sub.username}</div>
                      </div>
                      <div className="text-left">
                        <div className="font-black text-emerald-600 dark:text-emerald-400 text-xs font-mono">{sub.balance.toLocaleString()} {sub.currency || defaultCurrency}</div>
                        <div className="text-[10px] text-slate-500 font-bold">{sub.customersCount} مشترك</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-between items-center mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 dark:border-slate-800">
                {isEditing ? (
                  <div className="flex gap-1.5 justify-end w-full">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => saveBalance(dist)}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> حفظ الرصيد
                    </button>
                  </div>
                ) : showArchived ? (
                  <>
                    <button
                      onClick={() => onRestoreDistributor?.(dist.id)}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl transition-all flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800"
                    >
                      <Undo2 className="w-4 h-4" /> استعادة الحساب
                    </button>
                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: "حذف نهائي",
                          message: `هل أنت متأكد من حذف الموزع [${dist.name}] نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
                          confirmText: "حذف نهائي",
                          onConfirm: () => onDeleteDistributor(dist?.id, true)
                        });
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                      title="حذف نهائي"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setBalanceAmount(0);
                          setBalanceAction("add");
                          setBalanceNotes("");
                          setManageBalanceDistributor(dist);
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-bold text-[11px] rounded-xl transition-all"
                      >
                        إدارة الرصيد
                      </button>
                      <button
                        onClick={() => setEditingFullDistributor(dist)}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] rounded-xl transition-all flex items-center gap-1 border border-indigo-200/60 dark:border-indigo-800"
                        title="تعديل بيانات الحساب والرتبة"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        تعديل الحساب
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setConfirmModal({
                          isOpen: true,
                          title: "نقل للأرشيف",
                          message: `هل أنت متأكد من تعطيل ونقل حساب الموزع [${dist.name}] للأرشيف؟`,
                          description: "سيتم إيقاف صلاحياته فوراً ويمكنك استعادته خلال عام.",
                          confirmText: "نقل للأرشيف",
                          onConfirm: () => onDeleteDistributor(dist?.id)
                        });
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                      title="نقل للأرشيف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Customize RADIUS Permissions & Direct Commands */}
      {editingPermissionsDistributor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 space-y-5 max-h-[90vh] flex flex-col" dir="rtl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 rounded-2xl border border-purple-200 dark:border-purple-800">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base flex items-center gap-2">
                    تخصيص كامل أوامر وصلاحيات FreeRADIUS
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold">
                    الحساب المستهدف: <strong className="text-indigo-600 dark:text-indigo-400 font-black">{editingPermissionsDistributor.name}</strong> ({editingPermissionsDistributor.username}) • الرتبة: {editingPermissionsDistributor.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 mr-auto ml-4">
                <select
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-indigo-600 dark:text-indigo-400"
                  onChange={(e) => handleApplyProfile(e.target.value, true)}
                  value={modalProfileId}
                >
                  <option value="">تخصيص يدوي / بدون قالب...</option>
                  {settings?.permissionProfiles?.map((p: PermissionProfile) => (
                    <option key={p.id} value={p.id}>ربط مع القالب: {p.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowProfilesModal(true)} className="p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors" title="إدارة قوالب الصلاحيات">
                  <FileText className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => setEditingPermissionsDistributor(null)}
                className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Toolbar */}
            <DistributorPermissionsFilterable 
              permissions={modalPermissions} 
              onChange={setModalPermissions} 
              isModal={true} 
            />

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t dark:border-slate-800 shrink-0">
              <span className="text-xs text-slate-400 font-bold">
                سيتم تفعيل هذه الأوامر فوراً لهذا الموزع بمجرد الحفظ.
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPermissionsDistributor(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-bold text-xs rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={savePermissions}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  حفظ وتطبيق أوامر الريديوس
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Full Edit Distributor Data */}
      {editingFullDistributor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 space-y-5 overflow-y-auto max-h-[90vh]" dir="rtl">
            <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base">تعديل حساب ورتبة الحساب</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold">{editingFullDistributor.name} ({editingFullDistributor.username})</span>
                </div>
              </div>

              <button
                onClick={() => setEditingFullDistributor(null)}
                className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-xl text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lock Protection Banner */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
              editingFullDistributor.isLocked
                ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200"
                : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  editingFullDistributor.isLocked 
                    ? "bg-amber-200/80 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300" 
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                }`}>
                  {editingFullDistributor.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs flex items-center gap-1.5">
                    حماية وقفل حساب الموزع (Lock)
                    {editingFullDistributor.isLocked && <span className="text-[10px] bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 px-1.5 py-0.5 rounded-md font-black">مميّز كمقفل</span>}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {editingFullDistributor.isLocked
                      ? "الحساب مقفل حالياً لمنع التعديلات العشوائية على باقات الاشتراك أو حدود الرصيد من قبل المدراء الفرعيين."
                      : "تفعيل هذا الخيار يقفل حساب الموزع لحمايته من التعديل غير المقصود بواسطة المدراء الفرعيين."}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={editingFullDistributor.isLocked || false}
                  onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, isLocked: e.target.checked })}
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateDistributor(editingFullDistributor);
                setEditingFullDistributor(null);
              }}
              className="space-y-4 text-xs font-bold"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم الموظف / المدير التقني:</label>
                  <input
                    type="text"
                    value={editingFullDistributor.name}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">نوع الحساب (الرتبة):</label>
                  <select
                    value={editingFullDistributor.role || UserRole.DISTRIBUTOR}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      let newPerms = editingFullDistributor.permissions;
                      if (newRole === UserRole.TECHNICAL_ADMIN || newRole === UserRole.ADMIN) {
                        newPerms = getFullPermissionsObject();
                      }
                      setEditingFullDistributor({
                        ...editingFullDistributor,
                        role: newRole,
                        permissions: newPerms
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={UserRole.DISTRIBUTOR}>موزع</option>
                    <option value={UserRole.TECHNICAL_ADMIN}>مدير تقني</option>
                    <option value={UserRole.ADMIN}>مدير نظام</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم الدخول (Username):</label>
                  <input
                    type="text"
                    value={editingFullDistributor.username}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, username: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">كلمة المرور (Password):</label>
                  <div className="relative">
                    <input
                      type={showFullEditPassword ? "text" : "password"}
                      value={editingFullDistributor.password || ""}
                      onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, password: e.target.value })}
                      placeholder="أدخل كلمة المرور الجديدة..."
                      className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowFullEditPassword(!showFullEditPassword)}
                      className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
                    >
                      {showFullEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رقم الهاتف / الواتس:</label>
                  <input
                    type="text"
                    value={editingFullDistributor.phone}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">الدولة</label>
                  <select
                    value={editingFullDistributor.country || "الكل"}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, country: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="الكل">الكل (متاح لجميع الدول)</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">شعار الموزع (اختياري):</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditingFullDistributor({ ...editingFullDistributor, logo: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full p-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {editingFullDistributor.logo && <img src={editingFullDistributor.logo} alt="شعار الموزع" className="mt-2 h-10 w-auto rounded border" />}
                </div>

                

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رصيد الشحن الحالي:</label>
                  <input
                    type="number"
                    value={editingFullDistributor.balance}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, balance: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">العملة المعتمدة:</label>
                  <select
                    value={editingFullDistributor.currency || defaultCurrency}
                    onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.name} ({c.symbol})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Auto Renew Subscription Configuration */}
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                 <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    إعدادات تجديد الاشتراك التلقائي للموزع
                 </h4>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تفعيل التجديد التلقائي</label>
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={editingFullDistributor.autoRenewSubscription || false}
                          onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, autoRenewSubscription: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-500"></div>
                        <span className="ml-3 mr-3 text-sm font-bold text-slate-700 dark:text-slate-300">تفعيل الخصم من الرصيد</span>
                      </label>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">باقة الاشتراك</label>
                        <select
                          value={editingFullDistributor.subscriptionOfferId || ""}
                          onChange={(e) => {
                             const offerId = e.target.value;
                             // Calculate next end date based on duration
                             const offer = distributorOffers.find(o => o?.id === offerId);
                             let endDateStr = editingFullDistributor.subscriptionEndDate;
                             if (!endDateStr && offer) {
                               const nextMonth = new Date();
                               nextMonth.setMonth(nextMonth.getMonth() + (offer.durationMonths === 0 ? 1200 : offer.durationMonths));
                               endDateStr = nextMonth.toISOString().split('T')[0];
                             }

                             setEditingFullDistributor({ 
                               ...editingFullDistributor, 
                               subscriptionOfferId: offerId,
                               subscriptionEndDate: endDateStr,
                               subscriptionStatus: "نشط"
                             });
                          }}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">-- اختر باقة --</option>
                          {distributorOffers.map(offer => (
                            <option key={offer?.id} value={offer?.id}>{offer.name} - {offer.price === 0 ? "مجاني" : `${offer.price} ${editingFullDistributor.currency || defaultCurrency}`} / {offer.durationMonths === 0 ? "غير محدود" : `${offer.durationMonths} شهر`}</option>
                          ))}
                        </select>
                        {editingFullDistributor.subscriptionOfferId && distributorOffers.find(o => o.id === editingFullDistributor.subscriptionOfferId) && (
                           <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                             <Calendar className="w-3.5 h-3.5" />
                             تاريخ الانتهاء المتوقع: {editingFullDistributor.subscriptionEndDate ? new Date(editingFullDistributor.subscriptionEndDate).toLocaleDateString('ar-SA') : "غير محدد"}
                           </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">الحد الأقصى للسيرفرات (0 = غير محدود):</label>
                        <input
                          type="number"
                          min="0"
                          value={editingFullDistributor.maxNasServers || ""}
                          onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, maxNasServers: Number(e.target.value) || undefined })}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">يُحدد أقصى عدد سيرفرات NAS يُسمح للموزع بإضافتها.</p>
                      </div>

                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                   <div>
                     <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">المدة بالأشهر</label>
                     <input
                       type="number"
                       min="1"
                       placeholder="مثال: 1, 3, 12"
                       onChange={(e) => {
                         const months = Number(e.target.value);
                         if (months > 0) {
                           let baseDate = editingFullDistributor.subscriptionStartDate ? new Date(editingFullDistributor.subscriptionStartDate) : new Date();
                           baseDate.setMonth(baseDate.getMonth() + months);
                           setEditingFullDistributor({ ...editingFullDistributor, subscriptionEndDate: baseDate.toISOString().split('T')[0], subscriptionStatus: "نشط" });
                         }
                       }}
                       className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تاريخ الانتهاء والخصم القادم</label>
                     <input
                       type="date"
                       value={editingFullDistributor.subscriptionEndDate || ""}
                       onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, subscriptionEndDate: e.target.value, subscriptionStatus: "نشط" })}
                       className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                     />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">حالة حساب الموزع (العميل)</label>
                      <select
                        value={editingFullDistributor.subscriptionStatus || "نشط"}
                        onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, subscriptionStatus: e.target.value as "نشط" | "منتهي" })}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="نشط">🟢 نشط (يعمل)</option>
                        <option value="منتهي">🔴 منتهي أو موقوف</option>
                      </select>
                   </div>
                 </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-indigo-50/60 dark:bg-slate-800/80 rounded-xl border border-indigo-100 dark:border-slate-700 flex items-center justify-between">
                <span className="text-xs text-indigo-950 dark:text-indigo-200 font-extrabold flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  عدد أوامر وصلاحيات الريديوس المفعّلة لهذا الحساب: {getEnabledCount(editingFullDistributor.permissions)} / {totalPermsCount}
                </span>
                <button
                  type="button"
                  onClick={() => openPermissionsModal(editingFullDistributor)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  ضبط الأوامر المتقدمة
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingFullDistributor(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-bold rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-200 dark:shadow-none"
                >
                  حفظ بيانات الحساب
                </button>
              </div>
            </form>
          </div>
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

      {manageBalanceDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  إدارة رصيد الموزع
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  الموزع: {manageBalanceDistributor.name} (الرصيد الحالي: {manageBalanceDistributor.balance})
                </p>
              </div>
              <button
                onClick={() => setManageBalanceDistributor(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {manageBalanceDistributor.isLocked && (
              <div className="mx-6 mt-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between text-amber-900 dark:text-amber-200 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>تنبيه: حساب الموزع مقفل ضد التعديلات العشوائية.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...manageBalanceDistributor, isLocked: false };
                    setManageBalanceDistributor(updated);
                    onUpdateDistributor(updated);
                  }}
                  className="px-2.5 py-1 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 rounded-lg text-[10px] font-black transition-colors"
                >
                  فك القفل الآن
                </button>
              </div>
            )}

            <form onSubmit={handleSaveBalanceManagement} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">نوع العملية</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBalanceAction("add")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      balanceAction === "add"
                        ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Plus className="w-4 h-4" /> شحن رصيد
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalanceAction("deduct")}
                    className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      balanceAction === "deduct"
                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-2 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Trash2 className="w-4 h-4" /> خصم رصيد
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">المبلغ</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={balanceAmount || ""}
                    onChange={(e) => setBalanceAmount(Number(e.target.value))}
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {manageBalanceDistributor.currency || defaultCurrency}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={balanceNotes}
                  onChange={(e) => setBalanceNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none"
                  placeholder="اكتب سبب الشحن أو الخصم هنا..."
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={balanceAmount <= 0}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-emerald-200 dark:shadow-none flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  تأكيد العملية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {viewingHistoryDistributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    سجل عمليات الشحن والخصومات
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-mono">
                      {viewingHistoryDistributor.name}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-2">
                    <span>اسم المستخدم: <strong className="font-mono text-indigo-600 dark:text-indigo-400">@{viewingHistoryDistributor.username}</strong></span>
                    <span>•</span>
                    <span>العملة: <strong className="font-mono">{viewingHistoryDistributor.currency || defaultCurrency}</strong></span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const distToCharge = viewingHistoryDistributor;
                    setViewingHistoryDistributor(null);
                    setBalanceAmount(0);
                    setBalanceAction("add");
                    setBalanceNotes("");
                    setManageBalanceDistributor(distToCharge);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>شحن رصيد الآن</span>
                </button>
                <button
                  onClick={() => setViewingHistoryDistributor(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Summary Metrics */}
              {(() => {
                const txns = getAllDistributorTransactions(viewingHistoryDistributor);
                const totalRecharge = txns
                  .filter(t => t.type === "payment" || (t.type as string) === "topup" || (t as any).type === "إيداع")
                  .reduce((acc, t) => acc + (t.amount || 0), 0);
                const totalDeduction = txns
                  .filter(t => t.type === "deduction" || (t as any).type === "خصم")
                  .reduce((acc, t) => acc + (t.amount || 0), 0);

                const currCode = viewingHistoryDistributor.currency || defaultCurrency;

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 font-bold block mb-1">الرصيد المالي الحالي</span>
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          {viewingHistoryDistributor.balance.toLocaleString()} {currCode}
                        </div>
                      </div>

                      <div className="p-3.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/50">
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold block mb-1">إجمالي عمليات الشحن (+)</span>
                        <div className="text-lg font-black text-emerald-700 dark:text-emerald-300 font-mono">
                          + {totalRecharge.toLocaleString()} {currCode}
                        </div>
                      </div>

                      <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/30 rounded-2xl border border-rose-100 dark:border-rose-900/50">
                        <span className="text-[11px] text-rose-700 dark:text-rose-400 font-bold block mb-1">إجمالي الخصومات والسحوبات (-)</span>
                        <div className="text-lg font-black text-rose-700 dark:text-rose-300 font-mono">
                          - {totalDeduction.toLocaleString()} {currCode}
                        </div>
                      </div>

                      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] text-slate-400 font-bold block mb-1">إجمالي الحركات المسجلة</span>
                        <div className="text-lg font-black text-slate-700 dark:text-slate-200 font-mono">
                          {txns.length} حركة
                        </div>
                      </div>
                    </div>

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2">
                      <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
                        <button
                          onClick={() => setHistoryFilterType("all")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
                            historyFilterType === "all"
                              ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          جميع الحركات ({txns.length})
                        </button>
                        <button
                          onClick={() => setHistoryFilterType("payment")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
                            historyFilterType === "payment"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          شحن رصيد (+)
                        </button>
                        <button
                          onClick={() => setHistoryFilterType("deduction")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial ${
                            historyFilterType === "deduction"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          خصم رصيد (-)
                        </button>
                      </div>

                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          value={historySearchQuery}
                          onChange={(e) => setHistorySearchQuery(e.target.value)}
                          placeholder="بحث في البيان أو السبب..."
                          className="w-full pr-9 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                      </div>
                    </div>

                    {/* Table of Transactions */}
                    {(() => {
                      const filteredTxns = txns.filter(t => {
                        const isPayment = t.type === "payment" || (t.type as string) === "topup" || (t as any).type === "إيداع";
                        const matchesType =
                          historyFilterType === "all" ||
                          (historyFilterType === "payment" && isPayment) ||
                          (historyFilterType === "deduction" && !isPayment);

                        const query = historySearchQuery.toLowerCase();
                        const matchesSearch =
                          !query ||
                          (t.description || "").toLowerCase().includes(query) ||
                          (t.processedBy || "").toLowerCase().includes(query) ||
                          (t.amount || 0).toString().includes(query);

                        return matchesType && matchesSearch;
                      });

                      if (filteredTxns.length === 0) {
                        return (
                          <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <Coins className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                            <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">لا توجد حركات شحن أو خصم مسجلة</h4>
                            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              لم يتم تسجيل أي عمليات شحن أو خصم رصيد لهذا الموزع بعد. يمكنك استخدام زر "شحن رصيد الآن" لإضافة رصيد.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-extrabold border-b border-slate-200 dark:border-slate-800">
                              <tr>
                                <th className="p-3">#</th>
                                <th className="p-3">التاريخ والوقت</th>
                                <th className="p-3">نوع الحركة</th>
                                <th className="p-3">المبلغ</th>
                                <th className="p-3">البيان / السبب</th>
                                <th className="p-3">منفذ العملية</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {filteredTxns.map((t, idx) => {
                                const isPayment = t.type === "payment" || (t.type as string) === "topup" || (t as any).type === "إيداع";
                                return (
                                  <tr key={t.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-3 text-slate-400 font-mono font-bold">{idx + 1}</td>
                                    <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                      {t.date ? new Date(t.date).toLocaleString("ar-LY") : "-"}
                                    </td>
                                    <td className="p-3 whitespace-nowrap">
                                      {isPayment ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-black border border-emerald-200 dark:border-emerald-800">
                                          <Plus className="w-3 h-3" />
                                          شحن رصيد
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-black border border-rose-200 dark:border-rose-800">
                                          <Trash2 className="w-3 h-3" />
                                          خصم رصيد
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 font-mono font-black text-sm whitespace-nowrap">
                                      <span className={isPayment ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                        {isPayment ? "+" : "-"} {t.amount?.toLocaleString()} {currCode}
                                      </span>
                                    </td>
                                    <td className="p-3 font-bold text-slate-800 dark:text-slate-200 max-w-xs break-words">
                                      {t.description || "بدون بيان"}
                                    </td>
                                    <td className="p-3 font-bold text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                                      {t.processedBy || "النظام"}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-bold">
                تاريخ الاستعراض: {new Date().toLocaleDateString("ar-LY")}
              </span>
              <button
                onClick={() => setViewingHistoryDistributor(null)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {showProfilesModal && (
        <PermissionProfilesModal
          profiles={settings?.permissionProfiles || []}
          onSaveProfiles={(updatedProfiles) => {
            onUpdateSettings({ ...settings, permissionProfiles: updatedProfiles });
          }}
          onClose={() => setShowProfilesModal(false)}
        />
      )}
    </div>
  );
}
