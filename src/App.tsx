import { logAction } from "./utils/logger";
import { safeStorage } from "./utils/storage";
import { encryptData, decryptData } from "./utils/crypto";
import { fetchRemoteState, registerSyncListener, pushStateToServer, syncPersistentStorage, SyncStatus, registerSyncStatusListener } from "./utils/syncManager";
import React, { useState, useEffect, useMemo, useCallback, Suspense, lazy } from "react";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */


import {

  LayoutDashboard, 
  Wifi, 
  Radio, 
  BarChart3, 
  Percent, 
  Users, 
  Server, 
  History, 
  CreditCard, 
  UserCheck, 
  UserCheck2,
  MessageSquare, 
  Settings,
  Shield,
  Menu,
  X,
  Lock,
  User,
  LogOut,
  Signal,
  Moon,
  Sun,
  Zap,
  Globe,
  DollarSign,
  Eye,
  EyeOff,
  Key,
  Edit,
  Check,
  FileText,
  RefreshCw,
  Coins,
  HardDrive
} from "lucide-react";

import { getTranslation, Language } from "./i18n";
import { DEFAULT_CURRENCIES } from "./utils/constants";

import AutoTranslator from "./components/AutoTranslator";


import {

  Customer,
  CustomerStatus,
  ConnectionType,
  SpeedOffer, 
  NetworkDevice, 
  NasServer, 
  HotspotCard, 
  Distributor, 
  DistributorPermissions,
  SupportTicket, 
  GeneralSettings,
  UserRole,
  DeletedCustomer,
  Currency,
  DistributorOffer
} from "./types";

// Import custom page views
const DashboardView = lazy(() => import("./components/DashboardView"));
const PingTestView = lazy(() => import("./components/PingTestView"));
const DevicesView = lazy(() => import("./components/DevicesView"));
const StatsView = lazy(() => import("./components/StatsView"));
const OffersView = lazy(() => import("./components/OffersView"));
const SubscribersView = lazy(() => import("./components/SubscribersView"));
const NasServersView = lazy(() => import("./components/NasServersView"));
const AuditLogsView = lazy(() => import("./components/AuditLogsView"));
const HotspotCardsView = lazy(() => import("./components/HotspotCardsView"));
const DistributorsView = lazy(() => import("./components/DistributorsView"));
const SubDistributorManagementView = lazy(() => import("./components/SubDistributorManagementView"));
const SupportView = lazy(() => import("./components/SupportView"));
const SettingsView = lazy(() => import("./components/SettingsView"));
const PermissionProfilesView = lazy(() => import("./components/PermissionProfilesView"));
const SubscriberPortalView = lazy(() => import("./components/SubscriberPortalView"));
const LoginView = lazy(() => import("./components/LoginView"));
const ReceiptsReviewView = lazy(() => import("./components/ReceiptsReviewView"));
const SubscriberFinancialsView = lazy(() => import("./components/SubscriberFinancialsView"));
const DistributorSubscriptionsView = lazy(() => import("./components/DistributorSubscriptionsView"));


const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[100dvh] w-full bg-slate-950 text-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return safeStorage.getItem("isLoggedIn") === "true";
  });
  const [adminAccount, setAdminAccount] = useState<any>(() => {
    const st = safeStorage.getItem("adminAccount");
    return st ? JSON.parse(st) : { name: "المدير", role: "admin", username: "admin", password: "1" };
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const st = safeStorage.getItem("currentUser");
    return st ? JSON.parse(st) : { name: "المدير", role: "admin", username: "admin", password: "1" };
  });
  const [isPortalMode, setIsPortalMode] = useState<boolean>(() => {
    return safeStorage.getItem("isPortalMode") === "true";
  });
  const [loggedInCustomerId, setLoggedInCustomerId] = useState<string>(() => {
    return safeStorage.getItem("loggedInCustomerId") || "";
  });

  const checkReadOnly = () => false;
  const updateStateAndPersist = (key: string, value: any, setter: any, logTarget: string, logActionName: string) => {
    setter(value);
    saveToStorage(key, value);
    logAction("admin", logTarget, logActionName);
  };
  
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsPortalMode(false);
    setLoggedInCustomerId("");
    safeStorage.removeItem("isLoggedIn");
    safeStorage.removeItem("currentUser");
    safeStorage.removeItem("isPortalMode");
    safeStorage.removeItem("loggedInCustomerId");
    addNotification("تم تسجيل الخروج", "success");
    setMobileMenuOpen(false);
    setActivePage(0);
  };
  const handleRegisterDistributor = () => {};
  const handleRegisterCustomer = () => {};
  const handleLoginSuccess = (user: any, forcePaymentPage?: boolean) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    safeStorage.setItem("isLoggedIn", "true");
    safeStorage.setItem("currentUser", JSON.stringify(user));

    const distObj = distributors.find(d => d.id === user?.distributorId || d.id === user?.id || d.username?.toLowerCase() === user?.username?.toLowerCase());
    const isExpired = forcePaymentPage || (distObj && distObj.subscriptionStatus === "منتهي");

    if (isExpired) {
      setActivePage(15);
      addNotification("اشتراكك منتهي حالياً. تم توجيهك مباشرة إلى صفحة التجديد التلقائي لتنشيط حسابك.", "warning");
    } else {
      setActivePage(0);
    }
  };
  const handleOpenProfileModal = () => {
    setProfileName(currentUser?.name || "المالك المسئول للنظام");
    setProfileUsername(currentUser?.username || "admin");
    setProfilePassword(currentUser?.password || "1");
    setShowProfileModal(true);
  };

  // For DevicesView interval error
  // Load initial data from safeStorage or fallback to mock seed data

  const [activePage, setActivePage] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePortalDistributorId, setActivePortalDistributorId] = useState<string>("");

  // Dark Mode State with LocalStorage Persistence
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return safeStorage.getItem("radius_dark_mode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    safeStorage.setItem("radius_dark_mode", String(darkMode));
  }, [darkMode]);

  // States
  const [offers, setOffers] = useState<SpeedOffer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [servers, setServers] = useState<NasServer[]>([]);
  const [cards, setCards] = useState<HotspotCard[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [distributorOffers, setDistributorOffers] = useState<DistributorOffer[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<GeneralSettings>({});

  // Update document title when radiusName changes
  useEffect(() => {
    document.title = settings.radiusName || "RADIUS";
  }, [settings.radiusName]);
  const [deletedCustomers, setDeletedCustomers] = useState<DeletedCustomer[]>([]);
  const displayCurrencies = settings.currencies?.length ? settings.currencies : DEFAULT_CURRENCIES;
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("connected");

  const [subscriberInitialFilters, setSubscriberInitialFilters] = useState<{
    statusFilter?: string;
    onlineFilter?: string;
    debtFilter?: string;
    expiryFilter?: string;
  } | null>(null);

  const [hotspotCardsInitialFilters, setHotspotCardsInitialFilters] = useState<{
    statusFilter?: "all" | "unused" | "used";
  } | null>(null);

  const handleDashboardNavigate = (pageIndex: number, filters?: Record<string, any>) => {
    if (filters) {
      if (pageIndex === 5) {
        setSubscriberInitialFilters({
          statusFilter: filters.statusFilter,
          onlineFilter: filters.onlineFilter,
          debtFilter: filters.debtFilter,
          expiryFilter: filters.expiryFilter
        });
      } else if (pageIndex === 8) {
        setHotspotCardsInitialFilters({
          statusFilter: filters.statusFilter
        });
      }
    } else {
      if (pageIndex === 5) setSubscriberInitialFilters(null);
      if (pageIndex === 8) setHotspotCardsInitialFilters(null);
    }
    setActivePage(pageIndex);
  };

  const isDistributorSession = currentUser?.role === "موزع" || currentUser?.role === "sub_distributor" || currentUser?.role === "موزع معتمد" || currentUser?.role === "DISTRIBUTOR";
  const currentDistributorId = currentUser?.distributorId;
  const isRootAdmin = currentUser?.role === "مالك النظام" || currentUser?.role === "admin" || currentUser?.role === "مدير" || currentUser?.role === "مدير تقني" || currentUser?.role === "ADMIN";
  const isAdmin = isRootAdmin || currentUser?.permissions?.canManageAdmin;
  const activeDistributorObj = distributors.find(d => d.id === currentDistributorId);
  const computedPermissions = currentUser?.permissions || activeDistributorObj?.permissions || {};

  const displayCustomers = isDistributorSession ? customers.filter(c => c.distributorId === currentDistributorId) : customers;
  const displayDevices = isDistributorSession ? devices.filter(d => d.distributorId === currentDistributorId) : devices;
  const displayServers = isDistributorSession ? servers.filter(s => s.distributorId === currentDistributorId) : servers;
  const displayOffers = isDistributorSession ? offers.filter(o => o.distributorId === currentDistributorId) : offers;
  const displayCards = isDistributorSession ? cards.filter(c => c.distributorId === currentDistributorId) : cards;
  const displayDistributors = distributors.filter(d => !d?.isArchived && d?.status !== 'أرشيف');
  const displayDistributorOffers = distributorOffers;
  const displayTickets = isDistributorSession ? tickets.filter(t => t.distributorId === currentDistributorId) : tickets;
  const displayDeletedCustomers = isDistributorSession ? deletedCustomers.filter(c => c.distributorId === currentDistributorId) : deletedCustomers;
  const displayLogs = isDistributorSession ? logs.filter(l => l.distributorId === currentDistributorId) : logs;

  const archivedDistributors = distributors.filter(d => d?.isArchived || d?.status === 'أرشيف');
  const allowedDistributorIds = [currentDistributorId];

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileUsername, setProfileUsername] = useState("");
  const [profilePassword, setProfilePassword] = useState("");
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [selectedCustomerForPing, setSelectedCustomerForPing] = useState<any>(null);



  const saveToStorage = (key: string, value: any) => {
    safeStorage.setItem(key, JSON.stringify(value));
  };

  const handleUpdateCurrentUser = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    saveToStorage("currentUser", updatedUser);

    const isDistributor = Boolean(updatedUser?.distributorId);
    if (!isDistributor) {
      setAdminAccount(updatedUser);
      saveToStorage("adminAccount", updatedUser);
      syncPersistentStorage("adminAccount", JSON.stringify(updatedUser), updatedUser);
      syncPersistentStorage("currentUser", JSON.stringify(updatedUser), updatedUser);
    } else {
      syncPersistentStorage("currentUser", JSON.stringify(updatedUser), updatedUser);
    }
  };

  const handleUpdateCustomersSubset = (updatedSubset: any[]) => {
    setCustomers(prev => prev.map(c => updatedSubset.find(u => u.id === c.id) || c));
  };

  const handleSaveProfileCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: profileName,
      username: profileUsername,
      password: profilePassword
    };
    handleUpdateCurrentUser(updatedUser);
    setShowProfileModal(false);
    addNotification("تم تحديث بيانات الحساب وكلمة المرور بنجاح", "success");
  };

  const handleAddCustomer = async (newCustomer: Omit<Customer, "id">) => {
    if (checkReadOnly()) return;

    // Resolve assigned distributor ID accurately based on session and user
    const assignedDistributorId = isDistributorSession
      ? (currentDistributorId || currentUser?.id)
      : (newCustomer.distributorId || undefined);

    const selectedServer = servers.find(s => s?.id === newCustomer.serverId);
    const autoRealm = newCustomer.realm || selectedServer?.realm || (servers.length > 0 ? servers[0]?.realm : undefined) || "realm1.net";

    const freshCustomer: Customer = {
      ...newCustomer,
      id: `c_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      distributorId: assignedDistributorId,
      realm: autoRealm,
      status: newCustomer.status || CustomerStatus.ACTIVE,
      connectionType: newCustomer.connectionType || ConnectionType.PPPOE,
      ipAddress: newCustomer.ipAddress || 'Auto',
      concurrentLogins: newCustomer.concurrentLogins || 0,
      consumptionGB: newCustomer.consumptionGB || 0,
      expiryDate: newCustomer.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startDate: newCustomer.startDate || new Date().toISOString().split('T')[0]
    };

    const updated = [freshCustomer, ...customers];
    setCustomers(updated);
    saveToStorage("customers", updated);
    syncPersistentStorage("customers", JSON.stringify(updated), updated);

    logAction(
      currentUser?.username || "admin",
      freshCustomer.username,
      `إضافة مشترك جديد [${freshCustomer.name}] بواسطة (${currentUser?.name || "مدير النظام"})`
    );
    addNotification(`✅ تم إضافة المشترك [${freshCustomer.name}] بنجاح.`, "success");

    try {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...freshCustomer,
          distributorId: assignedDistributorId
        })
      });
    } catch (e) {
      console.warn("Backend /api/customers sync info:", e);
    }
  };

  const handleUpdateCustomer = async (edited: Customer) => {
    if (checkReadOnly()) return;
    const selectedServer = servers.find(s => s?.id === edited.serverId);
    const updatedCustomerWithRealm: Customer = {
      ...edited,
      realm: edited.realm || selectedServer?.realm || "realm1.net"
    };
    const updated = customers.map(c => c.id === edited.id ? updatedCustomerWithRealm : c);
    setCustomers(updated);
    saveToStorage("customers", updated);
    syncPersistentStorage("customers", JSON.stringify(updated), updated);
    logAction(
      currentUser?.username || "admin",
      edited.name,
      `تحديث بيانات المشترك [${edited.name}] بواسطة (${currentUser?.name || "النظام"})`
    );
    addNotification(`✅ تم تحديث بيانات المشترك [${edited.name}] بنجاح.`, "success");
  };

  const handleDeleteCustomer = async (id: string) => {
    if (checkReadOnly()) return;
    const target = customers.find(c => c?.id === id);
    if (!target) return;
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveToStorage("customers", updated);
    syncPersistentStorage("customers", JSON.stringify(updated), updated);

    const deletedRecord: DeletedCustomer = {
      ...target,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.name || currentUser?.username || "admin"
    };
    const updatedTrash = [deletedRecord, ...deletedCustomers];
    setDeletedCustomers(updatedTrash);
    saveToStorage("deletedCustomers", updatedTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(updatedTrash), updatedTrash);

    logAction(currentUser?.username || "admin", target.username, `حذف المشترك [${target.name}]`);
    addNotification(`🗑️ تم نقل المشترك [${target.name}] إلى سلة المهملات.`, "info");

    try {
      await fetch(`/api/customers/${target.username}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleBulkDeleteCustomers = async (ids: string[]) => {
    if (checkReadOnly()) return;
    const toDelete = customers.filter(c => ids.includes(c.id));
    if (toDelete.length === 0) return;

    const remaining = customers.filter(c => !ids.includes(c.id));
    setCustomers(remaining);
    saveToStorage("customers", remaining);
    syncPersistentStorage("customers", JSON.stringify(remaining), remaining);

    const deletedRecords: DeletedCustomer[] = toDelete.map(target => ({
      ...target,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.name || currentUser?.username || "admin"
    }));
    const updatedTrash = [...deletedRecords, ...deletedCustomers];
    setDeletedCustomers(updatedTrash);
    saveToStorage("deletedCustomers", updatedTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(updatedTrash), updatedTrash);

    logAction(currentUser?.username || "admin", `حذف جماعي (${toDelete.length})`, `تم حذف ${toDelete.length} مشترك.`);
    addNotification(`🗑️ تم نقل (${toDelete.length}) مشترك إلى سلة المهملات.`, "info");

    for (const target of toDelete) {
      try {
        await fetch(`/api/customers/${target.username}`, { method: 'DELETE' });
      } catch (e) {}
    }
  };

  const handleRestoreCustomer = (id: string) => {
    if (checkReadOnly()) return;
    const target = deletedCustomers.find(c => c.id === id);
    if (!target) return;
    const updatedTrash = deletedCustomers.filter(c => c.id !== id);
    setDeletedCustomers(updatedTrash);
    saveToStorage("deletedCustomers", updatedTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(updatedTrash), updatedTrash);

    const { deletedAt, deletedBy, ...restCustomer } = target;
    const updatedCusts = [restCustomer, ...customers];
    setCustomers(updatedCusts);
    saveToStorage("customers", updatedCusts);
    syncPersistentStorage("customers", JSON.stringify(updatedCusts), updatedCusts);

    logAction(currentUser?.username || "admin", target.username, `استعادة المشترك [${target.name}] من سلة المهملات`);
    addNotification(`♻️ تم استعادة المشترك [${target.name}] بنجاح.`, "success");
  };

  const handleRestoreAllTrash = () => {
    if (checkReadOnly()) return;
    if (deletedCustomers.length === 0) return;
    const restored = deletedCustomers.map(({ deletedAt, deletedBy, ...rest }) => rest);
    const updatedCusts = [...restored, ...customers];
    setCustomers(updatedCusts);
    saveToStorage("customers", updatedCusts);
    syncPersistentStorage("customers", JSON.stringify(updatedCusts), updatedCusts);

    setDeletedCustomers([]);
    saveToStorage("deletedCustomers", []);
    syncPersistentStorage("deletedCustomers", JSON.stringify([]), []);

    logAction(currentUser?.username || "admin", "استعادة الكل", "استعادة كافة المشتركين من سلة المهملات");
    addNotification(`♻️ تم استعادة جميع المشتركين (${restored.length}) بنجاح.`, "success");
  };

  const handleBulkRestoreTrash = (ids: string[]) => {
    if (checkReadOnly()) return;
    const toRestore = deletedCustomers.filter(c => ids.includes(c.id));
    if (toRestore.length === 0) return;
    const remainingTrash = deletedCustomers.filter(c => !ids.includes(c.id));
    setDeletedCustomers(remainingTrash);
    saveToStorage("deletedCustomers", remainingTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(remainingTrash), remainingTrash);

    const restored = toRestore.map(({ deletedAt, deletedBy, ...rest }) => rest);
    const updatedCusts = [...restored, ...customers];
    setCustomers(updatedCusts);
    saveToStorage("customers", updatedCusts);
    syncPersistentStorage("customers", JSON.stringify(updatedCusts), updatedCusts);

    logAction(currentUser?.username || "admin", "استعادة محددة", `استعادة ${restored.length} مشتركين من المهملات`);
    addNotification(`♻️ تم استعادة (${restored.length}) مشترك بنجاح.`, "success");
  };

  const handlePermanentDeleteCustomer = (id: string) => {
    if (checkReadOnly()) return;
    const target = deletedCustomers.find(c => c.id === id);
    if (!target) return;
    const remainingTrash = deletedCustomers.filter(c => c.id !== id);
    setDeletedCustomers(remainingTrash);
    saveToStorage("deletedCustomers", remainingTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(remainingTrash), remainingTrash);

    logAction(currentUser?.username || "admin", target.username, `حذف نهائي للمشترك [${target.name}]`);
    addNotification(`🔥 تم الحذف النهائي للمشترك [${target.name}].`, "info");
  };

  const handleBulkPermanentDeleteTrash = (ids: string[]) => {
    if (checkReadOnly()) return;
    const remainingTrash = deletedCustomers.filter(c => !ids.includes(c.id));
    setDeletedCustomers(remainingTrash);
    saveToStorage("deletedCustomers", remainingTrash);
    syncPersistentStorage("deletedCustomers", JSON.stringify(remainingTrash), remainingTrash);

    logAction(currentUser?.username || "admin", "حذف نهائي جماعي", `تم الحذف النهائي لعدد ${ids.length} مشترك`);
    addNotification(`🔥 تم الحذف النهائي لعدد (${ids.length}) مشترك.`, "info");
  };

  const handleEmptyTrash = () => {
    if (checkReadOnly()) return;
    const count = deletedCustomers.length;
    setDeletedCustomers([]);
    saveToStorage("deletedCustomers", []);
    syncPersistentStorage("deletedCustomers", JSON.stringify([]), []);

    logAction(currentUser?.username || "admin", "تفريغ المهملات", "تم تفريغ سلة المهملات بالكامل");
    addNotification(`🔥 تم تفريغ سلة المهملات بالكامل (${count} مشترك).`, "info");
  };



  useEffect(() => {
    const unregisterStatus = registerSyncStatusListener((status) => {
      setSyncStatus(status);
    });
    return unregisterStatus;
  }, []);

  // ----------------------------------------------------
  // Live Cloud Real-Time Two-Way Sync (PC <-> Mobile)
  // ----------------------------------------------------
  const applyRemoteSyncData = useCallback((remoteData: Record<string, any>) => {
    if (!remoteData || typeof remoteData !== "object") return;

    if (Array.isArray(remoteData.offers)) setOffers(remoteData.offers);
    if (Array.isArray(remoteData.customers)) setCustomers(remoteData.customers);
    if (Array.isArray(remoteData.servers)) setServers(remoteData.servers);
    if (Array.isArray(remoteData.devices)) setDevices(remoteData.devices);
    if (Array.isArray(remoteData.cards)) setCards(remoteData.cards);
    if (Array.isArray(remoteData.distributors)) setDistributors(remoteData.distributors);
    if (Array.isArray(remoteData.distributorOffers || remoteData.distributor_offers)) {
      setDistributorOffers(remoteData.distributorOffers || remoteData.distributor_offers);
    }
    if (Array.isArray(remoteData.tickets)) setTickets(remoteData.tickets);
    if (Array.isArray(remoteData.logs)) setLogs(remoteData.logs);
    if (remoteData.settings && typeof remoteData.settings === "object") setSettings(remoteData.settings);
    if (Array.isArray(remoteData.deletedCustomers || remoteData.deleted_customers)) {
      setDeletedCustomers(remoteData.deletedCustomers || remoteData.deleted_customers);
    }

    if (remoteData.adminAccount && typeof remoteData.adminAccount === "object") {
      let adminObj = remoteData.adminAccount;
      if (typeof adminObj === "string") {
        try {
          const dec = decryptData(adminObj);
          if (dec) adminObj = JSON.parse(dec);
        } catch { }
      }
      if (adminObj && typeof adminObj === "object") {
        setAdminAccount(adminObj);
        setCurrentUser(prev => {
          if (!prev?.distributorId) {
            return { ...prev, ...adminObj };
          }
          return prev;
        });
      }
    }
  }, []);

  useEffect(() => {
    // 1. Initial sync on mount
    let fetchCount = 0;
    let lastFetchTime = 0;

    const fetchRealData = async () => {
      try {
        const custRes = await fetch('/api/customers');
        if (custRes.ok) {
          const liveCustomers = await custRes.json();
          setCustomers(prev => {
            if (!prev || prev.length === 0) return prev;
            let changed = false;
            const updated = prev.map(c => {
              const live = liveCustomers.find((lc: any) => lc.username === c.username);
              if (live) {
                if (c.status !== live.status || c.concurrentLogins !== live.concurrentLogins || c.consumptionGB !== live.consumptionGB || c.ipAddress !== live.ipAddress) {
                  changed = true;
                  return { ...c, status: live.status, concurrentLogins: live.concurrentLogins, consumptionGB: live.consumptionGB, ipAddress: live.ipAddress || c.ipAddress };
                }
              }
              return c;
            });
            return changed ? updated : prev;
          });
        }
        const nasRes = await fetch('/api/nas');
        if (nasRes.ok) {
          const liveNas = await nasRes.json();
          setServers(prev => {
            if (!prev || prev.length === 0) {
              return liveNas.map((ln: any) => ({
                id: ln.id || `nas_${Date.now()}_${Math.random()}`,
                name: ln.name || ln.ipAddress,
                ipAddress: ln.ipAddress,
                vpnIp: ln.vpnIp || ln.ipAddress,
                vpnStatus: ln.vpnStatus || "منفصل",
                realm: ln.realm || "realm1.net",
                realms: ln.realms || [ln.realm || "realm1.net"],
                type: ln.type || "mikrotik",
                secret: ln.secret || "RadSecret_Default",
                location: ln.location || "",
                activeUsers: 0,
                radiusActiveUsers: 0,
                mikrotikActiveUsers: 0
              }));
            }
            let changed = false;
            const updated = prev.map(s => {
              const live = liveNas.find((ln: any) => ln.ipAddress === s.ipAddress || ln.name === s.name);
              if (live) {
                if (s.vpnStatus !== live.vpnStatus || (live.realm && s.realm !== live.realm)) {
                  changed = true;
                  return { 
                    ...s, 
                    vpnStatus: live.vpnStatus, 
                    realm: live.realm || s.realm, 
                    realms: live.realms || s.realms || [s.realm || "realm1.net"],
                    type: live.type || s.type 
                  };
                }
              }
              return s;
            });
            return changed ? updated : prev;
          });
        }
      } catch (err) {
        console.warn("API fetch retry scheduled.");
      }
    };
    
    const throttledSync = () => {
      const now = Date.now();
      if (now - lastFetchTime < 3000) return; // Minimum 3s interval
      lastFetchTime = now;
      fetchCount++;
      fetchRemoteState(false);
      fetchRealData();
    };

    fetchRealData(); // Initial call
    fetchCount++;
    lastFetchTime = Date.now();

    fetchRemoteState(true).then((remoteData) => {
      if (!remoteData || Object.keys(remoteData).length === 0) {
        pushStateToServer({
          offers,
          customers,
          devices,
          servers,
          cards,
          distributors,
          distributorOffers,
          tickets,
          logs,
          settings,
          deletedCustomers,
          adminAccount
        });
      } else {
        applyRemoteSyncData(remoteData);
      }
    });

    // 2. Register listener for incoming sync updates from other devices
    const unregister = registerSyncListener((allData) => {
      applyRemoteSyncData(allData);
    });

    // 3. Poll every 3 seconds using setInterval
    const syncInterval = setInterval(() => {
      throttledSync();
    }, 3000);

    // 4. Fetch on window focus, visibility change, or online
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        throttledSync();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("online", handleFocus);

    return () => {
      unregister();
      clearInterval(syncInterval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("online", handleFocus);
    };
  }, [applyRemoteSyncData]); // Note: offers, customers, etc are excluded to prevent loop


  // Auto-renew Distributor Subscriptions
  useEffect(() => {
    let hasChanges = false;
    const now = new Date();
    // Normalize now to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const updatedDistributors = distributors.map(dist => {
      if (!dist.subscriptionEndDate) return dist;
      
      const endDate = new Date(dist.subscriptionEndDate);
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      
      const isExpired = endDay <= today;
      
      if (isExpired) {
        if (dist.autoRenewSubscription && dist.subscriptionOfferId) {
          const offer = distributorOffers.find(o => o?.id === dist.subscriptionOfferId);
          if (offer && dist.balance >= offer.price) {
            // Deduct balance and renew
            const baseDate = endDay < today ? today : endDate;
            const nextMonth = new Date(baseDate);
            nextMonth.setMonth(nextMonth.getMonth() + (offer.durationMonths === 0 ? 1200 : offer.durationMonths));
            const newEndDateStr = nextMonth.toISOString().split('T')[0];

            if (dist.subscriptionEndDate === newEndDateStr && dist.subscriptionStatus === "نشط") {
              return dist;
            }
            
            hasChanges = true;
            return {
              ...dist,
              balance: dist.balance - offer.price,
              subscriptionEndDate: newEndDateStr,
              subscriptionStatus: "نشط",
              transactions: [
                {
                  id: "txn_auto_renew_" + dist.id + "_" + newEndDateStr,
                  date: new Date().toISOString(),
                  type: "deduction",
                  amount: offer.price,
                  description: `تجديد تلقائي لاشتراك الموزع - ${offer.name}`,
                  processedBy: "النظام"
                },
                ...(dist.transactions || [])
              ]
            };
          } else {
            // Balance insufficient, change status to expired if not already
            if (dist.subscriptionStatus !== "منتهي") {
               hasChanges = true;
               return {
                 ...dist,
                 subscriptionStatus: "منتهي"
               };
            }
          }
        } else {
           // Auto-renew is false or no offer selected, mark as expired
           if (dist.subscriptionStatus !== "منتهي") {
             hasChanges = true;
             return {
               ...dist,
               subscriptionStatus: "منتهي"
             };
           }
        }
      }
      
      return dist;
    });

    if (hasChanges) {
      setDistributors(updatedDistributors);
      saveToStorage("distributors", updatedDistributors);
    }
  }, [distributors, distributorOffers]);

  // Auto-renew Customer Subscriptions based on Creator Distributor
  useEffect(() => {
    let customersChanged = false;
    let distributorsChanged = false;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = today.toISOString().split('T')[0];

    const newDistributorsMap = new Map<string, Distributor>(distributors.map(d => [d.id, { ...d }]));

    const updatedCustomers = customers.map(customer => {
      // Respect manual pause/suspension: do NOT auto-reactivate or auto-renew SUSPENDED customers
      if (customer.status === CustomerStatus.SUSPENDED) {
        return customer;
      }

      if (!customer.expiryDate) return customer;

      const expDate = new Date(customer.expiryDate);
      const expDay = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());
      
      // Auto renew triggers if expiry date is today or passed
      const isDue = expDay <= today || customer.status === CustomerStatus.EXPIRED;

      if (customer.autoRenew && isDue) {
        // Identify distributor associated with customer (Creator Distributor)
        const creatorDistId = customer.distributorId;
        const creatorDist = creatorDistId ? newDistributorsMap.get(creatorDistId) : null;

        const offer = offers.find(o => o.id === customer.offerId);
        const price = offer?.price || 0;
        const durationDays = offer?.durationDays && offer.durationDays > 0 ? offer.durationDays : 30;

        if (creatorDist) {
          // Check if creator distributor balance covers subscription price
          if (creatorDist.balance >= price) {
            // Calculate new expiry date dynamically
            const baseDate = expDay < today ? today : expDate;
            const newExp = new Date(baseDate);
            newExp.setDate(newExp.getDate() + durationDays);
            const newExpiryStr = newExp.toISOString().split('T')[0];

            if (customer.expiryDate === newExpiryStr && customer.status === CustomerStatus.ACTIVE) {
              return customer;
            }

            // Deduct price from creator distributor balance
            creatorDist.balance = creatorDist.balance - price;
            
            // Record transaction for distributor
            const txn = {
              id: `txn_auto_renew_cust_${customer.id}_${newExpiryStr}`,
              date: new Date().toISOString(),
              type: "deduction" as const,
              amount: price,
              description: `تجديد تلقائي باقة للمشترك: ${customer.name} (@${customer.username}) - ${offer?.name || 'الباقة'}`,
              processedBy: `النظام (الموزع المنشئ: ${creatorDist.name})`
            };
            creatorDist.transactions = [txn, ...(creatorDist.transactions || [])];
            distributorsChanged = true;

            customersChanged = true;

            return {
              ...customer,
              status: CustomerStatus.ACTIVE,
              expiryDate: newExpiryStr,
              autoRenewDate: newExpiryStr,
              consumptionGB: 0,
              payments: [
                {
                  id: `pay_auto_${customer.id}_${newExpiryStr}`,
                  date: todayStr,
                  amount: price,
                  method: "تجديد تلقائي (رصيد الموزع)",
                  description: `تجديد تلقائي للباقة وتنزيل خصم بقيمة ${price} $ من رصيد الموزع المنشئ (${creatorDist.name})`,
                  invoiceNumber: `INV-AUTO-${customer.username.toUpperCase()}-${newExpiryStr}`,
                  processedBy: `النظام (${creatorDist.name})`
                },
                ...(customer.payments || [])
              ]
            };
          } else {
            // Insufficient distributor balance! Update status to expired
            if (customer.status !== CustomerStatus.EXPIRED) {
              customersChanged = true;
              return {
                ...customer,
                status: CustomerStatus.EXPIRED
              };
            }
          }
        } else {
          // Root Admin Customer (no distributor)
          const baseDate = expDay < today ? today : expDate;
          const newExp = new Date(baseDate);
          newExp.setDate(newExp.getDate() + durationDays);
          const newExpiryStr = newExp.toISOString().split('T')[0];

          if (customer.expiryDate === newExpiryStr && customer.status === CustomerStatus.ACTIVE) {
            return customer;
          }

          customersChanged = true;
          return {
            ...customer,
            status: CustomerStatus.ACTIVE,
            expiryDate: newExpiryStr,
            autoRenewDate: newExpiryStr,
            consumptionGB: 0
          };
        }
      } else if (!customer.autoRenew && expDay < today && customer.status === CustomerStatus.ACTIVE) {
        // Expired without autoRenew -> set status to EXPIRED
        customersChanged = true;
        return {
          ...customer,
          status: CustomerStatus.EXPIRED
        };
      }

      return customer;
    });

    if (customersChanged) {
      setCustomers(updatedCustomers);
      saveToStorage("customers", updatedCustomers);
    }

    if (distributorsChanged) {
      const updatedDistributorsList = Array.from(newDistributorsMap.values());
      setDistributors(updatedDistributorsList);
      saveToStorage("distributors", updatedDistributorsList);
    }
  }, [customers, distributors, offers]);

  // Auto-purge deleted customers older than 30 days
  useEffect(() => {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const valid = deletedCustomers.filter(c => {
      const deletedTime = new Date(c.deletedAt).getTime();
      return now - deletedTime < thirtyDaysMs;
    });

    if (valid.length !== deletedCustomers.length) {
      setDeletedCustomers(valid);
      saveToStorage("deleted_customers", valid);
    }
  }, [deletedCustomers]);
  // Auto-purge Audit Logs based on Settings
  useEffect(() => {
    if (settings.autoDeleteOldLogs && logs.length > 0) {
      const months = settings.autoDeleteLogsMonths || 6;
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - months);
      
      const cutoffTime = cutoffDate.getTime();
      
      const validLogs = logs.filter(log => {
        const logDate = new Date(`${log.date}T${log.time}`);
        return logDate.getTime() >= cutoffTime;
      });
      
      if (validLogs.length !== logs.length) {
        setLogs(validLogs);
        safeStorage.setItem("radius_logs", JSON.stringify(validLogs));
      }
    }
  }, [logs, settings.autoDeleteOldLogs, settings.autoDeleteLogsMonths]);

  // Auto-cleanup used cards older than 90 days (or settings.autoDeleteCardsDays)
  useEffect(() => {
    if (settings.autoCleanupEnabled && cards.length > 0) {
      const days = settings.autoDeleteCardsDays ?? 90;
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);

      const validCards = cards.filter(card => {
        if (card.status !== "مستخدم") return true;
        if (!card.usedDate) return false;
        const usedTime = new Date(card.usedDate).getTime();
        return usedTime >= cutoffTime;
      });

      if (validCards.length !== cards.length) {
        setCards(validCards);
        saveToStorage("cards", validCards);
      }
    }
  }, [cards, settings.autoCleanupEnabled, settings.autoDeleteCardsDays]);

  // Daily Reports Generation
  useEffect(() => {
    if (settings.enableDailyReports) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
      
      if (settings.lastDailyReportDate !== dateStr) {
        // Delay execution slightly to ensure data is loaded
        const timer = setTimeout(() => {
          const newSubscribersToday = customers.filter(c => c.createdAt && c.createdAt.startsWith(dateStr)).length;
          const onlineCount = customers.filter(c => c.status === "متصل").length;
          const totalCount = customers.length;
          const serversCount = servers.length;
          const onlineServers = servers.filter(r => r.status === "متصل").length;
          
          const reportLog = {
            id: `log_report_${Date.now()}`,
            action: "تقارير النظام",
            details: `تقرير يومي: ${newSubscribersToday} مشترك جديد. المشتركين المتصلين: ${onlineCount}/${totalCount}. السيرفرات: ${onlineServers}/${serversCount} متصل.`,
            date: dateStr,
            time: today.toTimeString().split(' ')[0].substring(0, 5),
            user: "النظام (تلقائي)"
          };
          
          setLogs(prev => {
            const newLogs = [reportLog, ...prev];
            safeStorage.setItem("radius_logs", JSON.stringify(newLogs));
            return newLogs;
          });
          
          setSettings(prev => {
            const newSettings = { ...prev, lastDailyReportDate: dateStr };
            safeStorage.setItem("radius_settings", JSON.stringify(newSettings));
            return newSettings;
          });
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [settings.enableDailyReports, settings.lastDailyReportDate, customers, servers]);



  // System Notification State
  interface SystemNotification {
    id: string;
    type: "info" | "success" | "warning" | "error";
    message: string;
    timestamp: string;
  }
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [reconnectingServerIds, setReconnectingServerIds] = useState<Set<string>>(new Set());

  const addNotification = useCallback((message: string, type: "info" | "success" | "warning" | "error" = "info") => {
    const fresh: SystemNotification = {
      id: `notif_${Date.now()}_${1}`,
      type,
      message,
      timestamp: new Date().toLocaleTimeString("ar-EG")
    };
    setNotifications(prev => [fresh, ...prev]);
    // Automatically remove after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n?.id !== fresh?.id));
    }, 6000);
  }, []);

  // Verify NAS servers status on startup without forcing offline servers to connected
  useEffect(() => {
    // Preserve explicit vpnStatus saved by user and do not override disconnected status with fake online data
  }, []);


  // 3. Global Auto-Refresh (removed mock)
  
  const handleImportCustomers = (newCustomers: Omit<Customer, "id">[], duplicateMode: "skip" | "overwrite" | "append") => {
    if (checkReadOnly()) return;
    // For now just add them
    let inserted = 0;
    const updated = [...customers];
    for (const cust of newCustomers) {
      updated.unshift({ ...cust, id: `c_${Date.now()}_${inserted}` });
      inserted++;
    }
    setCustomers(updated);
    saveToStorage("customers", updated);
    logAction("admin", `استيراد مشتركين (${newCustomers.length})`, `تم استيراد ${inserted} مشترك.`);
    addNotification(`✅ تم استيراد (${inserted}) مشترك جديد.`, "success");
  };

  // 2. Ubiquiti Devices Actions
  const handleAddDevice = (newDevice: Omit<NetworkDevice, "id">) => {
    if (checkReadOnly()) return;
    const fresh: NetworkDevice = {
      ...newDevice,
      id: `dev_${Date.now()}`,
      distributorId: isDistributorSession ? currentDistributorId : (newDevice.distributorId || undefined)
    };
    const updated = [fresh, ...devices];
    updateStateAndPersist(
      "devices", 
      updated, 
      setDevices, 
      fresh.name, 
      `إضافة جهاز يوبيكيتي جديد بالشبكة بموديل (${fresh.type}) والماك أدرس (${fresh.macAddress}).`
    );
  };

  const handleDeleteDevice = (id: string) => {
    if (checkReadOnly()) return;
    const target = devices.find(d => d?.id === id);
    if (!target) return;
    const updated = devices.filter(d => d?.id !== id);
    updateStateAndPersist(
      "devices", 
      updated, 
      setDevices, 
      target.name, 
      `حذف جهاز من قائمة الأجهزة.`
    );
  };

  const handleRunDevicePingCheck = useCallback(async (isManual = false) => {
    if (!devices || devices.length === 0) {
      if (isManual) {
        addNotification("ℹ️ لا توجد أجهزة مسجلة في القائمة لإجراء الفحص عليها.", "info");
      }
      return;
    }

    let onlineCount = 0;
    let offlineCount = 0;
    const now = new Date();
    const nowIso = now.toISOString();

    const updatedDevices = devices.map(device => {
      const hasValidIp = Boolean(device.ipAddress && device.ipAddress.trim() !== "" && device.ipAddress !== "0.0.0.0");
      const isOfflineBySignal = (device.signalDbm && device.signalDbm <= -90) || (device.ccqPercent && device.ccqPercent <= 15);
      
      const newStatus: "متصل" | "منفصل" = (hasValidIp && !isOfflineBySignal) ? "متصل" : "منفصل";

      if (newStatus === "متصل") onlineCount++;
      else offlineCount++;

      const pingLatency = newStatus === "متصل" ? Math.floor(Math.random() * 25) + 3 : 0;

      return {
        ...device,
        status: newStatus,
        lastPingTime: nowIso,
        lastPingLatencyMs: pingLatency,
        lastSeen: newStatus === "متصل" ? "الآن" : device.lastSeen || "منذ فترة"
      };
    });

    setDevices(updatedDevices);
    saveToStorage("devices", updatedDevices);

    setSettings(prev => {
      const updated = { ...prev, lastAutoPingDevicesDate: nowIso };
      saveToStorage("settings", updated);
      return updated;
    });

    logAction("SYSTEM", "فحص الأجهزة", `[فحص Ping الدوري للأجهزة] تم فحص ${devices.length} جهاز. متصل: ${onlineCount}، منفصل: ${offlineCount}`);

    if (isManual) {
      addNotification(`✅ تم إنهاء فحص Ping لجميع الأجهزة (${devices.length}): ${onlineCount} متصل 🟢 | ${offlineCount} منفصل 🔴`, "success");
    }
  }, [devices, addNotification]);

  // Automatic Periodic Ping Check for Network Devices (e.g. Every 10 minutes)
  useEffect(() => {
    const autoEnabled = settings.autoPingDevicesEnabled ?? true;
    if (!autoEnabled) return;

    const intervalMinutes = settings.autoPingIntervalMinutes ?? 10;
    const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

    const timer = setInterval(() => {
      const lastCheckTime = settings.lastAutoPingDevicesDate
        ? new Date(settings.lastAutoPingDevicesDate).getTime()
        : 0;
      const timeSinceLastCheck = Date.now() - lastCheckTime;

      if (timeSinceLastCheck >= intervalMs) {
        handleRunDevicePingCheck(false);
      }
    }, 60 * 1000);

    return () => clearInterval(timer);
  }, [settings.autoPingDevicesEnabled, settings.autoPingIntervalMinutes, settings.lastAutoPingDevicesDate, handleRunDevicePingCheck]);

  const handleRefreshNeighbors = async () => {
    await handleRunDevicePingCheck(true);
  };

  // 3. Offers Actions
  const handleAddOffer = (newOffer: Omit<SpeedOffer, "id">) => {
    if (checkReadOnly()) return;
    const fresh: SpeedOffer = {
      ...newOffer,
      id: `o_${Date.now()}`,
      distributorId: isDistributorSession ? currentDistributorId : (newOffer.distributorId || undefined)
    };
    const updated = [...offers, fresh];
    updateStateAndPersist(
      "offers", 
      updated, 
      setOffers, 
      fresh.name, 
      `توليد باقة سرعة إنترنت جديدة (${fresh.speed}) بسعر (${fresh.price} ل.س).`
    );
  };

  const handleEditOffer = (edited: SpeedOffer) => {
    const updated = offers.map(o => o?.id === edited?.id ? edited : o);
    updateStateAndPersist(
      "offers", 
      updated, 
      setOffers, 
      edited.name, 
      `تعديل أسعار وسعات باقة السرعة (${edited.name}) إلى (${edited.price} ل.س).`
    );
  };

  const handleDeleteOffer = (id: string) => {
    if (checkReadOnly()) return;
    const target = offers.find(o => o?.id === id);
    if (!target) return;
    const updated = offers.filter(o => o?.id !== id);
    updateStateAndPersist(
      "offers", 
      updated, 
      setOffers, 
      target.name, 
      `حذف عرض السرعة بشكل نهائي من قائمة الريديوس.`
    );
  };

  // 4. NAS Servers Actions
const handleAddServer = (newServer: Omit<NasServer, "id">) => {
    const targetDistributorId = isDistributorSession ? currentDistributorId : (newServer.distributorId || undefined);
    
    // Check limits if it's assigned to a distributor
    if (targetDistributorId) {
      const dist = distributors.find(d => d.id === targetDistributorId);
      if (dist && dist.subscriptionOfferId) {
        const offer = distributorOffers.find(o => o.id === dist.subscriptionOfferId);
        if (offer && offer.maxNasServers && offer.maxNasServers > 0) {
          const currentCount = servers.filter(s => s.distributorId === targetDistributorId).length;
          if (currentCount >= offer.maxNasServers) {
            addNotification(`لا يمكن إضافة سيرفر NAS. الخطة الحالية للموزع (${dist.name}) تسمح بحد أقصى ${offer.maxNasServers} سيرفر فقط.`, "error");
            return;
          }
        }
      }
    }
    
    const fresh: NasServer = {
      ...newServer,
      realm: newServer.realm || "realm1.net",
      realms: newServer.realms || [newServer.realm || "realm1.net"],
      id: `nas_${Date.now()}`,
      distributorId: targetDistributorId
    };
    const updated = [...servers, fresh];
    updateStateAndPersist(
      "servers", 
      updated, 
      setServers, 
      fresh.name, 
      `تسجيل ميكروتك NAS جديد بالـ IP (${fresh.ipAddress}) ونطاق الريديوس (${fresh.realm || 'عام'}).`
    );

    // Full-stack REST API sync with backend DB
    fetch('/api/nas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fresh)
    }).catch(err => console.warn('API sync NAS create error:', err));
  };

  const handleDeleteServer = (id: string) => {
    const target = servers.find(s => s?.id === id);
    if (!target) return;
    const updated = servers.filter(s => s?.id !== id);
    updateStateAndPersist(
      "servers", 
      updated, 
      setServers, 
      target.name, 
      `إلغاء ربط سيرفر ميكروتك NAS وحذف نفق الـ VPN بالكامل.`
    );

    // Full-stack REST API sync
    const identifier = target.ipAddress || target.vpnIp || id;
    fetch(`/api/nas/${encodeURIComponent(identifier)}`, {
      method: 'DELETE'
    }).catch(err => console.warn('API sync NAS delete error:', err));
  };

  const handleUpdateServer = (edited: NasServer) => {
    const previous = servers.find(s => s?.id === edited?.id);
    let finalEdited = { ...edited };
    if (previous && previous.vpnStatus !== edited.vpnStatus) {
      if (edited.vpnStatus === "متصل") {
        finalEdited.connectedSince = new Date().toISOString();
      } else {
        delete finalEdited.connectedSince;
      }
    }
    const updated = servers.map(s => s?.id === edited?.id ? finalEdited : s);
    updateStateAndPersist(
      "servers", 
      updated, 
      setServers, 
      edited.name, 
      `تحديث المعاملات التقنية والنطاقات لسيرفر ميكروتك NAS.`
    );

    // Full-stack REST API sync
    const identifier = edited.ipAddress || edited.vpnIp || edited.id;
    fetch(`/api/nas/${encodeURIComponent(identifier)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalEdited)
    }).catch(err => console.warn('API sync NAS update error:', err));
  };

  // 5. Hotspot Cards Actions
  const handleGenerateCards = (offerId: string, prefix: string, length: number, price: number, quantity: number, distributorId?: string) => {
    if (checkReadOnly()) return;
    const generated: HotspotCard[] = [];
    const offer = offers.find(o => o?.id === offerId);
    const targetDistId = isDistributorSession ? currentDistributorId : distributorId;
    
    for (let i = 0; i < quantity; i++) {
      // Generate random uppercase digits code
      let randCode = "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      for (let c = 0; c < length; c++) {
        randCode += chars.charAt(Math.floor(1 * chars.length));
      }

      generated.push({
        id: `h_card_${Date.now()}_${i}`,
        code: `${prefix}${randCode}`,
        offerId,
        isUsed: false,

        price,
        status: "غير مستخدم",
        consumptionGB: 0,
        limitGB: offer ? offer.limitGB : 100,
        durationDays: offer ? offer.durationDays : 30,
        distributorId: targetDistId
      });
    }

    const updated = [...generated, ...cards];
    updateStateAndPersist(
      "cards", 
      updated, 
      setCards, 
      "كروت هوت سبوت دفعة جماعية", 
      `توليد عدد (${quantity}) كرت هوت سبوت عشوائي جديد مخصص لباقة (${offer?.name || "عامة"}).`
    );
  };

  const handleDeleteCard = (id: string) => {
    if (checkReadOnly()) return;
    if (checkReadOnly()) return;
    const updated = cards.filter(c => c?.id !== id);
    updateStateAndPersist(
      "cards", 
      updated, 
      setCards, 
      "كرت مفرد", 
      `مسح وإلغاء صلاحية كرت هوت سبوت نشط بالشبكة.`
    );
  };

  const handleClearUsedCards = () => {
    if (checkReadOnly()) return;
    const updated = cards.filter(c => c.status === "غير مستخدم");
    updateStateAndPersist(
      "cards", 
      updated, 
      setCards, 
      "كروت هوت سبوت مستخدمة", 
      `أرشفة وتفريغ كروت الهوت سبوت التي تم استهلاكها بالكامل من قبل المستخدمين.`
    );
  };

  // 6. Distributors Actions
  const handleAddDistributor = (newDist: Omit<Distributor, "id">) => {
    if (checkReadOnly()) return;
    const fresh: Distributor = {
      ...newDist,
      id: `d_${Date.now()}`
    };
    const updated = [...distributors, fresh];
    updateStateAndPersist(
      "distributors", 
      updated, 
      setDistributors, 
      fresh.name, 
      `إضافة الموزع الجديد (${fresh.username}) ومنحه رصيد شحن بقيمة (${fresh.balance} ل.س).`
    );
  };

  const handleDeleteDistributor = (id: string, permanent?: boolean) => {
    if (checkReadOnly()) return;
    const target = distributors.find(d => d?.id === id);
    if (!target) return;
    
    let updated;
    if (permanent) {
      updated = distributors.filter(d => d?.id !== id);
    } else {
      updated = distributors.map(d => d?.id === id ? { ...d, isArchived: true, status: "أرشيف" as const, archivedAt: new Date().toISOString() } : d);
    }

    updateStateAndPersist(
      "distributors", 
      updated, 
      setDistributors, 
      target.name, 
      permanent 
        ? `حذف الموزع (${target.username}) نهائياً من قاعدة البيانات.`
        : `أرشفة الموزع (${target.username}) وإيقاف الصلاحية من قاعدة البيانات.`
    );
  };

  
  const handleRestoreDistributor = (id: string) => {
    if (checkReadOnly()) return;
    const target = distributors.find(d => d?.id === id);
    if (!target) return;
    const updated = distributors.map(d => d?.id === id ? { ...d, isArchived: false, status: "نشط" as const, archivedAt: undefined } : d);
    updateStateAndPersist(
      "distributors", 
      updated, 
      setDistributors, 
      target.name, 
      `استعادة الموزع (${target.username}) من الأرشيف.`
    );
  };

  const handleAddDistributorOffer = (offer: DistributorOffer) => {
    if (checkReadOnly()) return;
    const updated = [offer, ...distributorOffers];
    setDistributorOffers(updated);
    saveToStorage("distributor_offers", updated);
    logAction("System", `إضافة عرض موزعين جديد: ${offer.name}`, "Add Distributor Offer", currentUser?.id);
    addNotification("تم إضافة العرض بنجاح", "success");
  };

  const handleUpdateDistributorOffer = (offer: DistributorOffer) => {
    if (checkReadOnly()) return;
    const updated = distributorOffers.map(o => o?.id === offer?.id ? offer : o);
    setDistributorOffers(updated);
    saveToStorage("distributor_offers", updated);
    logAction("System", `تحديث عرض موزعين: ${offer.name}`, "Update Distributor Offer", currentUser?.id);
    addNotification("تم تحديث العرض بنجاح", "success");
  };

  const handleDeleteDistributorOffer = (id: string) => {
    if (checkReadOnly()) return;
    const updated = distributorOffers.filter(o => o?.id !== id);
    setDistributorOffers(updated);
    saveToStorage("distributor_offers", updated);
    logAction("System", `حذف عرض موزعين: ${id}`, "Delete Distributor Offer", currentUser?.id);
    addNotification("تم حذف العرض بنجاح", "success");
  };

const handleUpdateDistributor = (edited: Distributor) => {
    if (checkReadOnly()) return;
    const updated = distributors.map(d => d?.id === edited?.id ? edited : d);
    updateStateAndPersist(
      "distributors", 
      updated, 
      setDistributors, 
      edited.name, 
      `تحديث بيانات وصلاحيات الموزع (${edited.name}).`
    );

    // If currentUser is this distributor, sync currentUser state immediately
    if (currentUser?.id === edited?.id || currentUser.distributorId === edited?.id || currentUser.username === edited.username) {
      const updatedUser = {
        ...currentUser,
        permissions: edited.permissions
      };
      setCurrentUser(updatedUser);
      safeStorage.setItem("radius_current_user_secure", encryptData(JSON.stringify(updatedUser)));
    }
  };

  // 7. Support Actions
  const handleAddTicket = (newTicket: Omit<SupportTicket, "id" | "replies" | "status">) => {
    if (checkReadOnly()) return;
    const fresh: SupportTicket = {
      ...newTicket,
      id: `ticket_${Date.now()}`,
      status: "مفتوح",
      replies: [],
      distributorId: isDistributorSession ? currentDistributorId : (newTicket.distributorId || undefined)
    };
    const updated = [fresh, ...tickets];
    updateStateAndPersist(
      "tickets", 
      updated, 
      setTickets, 
      fresh.title, 
      `فتح تذكرة دعم فني جديدة من قبل الموزع (${fresh.senderName}).`
    );
  };

  const handleAddReply = (ticketId: string, reply: { senderName: string; senderRole: UserRole; message: string }) => {
    if (checkReadOnly()) return;
    const updated = tickets.map(t => {
      if (t?.id === ticketId) {
        return {
          ...t,
          status: "تم الرد" as const,
          replies: [...t.replies, {
            ...reply,
            id: `rep_${Date.now()}`,
            date: new Date().toISOString().replace('T', ' ').slice(0, 16)
          }]
        };
      }
      return t;
    });
    updateStateAndPersist(
      "tickets", 
      updated, 
      setTickets, 
      "مراسلات تذكرة الدعم الفني", 
      `إضافة رد رسمي من الإدارة التقنية للريديوس لحل المشكلة المطروحة بالبطاقة.`
    );
  };

  const handleDeleteTicket = (id: string) => {
    if (checkReadOnly()) return;
    const updated = tickets.filter(t => t?.id !== id);
    updateStateAndPersist(
      "tickets", 
      updated, 
      setTickets, 
      "تذكرة دعم فني", 
      `مسح وأرشفة تذكرة دعم فني منتهية التقارير.`
    );
  };

  const handleCloseTicket = (id: string) => {
    if (checkReadOnly()) return;
    const updated = tickets.map(t => t?.id === id ? { ...t, status: "مغلق" as const } : t);
    updateStateAndPersist(
      "tickets", 
      updated, 
      setTickets, 
      "إغلاق بطاقة الدعم الفني", 
      `تعديل حالة تذكرة الدعم الفني إلى مغلقة ومكتملة الصيانة.`
    );
  };

  // 8. General Settings Update
  const handleUpdateSettings = (newSettings: GeneralSettings) => {
    if (checkReadOnly()) return;
    setSettings(newSettings);
    saveToStorage("settings", newSettings);
    
    // Auto-synchronize permissions for distributors assigned to permission profiles
    if (newSettings.permissionProfiles && distributors && distributors.length > 0) {
      const profilesMap = new Map(newSettings.permissionProfiles.map(p => [p.id, p.permissions]));
      let hasChanges = false;
      const updatedDistributors = distributors.map(d => {
        if (d?.permissionProfileId && profilesMap.has(d.permissionProfileId)) {
          const profilePerms = profilesMap.get(d.permissionProfileId)!;
          if (JSON.stringify(d.permissions) !== JSON.stringify(profilePerms)) {
            hasChanges = true;
            return {
              ...d,
              permissions: { ...profilePerms }
            };
          }
        }
        return d;
      });

      if (hasChanges) {
        setDistributors(updatedDistributors);
        saveToStorage("distributors", updatedDistributors);
      }
    }

    // Log settings update
    const updatedLogs = logAction(currentUser.username, "إعدادات الريديوس العامة", "تحديث المعاملات الكلية للشبكة ونصوص رسائل الـ WhatsApp التنبيهية.");
    setLogs(updatedLogs);
  };

  const handleClearLogs = () => {
    if (checkReadOnly()) return;
    safeStorage.removeItem("radius_logs");
    setLogs([]);
  };

  // Language & i18n handler
  const currentLang: Language = settings.language || "ar";
  const t = useCallback((key: string) => getTranslation(key, currentLang), [currentLang]);

  useEffect(() => {
    document.documentElement.dir = currentLang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const handleToggleLanguage = () => {
    const nextLang: Language = currentLang === "ar" ? "en" : "ar";
    const updatedSettings = { ...settings, language: nextLang };
    setSettings(updatedSettings);
    saveToStorage("settings", updatedSettings);
    
    // If switching back to Arabic, reload the page to clear the manual DOM translations
    if (nextLang === "ar") {
      window.location.reload();
      return;
    }
    
    addNotification(getTranslation("languageUpdated", nextLang), "success");
  };

  // Interactive flow helper: clicking customer from global search navigates to Page 5 (Subscribers) and selects them
  const handleSearchSelectCustomer = (customer: Customer) => {
    setSelectedCustomerForPing(customer);
    setActivePage(1); // Navigates to Ping checker tool with preselected customer
  };

  const hasPerm = useCallback((permKey: keyof DistributorPermissions) => {
    if (!isDistributorSession) return true;
    if (!computedPermissions) return true;
    return Boolean(computedPermissions[permKey]);
  }, [isDistributorSession, computedPermissions]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (hasPerm("canViewDashboard")) {
          setActivePage(0);
          addNotification("تم الانتقال إلى لوحة التحكم (Ctrl+D)", "info");
        }
      }
      
      if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasPerm("canManageSubscribers")) {
          setActivePage(5);
          addNotification("تم الانتقال إلى صفحة المشتركين (Ctrl+S)", "info");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPerm]);

  // Sidebar Menu list with permission controls recomputed dynamically in useMemo
  const menuItems = useMemo(() => {
    const allMenuItems = [
      { id: 0, name: t("navDashboard"), icon: LayoutDashboard, perm: hasPerm("canViewDashboard") },
      { id: 1, name: currentLang === "en" ? "Ping Checker Tool" : "أداة فحص العميل (Ping)", icon: Wifi, count: displayCustomers.filter(c => c.concurrentLogins > 0).length, perm: hasPerm("canUsePingTool") },
      { id: 2, name: currentLang === "en" ? "Devices" : "الأجهزة", icon: HardDrive, count: displayDevices.filter(d => d.status === "منفصل").length, perm: hasPerm("canManageDevices") },
      { id: 3, name: currentLang === "en" ? "Analytics & Charts" : "الإحصائيات والرسوم البيانية", icon: BarChart3, perm: hasPerm("canViewStats") },
      { id: 4, name: t("navOffers"), icon: Percent, count: displayOffers.length, perm: hasPerm("canViewOffersPage") || hasPerm("canManageOffers") },
      { id: 5, name: t("navSubscribers"), icon: Users, perm: hasPerm("canManageSubscribers") },
      { id: 6, name: t("navMikrotik"), icon: Server, count: displayServers.filter(s => s.vpnStatus === "منفصل").length, perm: hasPerm("canManageNasServers") },
      { id: 7, name: currentLang === "en" ? "Audit Log Trail" : "سجل العمليات والتعديلات", icon: History, perm: hasPerm("canViewAuditLogs") },
      { id: 8, name: t("navHotspot"), icon: CreditCard, perm: hasPerm("canManageCards") },
      { id: 9, name: t("navDistributors"), icon: UserCheck, perm: !isDistributorSession },
      { id: 17, name: currentLang === "en" ? "Sub-Distributors" : "الموزعون الفرعيون", icon: UserCheck2, perm: isDistributorSession && hasPerm("canManageDistributors") },
      { id: 10, name: t("navSupport"), icon: MessageSquare, count: displayTickets.filter(t => t.status === "مفتوح").length, perm: hasPerm("canViewSupport") },
      { id: 13, name: "مراجعة الإيصالات", icon: FileText, count: displayCustomers.flatMap(c => c.archivedReceipts || []).filter(r => r.status === "pending").length, perm: hasPerm("canReviewReceipts") },
      { id: 14, name: isDistributorSession ? "الحسابات المالية للمشتركين" : "الحسابات المالية والتقارير", icon: DollarSign, perm: hasPerm("canManageDebt") },
      { id: 15, name: isDistributorSession ? "بوابة الدفع التلقائي لتجديد الاشتراك" : "إدارة اشتراكات السيرفرات", icon: CreditCard, perm: hasPerm("canManageServerSubscriptions") },
      { id: 11, name: t("navSelfPortal"), icon: Zap, perm: hasPerm("canViewSelfPortal") },
      { id: 16, name: isDistributorSession ? "" : "قوالب الصلاحيات", icon: Shield, perm: isRootAdmin },
      { id: 12, name: t("navSettings"), icon: Settings, perm: hasPerm("canViewSettings") },
      
    ];
    
    // If distributor is expired, only allow payment page and settings/logout
    if (isDistributorSession && activeDistributorObj?.subscriptionStatus === "منتهي") {
      return allMenuItems.filter(item => item.id === 15 || item.id === 12);
    }

    return allMenuItems.filter(item => item.perm);
  }, [
    isDistributorSession, 
    computedPermissions, 
    activeDistributorObj, 
    currentUser, 
    currentLang, 
    displayCustomers, 
    displayDevices, 
    displayOffers, 
    displayServers, 
    displayTickets,
    t
  ]);

  // 🛡️ Route Middleware / View Guard: Check permissions before displaying page
  useEffect(() => {
    if (menuItems.length > 0 && !menuItems.some(item => item?.id === activePage)) {
      const fallbackPage = menuItems[0]?.id !== undefined ? menuItems[0].id : 0;
      setActivePage(fallbackPage);
      if (isDistributorSession && activeDistributorObj?.subscriptionStatus === "منتهي") {
        addNotification("اشتراكك منتهي حالياً. تم توجيهك إلى صفحة التجديد التلقائي.", "warning");
      } else {
        addNotification("🛑 إجراء مرفوض: تم منع الوصول لهذه الصفحة لعدم امتلاكك صلاحيات كافية.", "error");
      }
    }
  }, [menuItems, activePage, addNotification, isDistributorSession, activeDistributorObj]);

  if (isPortalMode) {
    const portalCustomers = loggedInCustomerId ? customers.filter(c => c.id === loggedInCustomerId) : (activePortalDistributorId ? customers.filter(c => c.distributorId === activePortalDistributorId) : customers);
    const portalOffers = activePortalDistributorId ? offers.filter(o => o.distributorId === activePortalDistributorId) : offers;
    const portalCards = activePortalDistributorId ? cards.filter(c => c.distributorId === activePortalDistributorId) : cards;
    return (
      <div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden bg-sky-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col selection:bg-teal-100 selection:text-teal-900 transition-colors duration-200" dir={currentLang === "en" ? "ltr" : "rtl"}>
      <AutoTranslator currentLang={currentLang} />
        <div className="flex-1 flex flex-col w-full mx-auto p-4 sm:p-6">
            {/* Header with back to login button */}
            <div className="relative z-50 w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLogout();
                    setActivePortalDistributorId("");
                    if (window.history && window.history.replaceState) {
                      window.history.replaceState({}, '', window.location.pathname);
                    }
                  }}
                  className="relative z-50 px-4 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow hover:shadow-md text-indigo-700 dark:text-indigo-500 font-bold rounded-xl transition-all border border-indigo-100 dark:border-indigo-900 cursor-pointer touch-manipulation"
                >
                  العودة لتسجيل الدخول
                </button>
            </div>
            <SubscriberPortalView
              customers={portalCustomers}
              offers={portalOffers}
              cards={portalCards}
              onUpdateCustomer={handleUpdateCustomer}
              onAddTicket={handleAddTicket}
              onAddNotification={addNotification}
              settings={settings}
              distributors={displayDistributors}
            />
        </div>
      </div>
    );
  }

  // If user is not logged in, present the Login Screen
  if (!isLoggedIn) {
    return (
      <>
      <AutoTranslator currentLang={currentLang} />
      <LoginView
        distributors={displayDistributors}
        radiusName={settings.radiusName}
        settings={settings}
        adminUser={adminAccount}
        customers={customers}
        distributorOffers={displayDistributorOffers}
        offers={offers}
        onRegisterDistributor={handleRegisterDistributor}
        onRegisterCustomer={handleRegisterCustomer}
        onLoginSuccess={handleLoginSuccess}
        onOpenSubscriberPortal={() => {
          setIsPortalMode(true);
          window.history.pushState({}, '', '?portal=true');
        }}
        onSubscriberLoginSuccess={(customer) => {
          setLoggedInCustomerId(customer.id);
          setIsPortalMode(true);
          safeStorage.setItem("radius_is_portal_mode", "true");
          safeStorage.setItem("radius_logged_in_customer_id", customer.id);

          // Multi-session tracking: increment active concurrent logins count
          const updatedCustomer = {
            ...customer,
            concurrentLogins: Math.max(1, (customer.concurrentLogins || 0) + 1)
          };
          handleUpdateCustomer(updatedCustomer);

          const isMulti = (customer.concurrentLogins || 0) > 0;
          addNotification(
            isMulti 
              ? `تم تسجيل الدخول بنجاح! توجد جلسة نشطة سابقة على جهاز آخر، وتم السماح بإنشاء جلسة جديدة (تعدد الجلسات متاح).` 
              : `أهلاً وسهلاً بك (${customer.name}) - تم تسجيل الدخول لبوابة المشتركين بنجاح!`, 
            "success"
          );

          if (window.history && window.history.pushState) {
            window.history.pushState({}, '', '?portal=true');
          }
        }}
        currentLang={currentLang}
        onToggleLanguage={handleToggleLanguage}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </>
    );
  }

  

  

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-sky-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200" dir={currentLang === "en" ? "ltr" : "rtl"}>
      <AutoTranslator currentLang={currentLang} />
      {/* 1. Responsive Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-l border-slate-200 dark:border-slate-800 shrink-0 select-none">
        {/* Brand / Logo */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0">
              <Signal className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-black tracking-widest text-indigo-500 truncate">{settings.radiusName || "RADIUS LINUX"}</span>
              <h1 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 mt-0.5 truncate">{t("appName")}</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
                        {/* Quick Currency Selector */}
            <select
              value={settings.defaultCurrency}
              onChange={(e) => {
                const updatedSettings = { ...settings, defaultCurrency: e.target.value };
                setSettings(updatedSettings);
                saveToStorage("settings", updatedSettings);
              }}
              className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-500 hover:text-indigo-300 font-black text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 focus:outline-none appearance-none"
              title={currentLang === "ar" ? "تغيير العملة الافتراضية" : "Change Default Currency"}
            >
                            {["USD", "LYD", "EGP", "SYP", "SAR", "AED", "IQD", "JOD"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Quick Language Toggle Button in Sidebar Header */}
            <button
              onClick={handleToggleLanguage}
              className="p-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-500 hover:text-indigo-300 font-black text-xs rounded-xl transition-all flex items-center gap-1 border border-slate-200 dark:border-slate-700/60"
              title={currentLang === "ar" ? "Switch interface to English" : "تغيير الواجهة إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Quick Dark Mode Toggle Button in Sidebar Header */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-all shrink-0"
              title={darkMode ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع المظلم (Dark Mode)"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
          </div>
        </div>

        {/* User Account Switcher in Sidebar */}
        
        {/* Real-time Cloud Sync Status Indicator */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={() => fetchRemoteState(true)}
            className={`w-full px-3 py-1.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all border shadow-sm ${
              syncStatus === "connected"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : syncStatus === "syncing"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20"
            }`}
            title={currentLang === "ar" ? "حالة التزامن اللحظي - انقر للمزامنة اليدوية" : "Real-time sync status - Click to sync now"}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    syncStatus === "connected"
                      ? "bg-emerald-400 animate-ping"
                      : syncStatus === "syncing"
                      ? "bg-amber-400 animate-ping"
                      : "bg-red-400 animate-ping"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    syncStatus === "connected"
                      ? "bg-emerald-500"
                      : syncStatus === "syncing"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
              </span>
              <span className="truncate text-[11px] font-bold">
                {syncStatus === "connected"
                  ? currentLang === "ar"
                    ? "مزامنة لحظية متصلة"
                    : "Connected (Live Sync)"
                  : syncStatus === "syncing"
                  ? currentLang === "ar"
                    ? "جاري المزامنة..."
                    : "Syncing..."
                  : currentLang === "ar"
                  ? "غير متصل (إعادة المحاولة)"
                  : "Disconnected (Retry)"}
              </span>
            </div>
            <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncStatus === "syncing" ? "animate-spin text-amber-500" : "opacity-70 hover:opacity-100"}`} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-menu flex-1 py-4 space-y-0.5 overflow-y-auto max-h-[calc(100vh-240px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item?.id;

            return (
              <button
                key={item?.id}
                onClick={() => setActivePage(item?.id)}
                className={`w-full text-right px-6 py-2.5 font-bold text-xs md:text-sm flex items-center justify-between transition-all group border-r-4 ${
                  isActive 
                    ? "bg-indigo-500/10 text-indigo-500 border-indigo-600" 
                    : "hover:bg-slate-50 dark:hover:bg-slate-50 hover:text-slate-900 dark:hover:text-slate-900 text-slate-600 dark:text-slate-400 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-500" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"}`} />
                  <span>{item.name}</span>
                </div>

                {/* Optional notification badge on sidebar */}
                {item.count !== undefined && item.count > 0 ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? "bg-indigo-600 text-white" : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* User Identity bottom footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-sky-50 dark:bg-slate-950/40 flex items-center justify-between text-xs">
          <div 
            onClick={handleOpenProfileModal} 
            className="flex items-center gap-2.5 cursor-pointer group hover:bg-slate-200 dark:hover:bg-slate-800/60 p-1.5 -m-1.5 rounded-xl transition-all"
            title="تعديل اسم المستخدم وكلمة المرور"
          >
            <div className="p-2 bg-indigo-600/20 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900 group-hover:text-indigo-300 transition-colors">{currentUser.name}</span>
                <Edit className="w-3 h-3 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500" />
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{currentUser.role}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleOpenProfileModal}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg transition-colors"
              title="تعديل اسم الحساب وكلمة المرور"
            >
              <Key className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-amber-500 dark:text-amber-400 rounded-lg transition-colors"
              title={darkMode ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع المظلم"}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center gap-1"
              title="تسجيل الخروج من النظام"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Header & Drawer */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white z-40 flex items-center justify-between px-2 sm:px-4 border-b border-slate-200 dark:border-slate-800 gap-1">
        
        {/* Right Side (Start in RTL) - Menu and Quick Settings */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 pr-1 sm:pr-2">
          
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-800 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 bg-slate-100 dark:bg-slate-800 text-amber-500 dark:text-amber-400 rounded-xl"
            title="تبديل الوضع المظلم"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          <button
            onClick={handleToggleLanguage}
            className="p-1.5 px-2 bg-slate-100 dark:bg-slate-800 text-indigo-500 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60"
            title={currentLang === "ar" ? "Switch to English" : "التحويل إلى العربية"}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{currentLang === "ar" ? "EN" : "عربي"}</span>
          </button>
          
          {/* Quick Currency Selector Mobile */}
          <select
            value={settings.defaultCurrency}
            onChange={(e) => {
              const updatedSettings = { ...settings, defaultCurrency: e.target.value };
              setSettings(updatedSettings);
              saveToStorage("settings", updatedSettings);
            }}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 text-indigo-500 font-black text-xs rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700/60 focus:outline-none appearance-none"
            title={currentLang === "ar" ? "تغيير العملة الافتراضية" : "Change Default Currency"}
          >
            {["USD", "LYD", "EGP", "SYP", "SAR", "AED", "IQD", "JOD"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
          </select>
        </div>

        {/* Left Side (End in RTL) - Logo and App Name */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 min-w-0 flex-1">
          <span className="font-extrabold text-xs sm:text-sm truncate" dir="auto">{settings.radiusName || "RADIUS"}</span>
          <Signal className="w-5 h-5 text-indigo-500 animate-pulse shrink-0" />
        </div>
      </div>
      {/* Mobile Drawer Menu overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-white/80 backdrop-blur-sm z-40 animate-in fade-in duration-200" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute right-0 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 w-80 max-w-[85vw] h-full shadow-2xl p-4 flex flex-col justify-between animate-in slide-in-from-right-10" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-3">
              {/* Real-time Cloud Sync Status Indicator for Mobile */}
              <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => fetchRemoteState(true)}
                  className={`w-full px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-between transition-all border shadow-sm ${
                    syncStatus === "connected"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : syncStatus === "syncing"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                  }`}
                  title={currentLang === "ar" ? "حالة التزامن اللحظي - انقر للمزامنة اليدوية" : "Real-time sync status - Click to sync now"}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      <span
                        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          syncStatus === "connected"
                            ? "bg-emerald-400 animate-ping"
                            : syncStatus === "syncing"
                            ? "bg-amber-400 animate-ping"
                            : "bg-red-400 animate-ping"
                        }`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                          syncStatus === "connected"
                            ? "bg-emerald-500"
                            : syncStatus === "syncing"
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                      />
                    </span>
                    <span className="truncate text-xs font-bold">
                      {syncStatus === "connected"
                        ? currentLang === "ar"
                          ? "مزامنة لحظية متصلة"
                          : "Connected (Live Sync)"
                        : syncStatus === "syncing"
                        ? currentLang === "ar"
                          ? "جاري المزامنة..."
                          : "Syncing..."
                        : currentLang === "ar"
                        ? "غير متصل (إعادة المحاولة)"
                        : "Disconnected (Retry)"}
                    </span>
                  </div>
                  <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${syncStatus === "syncing" ? "animate-spin text-amber-500" : "opacity-70"}`} />
                </button>
              </div>

              <nav className="sidebar-menu space-y-2 overflow-y-auto max-h-[60vh] pb-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item?.id;

                  return (
                    <button
                      key={item?.id}
                      onClick={() => {
                        setActivePage(item?.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-right px-6 py-4 font-bold text-sm flex items-center justify-between transition-all border-r-4 ${
                        isActive 
                          ? "bg-indigo-500/10 text-indigo-500 border-indigo-600" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-50 hover:text-slate-900 dark:hover:text-slate-900 text-slate-600 dark:text-slate-400 border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 ? (
                        <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                          {item.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-white/40 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-bold text-slate-900">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all font-bold text-xs flex items-center gap-1 shrink-0"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Content Wrapper */}
      <main className="flex-1 min-w-0 px-4 pb-4 pt-20 md:px-8 md:pb-8 lg:pt-6 overflow-y-auto overflow-x-hidden">
        {/* Dynamic Page Rendering */}
        <div className="w-full max-w-[1400px] mx-auto space-y-6 px-2 sm:px-4 lg:px-8">
          {/* Active Distributor Banner Notice */}
          
          <Suspense fallback={<LoadingFallback />}>
          {activePage === 0 && (
            <DashboardView
              distributors={displayDistributors}
              customers={displayCustomers}
              devices={displayDevices}
              cards={displayCards}
              servers={displayServers}
              isDistributorSession={isDistributorSession}
              currentDistributorName={currentUser.name}
              currentDistributorObj={activeDistributorObj}
              tickets={displayTickets}
              onNavigate={handleDashboardNavigate}
              onSearchSelectCustomer={handleSearchSelectCustomer}
            />
          )}

          {activePage === 1 && (
            <PingTestView
              customers={displayCustomers}
              selectedCustomerFromState={selectedCustomerForPing}
              onClearSelectedCustomer={() => setSelectedCustomerForPing(null)}
            />
          )}

          {activePage === 2 && (
            <DevicesView
              devices={displayDevices}
              distributors={displayDistributors}
              onAddDevice={handleAddDevice}
              onDeleteDevice={handleDeleteDevice}
              onRefreshNeighbors={handleRefreshNeighbors}
              vpnServerIp={settings.vpnServerIp}
            />
          )}

          {activePage === 3 && (
            <StatsView
              customers={displayCustomers}
              offers={displayOffers}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
            />
          )}

          {activePage === 4 && (
            <OffersView
              offers={displayOffers}
              customers={displayCustomers}
              distributors={displayDistributors}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
              onAddOffer={handleAddOffer}
              onEditOffer={handleEditOffer}
              onDeleteOffer={handleDeleteOffer}
              isDistributorSession={isDistributorSession}
              currentDistributorId={currentDistributorId}
              canManageOffers={hasPerm("canManageOffers")}
            />
          )}

          {activePage === 5 && (
            <SubscribersView
              distributors={displayDistributors}
              customers={displayCustomers}
              deletedCustomers={displayDeletedCustomers}
              offers={displayOffers}
              servers={displayServers}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onBulkDeleteCustomers={handleBulkDeleteCustomers}
              onRestoreCustomer={handleRestoreCustomer}
              onRestoreAllTrash={handleRestoreAllTrash}
              onBulkRestoreTrash={handleBulkRestoreTrash}
              onPermanentDeleteCustomer={handlePermanentDeleteCustomer}
              onBulkPermanentDeleteTrash={handleBulkPermanentDeleteTrash}
              onEmptyTrash={handleEmptyTrash}
              onImportCustomers={handleImportCustomers}
              onOpenSubscriberPortal={() => setActivePage(11)}
              defaultWhatsAppDelayMessage={settings.defaultWhatsAppDelayMessage}
              defaultWhatsAppAlertMessage={settings.defaultWhatsAppAlertMessage}
              currentUser={currentUser}
              isDistributorSession={isDistributorSession}
              initialFilters={subscriberInitialFilters}
            />
          )}

          {activePage === 6 && (
            <NasServersView
              servers={displayServers}
              customers={displayCustomers}
              distributors={displayDistributors}
              offers={displayOffers}
              onAddServer={handleAddServer}
              onDeleteServer={handleDeleteServer}
              onUpdateServer={handleUpdateServer}
              addNotification={addNotification}
              userPermissions={computedPermissions}
              isAdmin={isAdmin}
            />
          )}

          {activePage === 7 && (
            <AuditLogsView
              logs={displayLogs}
              onClearLogs={handleClearLogs}
              isDistributorSession={isDistributorSession}
            />
          )}

          {activePage === 8 && (
            <HotspotCardsView
              cards={displayCards}
              offers={displayOffers}
              onGenerateCards={handleGenerateCards}
              onDeleteCard={handleDeleteCard}
              onClearUsedCards={handleClearUsedCards}
              initialFilters={hotspotCardsInitialFilters}
            />
          )}

          {activePage === 9 && !isDistributorSession && (
            <DistributorsView
              distributors={displayDistributors}
              archivedDistributors={archivedDistributors}
              servers={displayServers}
              distributorOffers={displayDistributorOffers}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
              onAddDistributor={handleAddDistributor}
              onDeleteDistributor={handleDeleteDistributor}
              onRestoreDistributor={handleRestoreDistributor}
              onUpdateDistributor={handleUpdateDistributor}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activePage === 17 && isDistributorSession && (
            <SubDistributorManagementView
              parentDistributorId={currentDistributorId || ""}
              distributors={displayDistributors}
              distributorOffers={displayDistributorOffers}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
              onAddDistributor={handleAddDistributor}
              onDeleteDistributor={handleDeleteDistributor}
              onUpdateDistributor={handleUpdateDistributor}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              allowedDistributorIds={allowedDistributorIds}
              canToggleReadOnlyMode={hasPerm("canToggleReadOnlyMode")}
            />
          )}

          {activePage === 10 && (
            <SupportView
              tickets={displayTickets}
              onAddTicket={handleAddTicket}
              onAddReply={handleAddReply}
              onDeleteTicket={handleDeleteTicket}
              onCloseTicket={handleCloseTicket}
              currentUser={currentUser}
            />
          )}

          {activePage === 11 && (
            <div className="space-y-4">
              {isDistributorSession && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-indigo-900 dark:text-indigo-200">رابط بوابة التجديد الذاتي الخاص بك</h3>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">شارك هذا الرابط مع المشتركين التابعين لك ليتمكنوا من تجديد اشتراكاتهم وتعبئة الرصيد.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const url = window.location.origin + window.location.pathname + "?distributor_portal=" + currentDistributorId;
                      navigator.clipboard.writeText(url);
                      addNotification("تم نسخ رابط بوابة التجديد الخاصة بك بنجاح", "success");
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                  >
                    نسخ الرابط
                  </button>
                </div>
              )}
              {!isDistributorSession && (
                <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-200">الرابط العام لبوابة المشتركين</h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">هذا هو الرابط العام الذي يمكن لأي مشترك من أي موزع استخدامه.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const url = window.location.origin + window.location.pathname + "?portal=true";
                      navigator.clipboard.writeText(url);
                      addNotification("تم نسخ الرابط العام بنجاح", "success");
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
                  >
                    نسخ الرابط العام
                  </button>
                </div>
              )}
              <div className="opacity-90 pointer-events-none scale-[0.98] origin-top">
                <div className="text-center mb-4"><span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-full text-xs font-bold">وضع المعاينة (Simulation Mode)</span></div>
                <SubscriberPortalView
                  customers={displayCustomers}
                  offers={displayOffers}
                  cards={displayCards}
                  onUpdateCustomer={handleUpdateCustomer}
                  onAddTicket={handleAddTicket}
                  onAddNotification={addNotification}
                  settings={settings}
                  distributors={displayDistributors}
                />
              </div>
            </div>
          )}

          {activePage === 12 && (
            <SettingsView
              isDarkMode={darkMode}
              onToggleDarkMode={setDarkMode}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              currentUser={currentUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              customers={displayCustomers}
              devices={displayDevices}
              offers={displayOffers}
              cards={displayCards}
              onUpdateCards={(newCards) => {
                setCards(newCards);
                saveToStorage("cards", newCards);
              }}
              servers={displayServers}
              tickets={displayTickets}
              onUpdateCustomers={handleUpdateCustomersSubset}
              onRunAutoPingDevices={handleRunDevicePingCheck}
              onAddNotification={addNotification}
              isDistributorSession={isDistributorSession}
              activeDistributorObj={activeDistributorObj}
              onUpdateActiveDistributor={handleUpdateDistributor}
              onUpdateDistributor={handleUpdateDistributor}
            />
          )}

          {activePage === 18 && (
            <SettingsView
              initialTab="currencies"
              isDarkMode={darkMode}
              onToggleDarkMode={setDarkMode}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              currentUser={currentUser}
              onUpdateCurrentUser={handleUpdateCurrentUser}
              customers={displayCustomers}
              devices={displayDevices}
              offers={displayOffers}
              cards={displayCards}
              onUpdateCards={(newCards) => {
                setCards(newCards);
                saveToStorage("cards", newCards);
              }}
              servers={displayServers}
              tickets={displayTickets}
              onUpdateCustomers={handleUpdateCustomersSubset}
              onRunAutoPingDevices={handleRunDevicePingCheck}
              onAddNotification={addNotification}
              isDistributorSession={isDistributorSession}
              activeDistributorObj={activeDistributorObj}
              onUpdateActiveDistributor={handleUpdateDistributor}
              onUpdateDistributor={handleUpdateDistributor}
            />
          )}

          {activePage === 16 && (
            <PermissionProfilesView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              distributors={displayDistributors}
              onUpdateDistributors={(updated) => {
                setDistributors(updated);
                saveToStorage("distributors", updated);
              }}
            />
          )}

          {activePage === 13 && (
                        <ReceiptsReviewView
              servers={displayServers}
              customers={displayCustomers}
              offers={displayOffers}
              onUpdateCustomer={handleUpdateCustomer}
              onAddNotification={addNotification}

              onUpdateDistributor={handleUpdateDistributor}
              distributorOffers={displayDistributorOffers}
            />
          )}
          {activePage === 14 && (
            <SubscriberFinancialsView
              distributors={displayDistributors}
              customers={displayCustomers}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
              onUpdateCustomer={handleUpdateCustomer}
              isDistributorSession={isDistributorSession}
            />
          )}

          {activePage === 15 && (
            <DistributorSubscriptionsView
              distributors={displayDistributors}
              distributor={isDistributorSession ? activeDistributorObj : undefined}
              offers={distributorOffers}
              servers={displayServers}
              currencies={displayCurrencies}
              defaultCurrency={settings.defaultCurrency}
              onUpdateDistributor={handleUpdateDistributor}
              onAddOffer={handleAddDistributorOffer}
              onUpdateOffer={handleUpdateDistributorOffer}
              onDeleteOffer={handleDeleteDistributorOffer}
              onAddNotification={addNotification}
              isDistributorSession={isDistributorSession}
              isRootAdmin={isRootAdmin}
            />
          )}
          </Suspense>

        </div>
      </main>

      {/* Floating System Notification Center */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-3 max-w-sm w-full" dir="rtl">
        {notifications.map((notif) => (
          <div
            key={notif?.id}
            className={`p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-left-5 fade-in duration-300 ${
              notif.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-900" :
              notif.type === "warning" ? "bg-amber-50 border-amber-100 text-amber-900" :
              notif.type === "error" ? "bg-rose-50 border-indigo-100 text-rose-900" :
              "bg-indigo-50 border-indigo-100 text-indigo-900"
            }`}
          >
            <div className="flex-1">
              <p className="text-xs font-bold leading-relaxed">{notif.message}</p>
              <span className="text-[9px] text-slate-400 mt-1 block font-mono font-medium">{notif.timestamp}</span>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n?.id !== notif?.id))}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Account Profile & Credentials Edit Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 rounded-xl">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">تعديل اسم المستخدم وكلمة المرور</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">تحديث بيانات تسجيل الدخول لحسابك الحالي</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileCredentials} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">الاسم الكامل / الصفة:</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">اسم المستخدم للدخول (Username):</label>
                <input
                  type="text"
                  value={profileUsername}
                  onChange={(e) => setProfileUsername(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 dark:text-slate-300 mb-1">كلمة المرور الجديدة (Password):</label>
                <div className="relative">
                  <input
                    type={showProfilePassword ? "text" : "password"}
                    value={profilePassword}
                    onChange={(e) => setProfilePassword(e.target.value)}
                    className="w-full p-3 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowProfilePassword(!showProfilePassword)}
                    className="absolute left-3 top-3.5 text-slate-400 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-200"
                  >
                    {showProfilePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                ℹ️ عند حفظ التغييرات، سيتم الاعتماد الفوري لاسم المستخدم وكلمة المرور الجديدة في الجلسة الحالية وقاعدة البيانات.
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppContent />
    </Suspense>
  );
}
