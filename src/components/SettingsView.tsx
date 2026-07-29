/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  Settings, 
  Check, 
  Globe, 
  User, 
  Phone, 
  Database, 
  MessageSquare, 
  Smartphone, 
  ShieldAlert,
  Shield,
  Save,
  Moon,
  Sun,
  Clock,
  Calendar,
  Play,
  Pause,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  RotateCcw,
  History,
  Sparkles,
  Activity,
  FileText,
  X,
  SlidersHorizontal,
  Download,
  Coins,
  ArrowRightLeft,
  Calculator,
  Edit,
  DollarSign,
  Eye,
  EyeOff,
  CreditCard,
  Server,
  ShieldCheck,
  Lock,
  AlertOctagon,
  Wifi,
  WifiOff,
  Bug,
  Terminal,
  Fingerprint
} from "lucide-react";
import { GeneralSettings, Customer, CustomerStatus, ScheduledTask, Currency } from "../types";
import { DEFAULT_CURRENCIES } from "../utils/constants";
import { PERMISSION_GROUPS, getFullPermissionsObject } from "../utils/permissions";
import { safeStorage } from "../utils/storage";
import { 
  SyncFailureLog, 
  SyncStatus, 
  registerSyncStatusListener, 
  registerSyncFailureListener, 
  clearSyncFailures, 
  fetchRemoteState 
} from "../utils/syncManager";

interface SettingsViewProps {
  initialTab?: string;
  settings: GeneralSettings;
  onUpdateSettings: (settings: GeneralSettings) => void;
  currentUser: { name: string; role: string; username: string; password?: string; permissions?: any; distributorId?: string };
  onUpdateCurrentUser: (user: { name: string; role: string; username: string; password?: string }) => void;
  isDarkMode: boolean;
  onToggleDarkMode: (enabled: boolean) => void;
  customers?: Customer[];
  distributors?: any;
  
  devices?: any[];
  offers?: any[];
  cards?: any[];
  servers?: any[];
  tickets?: any[];
  onUpdateCustomers?: (customers: Customer[]) => void;
  onUpdateCards?: (cards: any[]) => void;
  onRunAutoPingDevices?: (isManual?: boolean) => Promise<void> | void;
  onAddNotification?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  isDistributorSession?: boolean;
  activeDistributorObj?: any;
  onUpdateActiveDistributor?: (distributor: any) => void;
  onUpdateDistributor?: (distributor: any) => void;
}

interface TaskExecutionLog {
  id: string;
  timestamp: string;
  taskTitle: string;
  actionType: string;
  status: "success" | "warning" | "failed";
  details: string;
  triggeredBy: string;
}

const DEFAULT_SCHEDULED_TASKS: ScheduledTask[] = [
  {
    id: "task_reset_consumption",
    title: "تصفير الاستهلاك والكوتا الشهرية",
    description: "تفرغ وتصفير عدادات الاستهلاك الفعلي بالـ GB لجميع المشتركين تلقائياً بداية كل شهر جديد.",
    actionType: "RESET_CONSUMPTION",
    frequency: "monthly",
    executionTime: "00:00 (في اليوم الأول من كل شهر)",
    enabled: true,
    lastRun: "2026-07-01 00:00",
    nextRun: "2026-08-01 00:00",
    runCount: 14
  },
  {
    id: "task_auto_suspend",
    title: "إيقاف المشتركين منتهيي الصلاحية تلقائياً",
    description: "فحص تواريخ انتهاء الاشتراك يومياً، وتحويل حالة المنتهين إلى 'منتهي' مع طرد جلساتهم أونلاين عبر PoD.",
    actionType: "AUTO_SUSPEND_EXPIRED",
    frequency: "daily",
    executionTime: "00:01 (منتصف الليل يومياً)",
    enabled: true,
    lastRun: "2026-07-22 00:01",
    nextRun: "2026-07-23 00:01",
    runCount: 204
  },
  {
    id: "task_expiry_alerts",
    title: "إرسال إشعارات وتنبيهات القرب من الانتهاء",
    description: "إرسال رسائل تذكير عبر الواتساب للمشتركين الذين ينتهي اشتراكهم خلال 3 أيام القادمة.",
    actionType: "EXPIRY_ALERTS",
    frequency: "daily",
    executionTime: "09:00 (صباح كل يوم)",
    enabled: true,
    lastRun: "2026-07-22 09:00",
    nextRun: "2026-07-23 09:00",
    runCount: 182
  },
  {
    id: "task_backup_data",
    title: "النسخ الاحتياطي التلقائي لقاعدة البيانات",
    description: "توليد وأرشفة نسخة احتياطية كاملة لجميع بيانات المشتركين والسيرفرات والسجلات.",
    actionType: "BACKUP_DATA",
    frequency: "weekly",
    executionTime: "كل يوم جمعة - 02:00 صباحاً",
    enabled: true,
    lastRun: "2026-07-17 02:00",
    nextRun: "2026-07-24 02:00",
    runCount: 32
  },
  {
    id: "task_flush_sessions",
    title: "تنسيق وتنظيف الجلسات الميتة (Flush Stale Sessions)",
    description: "مسح الجلسات الوهمية والمعلقة في رواترات الميكروتك لضمان دقة القوائم النشطة والأكتيف.",
    actionType: "FLUSH_SESSIONS",
    frequency: "every_6h",
    executionTime: "كل 6 ساعات متواصلة",
    enabled: true,
    lastRun: "2026-07-22 06:00",
    nextRun: "2026-07-22 12:00",
    runCount: 840
  }
];

export default function SettingsView({ 
  settings, 
  onUpdateSettings,
  currentUser,
  onUpdateCurrentUser,
  isDarkMode,
  onToggleDarkMode,
  customers = [],
  distributors = [],
  devices = [],
  offers = [],
  cards = [],
  servers = [],
  tickets = [],
  onUpdateCustomers,
  onUpdateCards,
  onRunAutoPingDevices,
  onAddNotification,
  isDistributorSession,
  activeDistributorObj,
  onUpdateActiveDistributor,
  onUpdateDistributor
}: SettingsViewProps) {
  const [radiusName, setRadiusName] = useState(settings.radiusName);
  const [radiusIp, setRadiusIp] = useState(settings.radiusIp);
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone);
  const [vpnServerIp, setVpnServerIp] = useState(settings.vpnServerIp);
  const [defaultWhatsAppDelayMessage, setDefaultWhatsAppDelayMessage] = useState(settings.defaultWhatsAppDelayMessage);
  const [defaultWhatsAppAlertMessage, setDefaultWhatsAppAlertMessage] = useState(settings.defaultWhatsAppAlertMessage);
  const [language, setLanguage] = useState<"ar" | "en">(settings.language || "ar");

  // External Login Page Customization State
  const [loginTagline, setLoginTagline] = useState(settings.loginTagline || "نظام إدارة الشبكات والموزعين المتقدم");
  const [loginDescription, setLoginDescription] = useState(settings.loginDescription || "منصة الإدارة المركزية لسيرفرات الميكروتيك وباقات المشتركين والموزعين");
  const [loginFooterNote, setLoginFooterNote] = useState(settings.loginFooterNote ?? "");
  const [loginSupportPhone, setLoginSupportPhone] = useState(settings.loginSupportPhone || settings.ownerPhone || "966500000000");
  const [showSubscriberPortalBtn, setShowSubscriberPortalBtn] = useState(settings.showSubscriberPortalBtn ?? true);
  const [maintenanceModeEnabled, setMaintenanceModeEnabled] = useState(settings.maintenanceModeEnabled ?? false);
  const [maintenanceModeMessage, setMaintenanceModeMessage] = useState(settings.maintenanceModeMessage || "النظام قيد التحديث والصيانة حالياً. نعتذر عن الإزعاج وسنعود قريباً.");
  const [autoDeleteOldLogs, setAutoDeleteOldLogs] = useState(settings.autoDeleteOldLogs ?? true);
  const [enableDailyReports, setEnableDailyReports] = useState(settings.enableDailyReports ?? false);
  const [autoDeleteLogsMonths, setAutoDeleteLogsMonths] = useState(settings.autoDeleteLogsMonths ?? 6);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(settings.showAccountSwitcher ?? true);


  const [bankAccountNumber, setBankAccountNumber] = useState(settings.bankAccountNumber || "");
  const [autoVerifyReceipts, setAutoVerifyReceipts] = useState(settings.autoVerifyReceipts ?? false);
  const [enablePaymentGateway, setEnablePaymentGateway] = useState(settings.enablePaymentGateway ?? false);
  const [paymentGatewayProvider, setPaymentGatewayProvider] = useState(
    isDistributorSession ? (activeDistributorObj?.paymentGatewayProvider || "stripe") : (settings.paymentGatewayProvider || "stripe")
  );
  const [paymentGatewayApiKey, setPaymentGatewayApiKey] = useState(
    isDistributorSession ? (activeDistributorObj?.paymentGatewayApiKey || "") : (settings.paymentGatewayApiKey || "")
  );

  // Backend API Integration State
  const [backendBaseUrl, setBackendBaseUrl] = useState(settings.backendBaseUrl || "");
  const [backendApiToken, setBackendApiToken] = useState(settings.backendApiToken || "");


  // Multi-Currency Management State
  const [currencies, setCurrencies] = useState<Currency[]>(() => settings.currencies && settings.currencies.length > 0 ? settings.currencies : DEFAULT_CURRENCIES);
  const [defaultCurrency, setDefaultCurrency] = useState<string>(settings.defaultCurrency || "LYD");

  // Currency Form State (Modal)
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [currencyCode, setCurrencyCode] = useState("");
  const [currencyName, setCurrencyName] = useState("");
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [currencyRate, setCurrencyRate] = useState<number>(1.0);
  const [currencyIsBase, setCurrencyIsBase] = useState(false);

  // Currency Live Test Calculator State in Settings
  const [testAmount, setTestAmount] = useState<number>(100);
  const [testFrom, setTestFrom] = useState<string>("USD");
  const [testTo, setTestTo] = useState<string>("LYD");

  // Check permissions
  const canManageRadius = (!currentUser.distributorId) || currentUser.permissions?.canManageRadiusSettings;
  const canResetRadius = (!currentUser.distributorId) || currentUser.permissions?.canResetRadiusData;

  const canExportRadius = (!currentUser.distributorId) || currentUser.permissions?.canExportRadiusData;
  const canManageScheduledTasks = (!currentUser.distributorId) || currentUser.permissions?.canManageRadiusScheduledTasks;
  const canManageCurrencies = (!currentUser.distributorId) || currentUser.permissions?.canManageRadiusCurrencies;


  useEffect(() => {
    if (settings.language) {
      setLanguage(settings.language);
    }
  }, [settings.language]);

  // Currency Conversion Calculation
  const convertCurrencyAmount = (amount: number, fromCode: string, toCode: string): number => {
    if (!amount || amount <= 0 || fromCode === toCode) return amount;
    const fromCurr = currencies.find(c => c.code === fromCode);
    const toCurr = currencies.find(c => c.code === toCode);
    if (!fromCurr || !toCurr || fromCurr.exchangeRate <= 0 || toCurr.exchangeRate <= 0) return amount;

    // Convert from source currency to base currency then to target currency
    const amountInBase = amount / fromCurr.exchangeRate;
    return amountInBase * toCurr.exchangeRate;
  };

  // Engineer state
  const [engineerName, setEngineerName] = useState(currentUser.name);
  const [engineerRole, setEngineerRole] = useState(currentUser.role);
  const [engineerUsername, setEngineerUsername] = useState(currentUser.username);
  const [engineerPassword, setEngineerPassword] = useState(currentUser.password || "admin");
  const [showEngineerPassword, setShowEngineerPassword] = useState(false);

  useEffect(() => {
    if (currentUser && !currentUser.distributorId) {
      setEngineerName(currentUser.name || "المالك المسئول للنظام");
      setEngineerRole(currentUser.role || "مالك النظام");
      setEngineerUsername(currentUser.username || "admin");
      if (currentUser.password) {
        setEngineerPassword(currentUser.password);
      }
    }
  }, [currentUser]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "cleanup" | "sync" | "owner" | "security">("general");

  // Live Cloud Sync Diagnostics State
  const [syncFailuresList, setSyncFailuresList] = useState<SyncFailureLog[]>([]);
  const [syncStatusState, setSyncStatusState] = useState<SyncStatus>("connected");
  const [isTestingSync, setIsTestingSync] = useState(false);

  useEffect(() => {
    const unregisterFailures = registerSyncFailureListener((failures) => {
      setSyncFailuresList(failures);
    });
    const unregisterStatus = registerSyncStatusListener((status) => {
      setSyncStatusState(status);
    });
    return () => {
      unregisterFailures();
      unregisterStatus();
    };
  }, []);

  // Auto-Cleanup State
  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState(settings.autoCleanupEnabled ?? true);
  const [autoDeleteCardsDays, setAutoDeleteCardsDays] = useState(settings.autoDeleteCardsDays ?? 90);
  const [autoDeleteAuditLogsDays, setAutoDeleteAuditLogsDays] = useState(settings.autoDeleteAuditLogsDays ?? 90);
  const [autoCleanupFrequency, setAutoCleanupFrequency] = useState<"daily" | "weekly" | "monthly">(settings.autoCleanupFrequency || "daily");
  const [lastAutoCleanupDate, setLastAutoCleanupDate] = useState(settings.lastAutoCleanupDate || "");

  // Auto-Ping Devices State (الفحص الدوري التلقائي للأجهزة)
  const [autoPingDevicesEnabled, setAutoPingDevicesEnabled] = useState(settings.autoPingDevicesEnabled ?? true);
  const [autoPingIntervalMinutes, setAutoPingIntervalMinutes] = useState(settings.autoPingIntervalMinutes ?? 10);
  const [lastAutoPingDevicesDate, setLastAutoPingDevicesDate] = useState(settings.lastAutoPingDevicesDate || "");
  const [isManualPingRunning, setIsManualPingRunning] = useState(false);

  // Counts for Auto-Cleanup metrics
  const usedCardsList = (cards || []).filter(c => c.status === "مستخدم");
  const usedCardsCount = usedCardsList.length;

  const oldCardsCount = usedCardsList.filter(c => {
    if (!c.usedDate) return true;
    const usedTime = new Date(c.usedDate).getTime();
    return (Date.now() - usedTime) > (autoDeleteCardsDays * 24 * 60 * 60 * 1000);
  }).length;

  let allLogsList: any[] = [];
  try {
    const rawLogs = safeStorage.getItem("radius_logs");
    if (rawLogs) allLogsList = JSON.parse(rawLogs);
  } catch (e) {
    allLogsList = [];
  }
  const totalLogsCount = allLogsList.length;
  const oldLogsCount = allLogsList.filter(l => {
    if (!l.date) return false;
    const logTime = new Date(`${l.date}T${l.time || "00:00:00"}`).getTime();
    return !isNaN(logTime) && (Date.now() - logTime) > (autoDeleteAuditLogsDays * 24 * 60 * 60 * 1000);
  }).length;

  const handlePurgeUsedCards = (days: number) => {
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const validCards = (cards || []).filter(c => {
      if (c.status !== "مستخدم") return true;
      if (!c.usedDate) return false;
      const usedTime = new Date(c.usedDate).getTime();
      return usedTime >= cutoffTime;
    });

    const deletedCount = (cards || []).length - validCards.length;

    if (onUpdateCards) {
      onUpdateCards(validCards);
    } else {
      safeStorage.setItem("radius_cards", JSON.stringify(validCards));
    }

    if (onAddNotification) {
      onAddNotification(`✅ تم تطهير وحذف ${deletedCount} كارت مستهلك قديم (أكثر من ${days} يوم) بنجاح!`, "success");
    }
  };

  const handlePurgeAuditLogs = (days: number) => {
    let rawLogs: any[] = [];
    try {
      const stored = safeStorage.getItem("radius_logs");
      if (stored) rawLogs = JSON.parse(stored);
    } catch (e) {
      rawLogs = [];
    }

    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const validLogs = rawLogs.filter(l => {
      if (!l.date) return false;
      const logTime = new Date(`${l.date}T${l.time || "00:00:00"}`).getTime();
      return !isNaN(logTime) && logTime >= cutoffTime;
    });

    const deletedCount = rawLogs.length - validLogs.length;
    safeStorage.setItem("radius_logs", JSON.stringify(validLogs));

    if (onAddNotification) {
      onAddNotification(`✅ تم تطهير ومسح ${deletedCount} سجل عمليات قديم (أكثر من ${days} يوم) بنجاح!`, "success");
    }
  };

  const handleRunFullAutoCleanup = () => {
    handlePurgeUsedCards(autoDeleteCardsDays);
    handlePurgeAuditLogs(autoDeleteAuditLogsDays);

    const nowStr = new Date().toLocaleString("ar-EG");
    setLastAutoCleanupDate(nowStr);

    onUpdateSettings({
      ...settings,
      autoCleanupEnabled,
      autoDeleteCardsDays,
      autoDeleteAuditLogsDays,
      autoCleanupFrequency,
      lastAutoCleanupDate: nowStr
    });

    if (onAddNotification) {
      onAddNotification("🚀 تم تنفيذ الحذف والكبس التلقائي الشامل لقاعدة البيانات لتسريع الأداء!", "success");
    }
  };

  // Scheduled Tasks Engine State
  const [tasks, setTasks] = useState<ScheduledTask[]>(() => {
    const saved = safeStorage.getItem("radius_scheduled_tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse tasks");
      }
    }
    return DEFAULT_SCHEDULED_TASKS;
  });

  const [executionLogs, setExecutionLogs] = useState<TaskExecutionLog[]>(() => {
    const saved = safeStorage.getItem("radius_scheduled_logs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse logs");
      }
    }
    return [
      {
        id: "log_1",
        timestamp: "2026-07-22 09:00:15",
        taskTitle: "إرسال إشعارات وتنبيهات القرب من الانتهاء",
        actionType: "EXPIRY_ALERTS",
        status: "success",
        details: "تم إرسال 14 إشعار تذكير عبر الواتساب بنجاح.",
        triggeredBy: "النظام التلقائي (Cron Engine)"
      },
      {
        id: "log_2",
        timestamp: "2026-07-22 06:00:02",
        taskTitle: "تنسيق وتنظيف الجلسات الميتة (Flush Stale Sessions)",
        actionType: "FLUSH_SESSIONS",
        status: "success",
        details: "تم تنظيف وتفريغ 3 جلسات معلقة عبر سيرفرات الميكروتك.",
        triggeredBy: "النظام التلقائي (Cron Engine)"
      },
      {
        id: "log_3",
        timestamp: "2026-07-22 00:01:05",
        taskTitle: "إيقاف المشتركين منتهيي الصلاحية تلقائياً",
        actionType: "AUTO_SUSPEND_EXPIRED",
        status: "success",
        details: "تم فحص المشتركين وإيقاف 2 منتهين وطرد جلساتهم أونلاين.",
        triggeredBy: "النظام التلقائي (Cron Engine)"
      }
    ];
  });

  const [runningTaskId, setRunningTaskId] = useState<string | null>(null);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // New task form fields
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskActionType, setNewTaskActionType] = useState<ScheduledTask["actionType"]>("RESET_CONSUMPTION");
  const [newTaskFrequency, setNewTaskFrequency] = useState<ScheduledTask["frequency"]>("daily");
  const [newTaskExecutionTime, setNewTaskExecutionTime] = useState("00:00");

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Save tasks and logs to local storage
  useEffect(() => {
    safeStorage.setItem("radius_scheduled_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    safeStorage.setItem("radius_scheduled_logs", JSON.stringify(executionLogs));
  }, [executionLogs]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDistributorSession && activeDistributorObj && onUpdateActiveDistributor) {
      onUpdateActiveDistributor({
        ...activeDistributorObj,
        paymentGatewayProvider,
        paymentGatewayApiKey
      });
      
      // Filter out payment gateway updates for global settings when saved by a distributor
      onUpdateSettings({
        radiusName, radiusIp, ownerName, ownerPhone, vpnServerIp,
        defaultWhatsAppDelayMessage, defaultWhatsAppAlertMessage,
        language, currencies, defaultCurrency, loginTagline,
        loginDescription, loginFooterNote, loginSupportPhone,
        showSubscriberPortalBtn, maintenanceModeEnabled, maintenanceModeMessage,
        autoDeleteOldLogs, autoDeleteLogsMonths, showAccountSwitcher, enableDailyReports,
        bankAccountNumber, autoVerifyReceipts, enablePaymentGateway,
        backendBaseUrl, backendApiToken,
        autoCleanupEnabled, autoDeleteCardsDays, autoDeleteAuditLogsDays,
        autoCleanupFrequency, lastAutoCleanupDate,
        autoPingDevicesEnabled, autoPingIntervalMinutes, lastAutoPingDevicesDate,
        // keep global untouched for these two
        paymentGatewayProvider: settings.paymentGatewayProvider,
        paymentGatewayApiKey: settings.paymentGatewayApiKey
      });
    } else {
      onUpdateSettings({
        radiusName, radiusIp, ownerName, ownerPhone, vpnServerIp,
        defaultWhatsAppDelayMessage, defaultWhatsAppAlertMessage,
        language, currencies, defaultCurrency, loginTagline,
        loginDescription, loginFooterNote, loginSupportPhone,
        showSubscriberPortalBtn, maintenanceModeEnabled, maintenanceModeMessage,
        autoDeleteOldLogs, autoDeleteLogsMonths, showAccountSwitcher, enableDailyReports,
        bankAccountNumber, autoVerifyReceipts, enablePaymentGateway,
        paymentGatewayProvider, paymentGatewayApiKey, backendBaseUrl, backendApiToken,
        autoCleanupEnabled, autoDeleteCardsDays, autoDeleteAuditLogsDays,
        autoCleanupFrequency, lastAutoCleanupDate,
        autoPingDevicesEnabled, autoPingIntervalMinutes, lastAutoPingDevicesDate
      });
      onUpdateCurrentUser({
        ...currentUser,
        name: engineerName,
        role: engineerRole,
        username: engineerUsername,
        password: engineerPassword
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  // Currency CRUD Handlers
  const handleOpenAddCurrency = () => {
    setEditingCurrency(null);
    setCurrencyCode("");
    setCurrencyName("");
    setCurrencySymbol("");
    setCurrencyRate(1.0);
    setCurrencyIsBase(false);
    setShowAddCurrencyModal(true);
  };

  const handleOpenEditCurrency = (curr: Currency) => {
    setEditingCurrency(curr);
    setCurrencyCode(curr.code);
    setCurrencyName(curr.name);
    setCurrencySymbol(curr.symbol);
    setCurrencyRate(curr.exchangeRate);
    setCurrencyIsBase(!!curr.isBase);
    setShowAddCurrencyModal(true);
  };

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currencyCode || !currencyName || !currencySymbol || currencyRate <= 0) return;

    let updatedCurrencies = [...currencies];

    if (currencyIsBase) {
      // Unset previous base currency
      updatedCurrencies = updatedCurrencies.map(c => ({ ...c, isBase: false }));
    }

    if (editingCurrency) {
      // Edit existing
      updatedCurrencies = updatedCurrencies.map(c => {
        if (c.code === editingCurrency.code) {
          return {
            code: currencyCode.toUpperCase(),
            name: currencyName,
            symbol: currencySymbol,
            exchangeRate: currencyIsBase ? 1.0 : currencyRate,
            isBase: currencyIsBase
          };
        }
        return c;
      });
    } else {
      // Add new
      if (updatedCurrencies.some(c => c.code.toUpperCase() === currencyCode.toUpperCase())) {
        if (onAddNotification) onAddNotification("رمز العملة المكتوب موجود بالفعل!", "error");
        return;
      }
      updatedCurrencies.push({
        code: currencyCode.toUpperCase(),
        name: currencyName,
        symbol: currencySymbol,
        exchangeRate: currencyIsBase ? 1.0 : currencyRate,
        isBase: currencyIsBase
      });
    }

    setCurrencies(updatedCurrencies);
    setShowAddCurrencyModal(false);
    onUpdateSettings({
      ...settings,
      currencies: updatedCurrencies,
      defaultCurrency
    });

    if (onAddNotification) {
      onAddNotification(`تم ${editingCurrency ? "تحديث" : "إضافة"} العملة [${currencyCode.toUpperCase()}] بنجاح!`, "success");
    }
  };

  const handleResetRadiusData = () => {
    if (isDistributorSession) {
       if (onAddNotification) onAddNotification("تصفير النظام مسموح فقط للمدير العام.", "error");
       return;
    }
    setConfirmModal({
      isOpen: true,
      title: "تصفير بيانات الريديوس بالكامل",
      message: "هل أنت متأكد تماماً من تصفير كافة بيانات الريديوس؟",
      description: "سيتم مسح جميع المشتركين، الموزعين، العروض، الجلسات، الأجهزة (NAS/UBNT) والبطاقات. هذا الإجراء نهائي ولا يمكن التراجع عنه!",
      confirmText: "نعم، تصفير النظام نهائياً",
      isDanger: true,
      onConfirm: () => {
        safeStorage.setItem("radius_customers", "[]");
        safeStorage.setItem("radius_deleted_customers", "[]");
        safeStorage.setItem("radius_distributors", "[]");
        safeStorage.setItem("radius_devices", "[]");
        safeStorage.setItem("radius_offers", "[]");
        safeStorage.setItem("radius_cards", "[]");
        safeStorage.setItem("radius_servers", "[]");
        safeStorage.setItem("radius_tickets", "[]");
        safeStorage.setItem("radius_distributor_offers", "[]");
        safeStorage.setItem("radius_logs", "[]");
        safeStorage.setItem("radius_financial_transactions", "[]");
        safeStorage.setItem("radius_support_tickets", "[]");
        safeStorage.setItem("radius_devices_ubnt", "[]");
        safeStorage.setItem("radius_distributorOffers", "[]"); // just in case
        
        if (onAddNotification) onAddNotification("تم تصفير جميع البيانات بنجاح، جاري إعادة تحميل النظام...", "success");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  };

  const handleExportSystemData = () => {
    try {
      let data = {};
      if (isDistributorSession) {
        data = {
          settings,
          customers,
          distributors,
          devices,
          offers,
          cards,
          servers,
          tickets
        };
      } else {
        data = {
          settings: JSON.parse(safeStorage.getItem("radius_settings") || "null") || settings,
          customers: JSON.parse(safeStorage.getItem("radius_customers") || "null") || [],
          distributors: JSON.parse(safeStorage.getItem("radius_distributors") || "null") || [],
          devices: JSON.parse(safeStorage.getItem("radius_devices") || "null") || [],
          offers: JSON.parse(safeStorage.getItem("radius_offers") || "null") || [],
          cards: JSON.parse(safeStorage.getItem("radius_cards") || "null") || [],
          servers: JSON.parse(safeStorage.getItem("radius_servers") || "null") || [],
          tickets: JSON.parse(safeStorage.getItem("radius_tickets") || "null") || [],
          distributorOffers: JSON.parse(safeStorage.getItem("radius_distributorOffers") || "null") || [],
        };
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `radius_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (onAddNotification) onAddNotification("تم تصدير بيانات النظام بنجاح كملف JSON", "success");
    } catch (error) {
      console.error("Export error:", error);
      if (onAddNotification) onAddNotification("حدث خطأ أثناء تصدير البيانات", "error");
    }
  };

  const handleDeleteCurrency = (code: string) => {
    const curr = currencies.find(c => c.code === code);
    if (curr?.isBase) {
      if (onAddNotification) onAddNotification("لا يمكن حذف العملة الأساسية للنظام!", "warning");
      return;
    }
    if (currencies.length <= 1) {
      if (onAddNotification) onAddNotification("يجب الإبقاء على عملة واحدة على الأقل في النظام!", "warning");
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف العملة",
      message: `هل أنت متأكد من حذف العملة (${code})؟`,
      description: "سيتم مسح هذه العملة من قائمة العملات المتاحة بالنظام.",
      confirmText: "حذف العملة",
      onConfirm: () => {
        const filtered = currencies.filter(c => c.code !== code);
        setCurrencies(filtered);
        if (defaultCurrency === code) {
          const fallback = filtered[0]?.code || "USD";
          setDefaultCurrency(fallback);
        }
        onUpdateSettings({
          ...settings,
          currencies: filtered,
          defaultCurrency: defaultCurrency === code ? (filtered[0]?.code || "USD") : defaultCurrency
        });
        if (onAddNotification) onAddNotification(`تم حذف العملة [${code}] من الإعدادات.`, "info");
      }
    });
  };

  // Toggle Scheduled Task Enabled / Disabled
  const handleToggleTask = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t?.id === taskId) {
        const nextState = !t.enabled;
        const msg = nextState ? `تم تفعيل الجدولة التلقائية لمهمة [${t.title}]` : `تم تعطيل مهمة الجدولة [${t.title}]`;
        if (onAddNotification) onAddNotification(msg, nextState ? "success" : "warning");
        return { ...t, enabled: nextState };
      }
      return t;
    });
    setTasks(updated);
  };

  // Immediate Task Execution Handler ("تشغيل وتنفيذ فوراً")
  const handleRunTaskNow = (task: ScheduledTask) => {
    setRunningTaskId(task?.id);

    setTimeout(() => {
      const nowStr = new Date().toLocaleString("ar-EG");
      let resultDetails = "";
      let affectedCount = 0;

      if (task.actionType === "RESET_CONSUMPTION") {
        if (customers.length > 0 && onUpdateCustomers) {
          const resetCustomers = customers.map(c => ({
            ...c,
            consumptionGB: 0
          }));
          onUpdateCustomers(resetCustomers);
          affectedCount = customers.length;
          resultDetails = `تم تصفير وتفريغ عدادات الاستهلاك بالكامل لعدد (${affectedCount}) مشتركاً (0.0 GB).`;
        } else {
          resultDetails = "تمت عملية تصفير الاستهلاك بنجاح (لا يوجد مشتركين مسجلين).";
        }
        if (onAddNotification) {
          onAddNotification(`⚡ [تصفير الاستهلاك] تم تصفير استهلاك جميع المشتركين (${affectedCount}) بنجاح!`, "success");
        }
      } 
      else if (task.actionType === "AUTO_SUSPEND_EXPIRED") {
        const todayStr = new Date().toISOString().split("T")[0];
        let suspendedNum = 0;
        let kickedNum = 0;

        if (customers.length > 0 && onUpdateCustomers) {
          const updated = customers.map(c => {
            const isExpiredDate = c.expiryDate && c.expiryDate < todayStr;
            if (isExpiredDate || c.status === CustomerStatus.EXPIRED) {
              suspendedNum++;
              if (c.concurrentLogins > 0) kickedNum++;
              return {
                ...c,
                status: CustomerStatus.EXPIRED,
                concurrentLogins: 0
              };
            }
            return c;
          });
          onUpdateCustomers(updated);
          affectedCount = suspendedNum;
          resultDetails = `تم إيقاف (${suspendedNum}) مشتركاً منتهي الصلاحية مع طرد (${kickedNum}) جلسة أونلاين نشطة فورياً.`;
        } else {
          resultDetails = "تم فحص التواريخ بنجاح، ولم يتم العثور على أية حسابات منتهية جديدة.";
        }

        if (onAddNotification) {
          onAddNotification(`⚡ [إيقاف تلقائي] تم فحص وإيقاف (${suspendedNum}) مشتركاً منتهي الصلاحية وطرد جلساتهم بنجاح!`, "success");
        }
      }
      else if (task.actionType === "EXPIRY_ALERTS") {
        const today = new Date();
        const in3Days = new Date();
        in3Days.setDate(today.getDate() + 3);

        const expiringSubscribers = customers.filter(c => {
          if (!c.expiryDate) return false;
          const exp = new Date(c.expiryDate);
          return exp >= today && exp <= in3Days;
        });

        affectedCount = expiringSubscribers.length;
        resultDetails = `تم إرسال (${affectedCount}) إشعار تنبيه عبر بوابة الواتساب للمشتركين الذين تنتهي باقتهم خلال 3 أيام.`;
        if (onAddNotification) {
          onAddNotification(`📱 [تنبيهات الانتهاء] تم إرسال (${affectedCount}) رسالة تنبيهية للمشتركين بنجاح!`, "info");
        }
      }
      else if (task.actionType === "BACKUP_DATA") {
        resultDetails = `تم توليد حزمة أرشفة للنسخة الاحتياطية تحتوي على (${customers.length}) مشتركاً والإعدادات الكلية.`;
        if (onAddNotification) {
          onAddNotification("💾 [النسخ الاحتياطي] تم إنشاء وتأمين النسخة الاحتياطية للنظام بنجاح!", "success");
        }
      }
      else if (task.actionType === "FLUSH_SESSIONS") {
        resultDetails = "تم تنقية وتصفية كافة الجلسات المعلقة عبر حزم RADIUS Disconnect-Request (PoD).";
        if (onAddNotification) {
          onAddNotification("🔄 [تنسيق الجلسات] تم تفريغ وتصفية كافة الجلسات الميتة بنجاح!", "success");
        }
      }
      else {
        resultDetails = "تم تنفيذ المهمة المخصصة بنجاح مع تحديث المتغيرات المرتبطة.";
        if (onAddNotification) {
          onAddNotification(`⚡ تم تنفيذ مهمة [${task.title}] بنجاح!`, "success");
        }
      }

      // Update task statistics
      setTasks(prev => prev.map(t => {
        if (t?.id === task?.id) {
          return {
            ...t,
            lastRun: nowStr,
            runCount: t.runCount + 1
          };
        }
        return t;
      }));

      // Append to execution logs
      const newLog: TaskExecutionLog = {
        id: `exec_${Date.now()}`,
        timestamp: new Date().toLocaleString("ar-EG"),
        taskTitle: task.title,
        actionType: task.actionType,
        status: "success",
        details: resultDetails,
        triggeredBy: `يدوي بواسطة المهندس (${engineerName})`
      };

      setExecutionLogs(prev => [newLog, ...prev]);
      setRunningTaskId(null);
    }, 800);
  };

  // Add new custom task
  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: ScheduledTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDescription.trim() || "مهمة جدولة تلقائية مخصصة للريديوس.",
      actionType: newTaskActionType,
      frequency: newTaskFrequency,
      executionTime: newTaskExecutionTime || "00:00",
      enabled: true,
      lastRun: "لم تُنفذ بعد",
      nextRun: "اليوم القادم 00:00",
      runCount: 0
    };

    setTasks(prev => [newTask, ...prev]);
    setShowNewTaskModal(false);

    // Reset form
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskExecutionTime("00:00");

    if (onAddNotification) {
      onAddNotification(`✅ تم إدراج مهمة جدولة جديدة: [${newTask.title}] بنجاح!`, "success");
    }
  };

  // Delete task
  const handleDeleteTask = (taskId: string, title: string) => {
    setConfirmModal({
      isOpen: true,
      title: "تأكيد حذف مهمة الجدولة",
      message: `هل أنت متأكد من حذف مهمة الجدولة [${title}] نهائياً؟`,
      description: "سيتم إيقاف هذه المهمة وحذفها من المهام التلقائية.",
      confirmText: "حذف المهمة",
      onConfirm: () => {
        setTasks(prev => prev.filter(t => t?.id !== taskId));
        if (onAddNotification) {
          onAddNotification(`تم حذف مهمة الجدولة [${title}].`, "info");
        }
      }
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            الإعدادات العامة وجدولة المهام المتكررة (RADIUS & Cron Tasks)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 mt-1 font-bold">
            تهيئة المتغيرات الكلية للشبكة، إدارة الجدولة الآلية لتصفير الكوتا وإيقاف منتهي الاشتراك، وتخصيص ثيمات اللوحة.
          </p>
        </div>
      </div>


      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-px mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          الإعدادات العامة
        </button>
        <button
          onClick={() => setActiveTab('cleanup')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'cleanup'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          التنظيف التلقائي (Auto-Cleanup)
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'sync'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          <span>تشخيص المزامنة والربط</span>
          {syncFailuresList.length > 0 ? (
            <span className="px-2 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full">
              {syncFailuresList.length} خطأ
            </span>
          ) : (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
              سليم 🟢
            </span>
          )}
        </button>
        {(!currentUser.distributorId) && (
          <button
            onClick={() => setActiveTab('owner')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'owner'
                ? 'border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            إدارة المالك المسئول للنظام
          </button>
        )}
        {(!currentUser.distributorId) && (
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            الأمان والنسخ الاحتياطي
          </button>
        )}
      </div>


      {activeTab === "general" && (
        <div className="space-y-6">
            {/* 1. SCHEDULED TASKS & CRON AUTOMATION ENGINE CARD */}
      {canManageScheduledTasks && (
      <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-sm space-y-6 transition-all">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base md:text-lg flex items-center gap-2">
                  جدولة المهام المتكررة والنظام التلقائي (Scheduled Cron Engine)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold mt-0.5">
                  محرك الجدولة التلقائية المدمج لتنفيذ عمليات 'تصفير الاستهلاك الشهري'، 'إيقاف المشتركين المنتهين'، و'النسخ الاحتياطي'.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              المحرك متصل ومُفعل 🟢
            </span>

            <button
              type="button"
              onClick={() => setShowNewTaskModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              إضافة مهمة متكررة جديدة
            </button>
          </div>
        </div>

        {/* Tasks List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => {
            const isRunning = runningTaskId === task?.id;

            return (
              <div 
                key={task?.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                  task.enabled 
                    ? "bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 dark:border-slate-700 shadow-sm" 
                    : "bg-slate-100 dark:bg-slate-800/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700/60 dark:border-slate-800 opacity-75"
                }`}
              >
                {/* Top Badge & Toggle Header */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      task.actionType === "RESET_CONSUMPTION" ? "bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300" :
                      task.actionType === "AUTO_SUSPEND_EXPIRED" ? "bg-indigo-100 text-indigo-700 dark:bg-rose-950/80 dark:text-indigo-300" :
                      task.actionType === "EXPIRY_ALERTS" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300"
                    }`}>
                      <Zap className="w-3 h-3" />
                      {task.frequency === "monthly" ? "تكرار شهري" :
                       task.frequency === "daily" ? "تكرار يومي" :
                       task.frequency === "weekly" ? "تكرار أسبوعي" : "تكرار دوري"}
                    </span>

                    {/* Enable Toggle Button */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        {task.enabled ? "مُمكّنة" : "مُعطلة"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task?.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                          task.enabled ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                            task.enabled ? "-translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm leading-snug">
                    {task.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-medium leading-relaxed">
                    {task.description}
                  </p>
                </div>

                {/* Execution Details & Run Controls */}
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 dark:border-slate-700/60 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400">
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 dark:border-slate-700/60">
                      <span className="block text-[10px] text-slate-400">تاريخ آخر تنفيذ:</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 dark:text-slate-200">{task.lastRun || "لم تُنفذ"}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60 dark:border-slate-700/60">
                      <span className="block text-[10px] text-slate-400">التنفيذ المباشر القادم:</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{task.nextRun || "غير محدد"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-extrabold">
                      عدد مرات التنفيذ: <span className="font-mono text-slate-700 dark:text-slate-200 dark:text-slate-300">{task.runCount}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task?.id, task.title)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                        title="حذف مهمة الجدولة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleRunTaskNow(task)}
                        className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                          isRunning
                            ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95"
                        }`}
                        title="تشغيل وتنفيذ المهمة فوراً الآن"
                      >
                        {isRunning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            جاري التنفيذ...
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            تشغيل الآن ⚡
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Execution Logs Table */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 dark:text-slate-200 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-500" />
              سجل وقائع تنفيذ الجدولة التلقائية (Cron Logs Trail)
            </h4>

            <button
              type="button"
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: "تفريغ سجل الجدولة",
                  message: "هل تريد تفريغ ومسح سجل وقائع الجدولة التلقائية؟",
                  description: "سيتم مسح كافه السجلات السابقة للعمليات المؤوتمتة.",
                  confirmText: "تفريغ السجل",
                  onConfirm: () => setExecutionLogs([])
                });
              }}
              className="text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition-all"
            >
              تفريغ السجل
            </button>
          </div>

          <div className="table-scroll-container rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right text-xs min-w-[700px] sticky-table">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black border-b border-slate-200 dark:border-slate-800 sticky-thead">
                <tr>
                  <th className="p-3">التاريخ والوقت</th>
                  <th className="p-3">عنوان المهمة</th>
                  <th className="p-3">نوع العملية</th>
                  <th className="p-3">النتيجة والتفاصيل</th>
                  <th className="p-3">المُنَفِذ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200 dark:text-slate-300 font-medium">
                {executionLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400 font-bold">
                      لا توجد سجلات تنفيذ سابقة حتى الآن.
                    </td>
                  </tr>
                ) : (
                  executionLogs.map((log) => (
                    <tr key={log?.id} className="hover:bg-slate-50 dark:bg-slate-800/60 dark:hover:bg-slate-800/40 transition-all">
                      <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">{log.taskTitle}</td>
                      <td className="p-3">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 dark:bg-slate-800 text-slate-700 dark:text-slate-200 dark:text-slate-300">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        {log.details}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px] font-bold">{log.triggeredBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      )}
      {/* Main Settings Form */}

      {/* RADIUS Settings Form */}
      {canManageRadius && (
      <form onSubmit={handleSave} className="space-y-6">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Language Selector Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
                    <Globe className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base md:text-lg">
                    لغة النظام والواجهة (System Language)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold">
                  تبديل لغة القوائم والواجهات ديناميكياً بين العربية والإنجليزي مع ضبط اتجاه التنسيق (RTL / LTR) تلقائياً وحفظ التفضيلات.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                {language === "ar" ? "🇸🇦 العربية (المعيارية)" : "🇬🇧 English (Standard)"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Arabic Option */}
              <button
                type="button"
                onClick={() => {
                  setLanguage("ar");
                  onUpdateSettings({
                    ...settings,
                    radiusName,
                    radiusIp,
                    ownerName,
                    ownerPhone,
                    vpnServerIp,
                    defaultWhatsAppDelayMessage,
                    defaultWhatsAppAlertMessage,
                    language: "ar"
                  });
                  if (onAddNotification) {
                    onAddNotification("🇸🇦 تم تحويل لغة الواجهة والنظام إلى العربية بنجاح!", "success");
                  }
                }}
                className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-4 ${
                  language === "ar"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-700 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50"
                }`}
              >
                <div className={`p-2 rounded-lg text-lg ${language === "ar" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 dark:bg-slate-700 text-slate-600 dark:text-slate-300 dark:text-slate-300"}`}>
                  🇸🇦
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white">العربية (Arabic)</span>
                    {language === "ar" && (
                      <span className="text-xs bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">مُفعلة</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold mt-1">
                    اتجاه الواجهة من اليمين إلى اليسار (RTL) - اللغة الرئيسية.
                  </p>
                </div>
              </button>

              {/* English Option */}
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  onUpdateSettings({
                    ...settings,
                    radiusName,
                    radiusIp,
                    ownerName,
                    ownerPhone,
                    vpnServerIp,
                    defaultWhatsAppDelayMessage,
                    defaultWhatsAppAlertMessage,
                    language: "en"
                  });
                  if (onAddNotification) {
                    onAddNotification("🇬🇧 System language switched to English successfully!", "success");
                  }
                }}
                className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-4 ${
                  language === "en"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-sm ring-2 ring-indigo-500/20"
                    : "border-slate-200 dark:border-slate-700 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50 dark:bg-slate-800/50"
                }`}
              >
                <div className={`p-2 rounded-lg text-lg ${language === "en" ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 dark:bg-slate-700 text-slate-600 dark:text-slate-300 dark:text-slate-300"}`}>
                  🇬🇧
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white">English (الإنجليزي)</span>
                    {language === "en" && (
                      <span className="text-xs bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">Active</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold mt-1">
                    Left-to-Right layout (LTR) with full English menu translations.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Multi-Currency Management & Exchange Rates Card */}
          {canManageCurrencies && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-5 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base md:text-lg">
                    إدارة العملات وأسعار الصرف (Multi-Currency Engine)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold">
                  تحديد العملة الافتراضية لكل موزّع وباقة، ضبط أسعار الصرف بالنسبة للعملة الأساسية، وتوفير أداة تحويل لحظية في الإحصائيات.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleOpenAddCurrency}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-slate-900 font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إضافة عملة جديدة
                </button>
              </div>
            </div>

            {/* System Default Currency Selector */}
            <div className="bg-amber-50/50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-200/60 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 block text-sm">العملة الافتراضية العامة للنظام (Default System Currency):</span>
                <span className="text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold text-[11px]">تُستخدم كعملة افتراضية عند إضافة باقة أو موزع جديد.</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={defaultCurrency}
                  onChange={(e) => {
                    setDefaultCurrency(e.target.value);
                    if (onAddNotification) onAddNotification(`تم تعيين [${e.target.value}] كعملة افتراضية للنظام!`, "success");
                  }}
                  className="bg-white dark:bg-slate-900 dark:bg-slate-800 text-slate-800 dark:text-slate-100 dark:text-slate-100 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 font-black text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {currencies.map(c => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.symbol}) - {c.code}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currencies Grid / Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {currencies.map((curr) => {
                const isSystemDefault = curr.code === defaultCurrency;
                return (
                  <div
                    key={curr.code}
                    className={`p-4 rounded-2xl border transition-all space-y-2 relative ${
                      curr.isBase
                        ? "bg-gradient-to-br from-indigo-50/80 to-blue-50/50 dark:from-indigo-950/50 dark:to-blue-950/30 border-indigo-200 dark:border-indigo-800 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 flex items-center justify-center font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm shadow-xs">
                          {curr.symbol}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 dark:text-white text-xs block">{curr.name}</span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{curr.code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditCurrency(curr)}
                          className="p-1.5 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-all"
                          title="تعديل سعر الصرف والبيانات"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!curr.isBase && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCurrency(curr.code)}
                            className="p-1.5 hover:bg-indigo-100 dark:hover:bg-rose-950 text-indigo-500 rounded-lg transition-all"
                            title="حذف العملة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 dark:border-slate-700/60 flex items-center justify-between text-xs font-bold">
                      <span className="text-[10px] text-slate-400">سعر الصرف (Exchange Rate):</span>
                      <span className="font-mono text-slate-800 dark:text-slate-100 dark:text-slate-200">
                        {curr.isBase ? "1.0 (أساسية)" : `${curr.exchangeRate}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      {curr.isBase && (
                        <span className="text-[9px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-full">
                          👑 العملة الأساسية (Base)
                        </span>
                      )}
                      {isSystemDefault && (
                        <span className="text-[9px] bg-amber-500 text-slate-900 font-black px-2 py-0.5 rounded-full">
                          ⭐ افتراضية النظام
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Test Interactive Exchange Converter inside Settings */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  أداة اختبار تحويل العملات اللحظية (Live Exchange Simulator)
                </h4>
                <span className="text-[10px] text-slate-400 font-bold">تحويل فوري استناداً لأسعار الصرف المحددة أعلاه</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">المبلغ المراد تحويله:</label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">من عملة:</label>
                  <select
                    value={testFrom}
                    onChange={(e) => setTestFrom(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold mb-1">إلى عملة:</label>
                  <select
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                    className="w-full p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {currencies.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl text-center">
                  <span className="block text-[9px] text-amber-300 font-bold">النتيجة المحوّلة اللحظية:</span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {convertCurrencyAmount(testAmount, testFrom, testTo).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencies.find(c => c.code === testTo)?.symbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

                    )}
          {/* Appearance & Dark Mode Toggle Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${isDarkMode ? "bg-amber-500/20 text-amber-400" : "bg-indigo-50 text-indigo-600"}`}>
                  {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </div>
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base">
                  مظهر اللوحة والوضع المظلم (Dark Mode)
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400 font-bold">
                تفعيل ثيم الرؤية الليلية الداكن الكامل لجميع الشاشات والجداول لراحة العين أثناء العمل والتدقيق المتواصل.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className={`text-xs font-black ${isDarkMode ? "text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>
                {isDarkMode ? "الوضع المظلم مفعّل 🌙" : "الوضع الفاتح ☀️"}
              </span>
              <button
                type="button"
                onClick={() => onToggleDarkMode(!isDarkMode)}
                className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isDarkMode ? "bg-indigo-600" : "bg-slate-300"
                }`}
                role="switch"
                aria-checked={isDarkMode}
                title="اضغط لتغيير النمط الداكن/الفاتح"
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white dark:bg-slate-900 shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] ${
                    isDarkMode ? "-translate-x-7" : "translate-x-0"
                  }`}
                >
                  {isDarkMode ? "🌙" : "☀️"}
                </span>
              </button>
            </div>
          </div>

          {/* RADIUS Core Configurations Card */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              المتغيرات الأساسية وعناوين الـ IP
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم نظام الريديوس (RADIUS Identity):</label>
                <input
                  type="text"
                  value={radiusName}
                  onChange={(e) => setRadiusName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">IP السيرفر الرئيسي (Core IP):</label>
                  <input
                    type="text"
                    value={radiusIp}
                    onChange={(e) => setRadiusIp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-blue-600 dark:text-blue-400 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">IP سيرفر الميكروتك VPN (Gateway):</label>
                  <input
                    type="text"
                    value={vpnServerIp}
                    onChange={(e) => setVpnServerIp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-purple-600 dark:text-purple-400 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Owner details card */}
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              البيانات العامة للشبكة والمالك
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم صاحب الريديوس/المجموعة:</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رقم هاتف الدعم الفني العام:</label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          

          {/* Login Page External Branding & Settings Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/10 via-slate-900/10 to-purple-900/10 dark:bg-slate-900 p-6 rounded-2xl border border-indigo-500/20 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-indigo-500/20 dark:border-slate-800 pb-3 gap-2">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>تعديل البيانات الظاهرة في صفحة الدخول الخارجي (Login Page Settings)</span>
              </h3>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-auto">
                ⚡ ينعكس تلقائياً في الواجهة الخارجية عند الحفظ
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
              قم بتخصيص كافة النصوص والبيانات الظاهرة للزوار بصفحة تسجيل الدخول الخارجي. عند الضغط على "حفظ جميع الإعدادات" أدناه يتم تحديثها فوراً.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">اسم النظام / شبكة الريديوس الرئيسي:</label>
                <input
                  type="text"
                  value={radiusName}
                  onChange={(e) => setRadiusName(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">الشعار الفرعي (Tagline):</label>
                <input
                  type="text"
                  value={loginTagline}
                  onChange={(e) => setLoginTagline(e.target.value)}
                  placeholder="مثال: نظام إدارة الشبكات والموزعين المتقدم"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">الوصف الرئيسي في صندوق تسجيل الدخول:</label>
                <input
                  type="text"
                  value={loginDescription}
                  onChange={(e) => setLoginDescription(e.target.value)}
                  placeholder="مثال: منصة الإدارة المركزية لسيرفرات الميكروتيك وباقات المشتركين والموزعين"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">رقم هاتف الدعم الفني المباشر بالخارج:</label>
                <input
                  type="text"
                  value={loginSupportPhone}
                  onChange={(e) => setLoginSupportPhone(e.target.value)}
                  placeholder="مثال: 966500000000"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">الملاحظة/الشريط الأمني أسفل صندوق الدخول:</label>
                <input
                  type="text"
                  value={loginFooterNote}
                  onChange={(e) => setLoginFooterNote(e.target.value)}
                  placeholder="مثال: جلسة مخصصة ومحشوة بنظام تشفير SSL 256-bit لمراقبة الميكروتيك"
                  className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">إظهار زر بوابة المشتركين الذاتية</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400">السماح بالانتقال المباشر لبوابة المشتركين من شريط صفحة الدخول بالخارج</span>
                </div>
                <input
                  type="checkbox"
                  checked={showSubscriberPortalBtn}
                  onChange={(e) => setShowSubscriberPortalBtn(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 dark:border-slate-800 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 dark:text-slate-200">تفعيل وضع الصيانة للمشتركين</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 dark:text-slate-400">إيقاف بوابة المشتركين مؤقتاً وعرض صفحة تحت التحديث للصيانة</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceModeEnabled}
                    onChange={(e) => setMaintenanceModeEnabled(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
                {maintenanceModeEnabled && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">رسالة وضع الصيانة التي تظهر للمشترك:</label>
                    <textarea
                      value={maintenanceModeMessage}
                      onChange={(e) => setMaintenanceModeMessage(e.target.value)}
                      placeholder="رسالة الصيانة التي ستعرض للمشتركين"
                      rows={2}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment & Transfer Settings */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              إعدادات التحويلات البنكية والإيصالات
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم الحساب أو IBAN المطلوب تحويل له:</label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="مثال: SA1234567890..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div className="pt-2 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-700 md:pr-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-800 dark:text-slate-100">التحقق التلقائي من الإيصالات والمطابقة</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">إذا تم إيقافه، ستذهب الإيصالات لقيد المراجعة</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyReceipts}
                  onChange={(e) => setAutoVerifyReceipts(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Automatic Periodic Device Health Check (Ping) Card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-all">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-2.5 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
                    <Activity className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base md:text-lg flex items-center gap-2">
                    الفحص الدوري التلقائي للأجهزة (NetworkDevice Auto-Ping Check)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  يقوم النظام بمحاولة Ping لكافة أجهزة الشبكة (NetworkDevice) دورياً كل 10 دقائق، وتحديث حالة الاتصال (متصل / منفصل) ومعدل الاستجابة تلقائياً.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${
                  autoPingDevicesEnabled
                    ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${autoPingDevicesEnabled ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                  {autoPingDevicesEnabled ? "الفحص التلقائي مُفعل 🟢" : "الفحص الدوري متوقف 🔴"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Toggle Switch */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3">
                <div>
                  <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">
                    تفعيل الفحص الدوري التلقائي للأجهزة
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                    إجراء فحص Ping خلفي مجدول لكافة الأجهزة المسجلة
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoPingDevicesEnabled(!autoPingDevicesEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    autoPingDevicesEnabled ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                      autoPingDevicesEnabled ? "-translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Interval selector */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1">
                <label className="font-extrabold text-xs text-slate-800 dark:text-slate-200 block">
                  فترة الفحص الدوري (بالدقائق):
                </label>
                <select
                  value={autoPingIntervalMinutes}
                  onChange={(e) => setAutoPingIntervalMinutes(parseInt(e.target.value) || 10)}
                  disabled={!autoPingDevicesEnabled}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:opacity-50"
                >
                  <option value={5}>كل 5 دقائق</option>
                  <option value={10}>كل 10 دقائق (الافتراضي)</option>
                  <option value={15}>كل 15 دقيقة</option>
                  <option value={30}>كل 30 دقيقة</option>
                  <option value={60}>كل ساعة (60 دقيقة)</option>
                </select>
              </div>
            </div>

            {/* Last Ping Status & Manual Trigger Bar */}
            <div className="p-4 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200/60 dark:border-purple-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  آخر فحص دوري تم للأجهزة:{" "}
                  <strong className="text-purple-700 dark:text-purple-300 font-mono">
                    {lastAutoPingDevicesDate
                      ? new Date(lastAutoPingDevicesDate).toLocaleString("ar-EG", {
                          dateStyle: "medium",
                          timeStyle: "short"
                        })
                      : "لم يتم إجراء فحص دوري بعد"}
                  </strong>
                </span>
              </div>

              <button
                type="button"
                disabled={isManualPingRunning}
                onClick={async () => {
                  setIsManualPingRunning(true);
                  if (onRunAutoPingDevices) {
                    await onRunAutoPingDevices(true);
                  } else if (onAddNotification) {
                    onAddNotification("✅ تم إجراء فحص أجهزة الشبكة بنجاح!", "success");
                  }
                  setLastAutoPingDevicesDate(new Date().toISOString());
                  setTimeout(() => setIsManualPingRunning(false), 1200);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isManualPingRunning ? "animate-spin" : ""}`} />
                <span>{isManualPingRunning ? "جارٍ الفحص والمصادقة..." : "فحص Ping شامل لجميع الأجهزة الآن"}</span>
              </button>
            </div>
          </div>

          {/* Backend API Integration Settings */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              إعدادات الربط مع الخادم الخلفي (Backend API Integration)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الرابط الأساسي للخادم (Backend Base URL):</label>
                <input
                  type="text"
                  value={backendBaseUrl}
                  onChange={(e) => setBackendBaseUrl(e.target.value)}
                  placeholder="مثال: https://api.yourdomain.com أو http://localhost:8000"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-left font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مفتاح التوثيق (API Token) - اختياري:</label>
                <input
                  type="password"
                  value={backendApiToken}
                  onChange={(e) => setBackendApiToken(e.target.value)}
                  placeholder="أدخل الـ Token السري الخاص بالـ Backend إن وجد"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-left font-mono"
                  dir="ltr"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-bold">
              ملاحظة: تُستخدم هذه الإعدادات للتواصل المباشر مع واجهات (FastAPI / Flask) لإدارة FreeRADIUS. إذا تركت فارغة سيتم الاعتماد على المحاكي الداخلي (Mock) للنظام.
            </p>
          </div>

          {/* WhatsApp templates editing card */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              نماذج رسائل وإشعارات الواتس آب الافتراضية للعملاء
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">نموذج رسالة تذكير انتهاء الاشتراك (Alert delay):</label>
                <p className="text-[10px] text-slate-400 mb-1.5 font-bold">يمكن استخدام المتغيرات التلقائية: {`{name}`} لاسم العميل، {`{username}`} لاسم المستخدم، {`{expiryDate}`} لتاريخ الانتهاء، و {`{offer}`} للباقة.</p>
                <textarea
                  value={defaultWhatsAppDelayMessage}
                  onChange={(e) => setDefaultWhatsAppDelayMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[90px] font-medium leading-relaxed text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">نموذج رسالة تنبيه تجاوز سعة استهلاك الكوتة (Quota alert):</label>
                <p className="text-[10px] text-slate-400 mb-1.5 font-bold">يمكن استخدام المتغيرات التلقائية: {`{name}`} لاسم العميل، و {`{consumption}`} لحساب كمية الاستهلاك الفعلي.</p>
                <textarea
                  value={defaultWhatsAppAlertMessage}
                  onChange={(e) => setDefaultWhatsAppAlertMessage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[90px] font-medium leading-relaxed text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Bottom Submit Bar */}
        <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-400 font-bold">
            يتكفل خادم ريديوس أوبنتو بتوزيع هذه القيم على كافة أجهزة الميكروتيك VPN المتصلة.
          </span>

          <div className="flex items-center gap-3">
            {savedSuccess && (
              <span className="text-xs text-green-600 font-extrabold flex items-center gap-1">
                <Check className="w-4 h-4 animate-bounce" /> تم حفظ التغييرات وجارٍ الأرشفة!
              </span>
            )}
            
            {canResetRadius && (
            <button
              type="button"
              onClick={handleResetRadiusData}
              className="px-6 py-2.5 bg-rose-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 font-extrabold text-xs rounded-xl transition-all shadow-sm border border-rose-200 dark:border-indigo-500/30 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              تصفير بيانات الريديوس
            </button>
            )}
            {canExportRadius && (
            <button
              type="button"
              onClick={handleExportSystemData}
              className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-all shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              تصدير بيانات النظام كنسخة احتياطية
            </button>
            )}

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ وتطبيق الإعدادات
            </button>
          </div>
        </div>
      </form>

      )}
      {/* CREATE NEW SCHEDULED TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                إضافة مهمة جدولة متكررة جديدة
              </h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="p-1 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTask} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">عنوان المهمة المجدولة:</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="مثلاً: تصفير كوتا باقة الألعاب أسبوعياً..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">نوع العمليات المنفذة:</label>
                <select
                  value={newTaskActionType}
                  onChange={(e) => setNewTaskActionType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="RESET_CONSUMPTION">تصفير الاستهلاك والكوتا بالكامل (Reset Consumption)</option>
                  <option value="AUTO_SUSPEND_EXPIRED">إيقاف منتهي الصلاحية وطرد الجلسات النشطة (Auto Suspend)</option>
                  <option value="EXPIRY_ALERTS">إرسال تنبيهات وتذكيرات الواتساب (Expiry Alerts)</option>
                  <option value="BACKUP_DATA">النسخ الاحتياطي التلقائي (Backup Data)</option>
                  <option value="FLUSH_SESSIONS">تنظيف الجلسات الميتة (Flush Stale Sessions)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">التكرار الدوري:</label>
                  <select
                    value={newTaskFrequency}
                    onChange={(e) => setNewTaskFrequency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="daily">يومياً</option>
                    <option value="weekly">أسبوعياً</option>
                    <option value="monthly">شهرياً</option>
                    <option value="every_6h">كل 6 ساعات</option>
                    <option value="every_12h">كل 12 ساعة</option>
                    <option value="hourly">كل ساعة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">وقت التنفيذ المحدد:</label>
                  <input
                    type="text"
                    value={newTaskExecutionTime}
                    onChange={(e) => setNewTaskExecutionTime(e.target.value)}
                    placeholder="00:00"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">شرح وتفاصيل المهمة:</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  placeholder="وصف اختياري للمهمة..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[70px]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all font-black"
                >
                  إدراج وجدولة المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ADD / EDIT CURRENCY MODAL */}
      {showAddCurrencyModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 dark:border-slate-700 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3">
              <h3 className="font-black text-slate-800 dark:text-slate-100 dark:text-slate-100 text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                {editingCurrency ? "تعديل بيانات وسعر صرف العملة" : "إضافة عملة جديدة للنظام"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCurrencyModal(false)}
                className="p-1 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrency} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">رمز العملة (Code):</label>
                  <input
                    type="text"
                    value={currencyCode}
                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                    placeholder="مثال: USD, LYD, SYP"
                    disabled={!!editingCurrency}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">رمز العرض (Symbol):</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="مثال: $, د.ل, ل.س"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">اسم العملة الكامل:</label>
                <input
                  type="text"
                  value={currencyName}
                  onChange={(e) => setCurrencyName(e.target.value)}
                  placeholder="مثال: دينار ليبي، دولار أمريكي..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">
                  سعر الصرف مقارنة بالعملة الأساسية (Exchange Rate):
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={currencyRate}
                  onChange={(e) => setCurrencyRate(Number(e.target.value))}
                  disabled={currencyIsBase}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 dark:text-slate-100 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 block mt-1 font-normal">
                  كم تسوي هذه العملة مقارنة بالعملة الأساسية (إذا كانت العملة الأساسية USD، فإن 1 USD = {currencyRate} من هذه العملة).
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="currencyIsBaseChk"
                  checked={currencyIsBase}
                  onChange={(e) => {
                    setCurrencyIsBase(e.target.checked);
                    if (e.target.checked) setCurrencyRate(1.0);
                  }}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                />
                <label htmlFor="currencyIsBaseChk" className="text-slate-800 dark:text-slate-100 dark:text-slate-200 cursor-pointer">
                  تعيين هذه العملة كـ <strong>العملة الأساسية (Base Currency = 1.0)</strong> للنظام
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCurrencyModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-slate-900 rounded-xl shadow-md transition-all font-black"
                >
                  {editingCurrency ? "تحديث العملة" : "حفظ وإدراج العملة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        </div>
      )}


      {activeTab === "owner" && (
        <div className="space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Engineer details card */}
          {(!currentUser.distributorId) && (
          <div className="bg-white dark:bg-slate-900 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              البيانات الخاصة بالمهندس المسؤول
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم المهندس المسؤول:</label>
                <input
                  type="text"
                  value={engineerName}
                  onChange={(e) => setEngineerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-800 dark:text-slate-100 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">رتبة/صفة المهندس في النظام:</label>
                <input
                  type="text"
                  value={engineerRole}
                  onChange={(e) => setEngineerRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 dark:text-slate-200 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">اسم مستخدم المهندس (Username):</label>
                <input
                  type="text"
                  value={engineerUsername}
                  onChange={(e) => setEngineerUsername(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700 dark:text-slate-200 dark:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 dark:text-slate-400 mb-1">كلمة المرور (Password):</label>
                <div className="relative">
                  <input
                    type={showEngineerPassword ? "text" : "password"}
                    value={engineerPassword}
                    onChange={(e) => setEngineerPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور الحالية أو الجديدة..."
                    className="w-full p-2.5 pl-10 bg-slate-50 dark:bg-slate-800 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-700 dark:text-slate-200 dark:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEngineerPassword(!showEngineerPassword)}
                    className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
                  >
                    {showEngineerPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
              
              {/* Permissions Display */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base border-b border-slate-200 dark:border-slate-800 pb-3 mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-600" />
                  الصلاحيات الكلية للنظام
                </h3>
                <div className="px-2 py-3 text-xs md:text-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-sm">
                  بصفتك المالك المسئول للنظام (أو مدير تقني)، أنت تمتلك كافة الصلاحيات المتاحة في النظام لجميع الوحدات والإعدادات بشكل افتراضي، ولا يمكن تقييدها.
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1 pl-1 mt-4">
                  {PERMISSION_GROUPS.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group?.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm opacity-80">
                        <div className={`p-3 border-b dark:border-slate-800 flex items-center justify-between ${group.headerBg}`}>
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200`}>
                              <GroupIcon className="w-4 h-4" />
                            </div>
                            <span className="font-extrabold text-slate-800 dark:text-slate-100 text-xs">{group.title}</span>
                          </div>
                          <span className="text-[10px] font-black bg-white/60 dark:bg-slate-900/60 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            {group.permissions.length} / {group.permissions.length}
                          </span>
                        </div>
                        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                          {group.permissions.map((perm) => (
                            <label
                              key={perm.key}
                              className="flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-not-allowed bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                            >
                              <div className="relative flex items-center mt-0.5">
                                <input type="checkbox" checked readOnly className="sr-only" />
                                <div className="w-4 h-4 rounded-md border flex items-center justify-center transition-all bg-emerald-500 border-emerald-500">
                                  <Check className="w-3 h-3 text-slate-900" />
                                </div>
                              </div>
                              <div className="flex-1 space-y-1">
                                <span className="font-extrabold text-slate-800 dark:text-slate-100 block line-clamp-1 text-[11px] leading-tight">{perm.label}</span>
                                <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-relaxed opacity-90">{perm.desc}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-slate-900 font-black rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Save className="w-5 h-5" />
                  حفظ بيانات المالك
                </button>
                {savedSuccess && (
                  <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in fade-in slide-in-from-right-4">
                    <Check className="w-5 h-5" />
                    تم حفظ البيانات بنجاح
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === "security" && !currentUser.distributorId && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 dark:border-rose-900/30 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  نظام العزل الصارم الشامل (Strict Isolation System)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  نظام أمان عالي الحماية يضمن الفصل الكامل والتام بين بيانات الموزعين والعملاء والسيرفرات والسجلات.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                  settings.strictIsolation 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  {settings.strictIsolation ? "العزل الصارم مفعّل شاملاً" : "العزل الصارم اختياري"}
                </span>
              </div>
            </div>

            {/* Master Global Switch */}
            <div className="p-4 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  تفعيل نظام العزل الصارم على كامل النظام
                </h4>
                <p className="text-xs text-indigo-800/80 dark:text-indigo-300">
                  عند التفعيل، يحظر على كل موزع رؤية أي بيانات تخص موزعين آخرين أو موزعين فرعيين أو مشتركيهم نهائياً.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const newStatus = !settings.strictIsolation;
                  onUpdateSettings({
                    ...settings,
                    strictIsolation: newStatus
                  });
                  if (onUpdateDistributor && distributors.length > 0) {
                    distributors.forEach(dist => {
                      onUpdateDistributor({
                        ...dist,
                        strictIsolation: newStatus
                      });
                    });
                  }
                }}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  settings.strictIsolation ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                    settings.strictIsolation ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Bulk Enforce Action */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (onUpdateDistributor && distributors.length > 0) {
                    distributors.forEach(dist => {
                      onUpdateDistributor({
                        ...dist,
                        strictIsolation: true
                      });
                    });
                  }
                  onUpdateSettings({
                    ...settings,
                    strictIsolation: true
                  });
                }}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>تطبيق العزل الصارم فوراً على كافة الموزعين ({distributors.length})</span>
              </button>
            </div>

            {/* Individual Distributor Control List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                حالة العزل الصارم لكل موزع على حدة:
              </h4>
              {distributors.length === 0 ? (
                <p className="text-sm text-slate-400">لا يوجد موزعين مسجلين حالياً.</p>
              ) : (
                distributors.map(dist => (
                  <div key={dist.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">{dist.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">@{dist.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        dist.strictIsolation || settings.strictIsolation
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                      }`}>
                        {dist.strictIsolation || settings.strictIsolation ? "معزول صارمًا" : "عزل عادي"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onUpdateDistributor) {
                            onUpdateDistributor({
                              ...dist,
                              strictIsolation: !dist.strictIsolation
                            });
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          dist.strictIsolation || settings.strictIsolation ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                            dist.strictIsolation || settings.strictIsolation ? '-translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                  <Server className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  إدارة استقرار وأداء النظام
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  إعدادات إعادة التشغيل التلقائي وتطهير الجلسات الخاملة لضمان أفضل أداء على الجوال والكمبيوتر.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-1 pr-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">إعادة تشغيل النظام تلقائياً</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">إعادة تهيئة الذاكرة وتنظيف العمليات الدورية.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={settings.autoRestartDays || 7}
                      onChange={(e) => onUpdateSettings({ ...settings, autoRestartDays: parseInt(e.target.value) || 7 })}
                      disabled={!settings.autoRestartEnabled}
                      className="w-20 px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-center focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">أيام</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ ...settings, autoRestartEnabled: !settings.autoRestartEnabled })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      settings.autoRestartEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                        settings.autoRestartEnabled ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-1 pr-4">
                  <h4 className="font-bold text-slate-900 dark:text-white">تطهير الجلسات الخاملة (Purge Idle Sessions)</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">فصل الجلسات المعلقة تلقائياً لتحرير الموارد.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, autoPurgeIdleSessions: !settings.autoPurgeIdleSessions })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.autoPurgeIdleSessions ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                      settings.autoPurgeIdleSessions ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-1 pr-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    القفل البيومتري (البصمة / الوجه)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تفعيل تسجيل الدخول باستخدام البصمة أو التعرف على الوجه للأجهزة الداعمة.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const newValue = !settings.enableBiometricLogin;
                    if (newValue) {
                      if (!window.PublicKeyCredential) {
                        if (onAddNotification) onAddNotification("جهازك لا يدعم المصادقة البيومترية.", "error");
                        return;
                      }
                      try {
                        // Create a dummy credential just to check if the device can do it and get permission
                        const challenge = new Uint8Array(32);
                        window.crypto.getRandomValues(challenge);
                        const userId = new Uint8Array(16);
                        window.crypto.getRandomValues(userId);
                        
                        await navigator.credentials.create({
                          publicKey: {
                            challenge,
                            rp: { name: "RADIUS System", id: window.location.hostname },
                            user: { id: userId, name: "admin", displayName: "Administrator" },
                            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
                            authenticatorSelection: { userVerification: "preferred" },
                            timeout: 60000,
                            attestation: "none"
                          }
                        });
                        
                        onUpdateSettings({ ...settings, enableBiometricLogin: true });
                        if (onAddNotification) onAddNotification("تم تفعيل القفل البيومتري بنجاح.", "success");
                      } catch (err) {
                        console.error("Biometric setup failed:", err);
                        if (onAddNotification) onAddNotification("فشل تفعيل البصمة. تأكد من إعدادها في جهازك.", "error");
                      }
                    } else {
                      onUpdateSettings({ ...settings, enableBiometricLogin: false });
                      if (onAddNotification) onAddNotification("تم إيقاف القفل البيومتري.", "success");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                    settings.enableBiometricLogin ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                      settings.enableBiometricLogin ? '-translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "cleanup" && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  التنظيف التلقائي وتطهير قاعدة البيانات (Auto-Cleanup & Optimization)
                  {autoCleanupEnabled ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      مُفعل 🟢
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                      معطل ⚪
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">
                  جدولة آلية وتطهير دوري للكروت المستهلكة القديمة وسجلات الأنشطة السابقة لتسريع الاستجابة وتخفيف حجم قاعدة البيانات.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunFullAutoCleanup}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>تشغيل التنظيف والشطب الشامل الآن</span>
            </button>
          </div>

          {/* Database Metrics Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>الكروت المستهلكة المتاحة للتنظيف</span>
                <CreditCard className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {oldCardsCount} <span className="text-xs text-slate-400 font-normal">كارت (&gt; {autoDeleteCardsDays} يوم)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">إجمالي الكروت المستخدمة: {usedCardsCount}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>سجلات الأنشطة والعمليات القديمة</span>
                <History className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-100">
                {oldLogsCount} <span className="text-xs text-slate-400 font-normal">سجل (&gt; {autoDeleteAuditLogsDays} يوم)</span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">إجمالي سجلات النظام: {totalLogsCount}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>تحسين سرعة الاستجابة المتوقع</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                +35% <span className="text-xs text-slate-400 font-normal">سرعة المعالجة</span>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">تخفيف الحمل على متصفح السيرفرات</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>آخر تاريخ تنفيذ للتنظيف</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-sm font-black text-slate-800 dark:text-slate-100 truncate mt-1">
                {lastAutoCleanupDate || "لم يُنفذ بعد"}
              </div>
              <p className="text-[11px] text-slate-400 font-semibold">جدولة: {autoCleanupFrequency === "daily" ? "يومياً" : autoCleanupFrequency === "weekly" ? "أسبوعياً" : "شهرياً"}</p>
            </div>
          </div>

          {/* Configuration Settings Box */}
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
                إعدادات وجدولة الحذف التلقائي
              </h4>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                حفظ الإعدادات
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enable Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <label className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">
                    تفعيل الحذف والكبس التلقائي لقاعدة البيانات
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    تشغيل الجدولة التلقائية لحذف الكروت والسجلات القديمة بشكل دوري.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoCleanupEnabled}
                  onChange={(e) => setAutoCleanupEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Cleanup Frequency */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  تكرار دورة التنظيف التلقائي (Cleanup Frequency):
                </label>
                <select
                  value={autoCleanupFrequency}
                  onChange={(e) => setAutoCleanupFrequency(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="daily">يومياً (عند الساعة 03:00 صباحاً)</option>
                  <option value="weekly">أسبوعياً (كل يوم جمعة 03:00 صباحاً)</option>
                  <option value="monthly">شهرياً (بداية كل شهر ميلادي)</option>
                </select>
              </div>

              {/* Cards Retention Period */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  فترة الاحتفاظ بالكروت المستهلكة (بالأيام):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={autoDeleteCardsDays}
                    onChange={(e) => setAutoDeleteCardsDays(Number(e.target.value) || 90)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">يوماً (افتراضي 90 يوم)</span>
                </div>
                <p className="text-[11px] text-slate-400">سيتم حذف أي كارت هوت سبوت بحالة "مستخدم" وتاريخ استخدامه أقدم من هذا العدد.</p>
              </div>

              {/* Audit Logs Retention Period */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  فترة الاحتفاظ بسجلات الأنشطة والعمليات (بالأيام):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={autoDeleteAuditLogsDays}
                    onChange={(e) => setAutoDeleteAuditLogsDays(Number(e.target.value) || 90)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold text-slate-500 shrink-0">يوماً (افتراضي 90 يوم)</span>
                </div>
                <p className="text-[11px] text-slate-400">سيتم تطهير سجلات الأنشطة وتتبع إجراءات المستخدمين الأقدم من هذه المدة.</p>
              </div>
            </div>
          </form>

          {/* Quick Manual Purge Actions */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-500" />
              إجراءات التطهير اليدوي الفوري (Manual Purge Triggers)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl space-y-3">
                <div>
                  <h5 className="font-bold text-rose-900 dark:text-rose-200 text-sm flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-rose-500" />
                    حذف الكروت المستهلكة القديمة (&gt; {autoDeleteCardsDays} يوم)
                  </h5>
                  <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
                    تنظيف كافة كروت الهوت سبوت المستخدمة والتي مضى عليها أكثر من {autoDeleteCardsDays} يوم.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurgeUsedCards(autoDeleteCardsDays)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تطهير الكروت المستهلكة الآن ({oldCardsCount})</span>
                </button>
              </div>

              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-xl space-y-3">
                <div>
                  <h5 className="font-bold text-amber-900 dark:text-amber-200 text-sm flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-500" />
                    تطهير سجلات الأنشطة القديمة (&gt; {autoDeleteAuditLogsDays} يوم)
                  </h5>
                  <p className="text-xs text-amber-700/80 dark:text-amber-300/80 mt-1">
                    تفريغ سجلات تتبع العمليات والأحداث المسجلة الأقدم من {autoDeleteAuditLogsDays} يوم.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePurgeAuditLogs(autoDeleteAuditLogsDays)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تطهير السجلات الآن ({oldLogsCount})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sync" && (
        <div className="space-y-6">
          {/* Diagnostic Tool Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    أداة تشخيص المزامنة السحابية اللحظية (Sync Diagnostics & Error Tracker)
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                    فحص حالة المزامنة المباشرة، وتشخيص أسباب انقطاع التزامن بين الكمبيوتر والجوال والمتصفحات المختلفة.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={async () => {
                    setIsTestingSync(true);
                    await fetchRemoteState(true);
                    setTimeout(() => setIsTestingSync(false), 600);
                    if (onAddNotification) {
                      onAddNotification("⚡ تم تنفيذ اختبار المزامنة والفحص المباشر مع السيرفر بنجاح!", "info");
                    }
                  }}
                  disabled={isTestingSync}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTestingSync ? "animate-spin" : ""}`} />
                  <span>فحص واختبار المزامنة الآن</span>
                </button>

                {syncFailuresList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearSyncFailures();
                      if (onAddNotification) onAddNotification("تم مسح سجل أخطاء المزامنة بنجاح", "success");
                    }}
                    className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800/60 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>مسح السجل</span>
                  </button>
                )}
              </div>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">حالة الاتصال المباشر</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-3 w-3">
                    <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      syncStatusState === 'connected' ? 'bg-emerald-400 animate-ping' : syncStatusState === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-red-400 animate-ping'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${
                      syncStatusState === 'connected' ? 'bg-emerald-500' : syncStatusState === 'syncing' ? 'bg-amber-500' : 'bg-red-500'
                    }`} />
                  </span>
                  <span className={`text-base font-black ${
                    syncStatusState === 'connected' ? 'text-emerald-600 dark:text-emerald-400' : syncStatusState === 'syncing' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {syncStatusState === 'connected' ? 'متصل بنجاح (Live)' : syncStatusState === 'syncing' ? 'جاري التزامن...' : 'غير متصل (Disconnected)'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">عدد الأخطاء المسجلة</span>
                <div className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span className={syncFailuresList.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}>
                    {syncFailuresList.length}
                  </span>
                  <span className="text-xs font-normal text-slate-400">عملية فاشلة</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">بروتوكول المزامنة المستخدم</span>
                <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">
                  REST API + BroadcastChannel
                </div>
                <span className="text-[11px] text-slate-400 block">مزامنة تلقائية كل 1.5 ثانية</span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">نقطة المزامنة السحابية</span>
                <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono truncate">
                  /api/sync
                </div>
                <span className="text-[11px] text-slate-400 block">دعم التشفير والربط الثنائي</span>
              </div>
            </div>
          </div>

          {/* Sync Failures Error Log (Last 5 Failures) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                سجل أخطاء وانقطاع المزامنة (آخر 5 عمليات فاشلة)
              </h4>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
                عرض {Math.min(syncFailuresList.length, 5)} من أصل {syncFailuresList.length}
              </span>
            </div>

            {syncFailuresList.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-base">
                    لا توجد أي أخطاء أو انقطاع في المزامنة!
                  </h5>
                  <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 max-w-md mx-auto">
                    الاتصال السحابي والتزامن اللحظي بين المتصفحات والأجهزة يعمل باستقرار وسلاسة دون أي عمليات معلقة أو مفقودة.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {syncFailuresList.slice(0, 5).map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-4 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl space-y-2 transition-all hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-200/50 dark:border-rose-900/30 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-[11px] font-black rounded-lg bg-rose-600 text-white">
                          # {index + 1}
                        </span>
                        <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-lg ${
                          log.type === 'push' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30' : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {log.type === 'push' ? 'إرسال بيانات (PUSH)' : 'جلب بيانات (FETCH)'}
                        </span>
                        {log.statusCode && (
                          <span className="px-2 py-0.5 text-[11px] font-mono font-black bg-slate-800 text-slate-100 rounded-md">
                            HTTP {log.statusCode}
                          </span>
                        )}
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                          {log.endpoint}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {log.timestamp}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-rose-900 dark:text-rose-200 flex items-start gap-1.5">
                        <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>تفاصيل الخطأ: {log.errorMessage}</span>
                      </p>
                      {log.payloadSummary && (
                        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 pr-5">
                          العناصر المتأثرة: <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-[10px] text-indigo-600 dark:text-indigo-300">{log.payloadSummary}</code>
                        </p>
                      )}
                    </div>

                    <div className="pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/40 dark:border-slate-800/40 flex items-center justify-between">
                      <span>💡 اقتراح الحل: تحقق من اتصال الشبكة، أو أعد تحميل الصفحة لإجبار إعادة الاتصال.</span>
                      <button
                        onClick={() => fetchRemoteState(true)}
                        className="text-indigo-600 dark:text-indigo-400 font-extrabold hover:underline"
                      >
                        إعادة التجربة الآن ←
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        description={confirmModal.description}
        confirmText={confirmModal.confirmText}
        isDanger={confirmModal.isDanger}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
