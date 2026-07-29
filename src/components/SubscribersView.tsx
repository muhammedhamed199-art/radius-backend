import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  Users, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Plus, 
  Phone, 
  MapPin, 
  Send, 
  Check, 
  X, 
  UserX, 
  UserCheck, 
  Lock, 
  Smartphone, 
  Share2, 
  AlertTriangle,
  UserPlus,
  Cpu,
  FileSpreadsheet,
  Download,
  Upload,
  MessageSquare,
  SendHorizontal,
  MoreVertical,
  Activity,
  ShieldAlert,
  RefreshCw,
  Play,
  Pause,
  Zap,
  BarChart2,
  ChevronDown,
  Calendar,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  TrendingUp,
  CreditCard,
  DollarSign,
  History,
  CalendarClock,
  ShieldCheck,
  Columns
, FileText, AlertCircle, CheckCircle, XCircle, Globe, Wifi, WifiOff} from "lucide-react";
import { Customer, CustomerStatus, ConnectionType, SpeedOffer, Distributor, NasServer, DeletedCustomer, CustomerCategory, COUNTRIES } from "../types";
import SubscriberImportExportModal from "./SubscriberImportExportModal";
import MessagingGatewayModal from "./MessagingGatewayModal";
import SubscriberLogsModal from "./SubscriberLogsModal";
import Subscriber360Modal from "./Subscriber360Modal";
import AutoRenewSettingsModal from "./AutoRenewSettingsModal";

export interface PingResult {
  status: 'testing' | 'success' | 'failed';
  ip: string;
  latency?: number;
  loss?: number;
  time: string;
  bytes?: number;
  ttl?: number;
  message?: string;
}

export interface ColumnConfig {
  id: string;
  label: string;
}

export const TABLE_COLUMNS: ColumnConfig[] = [
  { id: "name", label: "اسم العميل" },
  { id: "concurrentLogins", label: "حالة الاتصال" },
  { id: "status", label: "الحالة" },
  { id: "connectionType", label: "طريقة الاتصال" },
  { id: "username", label: "اسم الدخول" },
  { id: "ipAddress", label: "الـ IP الممنوح" },
  { id: "offer", label: "العرض المأخوذ" },
  { id: "serverId", label: "السيرفر" },
  { id: "consumptionGB", label: "الاستهلاك" },
  { id: "startDate", label: "تاريخ البدء" },
  { id: "expiryDate", label: "تاريخ الانتهاء" },
  { id: "autoWhatsAppAlert", label: "تنبيه واتساب" },
  { id: "options", label: "الخيارات" },
];

export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  name: true,
  concurrentLogins: true,
  status: true,
  connectionType: true,
  username: true,
  ipAddress: true,
  offer: true,
  serverId: true,
  consumptionGB: true,
  startDate: true,
  expiryDate: true,
  autoWhatsAppAlert: true,
  options: true,
};

interface SubscribersViewProps {
  customers: Customer[];
  deletedCustomers?: DeletedCustomer[];
  offers: SpeedOffer[];
  distributors: Distributor[];
  servers: NasServer[];
  onAddCustomer: (customer: Omit<Customer, "id">) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onBulkDeleteCustomers?: (ids: string[]) => void;
  onRestoreCustomer?: (id: string) => void;
  onRestoreAllTrash?: () => void;
  onBulkRestoreTrash?: (ids: string[]) => void;
  onPermanentDeleteCustomer?: (id: string) => void;
  onBulkPermanentDeleteTrash?: (ids: string[]) => void;
  onEmptyTrash?: () => void;
  onOpenSubscriberPortal?: () => void;
  defaultWhatsAppDelayMessage: string;
  defaultWhatsAppAlertMessage: string;
  onImportCustomers?: (newCustomers: Omit<Customer, "id">[], duplicateMode: "skip" | "overwrite" | "append") => void;
  currentUser?: { id?: string; name: string; role: string; username: string; distributorId?: string };
  isDistributorSession?: boolean;
  initialFilters?: {
    statusFilter?: string;
    onlineFilter?: string;
    debtFilter?: string;
    expiryFilter?: string;
    distributorFilter?: string;
  } | null;
}

export default function SubscribersView({
  customers,
  deletedCustomers = [],
  offers,
  distributors,
  servers,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  onBulkDeleteCustomers,
  onRestoreCustomer,
  onRestoreAllTrash,
  onBulkRestoreTrash,
  onPermanentDeleteCustomer,
  onBulkPermanentDeleteTrash,
  onEmptyTrash,
  onOpenSubscriberPortal,
  defaultWhatsAppDelayMessage,
  defaultWhatsAppAlertMessage,
  onImportCustomers = () => {},
  currentUser,
  isDistributorSession = false,
  initialFilters
}: SubscribersViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showTrashModal, setShowTrashModal] = useState(false);
  const [quickPreviewCustomer, setQuickPreviewCustomer] = useState<Customer | null>(null);
  const [trashSearchQuery, setTrashSearchQuery] = useState("");
  const [trashDaysFilter, setTrashDaysFilter] = useState<string>("all");
  const [trashSortOrder, setTrashSortOrder] = useState<string>("newest");
  const [trashDateFilter, setTrashDateFilter] = useState<string>("");
  const [trashDistributorFilter, setTrashDistributorFilter] = useState<string>("all");
  const [selectedTrashIds, setSelectedTrashIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.statusFilter || "all");
  const [debtFilter, setDebtFilter] = useState<string>(initialFilters?.debtFilter || "all");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const searchInput = document.getElementById('subscribers-search-input');
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [serverFilter, setServerFilter] = useState<string>("all");
  const [offerFilter, setOfferFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [onlineFilter, setOnlineFilter] = useState<string>(initialFilters?.onlineFilter || "all"); // "all", "online", "offline"
  const [expiryFilter, setExpiryFilter] = useState<string>(initialFilters?.expiryFilter || "all"); // "all", "expired", "today", "3_days", "7_days", "custom"
  const [expiryStartDate, setExpiryStartDate] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [distributorFilter, setDistributorFilter] = useState<string>(initialFilters?.distributorFilter || "all");
  const [expiryEndDate, setExpiryEndDate] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.statusFilter !== undefined) setStatusFilter(initialFilters.statusFilter);
      if (initialFilters.onlineFilter !== undefined) setOnlineFilter(initialFilters.onlineFilter);
      if (initialFilters.debtFilter !== undefined) setDebtFilter(initialFilters.debtFilter);
      if (initialFilters.expiryFilter !== undefined) setExpiryFilter(initialFilters.expiryFilter);
      if (initialFilters.distributorFilter !== undefined) setDistributorFilter(initialFilters.distributorFilter);
    }
  }, [initialFilters]);

  // Column Visibility State (Persisted in localStorage)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("subscribers_visible_columns");
      if (saved) {
        return { ...DEFAULT_VISIBLE_COLUMNS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Error loading visible columns from localStorage", e);
    }
    return DEFAULT_VISIBLE_COLUMNS;
  });

  const [showColumnToggleModal, setShowColumnToggleModal] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem("subscribers_visible_columns", JSON.stringify(visibleColumns));
    } catch (e) {
      console.error("Error saving visible columns to localStorage", e);
    }
  }, [visibleColumns]);

  const handleToggleColumn = (colId: string) => {
    setVisibleColumns(prev => ({
      ...prev,
      [colId]: prev[colId] === false ? true : false
    }));
  };

  const handleSelectAllColumns = () => {
    const allOn: Record<string, boolean> = {};
    TABLE_COLUMNS.forEach(col => { allOn[col.id] = true; });
    setVisibleColumns(allOn);
  };

  const handleResetColumns = () => {
    setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
  };

  const visibleColumnsCount = TABLE_COLUMNS.filter(c => visibleColumns[c.id] !== false).length;

  // Selection and Sorting states
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Modals state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);
  const [showMessagingGatewayModal, setShowMessagingGatewayModal] = useState(false);
  const [autoRenewModalCustomer, setAutoRenewModalCustomer] = useState<Customer | null>(null);
  const [messagingSingleCustomer, setMessagingSingleCustomer] = useState<Customer | null>(null);

  // Quick Action & Logs state
  const [logsCustomer, setLogsCustomer] = useState<Customer | null>(null);
  const [full360Customer, setFull360Customer] = useState<Customer | null>(null);
  const [full360Tab, setFull360Tab] = useState<"dashboard" | "renewal" | "usage" | "payments" | "modifications" | "debt" | "actions">("dashboard");

  // Ping Test State
  const [pingResults, setPingResults] = useState<Record<string, PingResult>>({});
  const [activePingPopoverId, setActivePingPopoverId] = useState<string | null>(null);

  const handleRunPingTest = (customer: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const customerId = customer?.id;
    if (!customerId) return;
    const ip = customer.ipAddress || "10.0.0.1";

    setPingResults(prev => ({
      ...prev,
      [customerId]: {
        status: 'testing',
        ip: ip,
        time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
    }));

    setActivePingPopoverId(customerId);

    setTimeout(() => {
      const isOnline = customer.concurrentLogins > 0;
      
      if (isOnline) {
        const latency = 12;
        const loss = 0;
        setPingResults(prev => ({
          ...prev,
          [customerId]: {
            status: 'success',
            ip: ip,
            latency: latency,
            loss: loss,
            bytes: 32,
            ttl: 64,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `استجابة سريعة من ${ip} | زمن الاستجابة ${latency}ms`
          }
        }));
      } else {
        setPingResults(prev => ({
          ...prev,
          [customerId]: {
            status: 'failed',
            ip: ip,
            latency: 0,
            loss: 100,
            time: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            message: `تعذر الاتصال بـ ${ip} (Request Timeout) - العميل غير متصل`
          }
        }));
      }
    }, 700);
  };
  const [activeDropdownCustomer, setActiveDropdownCustomer] = useState<Customer | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null);

  const handleOpenDropdown = (e: React.MouseEvent, customer: Customer) => {
    e.stopPropagation();
    if (activeDropdownCustomer?.id === customer?.id) {
      setActiveDropdownCustomer(null);
      setDropdownPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const menuWidth = 260;
    const menuEstimatedHeight = 460;

    let right = window.innerWidth - rect.right;
    if (right + menuWidth > window.innerWidth - 10) {
      right = window.innerWidth - menuWidth - 10;
    }
    if (right < 10) right = 10;

    let top = rect.bottom + 6;
    if (top + menuEstimatedHeight > window.innerHeight - 10) {
      top = Math.max(10, rect.top - menuEstimatedHeight - 6);
    }

    setDropdownPosition({ top, right });
    setActiveDropdownCustomer(customer);
  };

  useEffect(() => {
    if (!activeDropdownCustomer) return;
    const handleClose = () => {
      setActiveDropdownCustomer(null);
      setDropdownPosition(null);
    };
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [activeDropdownCustomer]);

  // Confirmation Dialog State
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

  const canModifyCustomer = (customer: Customer) => {
    if (!isDistributorSession) return true;
    if (currentUser?.role === 'admin') return true;
    return customer.distributorId === currentUser?.id;
  };

  // Quick inline update with auto-kick if customer is online
  const handleRowClick = (e: React.MouseEvent, customer: Customer) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a') || target.closest('.relative')) {
      return;
    }
    setQuickPreviewCustomer(customer);
  };

  const handleQuickUpdate = (customer: Customer, changes: Partial<Customer>, actionName: string) => {
    if (!canModifyCustomer(customer)) {
      alert("❌ عذراً، لا تملك الصلاحية لتعديل بيانات مشترك تابع لموزع آخر.");
      return;
    }
    const isOnline = customer.concurrentLogins > 0;
    const updatedCustomer: Customer = {
      ...customer,
      ...changes,
      ...(isOnline ? { concurrentLogins: 0 } : {})
    };

    onUpdateCustomer(updatedCustomer);

    if (isOnline) {
      alert(`⚡ تم ${actionName} بنجاح!\n\nنظراً لأن المشترك (${customer.name}) كان متصلاً حالياً، تم طرد وقطع الجلسة النشطة تلقائياً ليقوم السيرفر بتطبيق الإعدادات والسرعة الجديدة فور إعادة الاتصال.`);
    }
  };

  // Kick / Disconnect Active Session
  const handleKickSubscriber = (customer: Customer) => {
    if (!canModifyCustomer(customer)) {
      alert("❌ عذراً، لا تملك الصلاحية لقطع اتصال مشترك تابع لموزع آخر.");
      return;
    }
    if (customer.concurrentLogins === 0) {
      alert(`المشترك [${customer.name}] غير متصل حالياً برواتر الريديوس.`);
      return;
    }

    if (confirm(`هل أنت متأكد من قطع اتصال وطرد المشترك [${customer.name}] من السيرفر فورياً؟`)) {
      const updated: Customer = {
        ...customer,
        concurrentLogins: 0
      };
      onUpdateCustomer(updated);
      alert(`⚡ تم إرسال حزمة PoD (Disconnect-Request) وطرد المشترك [${customer.name}] من الجلسة النشطة بنجاح.`);
    }
  };

  // Renewal Subscriber
  const handleRenewSubscriber = (customer: Customer) => {
    if (!canModifyCustomer(customer)) {
      alert("❌ عذراً، لا تملك الصلاحية لتجديد اشتراك تابع لموزع آخر.");
      return;
    }
    const currExp = new Date(customer.expiryDate || new Date());
    const base = currExp > new Date() ? currExp : new Date();
    base.setDate(base.getDate() + 30);
    const newExpiryStr = base.toISOString().split("T")[0];

    const updated: Customer = {
      ...customer,
      expiryDate: newExpiryStr,
      status: CustomerStatus.ACTIVE
    };
    onUpdateCustomer(updated);
    alert(`✅ تم تجديد اشتراك المشترك [${customer.name}] لمدة 30 يوماً بنجاح!\nتاريخ الانتهاء الجديد: ${newExpiryStr}`);
  };

  // Toggle Status (Pause / Resume)
  const handleToggleStatus = (customer: Customer) => {
    if (!canModifyCustomer(customer)) {
      alert("❌ عذراً، لا تملك الصلاحية لتغيير حالة مشترك تابع لموزع آخر.");
      return;
    }
    const isCurrentlyActive = customer.status === CustomerStatus.ACTIVE;
    const newStatus = isCurrentlyActive ? CustomerStatus.SUSPENDED : CustomerStatus.ACTIVE;
    const isOnline = customer.concurrentLogins > 0;
    const updated: Customer = {
      ...customer,
      status: newStatus,
      ...(newStatus === CustomerStatus.SUSPENDED && isOnline ? { concurrentLogins: 0 } : {})
    };
    onUpdateCustomer(updated);

    if (newStatus === CustomerStatus.SUSPENDED) {
      alert(`🛑 تم إيقاف حساب المشترك [${customer.name}] مؤقتاً (موقوف). لن يتم تفعيله تلقائياً حتى تقوم بتفعيله يدوياً.`);
    } else {
      alert(`▶️ تم إعادة تفعيل وتنشيط خدمة المشترك [${customer.name}] بنجاح (نشط).`);
    }
  };

  // End Subscription (Zero remaining days & set EXPIRED)
  const handleEndSubscription = (customer: Customer) => {
    if (!canModifyCustomer(customer)) {
      alert("❌ عذراً، لا تملك الصلاحية لتغيير حالة مشترك تابع لموزع آخر.");
      return;
    }
    if (!window.confirm(`⛔ هل أنت متأكد من إنهاء اشتراك المشترك [${customer.name}]؟\nسيتم جعل عدد الأيام المتبقية 0 وتعيين حالة الحساب إلى "منتهي الاشتراك".`)) {
      return;
    }
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const isOnline = customer.concurrentLogins > 0;

    const updated: Customer = {
      ...customer,
      status: CustomerStatus.EXPIRED,
      expiryDate: yesterdayStr,
      ...(isOnline ? { concurrentLogins: 0 } : {})
    };
    onUpdateCustomer(updated);
    alert(`❌ تم إنهاء اشتراك المشترك [${customer.name}] وتصفير الأيام المتبقية وطرد أية جلسات نشطة بنجاح.`);
  };

  // Batch Import Handler
  const handleBatchImport = (newCustomers: Omit<Customer, "id">[], duplicateMode: "skip" | "overwrite" | "append") => {
    newCustomers.forEach(cust => {
      const existing = customers.find(c => c.username.trim().toLowerCase() === cust.username.trim().toLowerCase());
      if (existing) {
        if (duplicateMode === "skip") {
          return;
        } else if (duplicateMode === "overwrite") {
          onUpdateCustomer({
            ...existing,
            ...cust,
            id: existing?.id
          });
          return;
        } else if (duplicateMode === "append") {
          cust.username = `${cust.username}_dup`;
        }
      }
      onAddCustomer(cust);
    });
  };

  // Add customer form state
  const [addName, setAddName] = useState("");
  const [addUsername, setAddUsername] = useState("");
  const [addPassword, setAddPassword] = useState("");
  const [addPortalUsername, setAddPortalUsername] = useState("");
  const [addPortalPassword, setAddPortalPassword] = useState("");
  const [addStatus, setAddStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
  const [addType, setAddType] = useState<ConnectionType>(ConnectionType.PPPOE);
  const [addIpAssignmentType, setAddIpAssignmentType] = useState<"auto" | "manual">("auto");
  const [addIpAddress, setAddIpAddress] = useState("192.168.88.");
  const [addOfferId, setAddOfferId] = useState("");
  const [addStartDateMode, setAddStartDateMode] = useState<"now" | "first_connect" | "custom">("now");
  const [addStartDate, setAddStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [addExpiryDate, setAddExpiryDate] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addRegion, setAddRegion] = useState("");
  const [addCountry, setAddCountry] = useState<string>("الكل");
  const [addDebt, setAddDebt] = useState(0);
  const [addCategory, setAddCategory] = useState<CustomerCategory>("عادي");
  const [addMaxConcurrentLogins, setAddMaxConcurrentLogins] = useState(1);
  const [addDistributorId, setAddDistributorId] = useState("");
  const [addMacAddress, setAddMacAddress] = useState("");
  const [addMacBindingType, setAddMacBindingType] = useState<"manual" | "auto" | "disabled">("disabled");
  const [addAuthByMac, setAddAuthByMac] = useState(false);
  const [addServerId, setAddServerId] = useState("");
  const [addRealm, setAddRealm] = useState("realm1.net");

  // Edit customer form state
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPortalUsername, setEditPortalUsername] = useState("");
  const [editPortalPassword, setEditPortalPassword] = useState("");
  const [editStatus, setEditStatus] = useState<CustomerStatus>(CustomerStatus.ACTIVE);
  const [editType, setEditType] = useState<ConnectionType>(ConnectionType.PPPOE);
  const [editIpAssignmentType, setEditIpAssignmentType] = useState<"auto" | "manual">("auto");
  const [editIpAddress, setEditIpAddress] = useState("");
  const [editOfferId, setEditOfferId] = useState("");
  const [editStartDateMode, setEditStartDateMode] = useState<"now" | "first_connect" | "custom">("now");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDurationDays, setEditDurationDays] = useState<number>(30);

  const [editExpiryDate, setEditExpiryDate] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPaymentLink, setEditPaymentLink] = useState("");
  const [editRegion, setEditRegion] = useState("");
  const [editCountry, setEditCountry] = useState<string>("الكل");
  const [editDebt, setEditDebt] = useState(0);
  const [editCategory, setEditCategory] = useState<CustomerCategory>("عادي");
  const [editConcurrentLogins, setEditConcurrentLogins] = useState(1);
  const [editMaxConcurrentLogins, setEditMaxConcurrentLogins] = useState(1);
  const [editDistributorId, setEditDistributorId] = useState("");
  const [editMacAddress, setEditMacAddress] = useState("");
  const [editMacBindingType, setEditMacBindingType] = useState<"manual" | "auto" | "disabled">("disabled");
  const [editAuthByMac, setEditAuthByMac] = useState(false);
  const [editServerId, setEditServerId] = useState("");
  const [editRealm, setEditRealm] = useState("realm1.net");

  // WhatsApp bulk send state
  const [whatsAppTemplateType, setWhatsAppTemplateType] = useState<"delay" | "custom">("delay");
  const [customWhatsAppBody, setCustomWhatsAppBody] = useState("");
  const [whatsAppSendingProgress, setWhatsAppSendingProgress] = useState<"idle" | "sending" | "done">("idle");
  const [whatsappLogs, setWhatsappLogs] = useState<string[]>([]);

  // Default selection set
  useEffect(() => {
    if (offers.length > 0 && !addOfferId) {
      setAddOfferId(offers[0]?.id);
    }
  }, [offers]);

  useEffect(() => {
    if (servers.length > 0 && !addServerId) {
      setAddServerId(servers[0]?.id);
      if (servers[0]?.realm) {
        setAddRealm(servers[0].realm);
      }
    }
  }, [servers]);

  // Sync realm automatically whenever addServerId changes
  useEffect(() => {
    if (addServerId) {
      const selectedServer = servers.find(s => s?.id === addServerId);
      if (selectedServer?.realm) {
        setAddRealm(selectedServer.realm);
      }
    }
  }, [addServerId, servers]);

  // Sync editing fields when customer changes
  useEffect(() => {
    if (editingCustomer) {
      setEditName(editingCustomer.name);
      setEditPhone(editingCustomer.phone || "");
      setEditUsername(editingCustomer.username);
      setEditPassword(editingCustomer.password || "");
      setEditPortalUsername(editingCustomer.portalUsername || "");
      setEditPortalPassword(editingCustomer.portalPassword || "");
      setEditStatus(editingCustomer.status);
      setEditType(editingCustomer.connectionType);
      setEditIpAssignmentType(editingCustomer.ipAssignmentType || (editingCustomer.ipAddress === "تلقائي" ? "auto" : "manual"));
      setEditIpAddress(editingCustomer.ipAddress);
      setEditOfferId(editingCustomer.offerId);
      
      // Determine start date mode
      const initialMode: "now" | "first_connect" | "custom" = editingCustomer.startDateMode || 
        (editingCustomer.startDate === "عند أول اتصال" ? "first_connect" : "now");
      setEditStartDateMode(initialMode);
      setEditStartDate(editingCustomer.startDate || new Date().toISOString().split('T')[0]);
      if (editingCustomer.startDate && editingCustomer.expiryDate && editingCustomer.startDate !== "عند أول اتصال") {
        const start = new Date(editingCustomer.startDate);
        const end = new Date(editingCustomer.expiryDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setEditDurationDays(diffDays);
      } else {
        setEditDurationDays(30);
      }

      setEditExpiryDate(editingCustomer.expiryDate);
      setEditPhone(editingCustomer.phone || "");
      setEditPaymentLink(editingCustomer.paymentLink || "");
      setEditRegion(editingCustomer.region || "");
      setEditCountry(editingCustomer.country || "الكل");
      setEditDebt(editingCustomer.debt || 0);
      setEditConcurrentLogins(editingCustomer.concurrentLogins);
      setEditMaxConcurrentLogins(editingCustomer.maxConcurrentLogins || 1);
      setEditDistributorId(editingCustomer.distributorId || "");
      setEditMacAddress(editingCustomer.macAddress || "");
      setEditMacBindingType(editingCustomer.macBindingType || "disabled");
      setEditAuthByMac(!!editingCustomer.authByMac);
      setEditServerId(editingCustomer.serverId || "");

      const activeServer = servers.find(s => s?.id === editingCustomer.serverId);
      setEditRealm(editingCustomer.realm || activeServer?.realm || "realm1.net");
    }
  }, [editingCustomer, servers]);

  // Extract unique regions for the filter
  const uniqueRegions = useMemo(() => {
    const regions = customers.map(c => c.region).filter(Boolean) as string[];
    return Array.from(new Set(regions)).sort();
  }, [customers]);

  // Active filters count and reset
  const activeFiltersCount = [
    statusFilter !== "all",
    serverFilter !== "all",
    typeFilter !== "all",
    offerFilter !== "all",
    regionFilter !== "all",
    onlineFilter !== "all",
    expiryFilter !== "all",
    debtFilter !== "all",
    categoryFilter !== "all",
    distributorFilter !== "all",
    !!searchQuery.trim()
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setServerFilter("all");
    setTypeFilter("all");
    setOfferFilter("all");
    setRegionFilter("all");
    setOnlineFilter("all");
    setCategoryFilter("all");
    setDistributorFilter("all");
    setExpiryFilter("all");
    setDebtFilter("all");
    setExpiryStartDate("");
    setExpiryEndDate("");
  };

  // WhatsApp Alerts Stats
  const whatsappAlertStats = useMemo(() => {
    let pendingCount = 0;
    let sentCount = 0;

    customers.forEach(c => {
      if (c.autoWhatsAppAlert) {
        // Simple logic for pending: if expiry is soon and no "sent" log for this period, 
        // or just consider all active as potentially pending if not sent
        if (c.status === CustomerStatus.ACTIVE) {
          pendingCount++;
        }
      }
      if (c.autoWhatsAppAlertLogs) {
        sentCount += c.autoWhatsAppAlertLogs.filter(l => l.status === "sent").length;
      }
    });

    return { pendingCount, sentCount };
  }, [customers]);

  const [showAutoAlertLogsModal, setShowAutoAlertLogsModal] = useState<Customer | null>(null);

  // Filtering subscribers
  const filteredCustomers = customers.filter(c => {
    const serverObj = servers.find(s => s?.id === c.serverId);
    const serverName = serverObj?.name || "";
    const serverIp = serverObj?.ipAddress || "";
    const offerObj = offers.find(o => o?.id === c.offerId);
    const offerName = offerObj?.name || "";

    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = c.name.toLowerCase().includes(q);
      const matchesUsername = c.username.toLowerCase().includes(q);
      const matchesPhone = c.phone?.toLowerCase().includes(q) || false;
      const matchesRegion = c.region?.toLowerCase().includes(q) || false;
      const matchesIp = c.ipAddress.includes(q);
      const matchesMac = c.macAddress?.toLowerCase().includes(q) || false;
      const matchesServer = serverName.toLowerCase().includes(q) || serverIp.includes(q);
      const matchesOffer = offerName.toLowerCase().includes(q);
      const matchesStatus = c.status.toLowerCase().includes(q);

      if (!matchesName && !matchesUsername && !matchesPhone && !matchesRegion && !matchesIp && !matchesMac && !matchesServer && !matchesOffer && !matchesStatus) {
        return false;
      }
    }

    // 2. Status Filter
    if (statusFilter !== "all" && c.status !== statusFilter) {
      return false;
    }

    // 2.1 Debt Filter
    if (debtFilter === "debtors") {
      if (!c.debt || c.debt <= 0) return false;
    } else if (debtFilter === "no_debt") {
      if (c.debt && c.debt > 0) return false;
    }

    // 2.5 Category Filter
    if (categoryFilter !== "all" && (c.category || "عادي") !== categoryFilter) {
      return false;
    }

    // 3. Server Filter
    if (serverFilter !== "all") {
      if (serverFilter === "unlinked") {
        if (c.serverId) return false;
      } else if (c.serverId !== serverFilter) {
        return false;
      }
    }

    // 4. Connection Type Filter
    if (typeFilter !== "all" && c.connectionType !== typeFilter) {
      return false;
    }

    // 5. Offer Filter
    if (offerFilter !== "all" && c.offerId !== offerFilter) {
      return false;
    }

    // Region Filter
    if (regionFilter !== "all" && c.region !== regionFilter) {
      return false;
    }

    // Distributor Filter
    if (distributorFilter !== "all") {
      if (distributorFilter === "unassigned") {
        if (c.distributorId) return false;
      } else if (c.distributorId !== distributorFilter) {
        return false;
      }
    }

    // 6. Online / Offline Filter
    if (onlineFilter === "online" && c.concurrentLogins === 0) return false;
    if (onlineFilter === "offline" && c.concurrentLogins > 0) return false;

    // 7. Expiry Date Filter
    if (expiryFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayStr = today.toISOString().split("T")[0];

      let cExpDate: Date | null = null;
      if (c.expiryDate) {
        cExpDate = new Date(c.expiryDate);
        cExpDate.setHours(0, 0, 0, 0);
      }

      if (expiryFilter === "expired") {
        if (c.status === CustomerStatus.EXPIRED || (cExpDate && cExpDate < today)) {
          // match expired
        } else {
          return false;
        }
      } else if (expiryFilter === "today") {
        if (!c.expiryDate || c.expiryDate !== todayStr) return false;
      } else if (expiryFilter === "3_days") {
        const in3 = new Date(today);
        in3.setDate(in3.getDate() + 3);
        if (!cExpDate || cExpDate < today || cExpDate > in3) return false;
      } else if (expiryFilter === "7_days") {
        const in7 = new Date(today);
        in7.setDate(in7.getDate() + 7);
        if (!cExpDate || cExpDate < today || cExpDate > in7) return false;
      } else if (expiryFilter === "custom") {
        if (expiryStartDate) {
          const start = new Date(expiryStartDate);
          start.setHours(0, 0, 0, 0);
          if (!cExpDate || cExpDate < start) return false;
        }
        if (expiryEndDate) {
          const end = new Date(expiryEndDate);
          end.setHours(23, 59, 59, 999);
          if (!cExpDate || cExpDate > end) return false;
        }
      }
    }

    return true;
  });

  // Sorting subscribers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";

    switch (sortField) {
      case "name":
        valA = a.name;
        valB = b.name;
        break;
      case "connectionType":
        valA = a.connectionType;
        valB = b.connectionType;
        break;
      case "username":
        valA = a.username;
        valB = b.username;
        break;
      case "ipAddress":
        valA = a.ipAddress;
        valB = b.ipAddress;
        break;
      case "concurrentLogins":
        valA = a.concurrentLogins;
        valB = b.concurrentLogins;
        break;
      case "offer":
        const offerA = offers.find(o => o?.id === a.offerId)?.name || "";
        const offerB = offers.find(o => o?.id === b.offerId)?.name || "";
        valA = offerA;
        valB = offerB;
        break;
      case "consumptionGB":
        valA = a.consumptionGB;
        valB = b.consumptionGB;
        break;
      case "startDate":
        valA = a.startDate || "";
        valB = b.startDate || "";
        break;
      case "expiryDate":
        valA = a.expiryDate;
        valB = b.expiryDate;
        break;
      case "region":
      case "regionPhone":
        valA = `${a.region || ""} ${a.phone || ""}`;
        valB = `${b.region || ""} ${b.phone || ""}`;
        break;
      case "autoWhatsAppAlert":
        valA = a.autoWhatsAppAlert ? 1 : 0;
        valB = b.autoWhatsAppAlert ? 1 : 0;
        break;
      case "status":
        valA = a.status;
        valB = b.status;
        break;
      case "serverId":
        const sA = servers.find(s => s?.id === a.serverId)?.name || "";
        const sB = servers.find(s => s?.id === b.serverId)?.name || "";
        valA = sA;
        valB = sB;
        break;
      default:
        valA = a.name;
        valB = b.name;
    }



    if (typeof valA === "string" && typeof valB === "string") {
      return sortDirection === "asc" 
        ? valA.localeCompare(valB, "ar", { sensitivity: "base" }) 
        : valB.localeCompare(valA, "ar", { sensitivity: "base" });
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const exportExcel = () => {
    const data = sortedCustomers.map(c => {
      const offerName = offers.find(o => o?.id === c.offerId)?.name || "غير محدد";
      const serverName = servers.find(s => s?.id === c.serverId)?.name || "عام";
      return {
        "اسم المشترك": c.name,
        "اسم المستخدم": c.username,
        "كلمة المرور": c.password || "",
        "رقم الهاتف": c.phone || "",
        "المنطقة": c.region || "",
        "نوع الاتصال": c.connectionType,
        "الباقة والعرض": offerName,
        "السيرفر NAS": serverName,
        "عنوان IP": c.ipAddress || "تلقائي",
        "تاريخ البدء": c.startDate || "",
        "تاريخ الانتهاء": c.expiryDate,
        "الديون": c.debt || 0,
        "الرصيد": c.balance || 0,
        "الحالة": c.status === CustomerStatus.ACTIVE ? "نشط" : c.status === CustomerStatus.EXPIRED ? "منتهي" : "موقوف",
        "عنوان الماك MAC": c.macAddress || ""
      };
    });
    exportToExcel(data, `تصدير_المشتركين_${new Date().toISOString().split("T")[0]}`);
  };

  const exportCSV = () => {
    const data = sortedCustomers.map(c => {
      const offerName = offers.find(o => o?.id === c.offerId)?.name || "غير محدد";
      const serverName = servers.find(s => s?.id === c.serverId)?.name || "عام";
      return {
        "اسم المشترك": c.name,
        "اسم المستخدم": c.username,
        "كلمة المرور": c.password || "",
        "رقم الهاتف": c.phone || "",
        "المنطقة": c.region || "",
        "نوع الاتصال": c.connectionType,
        "الباقة والعرض": offerName,
        "السيرفر NAS": serverName,
        "عنوان IP": c.ipAddress || "تلقائي",
        "تاريخ البدء": c.startDate || "",
        "تاريخ الانتهاء": c.expiryDate,
        "الديون": c.debt || 0,
        "الرصيد": c.balance || 0,
        "الحالة": c.status === CustomerStatus.ACTIVE ? "نشط" : c.status === CustomerStatus.EXPIRED ? "منتهي" : "موقوف",
        "عنوان الماك MAC": c.macAddress || ""
      };
    });
    exportToCSV(data, `تصدير_المشتركين_${new Date().toISOString().split("T")[0]}`);
  };

  const exportPDF = () => {
    const columns = [
      { header: "الحالة", dataKey: "status" },
      { header: "الرصيد", dataKey: "balance" },
      { header: "رقم الهاتف", dataKey: "phone" },
      { header: "بيانات اللوحة", dataKey: "portal" },
      { header: "اسم المستخدم", dataKey: "username" },
      { header: "اسم المشترك", dataKey: "name" },
      { header: "رقم الحساب", dataKey: "id" }
    ];
    const data = sortedCustomers.map(c => ({
      id: c?.id,
      name: c.name,
      username: c.username,
      portal: `${c.portalUsername || "-"} / ${c.portalPassword || "-"}`, 
      phone: c.phone || "غير محدد",
      balance: c.balance || 0,
      status: c.status
    }));
    exportToPDF(data, columns, "subscribers", "قائمة المشتركين");
  };


  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds(sortedCustomers.map(c => c?.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds(prev => [...prev, id]);
    } else {
      setSelectedCustomerIds(prev => prev.filter(x => x !== id));
    }
  };

  const getLoggedInDistributorId = () => {
    if (currentUser?.distributorId) return currentUser.distributorId;
    if (currentUser?.id && distributors.some(d => d.id === currentUser.id)) {
      return currentUser.id;
    }
    if (currentUser?.username) {
      const match = distributors.find(d => d.username?.toLowerCase() === currentUser.username.toLowerCase());
      if (match) return match.id;
    }
    return currentUser?.id || undefined;
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addUsername || !addPassword) {
      alert("يرجى تعبئة الحقول الأساسية!");
      return;
    }

    // Check for duplicate username and password combination for the same distributor
    const loggedInDistId = getLoggedInDistributorId();
    const targetDistId = isDistributorSession ? loggedInDistId : (addDistributorId || undefined);
    const isDup = customers.some(c => 
      c.username.trim().toLowerCase() === addUsername.trim().toLowerCase() &&
      (c.password || "").trim() === addPassword.trim() &&
      c.distributorId === targetDistId
    );

    if (isDup) {
      const distName = distributors.find(d => d?.id === targetDistId)?.name || "مدير النظام الرئيسي";
      alert(`⚠️ خطأ تكرار: لا يمكن تسجيل اسم مستخدم وكلمة مرور مكررة لنفس الموزع المنشئ (${distName})! يُسمح بتكرار الحسابات فقط إذا كان الموزع المنشئ مختلفاً.`);
      return;
    }

    const autoIp = addType === ConnectionType.HOTSPOT || addType === ConnectionType.MAC 
      ? "Auto" 
      : "Auto";

    const computedStartDate = addStartDateMode === "first_connect" 
      ? "عند أول اتصال" 
      : (addStartDateMode === "now" ? new Date().toISOString().split('T')[0] : addStartDate);

    const activeServerObj = servers.find(s => s?.id === addServerId);
    const targetRealm = addRealm || activeServerObj?.realm || "realm1.net";

    onAddCustomer({
      name: addName,
      username: addUsername,
      password: addPassword,
      portalUsername: addPortalUsername,
      portalPassword: addPortalPassword,
      status: addStatus,
      connectionType: addType,
      ipAddress: addIpAssignmentType === "auto" ? autoIp : addIpAddress,
      ipAssignmentType: addIpAssignmentType,
      concurrentLogins: 0,
      maxConcurrentLogins: addMaxConcurrentLogins,
      offerId: addOfferId,
      consumptionGB: 0,
      startDate: computedStartDate,
      startDateMode: addStartDateMode,
      expiryDate: addExpiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      phone: addPhone,
      region: addRegion,
      country: addCountry,
      debt: addDebt,
      balance: 0,
      distributorId: targetDistId,
      macAddress: addMacBindingType === "manual" ? addMacAddress : undefined,
      macBindingType: addMacBindingType,
      authByMac: addAuthByMac,
      serverId: addServerId || undefined,
      realm: targetRealm,
      category: addCategory
    });

    // Reset fields
    setAddName("");
    setAddUsername("");
    setAddPassword("");
    setAddPortalUsername("");
    setAddPortalPassword("");
    setAddPhone("");
    setAddRegion("");
    setAddDebt(0);
    setAddDistributorId("");
    setAddMacAddress("");
    setAddMacBindingType("disabled");
    setAddAuthByMac(false);
    setAddIpAssignmentType("auto");
    setAddIpAddress("192.168.88.");
    setAddStartDateMode("now");
    setAddStartDate(new Date().toISOString().split('T')[0]);
    setAddServerId(servers[0]?.id || "");
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;

    if (!canModifyCustomer(editingCustomer)) {
      alert("❌ عذراً، لا تملك الصلاحية لتعديل بيانات مشترك تابع لموزع آخر.");
      return;
    }

    if (!editName || !editUsername || !editPassword) {
      alert("يرجى تعبئة الحقول الأساسية!");
      return;
    }

    // Check for duplicate username and password combination for the same distributor
    const targetDistId = editDistributorId || undefined;
    const isDup = customers.some(c => 
      c?.id !== editingCustomer?.id &&
      c.username.trim().toLowerCase() === editUsername.trim().toLowerCase() &&
      (c.password || "").trim() === editPassword.trim() &&
      c.distributorId === targetDistId
    );

    if (isDup) {
      const distName = distributors.find(d => d?.id === targetDistId)?.name || "مدير النظام الرئيسي";
      alert(`⚠️ خطأ تكرار: لا يمكن تسجيل اسم مستخدم وكلمة مرور مكررة لنفس الموزع المنشئ (${distName})! يُسمح بتكرار الحسابات فقط إذا كان الموزع المنشئ مختلفاً.`);
      return;
    }

    const autoIp = editType === ConnectionType.HOTSPOT || editType === ConnectionType.MAC 
      ? "Auto" 
      : "Auto";

    const finalIp = editIpAssignmentType === "auto" 
      ? (editingCustomer.ipAssignmentType === "auto" && editingCustomer.ipAddress ? editingCustomer.ipAddress : autoIp)
      : editIpAddress;

    const computedEditStartDate = editStartDateMode === "first_connect" 
      ? "عند أول اتصال" 
      : (editStartDateMode === "now" ? new Date().toISOString().split('T')[0] : editStartDate);

    const activeEditServerObj = servers.find(s => s?.id === editServerId);
    const targetEditRealm = editRealm || activeEditServerObj?.realm || editingCustomer.realm || "realm1.net";

    onUpdateCustomer({
      ...editingCustomer,
      name: editName,
      username: editUsername,
      password: editPassword,
      portalUsername: editPortalUsername,
      portalPassword: editPortalPassword,
      status: editStatus,
      connectionType: editType,
      ipAddress: finalIp,
      ipAssignmentType: editIpAssignmentType,
      offerId: editOfferId,
      startDate: computedEditStartDate,
      startDateMode: editStartDateMode,
      expiryDate: editExpiryDate,
      phone: editPhone,
      paymentLink: editPaymentLink,
      region: editRegion,
      country: editCountry,
      debt: editDebt,
      concurrentLogins: editConcurrentLogins,
      maxConcurrentLogins: editMaxConcurrentLogins,
      distributorId: targetDistId,
      macAddress: editMacBindingType === "manual" ? editMacAddress : (editMacBindingType === "disabled" ? undefined : editingCustomer.macAddress),
      macBindingType: editMacBindingType,
      authByMac: editAuthByMac,
      serverId: editServerId || undefined,
      realm: targetEditRealm,
      category: editCategory
    });

    setEditingCustomer(null);
    setEditServerId("");
  };

  // Substitute parameters in WhatsApp templates
  const renderMessageText = (template: string, customer: Customer) => {
    const offer = offers.find(o => o?.id === customer.offerId);
    return template
      .replace(/{name}/g, customer.name)
      .replace(/{username}/g, "")
      .replace(/{expiryDate}/g, customer.expiryDate)
      .replace(/{consumption}/g, customer.consumptionGB.toFixed(1))
      .replace(/{offer}/g, offer ? offer.name : "");
  };

  // Simulate bulk WhatsApp sending
  const handleSendWhatsAppBulk = () => {
    if (selectedCustomerIds.length === 0) return;
    
    setWhatsAppSendingProgress("sending");
    setWhatsappLogs([]);

    let idx = 0;
    const targets = customers.filter(c => selectedCustomerIds.includes(c?.id));

    const sendInterval = setInterval(() => {
      if (idx < targets.length) {
        const client = targets[idx];
        const rawTemplate = whatsAppTemplateType === "delay" ? defaultWhatsAppDelayMessage : customWhatsAppBody;
        const msg = renderMessageText(rawTemplate, client);
        
        setWhatsappLogs(prev => [
          ...prev,
          `✅ جاري إرسال الإشعار لـ [${client.name}] على الرقم: (${client.phone || "لا يوجد هاتف"})...`
        ]);
        idx++;
      } else {
        clearInterval(sendInterval);
        setWhatsAppSendingProgress("done");
        setTimeout(() => {
          setShowWhatsAppModal(false);
          setWhatsAppSendingProgress("idle");
          setSelectedCustomerIds([]);
        }, 2000);
      }
    }, 800);
  };

  const renderSortableHeader = (label: string, field: string, hiddenClass: string = "") => {
    if (visibleColumns[field] === false) return null;
    const isSorted = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)} 
        className={`px-2.5 py-2.5 cursor-pointer select-none hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-extrabold text-xs whitespace-normal min-w-[80px] break-words group text-right border border-slate-300 dark:border-slate-700 ${hiddenClass}`}
      >
        <div className="flex items-center gap-1 justify-between">
          <span>{label}</span>
          <span className={`text-[9px] transition-all duration-200 ${isSorted ? "text-indigo-600 opacity-100 font-bold" : "text-slate-400 opacity-40 group-hover:opacity-80"}`}>
            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title section */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5 overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="p-2.5 sm:p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 border border-indigo-100 dark:border-indigo-800/30 mt-1">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="flex-1 min-w-0 space-y-1 pt-0.5">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                إدارة العملاء والمشتركين في الريديوس
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed whitespace-normal">
                إضافة وتعديل المشتركين، مراجعة وتعديل بيانات الاتصال (العنوان والمنطقة والهاتف)، مع محرك إرسال الرسائل الجماعية عبر WhatsApp.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800/80 shrink-0 w-fit">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">تم إرسالها بنجاح</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-100">{whatsappAlertStats.sentCount} رسالة</div>
              </div>
            </div>
            <div className="w-px h-7 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 flex items-center justify-center">
                <History className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">رسائل معلقة</div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-100">{whatsappAlertStats.pendingCount} رسالة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar - Contained cleanly inside card with responsive flex wrap */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-start gap-2.5 w-full">
          {onOpenSubscriberPortal && (
            <button
              onClick={onOpenSubscriberPortal}
              className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-slate-900 font-extrabold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap"
              title="الانتقال إلى بوابة الخدمة الذاتية وتجديد الاشتراكات المباشرة للمشتركين"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>بوابة التجديد الذاتي ⚡</span>
            </button>
          )}

          <button
            onClick={() => {
              setMessagingSingleCustomer(null);
              setShowMessagingGatewayModal(true);
            }}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap"
            title="بوابات إرسال الرسائل والتنبيهات القصيرة عبر واتساب والـ SMS والتلجرام"
          >
            <SendHorizontal className="w-3.5 h-3.5 text-emerald-200" />
            <span>بوابات الرسائل والإشعارات 📱</span>
          </button>

          <button
            onClick={() => setShowTrashModal(true)}
            className="px-3 py-2 bg-rose-50 hover:bg-indigo-100 dark:bg-rose-900/20 dark:hover:bg-rose-900/40 text-indigo-700 dark:text-indigo-300 border border-rose-200 dark:border-rose-800/50 font-bold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
            title="سلة المهملات للمشتركين المحذوفين مؤقتاً"
          >
            <Trash2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>سلة المهملات</span>
            {deletedCustomers.length > 0 && (
              <span className="bg-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center animate-pulse">
                {deletedCustomers.length}
              </span>
            )}
          </button>

          {selectedCustomerIds.length > 0 && (
            <>
              <button
                onClick={() => {
                  setMessagingSingleCustomer(null);
                  setShowMessagingGatewayModal(true);
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>إرسال للمحددين ({selectedCustomerIds.length})</span>
              </button>

              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "تأكيد نقل المشتركين المحددين إلى سلة المهملات",
                    message: `هل أنت متأكد من نقل المشتركين المحددين (${selectedCustomerIds.length}) إلى سلة المهملات؟`,
                    description: "سيتم تعطيل اشتراكاتهم ونقلهم إلى سلة المهملات، ويمكنك استعادتهم لاحقاً خلال 30 يوماً.",
                    confirmText: "نقل إلى سلة المهملات",
                    onConfirm: () => {
                      if (onBulkDeleteCustomers) {
                        onBulkDeleteCustomers(selectedCustomerIds);
                      } else {
                        selectedCustomerIds.forEach(id => onDeleteCustomer(id));
                      }
                      setSelectedCustomerIds([]);
                    }
                  });
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap"
                title="نقل جميع المشتركين المحددين إلى سلة المهملات"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>حذف المحددين ({selectedCustomerIds.length})</span>
              </button>
            </>
          )}

          <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-[11px] md:text-xs transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap" title="تصدير إلى Excel">
            <FileSpreadsheet className="w-3.5 h-3.5" /> <span>إكسيل</span>
          </button>
          
          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-indigo-700 hover:bg-indigo-100 dark:bg-rose-900/30 dark:text-indigo-400 rounded-xl font-bold text-[11px] md:text-xs transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 shrink-0 whitespace-nowrap" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5" /> <span>PDF</span>
          </button>
          
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] md:text-xs transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 shrink-0 whitespace-nowrap" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5" /> <span>CSV</span>
          </button>

          <button
            onClick={() => setShowImportExportModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-slate-800 via-indigo-900 to-slate-900 hover:from-slate-700 hover:to-indigo-800 text-white font-extrabold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0 whitespace-nowrap border border-slate-700"
            title="مركز استيراد وتصدير المشتركين بجميع صيغ لينكس Linux (FreeRADIUS Users / SQL / RouterOS / CSV / Excel)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>استيراد / تصدير (Linux & Excel) 🐧</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] md:text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-100/50 shrink-0 whitespace-nowrap ms-auto"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>إضافة مشترك جديد</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200 dark:border-slate-700/80 space-y-3">
        {/* Main Search Row */}
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="relative w-full lg:flex-1">
            <input
              id="subscribers-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم، اسم الدخول، الهاتف... (اختصار: Ctrl+F)"
              className="w-full pl-9 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 transition-all shadow-inner font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute left-3 top-2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-200 dark:bg-slate-700 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Buttons & Quick Filter Toggle */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-between lg:justify-end">
            <button
              onClick={() => setShowColumnToggleModal(!showColumnToggleModal)}
              className={`px-3 py-2 rounded-xl text-[11px] md:text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                showColumnToggleModal
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
              title="تخصيص وإخفاء/إظهار أعمدة جدول المشتركين"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-500" />
              <span>الأعمدة ({visibleColumnsCount}/{TABLE_COLUMNS.length})</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showColumnToggleModal ? "rotate-180" : ""}`} />
            </button>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 rounded-xl text-[11px] md:text-xs font-extrabold flex items-center gap-1.5 border transition-all ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>البحث والتصفية المتقدمة</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] flex items-center justify-center font-extrabold animate-pulse">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvancedFilters ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {/* Column Toggle / Customizer Panel */}
        {showColumnToggleModal && (
          <div className="p-3.5 bg-indigo-50/70 dark:bg-slate-800/90 rounded-2xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 dark:border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Columns className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                  تخصيص وإخفاء/إظهار أعمدة الجدول:
                </h4>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-black">
                  {visibleColumnsCount} / {TABLE_COLUMNS.length} ظاهرة
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllColumns}
                  className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1 transition-all"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  إظهار الكل
                </button>
                <button
                  type="button"
                  onClick={handleResetColumns}
                  className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-3 h-3 text-slate-500" />
                  افتراضي
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumnToggleModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 pt-0.5">
              {TABLE_COLUMNS.map((col) => {
                const isVisible = visibleColumns[col.id] !== false;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => handleToggleColumn(col.id)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-extrabold transition-all border text-right select-none ${
                      isVisible
                        ? "bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-200 dark:ring-indigo-900/50"
                        : "bg-slate-100/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-400 line-through opacity-60"
                    }`}
                  >
                    <span className="truncate pl-1">{col.label}</span>
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                      isVisible ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-transparent"
                    }`}>
                      <Check className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              * يتم حفظ تفضيلات الأعمدة تلقائياً في ذاكرة المتصفح (localStorage) لجميع الجلسات القادمة.
            </p>
          </div>
        )}

        {/* Quick Filters */}
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-3 border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل الحالات</option>
            <option value={CustomerStatus.ACTIVE}>نشط 🟢</option>
            <option value={CustomerStatus.SUSPENDED}>موقف 🟡</option>
            <option value={CustomerStatus.EXPIRED}>منتهي 🔴</option>
          </select>

          <select
            value={debtFilter}
            onChange={(e) => setDebtFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل المديونيات</option>
            <option value="debtors">المدينون فقط 💰</option>
            <option value="no_debt">خالي من الديون</option>
          </select>

          <select
            value={distributorFilter}
            onChange={(e) => setDistributorFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[130px]"
            title="تصفية قائمة المشتركين حسب الموزع المنشئ"
          >
            <option value="all">👤 الموزع المنشئ (الكل)</option>
            <option value="unassigned">بدون موزع (المالك / مباشر)</option>
            {distributors.map(dist => {
              const count = customers.filter(c => c.distributorId === dist.id).length;
              return (
                <option key={dist.id} value={dist.id}>
                  الموزع: {dist.name} ({count} عميل)
                </option>
              );
            })}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل التصنيفات</option>
            <option value="عادي">عادي</option>
            <option value="تجريبي">تجريبي</option>
            <option value="برونزي">برونزي</option>
            <option value="فضي">فضي</option>
            <option value="ذهبي">ذهبي</option>
          </select>

          <select
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل السيرفرات</option>
            <option value="unlinked">غير مرتبط</option>
            {servers.map(srv => (
              <option key={srv?.id} value={srv?.id}>{srv.name}</option>
            ))}
          </select>

          <select
            value={offerFilter}
            onChange={(e) => setOfferFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل الباقات</option>
            {offers.map(off => (
              <option key={off?.id} value={off?.id}>{off.name}</option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-3 py-2 w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none flex-1 min-w-[120px]"
          >
            <option value="all">كل المناطق</option>
            {uniqueRegions.map(reg => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto pt-2">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 bg-rose-50 hover:bg-indigo-100 dark:bg-rose-900/20 dark:text-indigo-400 dark:border-rose-800 text-indigo-700 border border-rose-200 text-[11px] font-extrabold rounded-xl transition-all flex items-center gap-1.5"
                title="إعادة ضبط وتفريغ كل محددات الفلترة"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                إعادة ضبط
              </button>
            )}

            <div className="text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
              النتائج: <span className="text-indigo-600 font-extrabold font-mono text-sm">{filteredCustomers.length}</span> / {customers.length}
            </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200 dark:border-slate-800 text-xs font-extrabold">
          <span className="text-slate-400 text-[11px] ml-1">تصفية سريعة:</span>
          
          <button
            onClick={() => {
              setStatusFilter("all");
              setExpiryFilter("all");
              setOnlineFilter("all");
              setDebtFilter("all");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === "all" && expiryFilter === "all" && onlineFilter === "all" && debtFilter === "all"
                ? "bg-slate-800 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700"
            }`}
          >
            الكل ({customers.length})
          </button>

          <button
            onClick={() => setStatusFilter(CustomerStatus.ACTIVE)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === CustomerStatus.ACTIVE
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            نشط فقط 🟢
          </button>

          <button
            onClick={() => setStatusFilter(CustomerStatus.SUSPENDED)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === CustomerStatus.SUSPENDED
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            موقوف مؤقتاً 🟡
          </button>

          <button
            onClick={() => setStatusFilter(CustomerStatus.EXPIRED)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              statusFilter === CustomerStatus.EXPIRED
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            منتهي الاشتراك 🔴
          </button>

          <button
            onClick={() => {
              setDebtFilter("debtors");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              debtFilter === "debtors"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            المدينون 💰
          </button>

          <button
            onClick={() => {
              setExpiryFilter("3_days");
              setStatusFilter("all");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              expiryFilter === "3_days"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            ينتهي خلال 3 أيام ⏳
          </button>

          <button
            onClick={() => {
              setOnlineFilter("online");
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              onlineFilter === "online"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
            }`}
          >
            متصل أونلاين ⚡
          </button>

          {distributorFilter !== "all" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-extrabold border border-indigo-200 dark:border-indigo-800 animate-in fade-in">
              <span>
                الموزع: {distributorFilter === "unassigned" ? "بدون موزع (المالك)" : (distributors.find(d => d.id === distributorFilter)?.name || distributorFilter)}
              </span>
              <button
                onClick={() => setDistributorFilter("all")}
                className="p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full transition-colors"
                title="إلغاء فلتر الموزع"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Expandable Advanced Filtering Controls Panel */}
        {showAdvancedFilters && (
          <div className="px-2 py-2 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                خيارات البحث المتقدم الشاملة
              </h4>
              <button
                onClick={handleResetFilters}
                className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                مسح الخيارات
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              
              {/* Creator Distributor Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                  الموزع المنشئ / التابع له:
                </label>
                <select
                  value={distributorFilter}
                  onChange={(e) => setDistributorFilter(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">جميع الموزعين المنشئين (الكل)</option>
                  <option value="unassigned">مشتركون بدون موزع (المالك مباشرة)</option>
                  {distributors.map(dist => {
                    const distCustCount = customers.filter(c => c.distributorId === dist.id).length;
                    return (
                      <option key={dist.id} value={dist.id}>
                        {dist.name} - ({distCustCount} مشترك)
                      </option>
                    );
                  })}
                </select>
              </div>
              
              {/* 3. Expiry Date Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  تاريخ انتهاء الاشتراك:
                </label>
                <select
                  value={expiryFilter}
                  onChange={(e) => setExpiryFilter(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">جميع تواريخ الانتهاء</option>
                  <option value="expired">منتهي الاشتراك بالفعل</option>
                  <option value="today">ينتهي اليوم</option>
                  <option value="3_days">ينتهي خلال 3 أيام</option>
                  <option value="7_days">ينتهي خلال 7 أيام</option>
                  <option value="custom">نطاق تاريخ انتهاء مخصص...</option>
                </select>
              </div>

              {/* 4. Active Session Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-indigo-500" />
                  حالة الاتصال أونلاين:
                </label>
                <select
                  value={onlineFilter}
                  onChange={(e) => setOnlineFilter(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">الكل (متصل وغير متصل)</option>
                  <option value="online">متصل أونلاين الآن 🟢</option>
                  <option value="offline">غير متصل أوفلاين 🔴</option>
                </select>
              </div>

              {/* 6. Connection Type Filter */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  طريقة الاتصال:
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="all">جميع طرق الاتصال</option>
                  <option value={ConnectionType.PPPOE}>برودباند PPPoE</option>
                  <option value={ConnectionType.HOTSPOT}>هوت سبوت Hotspot</option>
                  <option value={ConnectionType.MAC}>ماك ادريس MAC</option>
                  <option value={ConnectionType.MIXED}>متعدد Mixed</option>
                </select>
              </div>

            </div>

            {/* Custom Date Range Pickers if expiryFilter === "custom" */}
            {expiryFilter === "custom" && (
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                <span className="text-xs font-bold text-amber-800">تحديد تاريخ انتهاء الاشتراك بين:</span>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">من:</span>
                  <input
                    type="date"
                    value={expiryStartDate}
                    onChange={(e) => setExpiryStartDate(e.target.value)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-bold">إلى:</span>
                  <input
                    type="date"
                    value={expiryEndDate}
                    onChange={(e) => setExpiryEndDate(e.target.value)}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Customers Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh] max-w-full">
          <table className="w-full text-right border-collapse border border-slate-300 dark:border-slate-700 text-xs md:text-sm min-w-[1300px]">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold">
                <th className="px-1 py-2 text-xs md:text-sm w-8 text-center border border-slate-300 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={sortedCustomers.length > 0 && selectedCustomerIds.length === sortedCustomers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-1 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400 border border-slate-300 dark:border-slate-700">#</th>
                {renderSortableHeader("اسم العميل", "name", "")}
                {renderSortableHeader("حالة الاتصال", "concurrentLogins", "")}
                {renderSortableHeader("الحالة", "status", "")}
                {renderSortableHeader("طريقة الاتصال", "connectionType", "")}
                {renderSortableHeader("اسم الدخول", "username", "")}
                {renderSortableHeader("الـ IP الممنوح", "ipAddress", "")}
                
                {renderSortableHeader("العرض المأخوذ", "offer", "")}
                {renderSortableHeader("السيرفر", "serverId", "")}
                {renderSortableHeader("الاستهلاك", "consumptionGB", "")}
                {renderSortableHeader("تاريخ البدء", "startDate", "")}
                {renderSortableHeader("تاريخ الانتهاء", "expiryDate", "")}
                {renderSortableHeader("تنبيه واتساب", "autoWhatsAppAlert", "")}
                {visibleColumns["options"] !== false && (
                  <th className="px-2 py-3 text-xs md:text-sm text-center w-36 border border-slate-300 dark:border-slate-700">الخيارات</th>
                )}
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={2 + visibleColumnsCount} className="p-8 text-center text-slate-400 font-medium">
                    لا يوجد عملاء مطابقون للبحث والفلترة حالياً.
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer, index) => {
                  const isSelected = selectedCustomerIds.includes(customer?.id);
                  const offer = offers.find(o => o?.id === customer.offerId);

                  return (
                    <tr 
                      key={customer?.id} 
                      onClick={(e) => handleRowClick(e, customer)}
                      className={`cursor-pointer transition-colors ${
                        isSelected 
                          ? "bg-indigo-50/50 dark:bg-indigo-950/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/60" 
                          : index % 2 === 0 
                            ? "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60" 
                            : "bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap border border-slate-200 dark:border-slate-800">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={(e) => handleSelectOne(customer?.id, e.target.checked)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] w-8 border border-slate-200 dark:border-slate-800">
                        {index + 1}
                      </td>
                      {visibleColumns["name"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-medium relative whitespace-nowrap min-w-[200px] border border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col gap-1 mt-0.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleOpenDropdown(e, customer)}
                                className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-md transition-all font-bold"
                                title="قائمة خيارات وإجراءات المشترك السريعة"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setEditingCustomer(customer); }}
                                className="font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline text-right transition-all flex items-center gap-2"
                                title={`تعديل بيانات المشترك (${customer.name})`}
                              >
                                <div className="flex flex-col gap-1 items-start">
                                  <span className="text-base sm:text-lg">{customer.name}</span>
                                {customer.category && customer.category !== "عادي" && (
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${
                                    customer.category === "ذهبي" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                                    customer.category === "فضي" ? "bg-slate-200 text-slate-700 border-slate-300" :
                                    customer.category === "برونزي" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                    "bg-indigo-100 text-indigo-700 border-indigo-200"
                                  }`}>
                                    {customer.category}
                                  </span>
                                )}
                              </div>
                            </button>
                            </div>
                            {customer.debt && customer.debt > 0 ? (
                              <span className="block text-[10px] text-amber-600 font-bold">مدين بـ: {customer.debt.toLocaleString()} ل.س</span>
                            ) : null}
                            <span className="inline-flex text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.5 rounded-md font-bold w-max">
                              المنشئ: {distributors.find(d => d?.id === customer.distributorId)?.name || "مدير النظام الرئيسي"}
                            </span>
                          </div>
                        </td>
                      )}
                      {visibleColumns["concurrentLogins"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap text-center border border-slate-200 dark:border-slate-800 relative">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-1.5 justify-center">
                              {customer.concurrentLogins > 0 ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 px-2 py-0.5 rounded-full text-[11px] font-black shadow-xs">
                                  <span className="relative flex h-2 w-2 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                  </span>
                                  <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                  <span>متصل</span>
                                  {customer.concurrentLogins > 1 && (
                                    <span className="text-[9px] bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 px-1 rounded-full font-extrabold">
                                      ({customer.concurrentLogins})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                                  <WifiOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>غير متصل</span>
                                </span>
                              )}

                              {/* Ping Test Button */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  if (activePingPopoverId === customer.id) {
                                    setActivePingPopoverId(null);
                                  } else {
                                    handleRunPingTest(customer, e);
                                  }
                                }}
                                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-extrabold transition-all border flex items-center gap-0.5 shadow-xs ${
                                  pingResults[customer.id]?.status === 'testing'
                                    ? 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse'
                                    : pingResults[customer.id]?.status === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : pingResults[customer.id]?.status === 'failed'
                                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-indigo-300 border-indigo-200 dark:border-slate-700'
                                }`}
                                title={`إجراء فحص Ping لعنوان IP (${customer.ipAddress || 'تلقائي'})`}
                              >
                                {pingResults[customer.id]?.status === 'testing' ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                                ) : (
                                  <Activity className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                                )}
                                <span>Ping</span>
                              </button>
                            </div>

                            {customer.serverId && (
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                                <span>{servers.find(s => s?.id === customer.serverId)?.name || "سيرفر نشط"}</span>
                                <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[8px] px-1 py-0.5 rounded font-mono font-bold">
                                  @{customer.realm || servers.find(s => s?.id === customer.serverId)?.realm || "realm1.net"}
                                </span>
                              </span>
                            )}

                            {/* Ping Result Tooltip Popover */}
                            {activePingPopoverId === customer.id && pingResults[customer.id] && (
                              <div 
                                onClick={(e) => e.stopPropagation()}
                                className="absolute z-40 top-full mt-1 right-1/2 translate-x-1/2 w-64 bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-slate-700 text-right animate-in fade-in zoom-in-95 duration-150"
                              >
                                {/* Arrow pointing up */}
                                <div className="absolute -top-2 right-1/2 translate-x-1/2 border-b-8 border-b-slate-900 border-x-8 border-x-transparent"></div>

                                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                                  <span className="text-xs font-black text-indigo-400 flex items-center gap-1">
                                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                    نتيجة فحص Ping التلقائي
                                  </span>
                                  <button 
                                    onClick={() => setActivePingPopoverId(null)}
                                    className="text-slate-400 hover:text-white p-0.5 rounded-lg transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="space-y-1.5 text-[11px]">
                                  <div className="flex justify-between items-center bg-slate-800/80 px-2.5 py-1 rounded-xl">
                                    <span className="text-slate-400">عنوان الـ IP:</span>
                                    <span className="font-mono text-amber-300 font-black dir-ltr">{pingResults[customer.id].ip}</span>
                                  </div>

                                  {pingResults[customer.id].status === 'testing' ? (
                                    <div className="flex items-center justify-center gap-2 py-2 text-amber-400 font-bold">
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      جاري فحص الاستجابة عبر الشبكة...
                                    </div>
                                  ) : pingResults[customer.id].status === 'success' ? (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">حالة الاستجابة:</span>
                                        <span className="text-emerald-400 font-black flex items-center gap-1">
                                          <CheckCircle className="w-3 h-3" /> متصل (Reply OK)
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">زمن التأخير (Latency):</span>
                                        <span className="font-mono text-emerald-300 font-extrabold">{pingResults[customer.id].latency} ms</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">فقدان الحزم:</span>
                                        <span className="font-mono text-emerald-400 font-bold">{pingResults[customer.id].loss}%</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">حالة الاستجابة:</span>
                                        <span className="text-rose-400 font-black flex items-center gap-1">
                                          <XCircle className="w-3 h-3" /> تعذر الوصول (Timeout)
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-400">فقدان الحزم:</span>
                                        <span className="font-mono text-rose-400 font-bold">100% Packet Loss</span>
                                      </div>
                                    </>
                                  )}

                                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                                    <span>الوقت: {pingResults[customer.id].time}</span>
                                    <button
                                      onClick={(e) => handleRunPingTest(customer, e)}
                                      className="text-indigo-400 hover:text-indigo-300 font-bold underline flex items-center gap-1"
                                    >
                                      <RefreshCw className="w-2.5 h-2.5" /> إعادة الفحص
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns["status"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col gap-1.5 items-center justify-center">
                            {customer.status === CustomerStatus.ACTIVE ? (
                              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1"><CheckCircle className="w-3 h-3" /> فعال</span>
                            ) : customer.status === CustomerStatus.EXPIRED ? (
                              <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1"><XCircle className="w-3 h-3" /> منتهي</span>
                            ) : (
                              <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1"><AlertCircle className="w-3 h-3" /> موقوف</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns["connectionType"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center gap-1.5 justify-center" onClick={e => e.stopPropagation()}>
                            {customer.connectionType === ConnectionType.PPPOE ? <Globe className="w-4 h-4 text-sky-500" /> : <Wifi className="w-4 h-4 text-emerald-500" />}
                            <select
                              value={customer.connectionType}
                              onChange={(e) => onUpdateCustomer({ ...customer, connectionType: e.target.value as ConnectionType })}
                              className="bg-transparent font-extrabold text-slate-700 dark:text-slate-300 text-[10px] outline-none cursor-pointer focus:ring-0 appearance-none text-center"
                              title="تغيير طريقة الاتصال"
                            >
                              <option value={ConnectionType.PPPOE}>{ConnectionType.PPPOE}</option>
                              <option value={ConnectionType.HOTSPOT}>{ConnectionType.HOTSPOT}</option>
                              <option value={ConnectionType.MIXED}>{ConnectionType.MIXED}</option>
                              <option value={ConnectionType.MAC}>{ConnectionType.MAC}</option>
                            </select>
                          </div>
                        </td>
                      )}
                      {visibleColumns["username"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-mono text-indigo-600 dark:text-indigo-400 whitespace-nowrap min-w-[120px] font-bold border border-slate-200 dark:border-slate-800" dir="ltr">
                          {customer.username}
                        </td>
                      )}
                      {visibleColumns["ipAddress"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[120px] border border-slate-200 dark:border-slate-800" dir="ltr">
                          {customer.ipAddress || "-"}
                        </td>
                      )}
                      {visibleColumns["offer"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 whitespace-nowrap min-w-[120px] border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                          <select
                            value={customer.offerId || ""}
                            onChange={(e) => onUpdateCustomer({ ...customer, offerId: e.target.value })}
                            className="bg-transparent outline-none cursor-pointer focus:ring-0 max-w-[100px] text-ellipsis appearance-none text-center"
                            title="تغيير السرعة والباقة"
                          >
                            <option value="">غير محدد</option>
                            {offers.map(o => (
                              <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      {visibleColumns["serverId"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                          <select
                            value={customer.serverId || ""}
                            onChange={(e) => {
                              const newSId = e.target.value;
                              const targetServer = servers.find(s => s?.id === newSId);
                              onUpdateCustomer({
                                ...customer,
                                serverId: newSId || undefined,
                                realm: targetServer?.realm || customer.realm || "realm1.net"
                              });
                            }}
                            className="bg-transparent outline-none cursor-pointer focus:ring-0 max-w-[90px] text-ellipsis appearance-none text-center"
                            title="نقل إلى سيرفر آخر"
                          >
                            <option value="">غير محدد</option>
                            {servers.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                      )}
                      {visibleColumns["consumptionGB"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm whitespace-nowrap min-w-[120px] border border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col gap-1 items-center justify-center">
                            <div className="flex items-center gap-1 text-[10px] font-bold">
                              <span className="text-emerald-600">{customer.consumptionGB} GB</span>
                              <span className="text-slate-300">/</span>
                              <span className="text-slate-500">{offer ? offer.limitGB + ' GB' : '∞'}</span>
                            </div>
                            {offer && (
                              <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${customer.consumptionGB / offer.limitGB > 0.9 ? 'bg-rose-500' : customer.consumptionGB / offer.limitGB > 0.75 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (customer.consumptionGB / offer.limitGB) * 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns["startDate"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">{customer.startDate}</td>
                      )}
                      {visibleColumns["expiryDate"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap min-w-[100px] border border-slate-200 dark:border-slate-800">{customer.expiryDate}</td>
                      )}
                      {visibleColumns["autoWhatsAppAlert"] !== false && (
                        <td className="px-2 py-2 text-xs md:text-sm text-center whitespace-nowrap min-w-[90px] border border-slate-200 dark:border-slate-800">
                          <div className="flex flex-col items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onUpdateCustomer({ ...customer, autoWhatsAppAlert: !customer.autoWhatsAppAlert });
                              }}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${customer.autoWhatsAppAlert ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                              title="تفعيل/إلغاء التنبيه التلقائي قبل الانتهاء"
                            >
                              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${customer.autoWhatsAppAlert ? '-translate-x-4' : 'translate-x-0'}`} />
                            </button>
                            {(customer.autoWhatsAppAlertLogs && customer.autoWhatsAppAlertLogs.length > 0) && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setShowAutoAlertLogsModal(customer); }}
                                className="text-[10px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold flex items-center gap-1"
                                title="عرض سجل التنبيهات"
                              >
                                <History className="w-3 h-3" /> سجل
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns["options"] !== false && (
                        <td className="px-2 py-2 text-center border border-slate-200 dark:border-slate-800">
                          {/* Quick Actions Dropdown Menu next to Name */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); setFull360Tab("dashboard"); setFull360Customer(customer); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-all" title="داتابورد"><Activity className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setFull360Tab("renewal"); setFull360Customer(customer); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-all" title="تجديد الباقة"><RefreshCw className="w-4 h-4" /></button>
                              <button onClick={(e) => { e.stopPropagation(); setFull360Tab("debt"); setFull360Customer(customer); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-all" title="الديون والذمم"><DollarSign className="w-4 h-4" /></button>
                              <div>
                              <button
                                onClick={(e) => handleOpenDropdown(e, customer)}
                                className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all font-bold"
                                title="قائمة خيارات وإجراءات المشترك السريعة"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              
                            </div>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTO WHATSAPP ALERTS LOG MODAL */}
      {showAutoAlertLogsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-2 py-2 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                سجل التنبيهات التلقائية - {showAutoAlertLogsModal.name}
              </h3>
              <button
                onClick={() => setShowAutoAlertLogsModal(null)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-2 py-2 text-xs md:text-sm max-h-[60vh] overflow-y-auto">
              {!showAutoAlertLogsModal.autoWhatsAppAlertLogs || showAutoAlertLogsModal.autoWhatsAppAlertLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-medium text-xs">
                  لا يوجد سجل تنبيهات لهذا المشترك.
                </div>
              ) : (
                <div className="space-y-3">
                  {showAutoAlertLogsModal.autoWhatsAppAlertLogs.map((log, i) => (
                    <div key={i} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{log.date}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.status === "sent" ? "bg-emerald-100 text-emerald-700" :
                          log.status === "failed" ? "bg-indigo-100 text-indigo-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {log.status === "sent" ? "تم الإرسال" : log.status === "failed" ? "فشل الإرسال" : "معلق"}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1">{log.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" />
                إضافة مشترك جديد في نظام الريديوس
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم العميل الثلاثي:</label>
                  <input
                    type="text"
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="مثال: يوسف الدوسري"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={addPhone}
                    onChange={(e) => setAddPhone(e.target.value)}
                    placeholder="مثال: 0599123456"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مستخدم الدخول (Username / الخدمة) - يمكن إضافة أكثر من اسم بفاصلة , :</label>
                  <input
                    type="text"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة مرور الخدمة (Password):</label>
                  <input
                    type="text"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                {/* Portal credentials section */}
                <div className="sm:col-span-2 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                  <div className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>بيانات دخول لوحة تحكم المشترك (اللوحة الخارجية)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مستخدم اللوحة (Portal Username):</label>
                      <input
                        type="text"
                        value={addPortalUsername}
                        onChange={(e) => setAddPortalUsername(e.target.value.replace(/\s/g, ""))}
                        placeholder="يطابق اسم مستخدم الخدمة إن ترك فارغاً"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة مرور اللوحة (Portal Password):</label>
                      <input
                        type="text"
                        value={addPortalPassword}
                        onChange={(e) => setAddPortalPassword(e.target.value)}
                        placeholder="تطابق كلمة مرور الخدمة إن تركت فارغة"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    * مخصصة لدخول العميل من صفحة Portal المخصصة للمشترك لتتبع الاستهلاك وتجديد الاشتراكات.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">طريقة منح عنوان الـ IP:</label>
                  <select
                    value={addIpAssignmentType}
                    onChange={(e) => {
                      const val = e.target.value as "auto" | "manual";
                      setAddIpAssignmentType(val);
                      if (val === "auto") {
                        setAddIpAddress("");
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  >
                    <option value="auto">تلقائي (يولده السيرفر حسب الاتصال)</option>
                    <option value="manual">يدوي (تحديد الـ IP بنفسك)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الآي بي (يمكن إضافة أكثر من IP بفاصلة ,):</label>
                  <input
                    type="text"
                    value={addIpAddress}
                    onChange={(e) => setAddIpAddress(e.target.value)}
                    disabled={addIpAssignmentType === "auto"}
                    placeholder={addIpAssignmentType === "auto" ? "سيتم توليد الـ IP تلقائياً" : "مثال: 192.168.88.50"}
                    className={`w-full p-2.5 border rounded-lg text-sm focus:outline-none font-mono ${
                      addIpAssignmentType === "auto" 
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">طريقة الاتصال بالسيرفر:</label>
                  <select
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as ConnectionType)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                  >
                    <option value={ConnectionType.PPPOE}>برودباند PPPoE</option>
                    <option value={ConnectionType.HOTSPOT}>هوت سبوت</option>
                    <option value={ConnectionType.MIXED}>متعدد (برودباند + هوت سبوت)</option>
                    <option value={ConnectionType.MAC}>ماك ادريس (MAC Address)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عدد الأجهزة المسموح بها في نفس الوقت:</label>
                  <input
                    type="number"
                    min="1"
                    value={addMaxConcurrentLogins}
                    onChange={(e) => setAddMaxConcurrentLogins(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                    required
                  />
                </div>
                {/* المنطقة السكنية */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المنطقة السكنية (العنوان):</label>
                  <input
                    type="text"
                    value={addRegion}
                    onChange={(e) => setAddRegion(e.target.value)}
                    placeholder="مثال: حي الروضة"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* الدولة */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الدولة:</label>
                  <select
                    value={addCountry}
                    onChange={(e) => setAddCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="الكل">الكل</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* السيرفر المتصل عليه */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">السيرفر المتصل عليه:</label>
                  <select
                    value={addServerId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setAddServerId(selectedId);
                      const selectedS = servers.find(s => s?.id === selectedId);
                      if (selectedS?.realm) {
                        setAddRealm(selectedS.realm);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="">سيرفر افتراضي / تلقائي</option>
                    {servers.map(s => (
                      <option key={s?.id} value={s?.id}>{s.name} ({s.ipAddress}) - Realm: {s.realm || "realm1.net"}</option>
                    ))}
                  </select>
                </div>

                {/* النطاق (Realm) تلقائي */}
                <div>
                  <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center justify-between">
                    <span>نطاق الريديوس (Realm):</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✨ يتطابق تلقائياً مع السيرفر</span>
                  </label>
                  <input
                    type="text"
                    value={addRealm}
                    onChange={(e) => setAddRealm(e.target.value)}
                    placeholder="مثال: realm1.net"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-900 dark:text-indigo-200"
                  />
                </div>

                {/* الباقة / العرض */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>
                  <select
                    value={addOfferId}
                    onChange={(e) => setAddOfferId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {offers.filter(o => !o.country || o.country === "الكل" || o.country === addCountry).map(o => (
                      <option key={o?.id} value={o?.id}>{o.name} ({o.speed})</option>
                    ))}
                  </select>
                </div>

                {/* حالة المشترك */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">حالة الحساب:</label>
                  <select
                    value={addStatus}
                    onChange={(e) => setAddStatus(e.target.value as CustomerStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={CustomerStatus.ACTIVE}>نشط (Active)</option>
                    <option value={CustomerStatus.EXPIRED}>منتهي / معطل (Expired)</option>
                    <option value={CustomerStatus.SUSPENDED}>موقوف مؤقتاً (Suspended)</option>
                  </select>
                </div>

                {/* طريقة اختيار تاريخ بداية الاشتراك */}
                <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    تاريخ بداية الاشتراك:
                  </label>
                  <select
                    value={addStartDateMode}
                    onChange={(e) => setAddStartDateMode(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none font-bold"
                  >
                    <option value="now">البدء من الآن (تاريخ اليوم)</option>
                    <option value="first_connect">البدء عند أول اتصال بالشبكة</option>
                    <option value="custom">تاريخ محدد مسبقاً</option>
                  </select>
                  {addStartDateMode === "custom" && (
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">حدد تاريخ البدء:</label>
                      <input
                        type="date"
                        value={addStartDate}
                        onChange={(e) => setAddStartDate(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2">
                  إضافة المشترك
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODALS -------------------- */}

      {full360Customer && (
        <Subscriber360Modal
          isOpen={!!full360Customer}
          onClose={() => setFull360Customer(null)}
          customer={full360Customer}
          offers={offers}
          servers={servers}
          onUpdateCustomer={onUpdateCustomer}
          onDeleteCustomer={onDeleteCustomer}
          initialTab={full360Tab}
        />
      )}

      {showMessagingGatewayModal && (
        <MessagingGatewayModal
          isOpen={showMessagingGatewayModal}
          onClose={() => setShowMessagingGatewayModal(false)}
          customers={customers}
          offers={offers}
          selectedCustomerIds={selectedCustomerIds}
          singleCustomer={messagingSingleCustomer}
        />
      )}

      {autoRenewModalCustomer && (
        <AutoRenewSettingsModal
          isOpen={!!autoRenewModalCustomer}
          onClose={() => setAutoRenewModalCustomer(null)}
          customer={autoRenewModalCustomer}
          onUpdateCustomer={onUpdateCustomer}
        />
      )}

      {showImportExportModal && (
        <SubscriberImportExportModal
          isOpen={showImportExportModal}
          onClose={() => setShowImportExportModal(false)}
          customers={customers}
          offers={offers}
          servers={servers}
          distributors={distributors}
          selectedCustomerIds={selectedCustomerIds}
          filteredCustomers={filteredCustomers}
          onImportCustomers={onImportCustomers}
        />
      )}

      {/* TRASH BIN MODAL */}
      {showTrashModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    سلة المهملات للمشتركين المحذوفين
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    يتم الاحتفاظ بالحسابات المحذوفة لمدة 30 يوماً من تاريخ الحذف مع إمكانية الاستعادة الكاملة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTrashModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Quick Actions Bar */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-3 shrink-0">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  <input
                    type="text"
                    value={trashSearchQuery}
                    onChange={(e) => setTrashSearchQuery(e.target.value)}
                    placeholder="ابحث باسم المشترك، اسم المستخدم، الهاتف، أو التاريخ..."
                    className="w-full pr-9 pl-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  {trashSearchQuery && (
                    <button
                      onClick={() => setTrashSearchQuery("")}
                      className="absolute left-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Specific Date Filter */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={trashDateFilter}
                      onChange={(e) => setTrashDateFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                      title="فلترة حسب تاريخ الحذف المباشر"
                    />
                    {trashDateFilter && (
                      <button
                        onClick={() => setTrashDateFilter("")}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
                        title="إلغاء فلترة التاريخ"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Days Remaining Filter Dropdown */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={trashDaysFilter}
                      onChange={(e) => setTrashDaysFilter(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="all">جميع المهل (30 يوم)</option>
                      <option value="ending_soon">🚨 موشكة على الحذف النهائي (≤ 5 أيام)</option>
                      <option value="warning">⚠️ تنبيه حرج (≤ 12 يوم)</option>
                      <option value="safe">✅ محذوفة مؤخراً (&gt; 12 يوم)</option>
                    </select>
                  </div>

                  {/* Distributor Filter Dropdown */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <select
                      value={trashDistributorFilter}
                      onChange={(e) => setTrashDistributorFilter(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="all">جميع الموزعين</option>
                      <option value="none">مباشر (بدون موزع)</option>
                      {distributors && distributors.map((d) => (
                        <option key={d.id} value={d.id}>
                          👤 {d.name} {d.username ? `(@${d.username})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sorting Order */}
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs font-bold">
                    <select
                      value={trashSortOrder}
                      onChange={(e) => setTrashSortOrder(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                    >
                      <option value="newest">⬇️ الأحدث حذفاً أولاً</option>
                      <option value="oldest">⬆️ الأقدم حذفاً (الأقرب للحذف النهائي)</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {(trashSearchQuery || trashDateFilter || trashDaysFilter !== "all" || trashDistributorFilter !== "all" || trashSortOrder !== "newest") && (
                    <button
                      onClick={() => {
                        setTrashSearchQuery("");
                        setTrashDateFilter("");
                        setTrashDaysFilter("all");
                        setTrashDistributorFilter("all");
                        setTrashSortOrder("newest");
                      }}
                      className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1"
                      title="إعادة ضبط جميع الفلاتر"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>إعادة ضبط</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons & Bulk Selection Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-700/60 pt-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-slate-600 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700/80 px-2.5 py-1 rounded-lg">
                    المجموع الكلي: ({deletedCustomers.length})
                  </span>
                  {selectedTrashIds.length > 0 && (
                    <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fadeIn">
                      <span>✓ المحدد: ({selectedTrashIds.length})</span>
                    </span>
                  )}
                </div>

                {deletedCustomers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Bulk Actions Bar when items are selected */}
                    {selectedTrashIds.length > 0 ? (
                      <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 p-1 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "تأكيد استعادة المشتركين المحددين",
                              message: `هل أنت متأكد من استعادة (${selectedTrashIds.length}) مشتركين محددين من سلة المهملات إلى القائمة النشطة؟`,
                              description: "سيتم نقل العناصر المحددة فوراً إلى جدول المشتركين.",
                              confirmText: "استعادة المختارين",
                              onConfirm: () => {
                                if (onBulkRestoreTrash) {
                                  onBulkRestoreTrash(selectedTrashIds);
                                } else if (onRestoreCustomer) {
                                  selectedTrashIds.forEach(id => onRestoreCustomer(id));
                                }
                                setSelectedTrashIds([]);
                              }
                            });
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                          title="استعادة العناصر المحددة فقط"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة المختار ({selectedTrashIds.length})</span>
                        </button>

                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "تأكيد الحذف النهائي للمشتركين المحددين",
                              message: `هل أنت متأكد من الحذف النهائي لعدد (${selectedTrashIds.length}) مشتركين محددين؟`,
                              description: "تحذير: هذا الإجراء سيمحو الحسابات المحددة نهائياً من سلة المهملات ولن يمكن استعادتها إطلاقاً.",
                              confirmText: "حذف المختار نهائياً",
                              onConfirm: () => {
                                if (onBulkPermanentDeleteTrash) {
                                  onBulkPermanentDeleteTrash(selectedTrashIds);
                                } else if (onPermanentDeleteCustomer) {
                                  selectedTrashIds.forEach(id => onPermanentDeleteCustomer(id));
                                }
                                setSelectedTrashIds([]);
                              }
                            });
                          }}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                          title="حذف العناصر المحددة نهائياً"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف المختار نهائياً ({selectedTrashIds.length})</span>
                        </button>

                        <button
                          onClick={() => setSelectedTrashIds([])}
                          className="px-2 py-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition-all"
                          title="إلغاء التحديد"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            if (!deletedCustomers || deletedCustomers.length === 0) return;
                            const exportData = deletedCustomers.map((c) => {
                              const deletedTime = c.deletedAt ? new Date(c.deletedAt).getTime() : Date.now();
                              const elapsedMs = Date.now() - deletedTime;
                              const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
                              const daysLeft = Math.max(0, Math.ceil(30 - elapsedDays));
                              const distObj = distributors ? distributors.find(d => d.id === c.distributorId) : undefined;
                              const distName = distObj ? distObj.name : (c.distributorId ? c.distributorId : "مباشر (الأدمن)");

                              return {
                                "اسم المشترك": c.name || "",
                                "اسم المستخدم": c.username || "",
                                "كلمة المرور": c.password || "",
                                "رقم الهاتف": c.phone || "",
                                "الموزع التابع له": distName,
                                "عنوان IP": c.ipAddress || "",
                                "المنطقة / العنوان": c.region || "",
                                "معرف العرض / الباقة": c.offerId || "",
                                "الحالة": c.status || "",
                                "تاريخ الانتهاء": c.expiryDate || "",
                                "تاريخ الحذف": c.deletedAt ? new Date(c.deletedAt).toLocaleString('ar-EG') : "",
                                "المهلة المتبقية (يوم)": daysLeft,
                                "الديون": c.debt || 0,
                                "الرصيد": c.balance || 0,
                                "العنوان المادي MAC": c.macAddress || ""
                              };
                            });

                            exportToCSV(exportData, `سلة_المهملات_المشتركين_${new Date().toISOString().split('T')[0]}`);
                          }}
                          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                          title="تصدير أرشيف سلة المهملات بصيغة CSV مع ترميز UTF-8 لدعم الألفاظ العربية والرموز"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>تصدير سلة المهملات (CSV) 📥</span>
                        </button>

                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: "تأكيد استعادة جميع المشتركين",
                              message: `هل أنت متأكد من استعادة جميع المشتركين في سلة المهملات (${deletedCustomers.length}) إلى القائمة النشطة؟`,
                              description: "سيتم نقل جميع الحسابات المحذوفة مؤقتاً فوراً إلى جدول المشتركين.",
                              confirmText: "استعادة الكل الآن",
                              onConfirm: () => {
                                if (onRestoreAllTrash) {
                                  onRestoreAllTrash();
                                } else if (onRestoreCustomer) {
                                  deletedCustomers.forEach(c => onRestoreCustomer(c.id));
                                }
                                setSelectedTrashIds([]);
                              }
                            });
                          }}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>استعادة الكل</span>
                        </button>

                        {onEmptyTrash && (
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "تأكيد حذف جميع المشتركين نهائياً",
                                message: `هل أنت متأكد من الحذف النهائي لجميع المشتركين في سلة المهملات (${deletedCustomers.length})؟`,
                                description: "تحذير: هذا الإجراء نهائي وسيمحو الحسابات نهائياً ولن يمكن استعادتها إطلاقاً.",
                                confirmText: "حذف الكل نهائياً",
                                onConfirm: () => {
                                  onEmptyTrash();
                                  setSelectedTrashIds([]);
                                }
                              });
                            }}
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف الكل نهائياً</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Table Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {(() => {
                let filteredTrash = deletedCustomers.filter(c => {
                  // Search query filter (Name, Username, Phone, Date)
                  if (trashSearchQuery.trim()) {
                    const q = trashSearchQuery.toLowerCase().trim();
                    const nameMatch = c.name && c.name.toLowerCase().includes(q);
                    const usernameMatch = c.username && c.username.toLowerCase().includes(q);
                    const phoneMatch = c.phone && c.phone.includes(q);
                    const deletedAtIso = c.deletedAt ? c.deletedAt.toLowerCase() : "";
                    const deletedAtFormattedAr = c.deletedAt ? new Date(c.deletedAt).toLocaleString('ar-EG') : "";
                    const deletedAtFormattedEn = c.deletedAt ? new Date(c.deletedAt).toLocaleDateString('en-US') : "";
                    const dateMatch = deletedAtIso.includes(q) || deletedAtFormattedAr.includes(q) || deletedAtFormattedEn.includes(q);

                    if (!nameMatch && !usernameMatch && !phoneMatch && !dateMatch) {
                      return false;
                    }
                  }

                  // Specific Date Filter (YYYY-MM-DD)
                  if (trashDateFilter) {
                    if (!c.deletedAt) return false;
                    const cDateStr = new Date(c.deletedAt).toISOString().split('T')[0];
                    if (cDateStr !== trashDateFilter) return false;
                  }

                  // Days Remaining Filter
                  const deletedTime = c.deletedAt ? new Date(c.deletedAt).getTime() : Date.now();
                  const elapsedMs = Date.now() - deletedTime;
                  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
                  const daysLeft = Math.max(0, Math.ceil(30 - elapsedDays));

                  if (trashDaysFilter === "ending_soon" && daysLeft > 5) return false;
                  if (trashDaysFilter === "warning" && daysLeft > 12) return false;
                  if (trashDaysFilter === "safe" && daysLeft <= 12) return false;

                  // Distributor Filter
                  if (trashDistributorFilter === "none") {
                    if (c.distributorId) return false;
                  } else if (trashDistributorFilter !== "all") {
                    if (c.distributorId !== trashDistributorFilter) return false;
                  }

                  return true;
                });

                // Sorting
                filteredTrash.sort((a, b) => {
                  const timeA = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
                  const timeB = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
                  if (trashSortOrder === "oldest") {
                    return timeA - timeB;
                  }
                  return timeB - timeA;
                });

                if (filteredTrash.length === 0) {
                  return (
                    <div className="text-center py-12 space-y-3">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                        <Trash2 className="w-8 h-8" />
                      </div>
                      <h4 className="font-extrabold text-slate-700 dark:text-slate-300 text-sm">
                        لا يوجد مشتركين في سلة المهملات
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        تظهر هنا الحسابات والمشتركين الذين تم نقلهم للسلة، ويمكن استعادتهم بضغطة زر واحدة.
                      </p>
                    </div>
                  );
                }

                const isAllSelected = filteredTrash.length > 0 && filteredTrash.every(c => selectedTrashIds.includes(c.id));

                return (
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 font-extrabold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-3.5 py-3 w-10 text-center">
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const filteredIds = filteredTrash.map(c => c.id);
                                  setSelectedTrashIds(Array.from(new Set([...selectedTrashIds, ...filteredIds])));
                                } else {
                                  const filteredSet = new Set(filteredTrash.map(c => c.id));
                                  setSelectedTrashIds(selectedTrashIds.filter(id => !filteredSet.has(id)));
                                }
                              }}
                              className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                              title="تحديد الكل / إلغاء تحديد الكل"
                            />
                          </th>
                          <th className="px-3.5 py-3">اسم المشترك</th>
                          <th className="px-3.5 py-3">اسم المستخدم</th>
                          <th className="px-3.5 py-3">الموزع</th>
                          <th className="px-3.5 py-3">رقم الهاتف</th>
                          <th className="px-3.5 py-3">تاريخ الحذف والمهلة المتبقية (30 يوم)</th>
                          <th className="px-3.5 py-3 text-center">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredTrash.map((customer) => {
                          const deletedTime = customer.deletedAt ? new Date(customer.deletedAt).getTime() : Date.now();
                          const elapsedMs = Date.now() - deletedTime;
                          const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
                          const daysLeft = Math.max(0, Math.ceil(30 - elapsedDays));
                          const percentLeft = Math.max(0, Math.min(100, (daysLeft / 30) * 100));
                          const isSelected = selectedTrashIds.includes(customer.id);

                          let badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800";
                          if (daysLeft <= 5) {
                            badgeStyle = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800 animate-pulse";
                          } else if (daysLeft <= 12) {
                            badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800";
                          }

                          const isCritical = daysLeft <= 3;
                          let rowStyle = isCritical
                            ? "bg-rose-50/90 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors border-r-4 border-r-rose-500"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors";

                          if (isSelected) {
                            rowStyle += " bg-indigo-50/80 dark:bg-indigo-950/50";
                          }

                          return (
                            <tr key={customer.id} className={rowStyle}>
                              <td className="px-3.5 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      setSelectedTrashIds(selectedTrashIds.filter(id => id !== customer.id));
                                    } else {
                                      setSelectedTrashIds([...selectedTrashIds, customer.id]);
                                    }
                                  }}
                                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                                />
                              </td>
                              <td className="px-3.5 py-3 font-extrabold text-slate-800 dark:text-slate-100">
                                {customer.name}
                              </td>
                              <td className="px-3.5 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {customer.username}
                              </td>
                              <td className="px-3.5 py-3 font-medium text-slate-600 dark:text-slate-300">
                                {(() => {
                                  if (!customer.distributorId) return <span className="text-slate-400 font-normal">مباشر (الأدمن)</span>;
                                  const dist = distributors ? distributors.find(d => d.id === customer.distributorId) : undefined;
                                  return dist ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] border border-indigo-200 dark:border-indigo-800">
                                      <UserCheck className="w-3 h-3 text-indigo-500" />
                                      {dist.name}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">غير معروف</span>
                                  );
                                })()}
                              </td>
                              <td className="px-3.5 py-3 font-mono text-slate-500 dark:text-slate-400">
                                {customer.phone || "—"}
                              </td>
                              <td className="px-3.5 py-3">
                                <div className="space-y-1">
                                  <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{customer.deletedAt ? new Date(customer.deletedAt).toLocaleString('ar-EG') : "غير محدد"}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border inline-flex items-center gap-1 ${badgeStyle}`}>
                                      <Clock className="w-3 h-3" />
                                      <span>متبقي {daysLeft} {daysLeft === 1 ? "يوم" : daysLeft === 2 ? "يومان" : daysLeft <= 10 ? "أيام" : "يوماً"}</span>
                                    </span>
                                    <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden hidden sm:block" title={`متبقي ${daysLeft} يوم من أصل 30 يوماً`}>
                                      <div
                                        className={`h-full rounded-full transition-all duration-300 ${daysLeft <= 5 ? "bg-rose-500" : daysLeft <= 12 ? "bg-amber-500" : "bg-emerald-500"}`}
                                        style={{ width: `${percentLeft}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3.5 py-3 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  {onRestoreCustomer && (
                                    <button
                                      onClick={() => onRestoreCustomer(customer.id)}
                                      className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1"
                                      title="استعادة المشترك إلى جدول المشتركين النشطين"
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                      <span>استعادة</span>
                                    </button>
                                  )}
                                  {onPermanentDeleteCustomer && (
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "حذف نهائي للمشترك",
                                          message: `هل أنت متأكد من الحذف النهائي للمشترك (${customer.name})؟`,
                                          description: "سيتم حذف الحساب نهائياً من سلة المهملات ولا يمكن استعادته.",
                                          confirmText: "حذف نهائي",
                                          onConfirm: () => onPermanentDeleteCustomer(customer.id)
                                        });
                                      }}
                                      className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[11px] rounded-lg transition-all flex items-center gap-1"
                                      title="حذف نهائي"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>حذف نهائي</span>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setShowTrashModal(false)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 font-extrabold text-xs rounded-xl transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {autoRenewModalCustomer && (
        <AutoRenewSettingsModal
          isOpen={!!autoRenewModalCustomer}
          onClose={() => setAutoRenewModalCustomer(null)}
          customer={autoRenewModalCustomer}
          onUpdateCustomer={onUpdateCustomer}
        />
      )}

      {confirmModal.isOpen && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
          title={confirmModal.title}
          message={confirmModal.message}
          description={confirmModal.description}
          confirmText={confirmModal.confirmText}
          onConfirm={confirmModal.onConfirm}
          isDanger={true}
        />
      )}

      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                تعديل بيانات المشترك: {editingCustomer.name}
              </h3>
              <button onClick={() => setEditingCustomer(null)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم العميل الثلاثي:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">رقم الهاتف:</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="مثال: 0599123456"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مستخدم الدخول (Username / الخدمة):</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة مرور الخدمة (Password):</label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>

                {/* Portal credentials section */}
                <div className="sm:col-span-2 bg-indigo-50/60 dark:bg-indigo-950/30 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
                  <div className="text-xs font-extrabold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>بيانات دخول لوحة تحكم المشترك (اللوحة الخارجية)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مستخدم اللوحة (Portal Username):</label>
                      <input
                        type="text"
                        value={editPortalUsername}
                        onChange={(e) => setEditPortalUsername(e.target.value.replace(/\s/g, ""))}
                        placeholder="يطابق اسم مستخدم الخدمة إن ترك فارغاً"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة مرور اللوحة (Portal Password):</label>
                      <input
                        type="text"
                        value={editPortalPassword}
                        onChange={(e) => setEditPortalPassword(e.target.value)}
                        placeholder="تطابق كلمة مرور الخدمة إن تركت فارغة"
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium">
                    * مخصصة لدخول العميل من صفحة Portal المخصصة للمشترك لتتبع الاستهلاك وتجديد الاشتراكات.
                  </p>
                </div>

                {/* المنطقة السكنية */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المنطقة السكنية (العنوان):</label>
                  <input
                    type="text"
                    value={editRegion}
                    onChange={(e) => setEditRegion(e.target.value)}
                    placeholder="مثال: حي الروضة"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* الدولة */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الدولة:</label>
                  <select
                    value={editCountry}
                    onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="الكل">الكل</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* السيرفر المتصل عليه */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">السيرفر المتصل عليه:</label>
                  <select
                    value={editServerId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setEditServerId(selectedId);
                      const selectedS = servers.find(s => s?.id === selectedId);
                      if (selectedS?.realm) {
                        setEditRealm(selectedS.realm);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="">سيرفر افتراضي / تلقائي</option>
                    {servers.map(s => (
                      <option key={s?.id} value={s?.id}>{s.name} ({s.ipAddress}) - Realm: {s.realm || "realm1.net"}</option>
                    ))}
                  </select>
                </div>

                {/* النطاق (Realm) تلقائي */}
                <div>
                  <label className="block text-xs font-bold text-indigo-700 dark:text-indigo-400 mb-1 flex items-center justify-between">
                    <span>نطاق الريديوس (Realm):</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✨ يتطابق تلقائياً مع السيرفر</span>
                  </label>
                  <input
                    type="text"
                    value={editRealm}
                    onChange={(e) => setEditRealm(e.target.value)}
                    placeholder="مثال: realm1.net"
                    className="w-full p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold text-indigo-900 dark:text-indigo-200"
                  />
                </div>

                {/* الباقة / العرض */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الباقة / العرض المخصص:</label>
                  <select
                    value={editOfferId}
                    onChange={(e) => setEditOfferId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {offers.filter(o => !o.country || o.country === "الكل" || o.country === editCountry).map(o => (
                      <option key={o?.id} value={o?.id}>{o.name} ({o.speed})</option>
                    ))}
                  </select>
                </div>

                {/* حالة المشترك */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">حالة الحساب:</label>
                    <button
                      type="button"
                      onClick={() => {
                        const yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        setEditExpiryDate(yesterday.toISOString().split('T')[0]);
                        setEditStatus(CustomerStatus.EXPIRED);
                      }}
                      className="text-[10px] text-rose-600 dark:text-rose-400 font-extrabold hover:underline flex items-center gap-1"
                      title="تصفير الأيام المتبقية وتغيير حالة الحساب إلى منتهي"
                    >
                      <XCircle className="w-3 h-3" />
                      إنهاء الاشتراك (تصفير الأيام)
                    </button>
                  </div>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as CustomerStatus)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value={CustomerStatus.ACTIVE}>نشط (Active) 🟢</option>
                    <option value={CustomerStatus.SUSPENDED}>موقوف مؤقتاً (Suspended) 🟡</option>
                    <option value={CustomerStatus.EXPIRED}>منتهي الاشتراك (Expired) 🔴</option>
                  </select>
                </div>

                {/* طريقة اختيار تاريخ بداية الاشتراك */}
                <div className="sm:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    تاريخ بداية الاشتراك:
                  </label>
                  <select
                    value={editStartDateMode}
                    onChange={(e) => setEditStartDateMode(e.target.value as any)}
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none font-bold"
                  >
                    <option value="now">البدء من الآن (تاريخ اليوم)</option>
                    <option value="first_connect">البدء عند أول اتصال بالشبكة</option>
                    <option value="custom">تاريخ محدد مسبقاً</option>
                  </select>

                  {editStartDateMode === "custom" && (
                    <div className="mt-2">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">حدد تاريخ البدء:</label>
                      <input
                        type="date"
                        value={editStartDate}
                        onChange={(e) => setEditStartDate(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  )}
                </div>

                {/* تاريخ انتهاء العميل والمدة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">المدة بالأيام:</label>
                    <input
                      type="number"
                      min="1"
                      value={editDurationDays}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 1;
                        setEditDurationDays(days);
                        if (editStartDate && editStartDateMode !== "first_connect") {
                          const start = new Date(editStartDate);
                          start.setDate(start.getDate() + days);
                          setEditExpiryDate(start.toISOString().split('T')[0]);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">تاريخ انتهاء الاشتراك:</label>
                    <input
                      type="date"
                      value={editExpiryDate}
                      onChange={(e) => {
                        setEditExpiryDate(e.target.value);
                        if (editStartDate && editStartDateMode !== "first_connect" && e.target.value) {
                           const start = new Date(editStartDate);
                           const end = new Date(e.target.value);
                           const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                           if (diffDays >= 0) setEditDurationDays(diffDays);
                        }
                      }}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* تصنيف المشترك */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">تصنيف المشترك:</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="عادي">عادي</option>
                    <option value="برونزي">برونزي</option>
                    <option value="فضي">فضي</option>
                    <option value="ذهبي">ذهبي</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setEditingCustomer(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  إلغاء
                </button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {/* Floating Quick Options Dropdown Overlay & Menu */}
      {activeDropdownCustomer && dropdownPosition && (
        <>
          {/* Backdrop to close when clicking outside */}
          <div
            className="fixed inset-0 z-[60] bg-transparent"
            onClick={() => {
              setActiveDropdownCustomer(null);
              setDropdownPosition(null);
            }}
          />

          {/* Floating Dropdown Menu */}
          <div
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
            className="fixed w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-[70] py-2 text-xs font-bold text-slate-700 dark:text-slate-200 max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-400 font-extrabold flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <span>خيارات المشترك السريعة</span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400">{activeDropdownCustomer.username}</span>
            </div>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("dashboard");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 font-extrabold flex items-center gap-2"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              1. داتابورد وداتا المشترك
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("renewal");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-extrabold flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              2. تجديد وتمديد باقة المشترك ⚡
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                if (window.confirm(`هل أنت متأكد من تجديد اشتراك العميل [${c.name}] لمدة 48 ساعة وتفعيله؟`)) {
                  const currentExp = c.expiryDate ? new Date(c.expiryDate) : new Date();
                  const now = new Date();
                  const baseDate = (!isNaN(currentExp.getTime()) && currentExp > now) ? currentExp : now;
                  baseDate.setDate(baseDate.getDate() + 2);
                  const newExpiry = baseDate.toISOString().split('T')[0];
                  
                  onUpdateCustomer({
                    ...c,
                    expiryDate: newExpiry,
                    status: CustomerStatus.ACTIVE
                  });
                }
              }}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-black flex items-center gap-2 border-y border-amber-100/60 dark:border-amber-900/30"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              ⚡ تجديد المشترك 48 ساعة
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("usage");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-800 dark:text-sky-300 font-extrabold flex items-center gap-2"
            >
              <TrendingUp className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              3. سجل الاستهلاك والكوتا (Usage)
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("payments");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-extrabold flex items-center gap-2"
            >
              <CreditCard className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              4. سجل المدفوعات والفواتير
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("modifications");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-extrabold flex items-center gap-2"
            >
              <History className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              5. سجل التعديلات والعمليات
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setFull360Tab("debt");
                setFull360Customer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-extrabold flex items-center gap-2"
            >
              <DollarSign className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              6. الذمم والديون المترتبة
              {activeDropdownCustomer.debt && activeDropdownCustomer.debt > 0 ? (
                <span className="mr-auto text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded-full font-black">
                  {activeDropdownCustomer.debt} $
                </span>
              ) : null}
            </button>

            {activeDropdownCustomer.concurrentLogins > 0 && (
              <button
                onClick={() => {
                  const c = activeDropdownCustomer;
                  setActiveDropdownCustomer(null);
                  handleKickSubscriber(c);
                }}
                className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-indigo-600 dark:text-indigo-400 border-t border-slate-200 dark:border-slate-800"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" />
                طرد العميل من الأكتيف (PoD)
              </button>
            )}

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                handleToggleStatus(c);
              }}
              className={`w-full text-right px-3 py-2 flex items-center gap-2 border-t border-slate-200 dark:border-slate-800 ${
                activeDropdownCustomer.status === CustomerStatus.ACTIVE ? "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400" : "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {activeDropdownCustomer.status === CustomerStatus.ACTIVE ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-500" />
                  إيقاف مؤقت وتعطيل الحساب
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-500" />
                  تفعيل وإعادة تشغيل الخدمة
                </>
              )}
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                handleEndSubscription(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-rose-700 dark:text-rose-400 border-t border-slate-200 dark:border-slate-800 font-extrabold"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              إنهاء الاشتراك (تصفير الأيام)
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setMessagingSingleCustomer(c);
                setShowMessagingGatewayModal(true);
              }}
              className="w-full text-right px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-2 text-blue-700 dark:text-blue-400"
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
              إرسال إشعار (WhatsApp/SMS)
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setAutoRenewModalCustomer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800"
            >
              <CalendarClock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              إعدادات التجديد التلقائي
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setEditingCustomer(c);
              }}
              className="w-full text-right px-3 py-2 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 border-t border-slate-200 dark:border-slate-800"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              تعديل بيانات المشترك
            </button>

            <button
              onClick={() => {
                const c = activeDropdownCustomer;
                setActiveDropdownCustomer(null);
                setConfirmModal({
                  isOpen: true,
                  title: "تأكيد نقل المشترك إلى سلة المهملات",
                  message: `هل أنت متأكد من نقل المشترك [${c.name}] إلى سلة المهملات؟`,
                  description: "سيتم إيقاف حسابه ونقله إلى سلة المهملات. يمكنك استعادته في أي وقت خلال 30 يوماً.",
                  confirmText: "نقل إلى سلة المهملات",
                  onConfirm: () => onDeleteCustomer(c?.id)
                });
              }}
              className="w-full text-right px-3 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 border-t border-rose-100 dark:border-slate-800 font-extrabold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              نقل إلى سلة المهملات
            </button>
          </div>
        </>
      )}

    </div>
  );
}

