/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  UserCheck, 
  Plus, 
  Search, 
  Coins, 
  Trash2, 
  ShieldCheck, 
  Smartphone, 
  Check, 
  X,
  XCircle,
  CreditCard,
  UserCheck2,
  Users,
  Server,
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
  FileText,
  Calendar,
  MoreVertical, Play, Pause, LogOut, Archive
} from "lucide-react";
import { Distributor, UserRole, DistributorPermissions, Currency, DistributorOffer, PermissionProfile } from "../types";
import { DistributorPermissionsFilterable } from "./DistributorPermissionsFilterable";
import PermissionProfilesModal from "./PermissionProfilesModal";
import { PERMISSION_GROUPS, getFullPermissionsObject, getDefaultDistributorPermissions, getEnabledCount, getTotalPermissionsCount } from "../utils/permissions";



interface SubDistributorManagementViewProps {
  distributors: Distributor[];
  distributorOffers?: DistributorOffer[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onAddDistributor: (dist: Omit<Distributor, "id">) => void;
  onDeleteDistributor: (id: string) => void;
  onUpdateDistributor: (dist: Distributor) => void;
  settings?: any;
  onUpdateSettings?: (settings: any) => void;
  allowedDistributorIds?: string[] | null;
  canToggleReadOnlyMode?: boolean;
}

export default function SubDistributorManagementView({
  distributors,
  distributorOffers = [],
  currencies = [],
  defaultCurrency = "LYD",
  onAddDistributor,
  onDeleteDistributor,
  onUpdateDistributor,
  settings,
  onUpdateSettings,
  parentDistributorId,
  allowedDistributorIds,
  canToggleReadOnlyMode
}: SubDistributorManagementViewProps & { parentDistributorId: string }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showProfilesModal, setShowProfilesModal] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "نشط" | "منتهي">("all");
  const [minBalance, setMinBalance] = useState<number | "">("");
  const [maxBalance, setMaxBalance] = useState<number | "">("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const parentDistributor = distributors.find(d => d.id === parentDistributorId);
  const parentPermissions = parentDistributor?.permissions;
  
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

  // Add form state
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.DISTRIBUTOR);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("123456");
  const [phone, setPhone] = useState("");
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [manageBalanceDistributor, setManageBalanceDistributor] = useState<Distributor | null>(null);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [balanceAction, setBalanceAction] = useState<"add" | "deduct">("add");
  const [balanceNotes, setBalanceNotes] = useState<string>("");
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

        const updatedDistributor = {
          ...manageBalanceDistributor,
          balance: isAdding 
            ? manageBalanceDistributor.balance + amount 
            : Math.max(0, manageBalanceDistributor.balance - amount),
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
      let permissionsToApply = { ...profile.permissions };
      
      // Filter applied permissions to only those the parent has
      if (parentPermissions) {
        for (const key in permissionsToApply) {
          if (!parentPermissions[key as keyof DistributorPermissions]) {
            delete permissionsToApply[key as keyof DistributorPermissions];
          }
        }
      }

      if (isEdit) {
        setModalPermissions(permissionsToApply);
        setModalProfileId(profile.id);
      } else {
        setNewPermissions(permissionsToApply);
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
      balance,
      currency: currency || defaultCurrency,
      customersCount: 0,
      salesCount: 0,
      permissions: newPermissions,
      permissionProfileId: newProfileId || undefined,
      subscriptionOfferId: subscriptionOfferId || undefined,
      subscriptionStatus: subscriptionOfferId ? "نشط" : undefined,
      parentDistributorId,
      isReadOnly
    });

    setName("");
    setUsername("");
    setPassword("123456");
    setPhone("");
    setIsReadOnly(false);
    setBalance(100000);
    setRole(UserRole.DISTRIBUTOR);
    setCurrency("");
    setNewPermissions(getDefaultDistributorPermissions());
    setNewProfileId("");
    setSubscriptionOfferId("");
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

  const filteredDistributors = distributors.filter(d => {
    if (d.parentDistributorId !== parentDistributorId) return false;
    if (d.isArchived || d.status === "أرشيف") return false;
    
    // Strict isolation: if allowedDistributorIds is provided, the distributor MUST be in it
    if (allowedDistributorIds && !allowedDistributorIds.includes(d.id)) return false;

    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.phone.includes(searchQuery);
                          
    const matchesStatus = filterStatus === "all" || d.subscriptionStatus === filterStatus || (!d.subscriptionStatus && filterStatus === "نشط");
    const matchesMinBalance = minBalance === "" || d.balance >= Number(minBalance);
    const matchesMaxBalance = maxBalance === "" || d.balance <= Number(maxBalance);

    return matchesSearch && matchesStatus && matchesMinBalance && matchesMaxBalance;
  });

  const totalPermsCount = getTotalPermissionsCount(parentPermissions);

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

            {canToggleReadOnlyMode && (
              <div className="flex flex-col justify-center">
                <label className="flex items-center gap-2 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={isReadOnly}
                    onChange={(e) => setIsReadOnly(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">رؤية فقط (يمنع التعديل)</span>
                </label>
              </div>
            )}

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
          </div>

          {/* Technical Admin Banner */}
          {/* RADIUS & System Permissions Customizer */}
          <div className="bg-slate-50 dark:bg-slate-800 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 dark:border-slate-700">
            <DistributorPermissionsFilterable 
              permissions={newPermissions} 
              onChange={setNewPermissions} 
              isModal={false} 
              allowedPermissions={parentPermissions}
            />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in slide-in-from-top-2">
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
                      {dist.name}
                      {isTechAdmin && <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[9px] rounded-md border border-purple-200 dark:border-purple-800/50">مدير تقني</span>}
                      {dist.isReadOnly && <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-rose-900/50 text-indigo-700 dark:text-indigo-300 text-[9px] rounded-md border border-rose-200 dark:border-rose-800/50">رؤية فقط</span>}
                      {dist.subscriptionStatus === "منتهي" ? (
                        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[9px] rounded-md border border-rose-200 dark:border-rose-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> موقوف</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] rounded-md border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> نشط</span>
                      )}
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
                      className="absolute left-0 top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[70] py-2 text-xs font-bold text-slate-700 dark:text-slate-200 overflow-y-auto max-h-[350px] scroll-smooth overscroll-contain touch-pan-y animate-in fade-in zoom-in-95 duration-100"
                    >
                        <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-extrabold flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                          <span>خيارات الموزع السريعة</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">{dist.username}</span>
                        </div>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            setEditingFullDistributor(dist);
                          }}
                          className="w-full text-right px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-extrabold flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4 text-indigo-500" />
                          1. تعديل بيانات الموزع كاملة
                        </button>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            setBalanceAmount(0);
                            setBalanceAction("add");
                            setBalanceNotes("");
                            setManageBalanceDistributor(dist);
                          }}
                          className="w-full text-right px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-extrabold flex items-center gap-2"
                        >
                          <Coins className="w-4 h-4 text-emerald-500" />
                          2. إدارة الرصيد المالي
                        </button>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            const isCurrentlyActive = dist.subscriptionStatus === "نشط";
                            const newStatus = isCurrentlyActive ? "موقوف" : "نشط";
                            if (window.confirm(`هل أنت متأكد من ${isCurrentlyActive ? "إيقاف الموزع الفرعي مؤقتاً (موقوف)" : "تنشيط حساب الموزع الفرعي"} [${dist.name}]؟`)) {
                              onUpdateDistributor({ ...dist, subscriptionStatus: newStatus });
                              window.alert(`تم ${newStatus === "نشط" ? "تنشيط" : "إيقاف (موقوف)"} الموزع ${dist.name} بنجاح.`);
                            }
                          }}
                          className={`w-full text-right px-3 py-2.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 font-extrabold flex items-center gap-2 ${dist.subscriptionStatus === "نشط" ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}
                        >
                          {dist.subscriptionStatus === "نشط" ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
                          3. {dist.subscriptionStatus === "نشط" ? "إيقاف الموزع مؤقتاً" : "تنشيط حساب الموزع"}
                        </button>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            if (window.confirm(`⛔ هل أنت متأكد من إنهاء اشتراك الموزع [${dist.name}] وتصفير الأيام المتبقية؟`)) {
                              const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                              onUpdateDistributor({ ...dist, subscriptionStatus: "منتهي", expiryDate: yesterdayStr });
                              window.alert(`تم إنهاء اشتراك الموزع [${dist.name}] وتصفير الأيام بنجاح.`);
                            }
                          }}
                          className="w-full text-right px-3 py-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-extrabold flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4 text-rose-500" />
                          إنهاء اشتراك الموزع (تصفير الأيام)
                        </button>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            if (window.confirm(`هل أنت متأكد من طرد الموزع [${dist.name}] من الجلسة النشطة (تسجيل خروج إجباري)؟`)) {
                              window.alert(`تم إرسال أمر تسجيل الخروج الإجباري للموزع ${dist.name} بنجاح.`);
                            }
                          }}
                          className="w-full text-right px-3 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-extrabold flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4 text-orange-500" />
                          4. طرد من الجلسة النشطة
                        </button>

                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            setEditingPermissionsDistributor(dist);
                          }}
                          className="w-full text-right px-3 py-2.5 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-extrabold flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-500" />
                          5. إدارة الصلاحيات والأوامر
                        </button>

                        <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

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
                          className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-extrabold flex items-center gap-2"
                        >
                          <Archive className="w-4 h-4 text-rose-500" />
                          نقل حساب الموزع للأرشيف
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveDropdownDistributor(null);
                            setConfirmModal({
                              isOpen: true,
                              title: "حذف نهائي",
                              message: `هل أنت متأكد من حذف الموزع [${dist.name}] نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
                              confirmText: "حذف نهائي",
                              onConfirm: () => onDeleteDistributor(dist?.id)
                            });
                          }}
                          className="w-full text-right px-3 py-2 hover:bg-rose-100 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                          حذف نهائي من النظام
                        </button>
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
                      {dist.subscriptionStatus === "منتهي" ? (
                        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[9px] rounded-md border border-rose-200 dark:border-rose-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> موقوف</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[9px] rounded-md border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> نشط</span>
                      )}
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
                          title: "تأكيد حذف حساب الموزع",
                          message: `هل أنت متأكد من تعطيل وحذف حساب الموزع [${dist.name}] نهائياً؟`,
                          description: "سيتم إلغاء صلاحياته ومسح حسابه من قائمة الموزعين.",
                          confirmText: "حذف الموزع نهائياً",
                          onConfirm: () => onDeleteDistributor(dist?.id)
                        });
                      }}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"
                      title="حذف الحساب"
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
              allowedPermissions={parentPermissions}
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
                {canToggleReadOnlyMode && (
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-7">
                      <input
                        type="checkbox"
                        checked={editingFullDistributor.isReadOnly || false}
                        onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, isReadOnly: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">رؤية فقط (يمنع التعديل)</span>
                    </label>
                  </div>
                )}

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
                
                {canToggleReadOnlyMode && (
                  <div className="flex flex-col justify-center">
                    <label className="flex items-center gap-2 cursor-pointer mt-5">
                      <input
                        type="checkbox"
                        checked={editingFullDistributor.isReadOnly || false}
                        onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, isReadOnly: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 dark:border-slate-700 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">رؤية فقط (يمنع التعديل)</span>
                    </label>
                  </div>
                )}
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
                    
                 </div>
                 
                 {editingFullDistributor.subscriptionOfferId && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                     <div>
                       <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تاريخ الانتهاء وتاريخ الخصم القادم</label>
                       <input
                         type="date"
                         value={editingFullDistributor.subscriptionEndDate || ""}
                         onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, subscriptionEndDate: e.target.value, subscriptionStatus: "نشط" })}
                         className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                       />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">حالة الاشتراك الحالية</label>
                        <select
                          value={editingFullDistributor.subscriptionStatus || "نشط"}
                          onChange={(e) => setEditingFullDistributor({ ...editingFullDistributor, subscriptionStatus: e.target.value as "نشط" | "منتهي" })}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="نشط">🟢 نشط</option>
                          <option value="منتهي">🔴 منتهي أو موقوف</option>
                        </select>
                     </div>
                   </div>
                 )}
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
