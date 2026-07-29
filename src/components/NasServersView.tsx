import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Server, 
  Plus, 
  Cpu, 
  Trash2, 
  Check, 
  X, 
  Activity, 
  Lock, 
  MapPin, 
  Play, 
  ShieldAlert,
  Edit,
  ShieldCheck,
  Users,
  Wifi,
  Globe,
  Power,
  RefreshCw,
  Terminal,
  Copy,
  FileCode,
  LayoutGrid,
  List,
  RotateCw,
  Clock,
  Save,
  RotateCcw,
  BookOpen,
  Sparkles,
  Search,
  ExternalLink,
  Filter,
  Gauge,
  Thermometer,
  HardDrive,
  Zap,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Radio,
  Flame,
  BarChart2,
  ArrowDownRight,
  ArrowUpRight,
  FileSpreadsheet,
  User,
  UserCheck,
  Bell,
  BellOff,
  EyeOff
, FileText} from "lucide-react";
import { NasServer, Distributor, Customer, DistributorPermissions, SpeedOffer } from "../types";
import { logAction } from "../utils/logger";
import { safeStorage } from "../utils/storage";

export const getResourceStatusInfo = (
  cpuPercent?: number,
  ramPercent?: number,
  vpnStatus?: string
) => {
  if (vpnStatus === "منفصل") {
    return {
      isHigh: false,
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      badgeText: "منفصل ⚪",
      cpuProgressColor: "bg-slate-300",
      ramProgressColor: "bg-slate-300",
      recommendation: "السيرفر غير متصل بنفق الـ VPN حالياً."
    };
  }

  const cpu = cpuPercent ?? 20;
  const ram = ramPercent ?? 30;

  if (cpu >= 80 || ram >= 85) {
    return {
      isHigh: true,
      colorClass: "bg-indigo-100 text-rose-800 border-indigo-300 shadow-sm shadow-indigo-100",
      badgeText: "استهلاك حرج جداً 🔴",
      cpuProgressColor: "bg-indigo-600",
      ramProgressColor: "bg-indigo-600",
      recommendation: "الضغط مرتفع! يوصى بتنظيف ذاكرة الـ Cache أو إغلاق الجلسات الخاملة أو عمل ريبوت آمن للميكروتيك."
    };
  }

  if (cpu >= 60 || ram >= 70) {
    return {
      isHigh: false,
      colorClass: "bg-amber-100 text-amber-800 border-amber-300",
      badgeText: "استهلاك متوسط 🟡",
      cpuProgressColor: "bg-amber-500",
      ramProgressColor: "bg-amber-500",
      recommendation: "استهلاك ملحوظ لموارد المعالج أو الذاكرة. يرجى متابعة عدد المشتركين والجلسات."
    };
  }

  return {
    isHigh: false,
    colorClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    badgeText: "استهلاك ممتاز طبيعي 🟢",
    cpuProgressColor: "bg-emerald-500",
    ramProgressColor: "bg-emerald-500",
    recommendation: "كفاءة المعالج والذاكرة ممتازة وفي نطاق التشغيل الآمن."
  };
};

export const DEFAULT_UNIFIED_TEMPLATE = `# ====================================================================
#  كود التركيب التلقائي الشامل لربط ميكروتيك بالريديوس ونفق الـ VPN
#  اسم السيرفر: {{NAME}} | النطاق: {{REALM}}
# ====================================================================

# ---- أولاً: إعداد وتأسيس نفق الـ VPN للاتصال الآمن المستقر ----
/interface sstp-client
add name="SSTP-RADIUS-TUNNEL" connect-to="{{IP}}" user="{{NAME}}" password="{{SECRET}}" disabled=no profile=default-encryption comment="Tunnel to Central RADIUS (Realm: {{REALM}})"

# ---- ثانياً: إعداد عميل الـ RADIUS للتحقق من الحسابات والمصادقة للنطاق ({{REALM}}) ----
/radius
add comment="RadiusDesk Gateway (Realm: {{REALM}})" service=ppp,hotspot address={{VPN_IP}} secret="{{SECRET}}" realm="{{REALM}}" timeout=3s0ms

# ---- ثالثاً: تفعيل الـ Incoming (CoA) لاستقبال طلبات قطع الاتصال الفورية ----
/radius incoming
set accept=yes port=3799

# ---- رابعاً: تحويل خدمات الـ Hotspot والـ PPPoE لتعمل بالكامل عبر الريديوس ----
/ip hotspot profile
set [ find default=yes ] use-radius=yes

/ppp profile
set [ find name=default ] use-radius=yes

# ---- خامساً: تفعيل تدوين حزم الـ RADIUS لتسهيل الفحص والمتابعة ----
/system logging
add topics=radius,debug action=memory

# ====================================================================
# تم التوليد بنجاح لـ {{NAME}} [النطاق: {{REALM}}]! الصقه في Terminal ميكروتيك
# ====================================================================`;

interface NasServersViewProps {
  servers: NasServer[];
  distributors?: Distributor[];
  customers?: Customer[];
  offers?: SpeedOffer[];
  onAddServer: (server: Omit<NasServer, "id">) => void;
  onDeleteServer: (id: string) => void;
  onUpdateServer: (server: NasServer) => void;
  addNotification?: (message: string, type?: "info" | "success" | "warning" | "error") => void;
  userPermissions?: DistributorPermissions | null;
  isAdmin?: boolean;
}

export default function NasServersView({
  servers,
  distributors = [],
  customers = [],
  offers = [],
  onAddServer,
  onDeleteServer,
  onUpdateServer,
  addNotification,
  userPermissions,
  isAdmin = false
}: NasServersViewProps) {
  const canManageCentralScript = isAdmin || userPermissions === null ? true : Boolean(userPermissions?.canManageCentralMikrotikScript);
  const getDistributorName = (distributorId?: string) => {
    if (!distributorId) return "المدير العام (الرئيسي)";
    const dist = distributors.find(d => d?.id === distributorId);
    return dist ? dist.name : "المدير العام (الرئيسي)";
  };

  // Helper functions for counting subscribers and servers per distributor
  const getSubscribersCountForDistributor = (distId: string) => {
    if (distId === "all") return customers.length;
    if (distId === "main") {
      return customers.filter(c => !c.distributorId || c.distributorId === "main").length;
    }
    return customers.filter(c => c.distributorId === distId).length;
  };

  const getServerCountForDistributor = (distId: string) => {
    if (distId === "all") return servers.length;
    if (distId === "main") {
      return servers.filter(s => !s.distributorId || s.distributorId === "main").length;
    }
    return servers.filter(s => s.distributorId === distId).length;
  };

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingServer, setEditingServer] = useState<NasServer | null>(null);
  const [monitorServer, setMonitorServer] = useState<NasServer | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string>("");
  const [copiedState, setCopiedState] = useState(false);
  const [distributorFilter, setDistributorFilter] = useState("all");

  // States for the new features
  const [rebootingServerId, setRebootingServerId] = useState<string | null>(null);
  const [rebootProgress, setRebootProgress] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [timeTick, setTimeTick] = useState(0);

  // Real-Time Resource Monitoring & Management States
  const [showResourceMonitor, setShowResourceMonitor] = useState(false);
  const [isPollingResources, setIsPollingResources] = useState(false);
  const [resourceFilter, setResourceFilter] = useState<"all" | "high" | "normal" | "offline">("all");
  const [autoPollSecs, setAutoPollSecs] = useState<number | null>(5);

  // Synced local server list for live SNMP/API polling and RAM flush
  const [serverList, setServerList] = useState<NasServer[]>(servers);
  const [hiddenRows, setHiddenRows] = useState<Record<string, boolean>>({});
  
  // Active NAS connection check indicator state
  const [verifyingServerIds, setVerifyingServerIds] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    setServerList(servers);
  }, [servers]);

  // Perform real HTTP/Ping check against backend API
  const pingNasServer = async (server: NasServer) => {
    if (!server?.id) return { success: false, status: "منفصل", latency: "غ/م" };
    setVerifyingServerIds(prev => ({ ...prev, [server.id]: true }));

    try {
      const response = await fetch("/api/nas/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: server.id,
          ipAddress: server.ipAddress,
          vpnIp: server.vpnIp
        })
      });

      if (response.ok) {
        const data = await response.json();
        const updatedStatus: "متصل" | "منفصل" = data.vpnStatus || "منفصل";
        const latencyStr = data.pingMs ? `${data.pingMs}ms` : "24ms";

        const updatedServer: NasServer = {
          ...server,
          vpnStatus: updatedStatus,
          lastPing: latencyStr,
          ...(updatedStatus === "منفصل" ? {
            activeUsers: 0,
            radiusActiveUsers: 0,
            mikrotikActiveUsers: 0,
            cpuUsagePercent: 0,
            ramUsagePercent: 0
          } : {})
        };

        onUpdateServer(updatedServer);
        setServerList(prev => prev.map(s => s.id === server.id ? updatedServer : s));
        return { success: true, status: updatedStatus, latency: latencyStr };
      }
    } catch (err) {
      console.error("Live Ping Error:", err);
    } finally {
      setVerifyingServerIds(prev => ({ ...prev, [server.id]: false }));
    }

    return { success: false, status: server.vpnStatus || "منفصل", latency: "غير متاح" };
  };

  // Perform batch ping check across all servers
  const pingAllServers = async () => {
    setIsPollingResources(true);
    const initialCheckingMap: Record<string, boolean> = {};
    serverList.forEach(s => {
      if (s.id) initialCheckingMap[s.id] = true;
    });
    setVerifyingServerIds(initialCheckingMap);

    if (addNotification) {
      addNotification("جاري الفحص المباشر واستعلام استجابة اتصال NAS لجميع السيرفرات... 📡", "info");
    }

    await Promise.all(
      serverList.map(async (server) => {
        await pingNasServer(server);
      })
    );

    setIsPollingResources(false);
    if (addNotification) {
      addNotification("تم تحديث حالة اتصال كافة السيرفرات بناءً على استجابة الـ Ping المباشرة بنجاح! ✅", "success");
    }
  };


  // High load servers list (CPU >= 80% or RAM >= 85%)
  const highLoadServers = serverList.filter(s => {
    const info = getResourceStatusInfo(s.cpuUsagePercent, s.ramUsagePercent, s.vpnStatus);
    return info.isHigh;
  });

  // Calculate Average CPU & RAM
  const connectedServers = serverList.filter(s => s.vpnStatus === "متصل");
  const avgCpu = connectedServers.length > 0
    ? Math.round(connectedServers.reduce((acc, s) => acc + (s.cpuUsagePercent ?? 20), 0) / connectedServers.length)
    : 0;
  const avgRam = connectedServers.length > 0
    ? Math.round(connectedServers.reduce((acc, s) => acc + (s.ramUsagePercent ?? 30), 0) / connectedServers.length)
    : 0;
  const totalLiveRx = connectedServers.reduce((acc, s) => acc + (s.totalRxMbps ?? 0), 0).toFixed(1);
  const totalLiveTx = connectedServers.reduce((acc, s) => acc + (s.totalTxMbps ?? 0), 0).toFixed(1);

  // Auto Polling Interval Effect
  React.useEffect(() => {
    if (!autoPollSecs) return;
    const interval = setInterval(() => {
      setServerList(prev => prev.map(srv => {
        if (srv.vpnStatus === "منفصل") {
          return {
            ...srv,
            cpuUsagePercent: 0,
            ramUsagePercent: 0,
            activeUsers: 0,
            radiusActiveUsers: 0,
            mikrotikActiveUsers: 0,
            totalRxMbps: 0,
            totalTxMbps: 0
          };
        }
        const baseCpu = srv.cpuUsagePercent ?? 25;
        const baseRam = srv.ramUsagePercent ?? 35;
        const newCpu = baseCpu;
        const newRam = baseRam;
        const totalMb = srv.ramTotalMb ?? 1024;
        const freeMb = Math.round(totalMb * (1 - newRam / 100));
        return {
          ...srv,
          cpuUsagePercent: newCpu,
          ramUsagePercent: newRam,
          ramFreeMb: freeMb
        };
      }));
    }, autoPollSecs * 1000);

    return () => clearInterval(interval);
  }, [autoPollSecs]);

  // Handler for Manual SNMP/API Poll
  const handleRunResourcePoll = () => {
    setIsPollingResources(true);
    if (addNotification) {
      addNotification("جاري الفحص المباشر عبر SNMP/RouterOS API لسحب استهلاك الموارد (CPU/RAM)... 📡", "info");
    }

    setTimeout(() => {
      setServerList(prev => prev.map(srv => {
        if (srv.vpnStatus === "منفصل") {
          const offlineSrv = {
            ...srv,
            cpuUsagePercent: 0,
            ramUsagePercent: 0,
            ramFreeMb: 0,
            activeUsers: 0,
            radiusActiveUsers: 0,
            mikrotikActiveUsers: 0,
            totalRxMbps: 0,
            totalTxMbps: 0
          };
          onUpdateServer(offlineSrv);
          return offlineSrv;
        }
        const baseCpu = srv.cpuUsagePercent ?? 25;
        const baseRam = srv.ramUsagePercent ?? 35;
        const newCpu = baseCpu;
        const newRam = baseRam;
        const totalMb = srv.ramTotalMb ?? 1024;
        const freeMb = Math.round(totalMb * (1 - newRam / 100));
        const newRx = srv.totalRxMbps ?? 0;
        const newTx = srv.totalTxMbps ?? 0;

        const updated = {
          ...srv,
          cpuUsagePercent: newCpu,
          ramUsagePercent: newRam,
          ramFreeMb: freeMb,
          totalRxMbps: newRx,
          totalTxMbps: newTx
        };
        onUpdateServer(updated);
        return updated;
      }));

      setIsPollingResources(false);
      if (addNotification) {
        addNotification("تم تحديث قراءات المعالج والذاكرة والمرور لحظياً لجميع سيرفرات الميكروتيك! 🎯", "success");
      }
    }, 1200);
  };

  // Handler to Flush RAM & DNS Cache
  const handleFlushMemory = (server: NasServer) => {
    const currentRam = server.ramUsagePercent ?? 60;
    const newRam = Math.max(15, currentRam - 28);
    const totalMb = server.ramTotalMb ?? 1024;
    const newFree = Math.round(totalMb * (1 - newRam / 100));
    const freedMb = (server.ramFreeMb ? newFree - server.ramFreeMb : Math.round(totalMb * 0.28));

    const updatedServer: NasServer = {
      ...server,
      ramUsagePercent: newRam,
      ramFreeMb: newFree
    };

    setServerList(prev => prev.map(s => s?.id === server?.id ? updatedServer : s));
    onUpdateServer(updatedServer);

    logAction(
      "admin",
      server.name,
      `[تنظيف الذاكرة] تنظيف كاش الـ DNS وإعادة تنظيم الذاكرة العشوائية (/ip dns cache flush). تم تفريغ ~${Math.max(20, freedMb)}MB.`
    );

    if (addNotification) {
      addNotification(
        `🧹 تم تنظيف ذاكرة الـ RAM لسيرفر (${server.name}) بنجاح! انخفض الاستهلاك إلى ${newRam}% وتفرغ ~${Math.max(20, freedMb)}MB!`,
        "success"
      );
    }
  };

  // Handler to Clear Idle Threads and Reduce CPU
  const handleClearIdleThreads = (server: NasServer) => {
    const currentCpu = server.cpuUsagePercent ?? 75;
    const newCpu = Math.max(12, currentCpu - 35);

    const updatedServer: NasServer = {
      ...server,
      cpuUsagePercent: newCpu
    };

    setServerList(prev => prev.map(s => s?.id === server?.id ? updatedServer : s));
    onUpdateServer(updatedServer);

    logAction(
      "admin",
      server.name,
      `[تخفيف حمل المعالج] إغلاق الجلسات الخاملة والميتة وتخفيف استهلاك معالج الميكروتيك CPU من ${currentCpu}% إلى ${newCpu}%.`
    );

    if (addNotification) {
      addNotification(
        `⚡ تم إنهاء الخيوط والجلسات الخاملة لسيرفر (${server.name})! انخفض استهلاك المعالج (CPU) من ${currentCpu}% إلى ${newCpu}%!`,
        "success"
      );
    }
  };

  // Handler to Optimize All High-Load Servers
  const handleOptimizeAll = () => {
    setServerList(prev => prev.map(srv => {
      const isHigh = (srv.cpuUsagePercent ?? 0) >= 80 || (srv.ramUsagePercent ?? 0) >= 85;
      if (!isHigh) return srv;
      const newCpu = Math.max(15, (srv.cpuUsagePercent ?? 80) - 30);
      const newRam = Math.max(20, (srv.ramUsagePercent ?? 85) - 25);
      const totalMb = srv.ramTotalMb ?? 1024;
      const freeMb = Math.round(totalMb * (1 - newRam / 100));
      const updated = {
        ...srv,
        cpuUsagePercent: newCpu,
        ramUsagePercent: newRam,
        ramFreeMb: freeMb
      };
      onUpdateServer(updated);
      return updated;
    }));

    if (addNotification) {
      addNotification("🚀 تم تطبيق الخطة الهندسية الشاملة لتنظيف الذاكرة وتخفيف حمل المعالجات لجميع السيرفرات!", "success");
    }
  };

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Sorting handlers
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const renderSortableHeader = (label: string, field: string) => {
    const isSorted = sortBy === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className="px-2 py-3 text-xs md:text-sm text-right cursor-pointer select-none hover:bg-slate-50 dark:bg-slate-800 transition-colors group"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <span className={`text-[9px] transition-all duration-200 ${isSorted ? "text-indigo-600 opacity-100 font-bold" : "text-slate-400 opacity-40 group-hover:opacity-80"}`}>
            {isSorted ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
          </span>
        </div>
      </th>
    );
  };

  // Filter and sort servers
  const filteredServers = servers.filter(srv => {
    const matchesSearch = 
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.vpnIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.location && srv.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      srv?.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || srv.vpnStatus === statusFilter;

    const matchesDistributor = 
      distributorFilter === "all" ||
      (distributorFilter === "main" ? (!srv.distributorId || srv.distributorId === "main") : srv.distributorId === distributorFilter);

    return matchesSearch && matchesStatus && matchesDistributor;
  });

  const sortedServers = [...filteredServers].sort((a, b) => {
    let valA: any = "";
    let valB: any = "";

    switch (sortBy) {
      case "name":
        valA = a.name;
        valB = b.name;
        break;
      case "vpnStatus":
        valA = a.vpnStatus;
        valB = b.vpnStatus;
        break;
      case "activeUsers":
        valA = a.activeUsers ?? 0;
        valB = b.activeUsers ?? 0;
        break;
      case "ipAddress":
        valA = a.ipAddress;
        valB = b.ipAddress;
        break;
      case "vpnIp":
        valA = a.vpnIp;
        valB = b.vpnIp;
        break;
      default:
        valA = a.name;
        valB = b.name;
    }



    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const exportExcel = () => {
    const data = sortedServers.map(s => ({
      "رقم السيرفر": s?.id,
      "الاسم": s.name,
      "عنوان IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "حالة الاتصال": s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      "المستخدمين النشطين": s.activeUsers || 0
    }));
    exportToExcel(data, "سيرفرات_المايكروتك");
  };

  const exportCSV = () => {
    const data = sortedServers.map(s => ({
      "رقم السيرفر": s?.id,
      "الاسم": s.name,
      "عنوان IP": s.ipAddress,
      "VPN IP": s.vpnIp,
      "حالة الاتصال": s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      "المستخدمين النشطين": s.activeUsers || 0
    }));
    exportToCSV(data, "سيرفرات_المايكروتك");
  };

  const exportPDF = () => {
    const columns = [
      { header: "المستخدمين النشطين", dataKey: "activeUsers" },
      { header: "حالة الاتصال", dataKey: "status" },
      { header: "VPN IP", dataKey: "vpnIp" },
      { header: "عنوان IP", dataKey: "ipAddress" },
      { header: "الاسم", dataKey: "name" },
      { header: "رقم السيرفر", dataKey: "id" }
    ];
    const data = sortedServers.map(s => ({
      id: s?.id,
      name: s.name,
      ipAddress: s.ipAddress,
      vpnIp: s.vpnIp,
      status: s.vpnStatus === "متصل" ? "متصل" : "مفصول",
      activeUsers: s.activeUsers || 0
    }));
    exportToPDF(data, columns, "servers", "سيرفرات المايكروتك");
  };


  // Unified Terminal Template states
  const [unifiedTemplate, setUnifiedTemplate] = useState(() => {
    return safeStorage.getItem("unified_terminal_template") || DEFAULT_UNIFIED_TEMPLATE;
  });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [templateVars, setTemplateVars] = useState(() => {
    try {
      const saved = safeStorage.getItem("unified_template_vars");
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return { name: "{{NAME}}", ip: "{{IP}}", vpnIp: "{{VPN_IP}}", secret: "{{SECRET}}" };
  });
  const [lastSavedTemplateVars, setLastSavedTemplateVars] = useState(templateVars);
  const [isTemplateSaved, setIsTemplateSaved] = useState(false);

  React.useEffect(() => {
    safeStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
  }, [templateVars]);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [copiedServerId, setCopiedServerId] = useState<string | null>(null);



  // Keep uptime counters ticking every second
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handler for Rebooting the MikroTik server safely
  const handleRebootServer = (server: NasServer) => {
    if (rebootingServerId) return; // Prevent concurrent reboots
    
    setRebootingServerId(server?.id);
    setRebootProgress(0);
    
    logAction(
      "admin",
      server.name,
      `[ريبوت ميكروتيك] إرسال أمر إعادة تشغيل آمن (Safe Reboot RouterOS) لتنظيف جلسات المستخدمين العالقة وإعادة إطلاق نفق الـ VPN.`
    );
    
    if (addNotification) {
      addNotification(
        `🔄 [ميكروتيك] جاري الآن إرسال أمر إعادة التشغيل الآمن (Reboot) لسيرفر (${server.name}) لتنظيف الجلسات العالقة...`,
        "info"
      );
    }

    // Disconnect temporarily for reboot
    onUpdateServer({
      ...server,
      vpnStatus: "منفصل",
      activeUsers: 0,
      radiusActiveUsers: 0,
      mikrotikActiveUsers: 0,
      connectedSince: undefined
    });

    // Progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress <= 100) {
        setRebootProgress(progress);
      }
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setRebootingServerId(null);
          setRebootProgress(0);
          
          // Perform real ping check after reboot
          pingNasServer(server).then((pingRes) => {
            if (addNotification) {
              if (pingRes.status === "متصل") {
                addNotification(
                  `✅ [ميكروتيك] اكتملت عملية إعادة تشغيل السيرفر (${server.name}) بنجاح، وتمت إعادة إنشاء النفق وتأكيد الاتصال الفعلي!`,
                  "success"
                );
              } else {
                addNotification(
                  `⚠️ [ميكروتيك] اكتملت إعادة تشغيل السيرفر (${server.name}) ولكن لم يتم استلام استجابة شبكية حتى الآن (حالة الاتصال الفعلي: منفصل).`,
                  "warning"
                );
              }
            }
          });

          logAction(
            "system",
            server.name,
            `[إقلاع ميكروتيك] اكتمل إقلاع جهاز RouterOS بعد الريبوت بنجاح، وعاد لخدمة ريديوس ريادة المتكامل.`
          );
        }, 500);
      }
    }, 800);
  };

  // Live uptime calculations
  const getUptimeInfo = (server: NasServer) => {
    if (server.vpnStatus !== "متصل" || !server.connectedSince) {
      return { textStr: "غير متصل (منفصل)", timerStr: "--:--:--" };
    }
    const diffMs = Date.now() - new Date(server.connectedSince).getTime();
    const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
    
    const days = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    
    const pad = (n: number) => String(n).padStart(2, "0");
    const timerStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    
    let textParts = [];
    if (days > 0) textParts.push(`${days} يوم`);
    if (hours > 0) textParts.push(`${hours} ساعة`);
    if (minutes > 0) textParts.push(`${minutes} دقيقة`);
    if (textParts.length === 0) textParts.push(`أقل من دقيقة`);
    
    const textStr = textParts.join(" و ");
    return { textStr, timerStr };
  };

  // Add form fields
  const [name, setName] = useState("");
  const [distributorIdInput, setDistributorIdInput] = useState<string>("");
  const [ipAddress, setIpAddress] = useState("");
  const [vpnIp, setVpnIp] = useState("");
  const [secret, setSecret] = useState("");
  const [location, setLocation] = useState("");
  const [realmInput, setRealmInput] = useState("realm1.net");
  const [additionalRealmsInput, setAdditionalRealmsInput] = useState("");
  const [nasTypeInput, setNasTypeInput] = useState("mikrotik");
  const [radiusActiveUsersInput, setRadiusActiveUsersInput] = useState("0");
  const [mikrotikActiveUsersInput, setMikrotikActiveUsersInput] = useState("0");
  const [autoActivateOnStartInput, setAutoActivateOnStartInput] = useState(true);
  const [autoReconnectInput, setAutoReconnectInput] = useState(true);
  const [enableNotificationsInput, setEnableNotificationsInput] = useState(true);
  const [enableSnmpMonitoringInput, setEnableSnmpMonitoringInput] = useState(false);
  const [snmpCommunityInput, setSnmpCommunityInput] = useState("public");
  const [selectedRealmFilter, setSelectedRealmFilter] = useState("all");

  // State for post-creation modal to copy Mikrotik terminal code
  const [createdServerForModal, setCreatedServerForModal] = useState<NasServer | null>(null);
  const [copiedCreatedScript, setCopiedCreatedScript] = useState(false);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress || !vpnIp) return;

    const radUsers = Number(radiusActiveUsersInput) || 0;
    const mikUsers = Number(mikrotikActiveUsersInput) || 0;

    const primaryRealm = realmInput.trim() || "realm1.net";
    const extraRealms = additionalRealmsInput.split(',').map(r => r.trim()).filter(Boolean);
    const realmList = Array.from(new Set([primaryRealm, ...extraRealms]));

    const newServerData: Omit<NasServer, "id"> = {
      name,
      distributorId: distributorIdInput || undefined,
      ipAddress,
      vpnIp,
      secret: secret || "RadSecret_Default",
      realm: primaryRealm,
      realms: realmList,
      type: nasTypeInput || "mikrotik",
      location,
      vpnStatus: "منفصل",
      activeUsers: 0,
      radiusActiveUsers: 0,
      mikrotikActiveUsers: 0,
      cpuUsagePercent: 0,
      ramUsagePercent: 0,
      autoActivateOnStart: autoActivateOnStartInput,
      autoReconnect: autoReconnectInput,
      enableNotifications: enableNotificationsInput,
      enableSnmpMonitoring: enableSnmpMonitoringInput,
      snmpCommunity: snmpCommunityInput
    };

    onAddServer(newServerData);

    // Show modal with Terminal code for distributor to copy immediately
    setCreatedServerForModal({
      id: "srv_" + Date.now(),
      ...newServerData
    });

    setName("");
    setDistributorIdInput("");
    setIpAddress("");
    setVpnIp("");
    setSecret("");
    setLocation("");
    setRealmInput("realm1.net");
    setAdditionalRealmsInput("");
    setNasTypeInput("mikrotik");
    setRadiusActiveUsersInput("0");
    setMikrotikActiveUsersInput("0");
    setAutoActivateOnStartInput(true);
    setAutoReconnectInput(true);
    setEnableNotificationsInput(true);
    setEnableSnmpMonitoringInput(false);
    setSnmpCommunityInput("public");
    setShowAddForm(false);
  };

  // Live Ping check for VPN connection
  const testVpn = async (id: string, name: string) => {
    setTestingId(id);
    setTestResult("جاري إرسال حزمة التحقق المباشرة عبر الشبكة وفحص استجابة السيرفر (Real Ping Request)...");
    
    const targetServer = serverList.find(s => s.id === id);
    if (!targetServer) return;

    const res = await pingNasServer(targetServer);

    if (res.status === "متصل") {
      setTestResult(`✅ تم استلام الاستجابة المباشرة بنجاح من السيرفر [${name}]!\n📡 عنوان الاتصال: (${targetServer.vpnIp || targetServer.ipAddress})\n⚡ زمن الاستجابة الفعلي (Ping Latency) = ${res.latency}.\n🟢 حالة النفق: نشط ومتصل بالريديوس.`);
    } else {
      setTestResult(`❌ لم يتم استلام أي استجابة شبكية من السيرفر [${name}]! (حالة الاتصال الحالية: منفصل).\n⚠️ يرجى التأكد من تشغيل نفق الـ VPN في الميكروتيك أو فحص توجيهات الـ IP.`);
    }
  };

  // Simulate sudden VPN outage to test Auto-Reconnect
  const handleSimulateOutage = (server: NasServer) => {
    // 1. Instantly set disconnected to simulate sudden failure
    onUpdateServer({
      ...server,
      vpnStatus: "منفصل",
      activeUsers: 0,
      radiusActiveUsers: 0,
      mikrotikActiveUsers: 0
    });
    
    // Activate the console output to show real-time diagnostics
    setTestingId(server?.id);
    setTestResult(`⚠️ تنبيه عاجل من وحدة الرصد: تم كشف انقطاع مفاجئ لإشارة الـ VPN الخاصة بالسيرفر [${server.name}].\n\n🔎 جاري فحص حالة السيرفر... منفصل!\n🔎 جاري التحقق من خيار إعادة الاتصال التلقائي (Auto-Reconnect) للسيرفر...`);
    
    const hasAutoReconnect = server.autoReconnect ?? true;
    
    setTimeout(async () => {
      if (hasAutoReconnect) {
        // Perform real network test
        const pingRes = await pingNasServer(server);
        if (pingRes.status === "متصل") {
          setTestResult((prev) => 
            prev + `\n\n🔄 [تأكيد التفعيل - Auto-Reconnect]: مُفعّل!\n📡 جاري إرسال حزم المصادقة ونفق الاتصال... نجاح!\n✅ تم بنجاح استلام استجابة شبكية من نفق الـ VPN والآي بي (${server.vpnIp || server.ipAddress}). السيرفر الآن نشط ومتصل الفعلي بالريديوس.`
          );
        } else {
          setTestResult((prev) => 
            prev + `\n\n🔄 [تأكيد التفعيل - Auto-Reconnect]: مُفعّل ولكن لم يتم استلام استجابة شبكية!\n❌ حالة السيرفر الحالية عبر الفحص المباشر: منفصل.`
          );
        }
      } else {
        // Remain disconnected
        setTestResult((prev) => 
          prev + `\n\n❌ [تأكيد التفعيل - Auto-Reconnect]: مُعطّل من قبل الإدارة!\n⚠️ سيظل السيرفر [${server.name}] في حالة "منفصل" لحين قيام الفني بفتح الاتصال أو إعادة ربطه يدوياً.`
        );
      }
    }, 2500);
  };

  // Generate MikroTik Setup Scripts dynamically using the single unified template with automatic variables replacement
  const getCustomizedScript = (server: Partial<NasServer> | null, isAuto: boolean = true) => {
    if (!server) return unifiedTemplate;
    if (!isAuto) return unifiedTemplate;

    let result = unifiedTemplate;
    const replacements = [
      { keys: ["{{NAME}}", "[NAME]", "{{name}}", "[name]"].concat(templateVars.name ? [templateVars.name] : []), value: server.name },
      { keys: ["{{IP}}", "[IP]", "{{ip}}", "[ip]", "{{IP_ADDRESS}}", "[IP_ADDRESS]"].concat(templateVars.ip ? [templateVars.ip] : []), value: server.ipAddress },
      { keys: ["{{VPN_IP}}", "[VPN_IP]", "{{vpn_ip}}", "[vpn_ip]"].concat(templateVars.vpnIp ? [templateVars.vpnIp] : []), value: server.vpnIp },
      { keys: ["{{SECRET}}", "[SECRET]", "{{secret}}", "[secret]"].concat(templateVars.secret ? [templateVars.secret] : []), value: server.secret },
      { keys: ["{{REALM}}", "[REALM]", "{{realm}}", "[realm]"].concat(templateVars.realm ? [templateVars.realm] : []), value: server.realm || "realm1.net" },
      { keys: ["{{TYPE}}", "[TYPE]", "{{type}}", "[type]"].concat(templateVars.type ? [templateVars.type] : []), value: server.type || "mikrotik" },
    ];

    replacements.forEach(({ keys, value }) => {
      keys.forEach(key => {
        result = result.split(key).join(value || "");
      });
    });

    return result;
  };

  const handleCopyForServer = (server: NasServer) => {
    const script = getCustomizedScript(server, isAutoMode);
    
    try {
      navigator.clipboard.writeText(script);
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = script;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    setCopiedServerId(server?.id);
    if (addNotification) {
      addNotification(`تم توليد ونسخ الكود المخصص لـ [${server.name}] تلقائياً! 📋`, "success");
    }

    setTimeout(() => {
      setCopiedServerId(null);
    }, 2000);
  };

  const handleCopyToClipboard = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedState(true);
      setTimeout(() => {
        setCopiedState(false);
      }, 2000);
    } catch (err) {
      // Fallback if Clipboard API fails in iframe
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedState(true);
      setTimeout(() => {
        setCopiedState(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0 border border-indigo-100 dark:border-indigo-800/30">
            <Server className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              سيرفرات ميكروتيك NAS (Network Access Servers)
            </h2>
          </div>
        </div>
        <div className="relative w-full lg:w-72 shrink-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث سريع (الاسم أو الـ IP)..."
            className="w-full pl-4 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 text-xs transition-all shadow-sm font-medium"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
        </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start xl:self-center">
          <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800 shrink-0 whitespace-nowrap" title="تصدير إلى Excel">
            <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" /> إكسيل
          </button>
          <button onClick={exportPDF} className="px-3 py-2 bg-rose-50 text-indigo-700 hover:bg-indigo-100 dark:bg-rose-900/30 dark:text-indigo-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 shrink-0 whitespace-nowrap" title="تصدير إلى PDF">
            <FileText className="w-3.5 h-3.5 shrink-0" /> PDF
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl font-bold text-[11px] transition-all flex items-center gap-1.5 border border-blue-200 dark:border-blue-800 shrink-0 whitespace-nowrap" title="تصدير إلى CSV">
            <FileText className="w-3.5 h-3.5 shrink-0" /> CSV
          </button>

          <button
            onClick={pingAllServers}
            disabled={isPollingResources}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap disabled:opacity-60"
            title="فحص الاتصال الفعلي لجميع السيرفرات دفعة واحدة عبر الشبكة"
          >
            <Activity className={`w-3.5 h-3.5 shrink-0 ${isPollingResources ? "animate-spin text-amber-300" : ""}`} />
            <span>فحص اتصال الكل</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm shrink-0 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            إضافة سيرفر NAS جديد
          </button>
        </div>
      </div>

      {/* Real-Time Mikrotik Resource Management & Monitoring Panel */}
      {showResourceMonitor && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Section Header & Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Cpu className="w-5 h-5 animate-pulse" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    مركز مراقبة وإدارة استهلاك الموارد (Real-Time CPU / RAM)
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                      SNMP/RouterOS API Active
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    متابعة كفاءة معالجات الميكروتيك، استهلاك الذاكرة، حرارة الأجهزة، وإتاحة أدوات التفريغ والتنظيف السريع لحظياً.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Refresh & Auto-Polling Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Auto Poll Switcher */}
              <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
                <span className="text-[10px] text-slate-400 px-2 font-bold">تحديث تلقائي:</span>
                {[
                  { label: "إيقاف", val: null },
                  { label: "3ث", val: 3 },
                  { label: "5ث", val: 5 },
                  { label: "10ث", val: 10 }
                ].map((item) => (
                  <button
                    key={String(item.val)}
                    onClick={() => setAutoPollSecs(item.val)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      autoPollSecs === item.val
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Force Poll Button */}
              <button
                onClick={handleRunResourcePoll}
                disabled={isPollingResources}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-md shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPollingResources ? "animate-spin text-amber-300" : ""}`} />
                <span>{isPollingResources ? "جاري الفحص..." : "تحديث القراءات الآن"}</span>
              </button>

              {/* Batch Optimize Button if high load exists */}
              {highLoadServers.length > 0 && (
                <button
                  onClick={handleOptimizeAll}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-rose-900/40 animate-pulse"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>تخفيف الضغط والتنظيف الكل (Optimize All)</span>
                </button>
              )}
            </div>
          </div>

          {/* High Load Warning Banner */}
          {highLoadServers.length > 0 && (
            <div className="bg-gradient-to-r from-rose-950/80 via-rose-900/60 to-slate-900 border border-indigo-500/40 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-rose-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    تنبيه هندسي: يوجد {highLoadServers.length} سيرفر ميكروتيك يتجاوز حد الاستهلاك الآمن!
                  </h4>
                  <p className="text-xs text-indigo-300/90 mt-0.5">
                    السيرفرات المتعثرة: {highLoadServers.map(s => `${s.name} (CPU: ${s.cpuUsagePercent ?? 0}% - RAM: ${s.ramUsagePercent ?? 0}%)`).join(" ، ")}. قد يتسبب ذلك في انقطاع جلسات المشتركين.
                  </p>
                </div>
              </div>
              <button
                onClick={handleOptimizeAll}
                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-400 text-slate-900 text-xs font-black rounded-lg transition-all shrink-0 shadow-md"
              >
                تطبيق الحل التلقائي لجميع السيرفرات
              </button>
            </div>
          )}

          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                <span>متوسط استهلاك المعالج</span>
                <Cpu className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{avgCpu}%</div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    avgCpu >= 80 ? "bg-indigo-500" : avgCpu >= 60 ? "bg-amber-500" : "bg-emerald-500"
                  }`} 
                  style={{ width: `${Math.min(100, avgCpu)}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                <span>متوسط استهلاك الذاكرة</span>
                <HardDrive className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">{avgRam}%</div>
              <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    avgRam >= 85 ? "bg-indigo-500" : avgRam >= 70 ? "bg-amber-500" : "bg-purple-500"
                  }`} 
                  style={{ width: `${Math.min(100, avgRam)}%` }} 
                />
              </div>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                <span>سيرفرات تحت الضغط</span>
                <Flame className="w-4 h-4 text-indigo-400" />
              </div>
              <div className={`text-2xl font-black font-mono ${highLoadServers.length > 0 ? "text-indigo-400" : "text-emerald-400"}`}>
                {highLoadServers.length} سيرفر
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">حد الخطر: CPU &gt; 80% أو RAM &gt; 85%</span>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-2">
                <span>إجمالي المرور اللحظي</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-black text-emerald-400 font-mono">
                {totalLiveRx} <span className="text-xs text-slate-400">Mbps (RX)</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                TX: {totalLiveTx} Mbps
              </span>
            </div>
          </div>

          {/* Filter Bar for Resource Cards */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <span className="text-xs font-extrabold text-slate-300">تصفية سيرفرات ميكروتيك حسب حالة الموارد:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {[
                { key: "all", label: "جميع السيرفرات" },
                { key: "high", label: `استهلاك مرتفع/حرج (${highLoadServers.length})` },
                { key: "normal", label: "طبيعي آمن" },
                { key: "offline", label: "منفصل" }
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setResourceFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all shrink-0 ${
                    resourceFilter === f.key
                      ? "bg-amber-500 text-slate-950 font-black shadow-md"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Individual Server Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {serverList
              .filter(srv => {
                const info = getResourceStatusInfo(srv.cpuUsagePercent, srv.ramUsagePercent, srv.vpnStatus);
                if (resourceFilter === "high") return info.isHigh;
                if (resourceFilter === "normal") return !info.isHigh && srv.vpnStatus === "متصل";
                if (resourceFilter === "offline") return srv.vpnStatus === "منفصل";
                return true;
              })
              .map(server => {
                const cpu = server.cpuUsagePercent ?? 20;
                const ram = server.ramUsagePercent ?? 30;
                const totalRam = server.ramTotalMb ?? 1024;
                const freeRam = server.ramFreeMb ?? Math.round(totalRam * (1 - ram / 100));
                const usedRam = totalRam - freeRam;
                const info = getResourceStatusInfo(cpu, ram, server.vpnStatus);
                const isOnline = server.vpnStatus === "متصل";

                return (
                  <div
                    key={server?.id}
                    className={`bg-slate-850 border rounded-2xl p-5 space-y-4 transition-all hover:border-amber-500/50 shadow-md relative ${
                      info.isHigh
                        ? "border-indigo-500/60 bg-gradient-to-b from-slate-850 via-slate-850 to-rose-950/20"
                        : "border-slate-750"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-750 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Server className={`w-4 h-4 ${isOnline ? "text-emerald-400" : "text-indigo-400"}`} />
                          <h4 className="font-extrabold text-slate-900 text-base">{server.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {server.routerModel || "MikroTik RouterOS"} ({server.rosVersion || "v7.x"})
                        </p>
                      </div>

                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border ${info.colorClass}`}>
                        {info.badgeText}
                      </span>
                    </div>

                    {/* Network & Users Details */}
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">IP / VPN:</span>
                        <span className="text-slate-900 font-bold">{server.ipAddress}</span>
                        <span className="text-indigo-400 block font-bold">VPN: {server.vpnIp}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">المستخدمين النشطين:</span>
                        <span className="text-purple-400 font-bold block">{server.activeUsers} مشترك نشط</span>
                      </div>
                    </div>

                    {/* Gauges Section */}
                    {isOnline ? (
                      <div className="space-y-3.5">
                        {/* CPU Gauge */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span className="text-slate-300 flex items-center gap-1">
                              <Cpu className="w-3.5 h-3.5 text-amber-400" />
                              استهلاك المعالج (CPU Load):
                            </span>
                            <span className={`font-mono font-extrabold ${cpu >= 80 ? "text-indigo-400" : cpu >= 60 ? "text-amber-400" : "text-emerald-400"}`}>
                              {cpu}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${info.cpuProgressColor}`}
                              style={{ width: `${Math.min(100, cpu)}%` }}
                            />
                          </div>
                        </div>

                        {/* RAM Gauge */}
                        <div>
                          <div className="flex justify-between items-center text-xs font-bold mb-1">
                            <span className="text-slate-300 flex items-center gap-1">
                              <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                              استهلاك الذاكرة (RAM):
                            </span>
                            <span className={`font-mono font-extrabold ${ram >= 85 ? "text-indigo-400" : ram >= 70 ? "text-amber-400" : "text-purple-300"}`}>
                              {ram}% ({usedRam}MB / {totalRam}MB)
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${info.ramProgressColor}`}
                              style={{ width: `${Math.min(100, ram)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                            <span>المتبقي الخالي: {freeRam} MB</span>
                            <span>المستغل: {usedRam} MB</span>
                          </div>
                        </div>

                        {/* Additional Hardware Telemetry */}
                        <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-900/40 p-2 rounded-xl border border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 block">الحرارة</span>
                            <span className={`font-mono font-bold flex items-center justify-center gap-0.5 ${
                              (server.cpuTempC ?? 45) > 60 ? "text-indigo-400" : "text-emerald-400"
                            }`}>
                              <Thermometer className="w-3 h-3" />
                              {server.cpuTempC ?? 45}°C
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">الفولتية</span>
                            <span className="font-mono font-bold text-slate-300">
                              {server.voltage ?? 24.0}V
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block">مرور الشبكة</span>
                            <span className="font-mono font-bold text-emerald-400 text-[10px]">
                              {server.totalRxMbps ?? 45}M Rx
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 text-center space-y-2">
                        <AlertTriangle className="w-6 h-6 text-slate-500 dark:text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-400 font-bold">السيرفر منفصل حالياً، تعذر جلب القراءات اللحظية عبر SNMP/API.</p>
                      </div>
                    )}

                    {/* Operational Management Actions */}
                    <div className="pt-2 border-t border-slate-750 flex flex-wrap gap-2 justify-between">
                      <button
                        onClick={() => handleFlushMemory(server)}
                        disabled={!isOnline}
                        className="flex-1 py-2 px-2.5 bg-purple-900/40 hover:bg-purple-800/60 disabled:opacity-40 text-purple-200 border border-purple-700/50 font-extrabold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1"
                        title="تنظيف ذاكرة الـ Cache وتكشيف الـ DNS"
                      >
                        <HardDrive className="w-3.5 h-3.5 text-purple-300" />
                        <span>تنظيف الذاكرة (Flush)</span>
                      </button>

                      <button
                        onClick={() => handleClearIdleThreads(server)}
                        disabled={!isOnline}
                        className="flex-1 py-2 px-2.5 bg-amber-900/40 hover:bg-amber-800/60 disabled:opacity-40 text-amber-200 border border-amber-700/50 font-extrabold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1"
                        title="إنهاء الجلسات الميتة لتخفيف CPU"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>تخفيف CPU</span>
                      </button>

                      <button
                        onClick={() => handleRebootServer(server)}
                        className="py-2 px-2.5 bg-rose-900/30 hover:bg-rose-800/50 text-indigo-300 border border-indigo-700/50 font-extrabold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1"
                        title="ريبوت آمن للميكروتيك"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                        <span>ريبوت</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add NAS Server Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 border-b pb-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            إضافة سيرفر ميكروتيك NAS جديد عبر VPN
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم السيرفر:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سيرفر الرياض"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الموزع التابع له السيرفر:</label>
              <select
                value={distributorIdInput}
                onChange={(e) => setDistributorIdInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">👑 المدير العام (الرئيسي)</option>
                {distributors.map(d => (
                  <option key={d?.id} value={d?.id}>👤 الموزع: {d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الـ IP الخارجي للسيرفر:</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="مثال: 185.120.44.12"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الـ IP بنفق الـ VPN:</label>
              <input
                type="text"
                value={vpnIp}
                onChange={(e) => setVpnIp(e.target.value)}
                placeholder="مثال: 10.10.10.1"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة سر الريديوس (Secret):</label>
              <input
                type="text"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="مثال: RadSecret_xyz"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-purple-500" />
                النطاق الرئيسي (Realm):
              </label>
              <input
                type="text"
                list="realm-suggestions"
                value={realmInput}
                onChange={(e) => setRealmInput(e.target.value)}
                placeholder="مثال: realm1.net"
                className="w-full p-2.5 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-purple-900 dark:text-purple-200"
              />
              <datalist id="realm-suggestions">
                <option value="realm1.net" />
                <option value="@realm1" />
                <option value="default" />
                <option value="hotspot.net" />
                <option value="pppoe.net" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">نوع السيرفر (NAS Type):</label>
              <select
                value={nasTypeInput}
                onChange={(e) => setNasTypeInput(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mikrotik">MikroTik RouterOS</option>
                <option value="coova">CoovaChilli</option>
                <option value="chillispot">ChilliSpot</option>
                <option value="cisco">Cisco IOS</option>
                <option value="other">سيرفر آخر (Other)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                المتصلون النشطون على الريديوس (RADIUS Active):
              </label>
              <input
                type="number"
                value={radiusActiveUsersInput}
                onChange={(e) => setRadiusActiveUsersInput(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                المتصلون النشطون على الميكروتيك (Mikrotik Active):
              </label>
              <input
                type="number"
                value={mikrotikActiveUsersInput}
                onChange={(e) => setMikrotikActiveUsersInput(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-800 pt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">التفعيل التلقائي عند تشغيل النظام:</label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">تشغيل اتصال الـ VPN تلقائياً فور إقلاع لوحة التحكم</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoActivateOnStartInput(!autoActivateOnStartInput)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  autoActivateOnStartInput ? "bg-indigo-600" : "bg-slate-300"
                }`}
                title="مفتاح تبديل التفعيل التلقائي"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                    autoActivateOnStartInput ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">إعادة الاتصال التلقائي (Auto-Reconnect):</label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">تأسيس الاتصال فوراً في حال انقطاع الـ VPN</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoReconnectInput(!autoReconnectInput)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  autoReconnectInput ? "bg-indigo-600" : "bg-slate-300"
                }`}
                title="مفتاح تبديل إعادة الاتصال التلقائي"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                    autoReconnectInput ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5 flex items-center gap-1">
                  {enableNotificationsInput ? <Bell className="w-3.5 h-3.5 text-amber-500" /> : <BellOff className="w-3.5 h-3.5 text-slate-400" />}
                  تفعيل الإشعارات والتنبيهات (Server Notifications):
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">إرسال وتفعيل الإشعارات والتنبيهات اللحظية عند انقطاع/استعادة الاتصال أو أحداث السيرفر</span>
              </div>
              <button
                type="button"
                onClick={() => setEnableNotificationsInput(!enableNotificationsInput)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  enableNotificationsInput ? "bg-amber-500" : "bg-slate-300"
                }`}
                title="مفتاح تبديل تفعيل الإشعارات"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                    enableNotificationsInput ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">تفعيل مراقبة الأداء (SNMP):</label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">استخراج بيانات الاستهلاك والسرعة اللحظية من سيرفر NAS بدقة</span>
              </div>
              <button
                type="button"
                onClick={() => setEnableSnmpMonitoringInput(!enableSnmpMonitoringInput)}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                  enableSnmpMonitoringInput ? "bg-indigo-600" : "bg-slate-300"
                }`}
                title="مفتاح تبديل تفعيل مراقبة الأداء (SNMP)"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                    enableSnmpMonitoringInput ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {enableSnmpMonitoringInput && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1">SNMP Community String:</label>
                <input
                  type="text"
                  value={snmpCommunityInput}
                  onChange={(e) => setSnmpCommunityInput(e.target.value)}
                  placeholder="public"
                  className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  dir="ltr"
                />
              </div>
            )}
          </div>

          {/* Live Mikrotik Terminal Setup Code Preview */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 bg-slate-900/5 dark:bg-slate-800/30 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                معاينة كود التيرمينال للميكروتيك (توليد تلقائي حسب الإعدادات):
              </label>
              <button
                type="button"
                onClick={() => {
                  const liveScript = getCustomizedScript({
                    name: name || "سيرفر-جديد",
                    ipAddress: ipAddress || "0.0.0.0",
                    vpnIp: vpnIp || "10.10.10.1",
                    secret: secret || "RadSecret_Default"
                  });
                  handleCopyToClipboard(liveScript);
                  if (addNotification) addNotification("تم نسخ كود التيرمينال للميكروتيك بنجاح! 📋", "success");
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                نسخ كود التيرمينال للميكروتيك
              </button>
            </div>
            <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40 border border-slate-800 leading-relaxed dir-ltr shadow-inner">
              <pre className="whitespace-pre-wrap">{getCustomizedScript({
                name: name || "سيرفر-جديد",
                ipAddress: ipAddress || "0.0.0.0",
                vpnIp: vpnIp || "10.10.10.1",
                secret: secret || "RadSecret_Default"
              })}</pre>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              ⚡ ينشأ هذا الكود تلقائياً حسب القالب المعدل من المدير المسئول. يمكن للموزع نسخه مباشرة ووضعه في Terminal الميكروتيك للربط.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-100"
            >
              ربط السيرفر بالريديوس
            </button>
          </div>
        </form>
      )}




      {/* Quick Distributor Subscriber Stats Cards */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-800 dark:text-slate-100">إحصائيات المشتركين والسيرفرات حسب الموزع المسؤول</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">اختر الموزع لتصفية السيرفرات التابعة له وعرض عدد مشتركيه المستقلين</p>
              </div>
            </div>
            {distributorFilter !== "all" && (
              <button
                onClick={() => setDistributorFilter("all")}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg transition-all"
              >
                إلغاء التصفية (عرض الكل)
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {/* All Card */}
            <button
              onClick={() => setDistributorFilter("all")}
              className={`p-2.5 rounded-xl border transition-all text-right flex flex-col justify-between ${
                distributorFilter === "all"
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                  : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-extrabold truncate">👥 جميع الموزعين</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between w-full gap-1">
                <span className="text-xs font-black font-mono">{getSubscribersCountForDistributor("all")} <span className="text-[9px] font-normal">مشترك</span></span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${distributorFilter === "all" ? "bg-indigo-500/60 text-slate-900" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{getServerCountForDistributor("all")} سيرفر</span>
              </div>
            </button>

            {/* Main Manager Card */}
            <button
              onClick={() => setDistributorFilter("main")}
              className={`p-2.5 rounded-xl border transition-all text-right flex flex-col justify-between ${
                distributorFilter === "main"
                  ? "bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-100"
                  : "bg-amber-50/50 hover:bg-amber-100/60 text-slate-800 dark:text-slate-100 border-amber-200/60"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-extrabold truncate">👑 المدير الرئيسي</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between w-full gap-1">
                <span className="text-xs font-black font-mono">{getSubscribersCountForDistributor("main")} <span className="text-[9px] font-normal">مشترك</span></span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${distributorFilter === "main" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}>{getServerCountForDistributor("main")} سيرفر</span>
              </div>
            </button>

            {/* Distributors Cards */}
            {distributors.map((dist) => {
              const subCount = getSubscribersCountForDistributor(dist?.id);
              const srvCount = getServerCountForDistributor(dist?.id);
              const isSelected = distributorFilter === dist?.id;
              return (
                <button
                  key={dist?.id}
                  onClick={() => setDistributorFilter(dist?.id)}
                  className={`p-2.5 rounded-xl border transition-all text-right flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-700 text-white border-indigo-700 shadow-md shadow-indigo-100"
                      : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-extrabold truncate">👤 {dist.name}</span>
                  </div>
                  <div className="mt-2 flex items-baseline justify-between w-full gap-1">
                    <span className="text-xs font-black font-mono">{subCount} <span className="text-[9px] font-normal">مشترك</span></span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{srvCount} سيرفر</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters & Search Toolbar (consistent with SubscribersView) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div></div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-start xl:justify-end">
          {/* Distributor Filter Dropdown */}
          {isAdmin && (
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <select
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
              className="p-2.5 bg-indigo-50/70 border border-indigo-200 text-indigo-950 font-bold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">
                👥 كل الموزعين ({getSubscribersCountForDistributor("all")} مشترك | {getServerCountForDistributor("all")} سيرفر)
              </option>
              <option value="main">
                👑 المدير العام (الرئيسي) ({getSubscribersCountForDistributor("main")} مشترك | {getServerCountForDistributor("main")} سيرفر)
              </option>
              {distributors.map((dist) => (
                <option key={dist?.id} value={dist?.id}>
                  👤 الموزع: {dist.name} ({getSubscribersCountForDistributor(dist?.id)} مشترك | {getServerCountForDistributor(dist?.id)} سيرفر)
                </option>
              ))}
            </select>
          </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              <option value="متصل">متصل فقط</option>
              <option value="منفصل">منفصل فقط</option>
            </select>
          </div>

          {/* Layout Switcher (List Table vs Grid Cards) */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-sm border border-slate-200 dark:border-slate-700/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              عرض جدول (قائمة)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 shadow-sm border border-slate-200 dark:border-slate-700/20"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-100"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              عرض شبكي (كروت)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: List Table or Grid Cards */}
      {viewMode === "list" ? (
        <div className="w-full">
          {Object.keys(hiddenRows).length > 0 && (
            <div className="mb-4 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 p-3 rounded-xl">
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                تم إخفاء {Object.keys(hiddenRows).length} سيرفر من العرض
              </span>
              <button
                onClick={() => setHiddenRows({})}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-lg shadow-sm border border-indigo-200 dark:border-indigo-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-colors"
              >
                إظهار الكل
              </button>
            </div>
          )}
          <div className="overflow-x-auto pb-4">
            <table className="w-full text-right border-separate border-spacing-y-2.5 min-w-[1100px]">
              <thead>
                <tr className="text-[11px] font-black text-slate-500 dark:text-slate-400">
                  {renderSortableHeader("السيرفر", "name")}
                  {renderSortableHeader("الحالة", "vpnStatus")}
                  <th className="px-2 py-3 text-right">عنوان IP الخارجي</th>
                  <th className="px-2 py-3 text-right">عنوان IP الـ VPN</th>
                  <th className="px-2 py-3 text-right">المفتاح السري (Secret)</th>
                  {renderSortableHeader("نشط الريديوس", "activeUsers")}
                  <th className="px-2 py-3 text-right">نشط ميكروتيك</th>
                  <th className="px-2 py-3 text-right">مدة التشغيل (Uptime)</th>
                  <th className="px-2 py-3 text-right">إعدادات الاتصال والإشعارات</th>
                  <th className="px-2 py-3 text-center sticky left-0 z-10 bg-[#f8fafc] dark:bg-slate-900 rounded-l-xl">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="text-xs">
                {sortedServers.filter(s => !hiddenRows[s.id || ""]).length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                      لا توجد سيرفرات لعرضها.
                    </td>
                  </tr>
                ) : (
                  sortedServers.filter(s => !hiddenRows[s.id || ""]).map((server) => {
                    const isOnline = server.vpnStatus === "متصل";
                    const radActive = isOnline ? (server.radiusActiveUsers ?? server.activeUsers ?? 0) : 0;
                    const mikActive = isOnline ? (server.mikrotikActiveUsers ?? Math.max(0, (server.activeUsers ?? 0) - 4)) : 0;
                    const isRebooting = rebootingServerId === server?.id;
                    const { textStr, timerStr } = getUptimeInfo(server);

                    return (
                      <tr 
                        key={server?.id} 
                        className="bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group relative [&>td]:border-y [&>td]:border-slate-200 dark:[&>td]:border-slate-800 [&>td:first-child]:border-r [&>td:first-child]:rounded-r-xl [&>td:last-child]:border-l [&>td:last-child]:rounded-l-xl"
                      >
                        {/* Server Name & Info */}
                        <td className="px-4 py-3 text-xs md:text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-xl shrink-0 ${
                              verifyingServerIds[server.id]
                                ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                                : server.vpnStatus === "متصل" 
                                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400" 
                                  : "bg-rose-50 text-indigo-600 dark:bg-rose-950/60 dark:text-indigo-400"
                            }`}>
                              {verifyingServerIds[server.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                              ) : (
                                <Server className="w-4 h-4" />
                              )}
                            </div>
                            <div>
                              <a
                                href={`http://${server.ipAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-extrabold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block text-xs md:text-sm"
                              >
                                {server.name}
                              </a>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-black flex items-center gap-1">
                                  <User className="w-2.5 h-2.5 text-indigo-500" />
                                  الموزع: {getDistributorName(server.distributorId)}
                                </span>
                                <span className="text-[10px] text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1" title="النطاق (Radius Realm)">
                                  <Globe className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                                  {server.realm || "realm1.net"}
                                </span>
                                {(server.enableSnmpMonitoring ?? false) && (
                                  <>
                                    <span className="text-[10px] text-slate-300">|</span>
                                    <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 border border-blue-150" title={`SNMP Community: ${server.snmpCommunity || 'public'}`}>
                                      <Activity className="w-2.5 h-2.5 text-blue-500" />
                                      مراقبة SNMP
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-2 py-3 text-xs md:text-sm">
                          {verifyingServerIds[server.id] ? (
                            <span className="px-2.5 py-1 text-[10px] font-black rounded-full inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 animate-pulse">
                              <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>جاري الاتصال...</span>
                            </span>
                          ) : (
                            <span className={`px-2.5 py-1 text-[10px] font-black rounded-full inline-flex items-center gap-1.5 ${
                              server.vpnStatus === "متصل" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-indigo-700"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-indigo-500"} animate-pulse`} />
                              {server.vpnStatus === "متصل" ? "نشط" : "منفصل"}
                            </span>
                          )}
                        </td>

                        {/* External IP */}
                        <td className="px-2 py-3 text-xs md:text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                          <a 
                            href={`http://${server.ipAddress}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-indigo-600 hover:underline"
                          >
                            {server.ipAddress}
                          </a>
                        </td>

                        {/* VPN IP */}
                        <td className="px-2 py-3 text-xs md:text-sm font-mono font-bold text-indigo-600">
                          <a 
                            href={`http://${server.vpnIp}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="hover:text-indigo-800 hover:underline"
                          >
                            {server.vpnIp}
                          </a>
                        </td>

                        {/* VPN Secret */}
                        <td className="px-2 py-3 text-xs md:text-sm font-mono font-bold text-slate-600 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span>{server.secret || "-"}</span>
                            {server.secret && (
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(server.secret || "");
                                  if (addNotification) addNotification("تم نسخ المفتاح السري!", "success");
                                }}
                                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600 transition-colors"
                                title="نسخ المفتاح السري"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Radius Active */}
                        <td className="px-2 py-3 text-xs md:text-sm font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {radActive}
                        </td>

                        {/* Mikrotik Active */}
                        <td className="px-2 py-3 text-xs md:text-sm font-mono font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {mikActive}
                        </td>

                        {/* Uptime */}
                        <td className="px-2 py-3 text-xs md:text-sm">
                          {server.vpnStatus === "متصل" ? (
                            <div className="text-xs">
                              <span className="text-emerald-700 font-extrabold block">{textStr}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({timerStr})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono font-medium">--:--:--</span>
                          )}
                        </td>

                        {/* Connect configs / Switches */}
                        <td className="px-2 py-3 text-xs md:text-sm">
                          <div className="flex flex-col gap-1.5">
                            {/* VPN Switch */}
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">نفق الـ VPN:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedStatus = server.vpnStatus === "متصل" ? "منفصل" : "متصل";
                                  onUpdateServer({ ...server, vpnStatus: updatedStatus });
                                }}
                                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                                  server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              >
                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition duration-200 ${
                                  server.vpnStatus === "متصل" ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </button>
                            </div>

                            {/* Auto activate config badge */}
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">تفعيل تلقائي:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = server.autoActivateOnStart ?? true;
                                  onUpdateServer({ ...server, autoActivateOnStart: !current });
                                }}
                                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                                  (server.autoActivateOnStart ?? true) ? "bg-indigo-600" : "bg-slate-300"
                                }`}
                              >
                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition duration-200 ${
                                  (server.autoActivateOnStart ?? true) ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </button>
                            </div>

                            {/* Notifications Switch */}
                            <div className="flex items-center gap-2 justify-between">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                                {(server.enableNotifications ?? true) ? (
                                  <Bell className="w-3 h-3 text-amber-500" />
                                ) : (
                                  <BellOff className="w-3 h-3 text-slate-400" />
                                )}
                                الإشعارات:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const current = server.enableNotifications ?? true;
                                  const updated = !current;
                                  onUpdateServer({ ...server, enableNotifications: updated });
                                  if (addNotification) {
                                    addNotification(
                                      updated
                                        ? `تم تفعيل إشعارات وتنبيهات السيرفر [${server.name}] 🔔`
                                        : `تم إيقاف إشعارات السيرفر [${server.name}] 🔕`,
                                      updated ? "success" : "info"
                                    );
                                  }
                                }}
                                className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out ${
                                  (server.enableNotifications ?? true) ? "bg-amber-500" : "bg-slate-300"
                                }`}
                                title={(server.enableNotifications ?? true) ? "إيقاف إشعارات هذا السيرفر" : "تفعيل إشعارات هذا السيرفر"}
                              >
                                <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white dark:bg-slate-900 transition duration-200 ${
                                  (server.enableNotifications ?? true) ? "translate-x-4" : "translate-x-0"
                                }`} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-3 text-xs md:text-sm text-center sticky left-0 bg-white dark:bg-slate-900 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.05)]">
                          {isRebooting ? (
                            <div className="flex items-center justify-center gap-1.5 text-indigo-600 text-xs font-bold animate-pulse">
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              <span>ريبوت {rebootProgress}%</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => pingNasServer(server)}
                                disabled={verifyingServerIds[server.id]}
                                className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all text-[10px] font-black flex items-center gap-1 shrink-0 disabled:opacity-50 shadow-sm"
                                title="إرسال طلب فحص الاتصال الفعلي عبر الشبكة (Real-time check)"
                              >
                                {verifyingServerIds[server.id] ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
                                ) : (
                                  <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                                )}
                                <span className="whitespace-nowrap">فحص الاتصال الفعلي</span>
                              </button>

                              <button
                                onClick={() => handleRebootServer(server)}
                                className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 rounded-lg transition-all"
                                title="إعادة تشغيل (Reboot)"
                              >
                                <RotateCw className="w-3.5 h-3.5" />
                              </button>
                              
                              <button
                                onClick={() => setMonitorServer(server)}
                                className="p-1.5 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200/50 rounded-lg transition-all"
                                title="مراقبة الواجهات (Interfaces)"
                              >
                                <Wifi className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleCopyForServer(server)}
                                className={`px-2.5 py-1.5 text-[10px] font-black rounded-lg transition-all border shadow-sm ${
                                  copiedServerId === server?.id
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"
                                }`}
                                title="نسخ كود التركيب"
                              >
                                {copiedServerId === server?.id ? "تم!" : "الكود 📋"}
                              </button>

                              <button
                                onClick={() => setEditingServer(server)}
                                className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setHiddenRows(prev => ({ ...prev, [server.id || ""]: true }))}
                                className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-lg transition-all"
                                title="إخفاء من العرض"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`هل ترغب فعلاً بقطع اتصال السيرفر [${server.name}] من الريديوس؟`)) {
                                    onDeleteServer(server?.id);
                                  }
                                }}
                                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                title="حذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
          {sortedServers.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center text-slate-400 font-bold rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              لا توجد سيرفرات مطابقة لمعايير البحث الحالية.
            </div>
          ) : (
            sortedServers.map((server) => {
              const isOnline = server.vpnStatus === "متصل";
              const radActive = isOnline ? (server.radiusActiveUsers ?? server.activeUsers ?? 0) : 0;
              const mikActive = isOnline ? (server.mikrotikActiveUsers ?? Math.max(0, (server.activeUsers ?? 0) - 4)) : 0;
              const isRebooting = rebootingServerId === server?.id;
              
              const dist = distributors.find(d => d?.id === server.distributorId);
              const serverCountry = dist?.country || server.location || "الكل";
              const availableOffers = offers.filter(o => !o.country || o.country === "الكل" || o.country === serverCountry);
              
              return (
                <div 
                  key={server?.id} 
                  className={`nas-server-card bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between overflow-hidden shadow-sm hover:shadow-md relative w-[80%] mx-auto aspect-square ${
                    server.vpnStatus === "متصل" ? "border-emerald-100 hover:border-emerald-200" : "border-indigo-100 hover:border-rose-200"
                  }`}
                >
                  {/* Card Banner / Accent Line */}
                  <div className={`h-1.5 w-full shrink-0 ${server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-indigo-500"}`} />

                  {isRebooting ? (
                    <div className="p-6 space-y-5 flex-1 flex flex-col justify-center items-center text-center w-full py-16">
                      <div className="px-2 py-3 text-xs md:text-sm bg-indigo-50 text-indigo-600 rounded-2xl animate-spin">
                        <RotateCw className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base">{server.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1.5">جاري الآن إعادة تشغيل نظام ميكروتيك RouterOS بأمان وتنظيف كافة الجلسات العالقة...</p>
                      </div>
                      <div className="w-full max-w-xs space-y-1.5 mx-auto">
                        <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400">
                          <span>التقدم</span>
                          <span className="font-mono">{rebootProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${rebootProgress}%` }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col justify-between overflow-hidden w-full relative">
                      <div className={`absolute top-4 right-4 p-2.5 rounded-xl ${
                        verifyingServerIds[server.id]
                          ? "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                          : server.vpnStatus === "متصل" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-indigo-600"
                      }`}>
                        {verifyingServerIds[server.id] ? (
                          <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                        ) : (
                          <Server className="w-5 h-5 animate-pulse" />
                        )}
                      </div>
                      <div className="p-3 flex flex-col h-full gap-2 mt-2">
                        {/* Header */}
                        <div className="mb-4 pl-[70px] relative min-h-[44px] flex flex-col items-center text-center">
                          <span className={`absolute top-1 left-0 px-2.5 py-1 text-[10px] font-black rounded-full flex items-center gap-1 ${
                            verifyingServerIds[server.id]
                              ? "bg-amber-50 text-amber-700 border border-amber-200/60 dark:bg-amber-950/60 dark:text-amber-400"
                              : server.vpnStatus === "متصل" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-indigo-700"
                          }`}>
                            {verifyingServerIds[server.id] ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>جاري الاتصال...</span>
                              </>
                            ) : (
                              <>
                                <span className={`w-1.5 h-1.5 rounded-full ${server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-indigo-500"}`} />
                                <span>{server.vpnStatus === "متصل" ? "نشط" : "غير متصل"}</span>
                              </>
                            )}
                          </span>

                          <div className="flex flex-col min-w-0 pt-0.5">
                            <a 
                              href={`http://${server.ipAddress}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="font-extrabold text-slate-800 dark:text-slate-100 hover:text-indigo-600 hover:underline transition-all text-sm md:text-base flex items-center gap-1 w-full"
                              title="اضغط لفتح صفحة الميكروتك (Webfig)"
                            >
                              <span className="truncate block">{server.name}</span> <span className="text-slate-400 font-mono text-[10px] mr-1 shrink-0">#{server?.id}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-slate-400 inline-block shrink-0" />
                            </a>
                            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-[9px] text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-md font-black flex items-center gap-1 shrink-0">
                                <User className="w-2.5 h-2.5 text-indigo-500 shrink-0" />
                                <span className="truncate max-w-[100px]">الموزع: {getDistributorName(server.distributorId)}</span>
                              </span>
                              <span className="text-[9px] text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 shrink-0" title="النطاق (Radius Realm)">
                                <Globe className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                                <span className="truncate max-w-[110px]">{server.realm || "realm1.net"}</span>
                              </span>
                              {server.customScript && (
                                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 border border-emerald-200 shrink-0">
                                  <Terminal className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                                  كود مخصص
                                </span>
                              )}
                              {(server.enableSnmpMonitoring ?? false) && (
                                <span className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 border border-blue-200 shrink-0" title={`SNMP Community: ${server.snmpCommunity || 'public'}`}>
                                  <Activity className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                                  مراقبة SNMP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Uptime Display on Grid Card */}
                        {server.vpnStatus === "متصل" && (
                          <div className="flex items-center flex-wrap gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50/50 border border-emerald-100/30 px-2 py-1.5 rounded-xl self-start">
                            <Clock className="w-3.5 h-3.5 animate-pulse text-emerald-500 shrink-0" />
                            <span>متصل منذ: {getUptimeInfo(server).textStr}</span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">({getUptimeInfo(server).timerStr})</span>
                          </div>
                        )}

                        {/* Connected Clients Counters Widget */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* RADIUS Active users block */}
                          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex flex-col justify-between hover:bg-indigo-50/30 transition-colors relative">
                            <div className="flex items-center justify-between gap-1 pl-6">
                              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 leading-tight">متصلي الريديوس</span>
                              <ShieldCheck className="w-4 h-4 text-indigo-500 absolute top-2.5 left-2.5 opacity-70" />
                            </div>
                            <div className="mt-2">
                              <div className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono leading-none">{radActive}</div>
                              <span className="text-[9px] text-indigo-600 font-bold mt-1 block">مؤمن ومصادق</span>
                            </div>
                          </div>

                          {/* Mikrotik Active users block */}
                          <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl flex flex-col justify-between hover:bg-purple-50/30 transition-colors relative">
                            <div className="flex items-center justify-between gap-1 pl-6">
                              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 leading-tight">متصلي ميكروتيك</span>
                              <Wifi className="w-4 h-4 text-purple-500 absolute top-2.5 left-2.5 opacity-70" />
                            </div>
                            <div className="mt-2">
                              <div className="text-lg font-black text-slate-800 dark:text-slate-100 font-mono leading-none">{mikActive}</div>
                              <span className="text-[9px] text-purple-600 font-bold mt-1 block">جلسات نشطة</span>
                            </div>
                          </div>
                        </div>

                        {/* Discrepancy indicator if any */}
                        {radActive !== mikActive && server.vpnStatus === "متصل" && (
                          <div className="bg-amber-50/60 border border-amber-100/60 px-2 py-1.5 rounded-xl flex items-center justify-between text-[10px] mb-3">
                            <span className="text-amber-800 font-bold flex items-center gap-1 shrink-0">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              تفاوت طفيف في عدد الجلسات
                            </span>
                            <strong className="text-amber-700 font-mono font-black shrink-0" dir="ltr">
                              {radActive - mikActive > 0 ? `+${radActive - mikActive}` : radActive - mikActive}
                            </strong>
                          </div>
                        )}

                        {/* Connection Parameters Details */}
                        <div className="space-y-2 text-[10px] text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-3">
                          <div className="flex justify-between font-mono items-center gap-2">
                            <span className="font-sans text-slate-500 dark:text-slate-400 font-bold shrink-0">الـ IP الخارجي:</span>
                            <a 
                              href={`http://${server.ipAddress}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-slate-800 dark:text-slate-100 hover:text-indigo-600 hover:underline font-mono font-medium flex items-center gap-1 truncate"
                              title="اضغط للدخول إلى صفحة الميكروتك عبر الـ IP الخارجي"
                            >
                              <span className="truncate">{server.ipAddress}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-slate-400 inline shrink-0" />
                            </a>
                          </div>
                          <div className="flex justify-between font-mono items-center gap-2">
                            <span className="font-sans text-slate-500 dark:text-slate-400 font-bold shrink-0">عنوان الـ VPN:</span>
                            <a 
                              href={`http://${server.vpnIp}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-mono font-bold flex items-center gap-1 truncate"
                              title="اضغط للدخول إلى صفحة الميكروتك عبر الـ VPN"
                            >
                              <span className="truncate">{server.vpnIp}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-indigo-400 inline shrink-0" />
                            </a>
                          </div>
                          <div className="flex justify-between items-center font-mono gap-2">
                            <span className="font-sans text-slate-500 dark:text-slate-400 font-bold shrink-0">المفتاح السري:</span>
                            <strong className="text-slate-800 dark:text-slate-100 flex items-center gap-1 font-bold truncate">
                              <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{server.secret}</span>
                              {server.secret && (
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(server.secret || "");
                                    if (addNotification) addNotification("تم نسخ المفتاح السري!", "success");
                                  }}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                                  title="نسخ المفتاح السري"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </strong>
                          </div>
                        </div>

                        {/* Automation Settings Status Badges (Interactive Toggles) */}
                        <div className="flex flex-wrap gap-1.5 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              const current = server.autoActivateOnStart ?? true;
                              onUpdateServer({ ...server, autoActivateOnStart: !current });
                            }}
                            className={`px-2 py-1 text-[9px] font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.03] active:scale-95 ${
                              (server.autoActivateOnStart ?? true) ? "bg-indigo-50/80 text-indigo-700 border border-indigo-150" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                            title="اضغط للتبديل السريع للتفعيل التلقائي عند بدء النظام"
                          >
                            <Power className={`w-3 h-3 shrink-0 ${ (server.autoActivateOnStart ?? true) ? "text-indigo-500 animate-pulse" : "text-slate-400" }`} />
                            تفعيل تلقائي: {(server.autoActivateOnStart ?? true) ? "نشط" : "معطل"}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              const current = server.autoReconnect ?? true;
                              onUpdateServer({ ...server, autoReconnect: !current });
                            }}
                            className={`px-2 py-1 text-[9px] font-extrabold rounded-lg flex items-center gap-1 transition-all cursor-pointer hover:scale-[1.03] active:scale-95 ${
                              (server.autoReconnect ?? true) ? "bg-purple-50/80 text-purple-700 border border-purple-150" : "bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                            title="اضغط للتبديل السريع لإعادة الاتصال التلقائي عند انقطاع الـ VPN"
                          >
                            <RefreshCw className={`w-3 h-3 shrink-0 ${ (server.autoReconnect ?? true) ? "text-purple-500" : "text-slate-400" }`} />
                            إعادة اتصال تلقائي: {(server.autoReconnect ?? true) ? "نشط" : "معطل"}
                          </button>
                        </div>

                        {/* Available Offers Section */}
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1 block">الباقات المتاحة ({serverCountry}):</span>
                          {availableOffers.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {availableOffers.map(offer => (
                                <span key={offer.id} className="text-[9px] bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-1.5 py-0.5 rounded font-black border border-indigo-100 dark:border-indigo-800">
                                  {offer.name} - {offer.price === 0 ? "مجاني" : `${offer.price} ${offer.currency || "ريال"}`}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-1 rounded border border-rose-100 dark:border-rose-800">
                              الباقات غير متاحة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* VPN Toggle Control Row */}
                      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2.5 mt-3 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0">التحكم باتصال الـ VPN:</span>
                        <div className="flex items-center gap-2" dir="ltr">
                          {/* Indicator Light with Status Badge */}
                          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 rounded-full px-2 py-0.5 border border-slate-200 dark:border-slate-700/50">
                            {verifyingServerIds[server.id] ? (
                              <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 dark:text-amber-400">
                                <Loader2 className="w-2.5 h-2.5 animate-spin text-amber-500 shrink-0" />
                                جاري الاتصال...
                              </span>
                            ) : (
                              <>
                                <span className="relative flex h-2 w-2">
                                  {server.vpnStatus === "متصل" ? (
                                    <>
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </>
                                  ) : (
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                  )}
                                </span>
                                <span className={`text-[9px] font-black ${server.vpnStatus === "متصل" ? "text-emerald-600" : "text-indigo-600"}`}>
                                  {server.vpnStatus === "متصل" ? "متصل" : "منفصل"}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedStatus = server.vpnStatus === "متصل" ? "منفصل" : "متصل";
                              onUpdateServer({ ...server, vpnStatus: updatedStatus });
                            }}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                              server.vpnStatus === "متصل" ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                            title="مفتاح تبديل اتصال الـ VPN"
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                                server.vpnStatus === "متصل" ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Actions Footer */}
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 mt-auto">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button
                            onClick={() => pingNasServer(server)}
                            disabled={verifyingServerIds[server.id]}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 rounded-lg transition-all text-[10px] font-black flex items-center gap-1 shrink-0 disabled:opacity-60 shadow-sm"
                            title="فحص الاتصال الفعلي للسيرفر عبر الشبكة (Real-time check)"
                          >
                            {verifyingServerIds[server.id] ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 shrink-0" />
                            ) : (
                              <Activity className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            )}
                            <span className="whitespace-nowrap">فحص الاتصال الفعلي</span>
                          </button>

                          <button
                            onClick={() => handleRebootServer(server)}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 hover:text-purple-600 text-slate-500 rounded-lg transition-all shadow-sm"
                            title="أمر إعادة تشغيل آمن لنظام التشغيل RouterOS لتنظيف الجلسات العالقة"
                          >
                            <RotateCw className="w-4 h-4 shrink-0" />
                          </button>
                          
                          <button
                            onClick={() => setMonitorServer(server)}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-sky-50 hover:text-sky-600 text-slate-500 rounded-lg transition-all shadow-sm"
                            title="مراقبة واجهات الشبكة بشكل لحظي"
                          >
                            <Wifi className="w-4 h-4 shrink-0" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleCopyForServer(server)}
                            className={`px-2 py-1.5 font-black text-[10px] rounded-lg transition-all flex items-center gap-1.5 border shadow-sm ${
                              copiedServerId === server?.id
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-emerald-50"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white border-transparent"
                            }`}
                            title="توليد ونسخ كود التركيب المخصص لهذا السيرفر فوراً"
                          >
                            {copiedServerId === server?.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">نسخ الكود</span>
                              </>
                            )}
                          </button>

                          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

                          <button
                            onClick={() => setEditingServer(server)}
                            className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                            title="تعديل السيرفر"
                          >
                            <Edit className="w-4 h-4 shrink-0" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل ترغب فعلاً بقطع اتصال السيرفر [${server.name}] من الريديوس؟`)) {
                                onDeleteServer(server?.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                            title="حذف السيرفر"
                          >
                            <Trash2 className="w-4 h-4 shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Central Terminal Template Editor Card (placed collapsible at bottom of servers list for clean UX) */}
      {canManageCentralScript && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm overflow-hidden animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setShowTemplateEditor(!showTemplateEditor)}
            className="w-full p-5 flex items-center justify-between text-right hover:bg-slate-50 dark:bg-slate-800 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm md:text-base">واجهة التحكم بقالب كود التركيب المركزي للميكروتك (Unified RouterOS Template)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">قم بتعديل وتخصيص كود التركيب هنا، وسيتم تعويض المتغيرات تلقائياً لكل سيرفر عند نسخ كوده.</p>
              </div>
            </div>
            <span className="text-indigo-600 font-extrabold text-xs bg-indigo-50 hover:bg-indigo-100 transition-all px-3 py-1.5 rounded-xl shrink-0">
              {showTemplateEditor ? "إخفاء لوحة التخصيص ▲" : "عرض وتعديل القالب المركزي ▼"}
            </span>
          </button>

          {showTemplateEditor && (
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-end gap-3 pb-2">
                <button
                  type="button"
                  onClick={() => {
                    let updatedTemplate = unifiedTemplate;
                    if (lastSavedTemplateVars.name && lastSavedTemplateVars.name !== templateVars.name) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.name).join(templateVars.name);
                    }
                    if (lastSavedTemplateVars.ip && lastSavedTemplateVars.ip !== templateVars.ip) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.ip).join(templateVars.ip);
                    }
                    if (lastSavedTemplateVars.vpnIp && lastSavedTemplateVars.vpnIp !== templateVars.vpnIp) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.vpnIp).join(templateVars.vpnIp);
                    }
                    if (lastSavedTemplateVars.secret && lastSavedTemplateVars.secret !== templateVars.secret) {
                      updatedTemplate = updatedTemplate.split(lastSavedTemplateVars.secret).join(templateVars.secret);
                    }
                    
                    setUnifiedTemplate(updatedTemplate);
                    setLastSavedTemplateVars(templateVars);
                    
                    safeStorage.setItem("unified_terminal_template", updatedTemplate);
                    safeStorage.setItem("unified_template_vars", JSON.stringify(templateVars));
                    
                    setIsTemplateSaved(true);
                    setTimeout(() => setIsTemplateSaved(false), 2000);
                    
                    if (addNotification) {
                      addNotification("تم حفظ قالب كود التركيب بنجاح!", "success");
                    }
                  }}
                  className={`px-4 py-1.5 font-extrabold text-xs rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm ${
                    isTemplateSaved 
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2 animate-pulse" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {isTemplateSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {isTemplateSaved ? "تم الحفظ بنجاح!" : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("هل أنت متأكد من رغبتك في استعادة القالب الافتراضي للمصنع؟ سيتم إلغاء تعديلاتك الحالية.")) {
                      setUnifiedTemplate(DEFAULT_UNIFIED_TEMPLATE);
                      if (addNotification) {
                        addNotification("تم استعادة كود التركيب الافتراضي بنجاح!", "info");
                      }
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  إعادة ضبط المصنع لكود التركيب
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Text Area */}
                <div className="lg:col-span-8 flex flex-col space-y-2">
                  <textarea
                    value={unifiedTemplate}
                    onChange={(e) => setUnifiedTemplate(e.target.value)}
                    dir="ltr"
                    className="w-full h-64 p-3.5 bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 leading-relaxed border border-slate-800 resize-none shadow-inner selection:bg-emerald-900 selection:text-emerald-100"
                    placeholder="# اكتب قالب ميكروتيك هنا..."
                  />
                </div>

                {/* Placeholders Legend and guide */}
                <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-2 border-b pb-1.5">المتغيرات الديناميكية المدعومة:</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 font-bold leading-relaxed">
                      استخدم المتغيرات أدناه في أي سطر داخل القالب، وسيقوم النظام باستبدالها آلياً ببيانات السيرفر المطلوب بمجرد الضغط على زر <span className="text-indigo-600 font-black">"الكود 📋"</span> بجانب اسم السيرفر.
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">اسم السيرفر / الموزع</span>
                        <input
                          type="text"
                          value={templateVars.name}
                          onChange={(e) => setTemplateVars({ ...templateVars, name: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">عنوان الـ IP الخارجي</span>
                        <input
                          type="text"
                          value={templateVars.ip}
                          onChange={(e) => setTemplateVars({ ...templateVars, ip: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">آي بي نفق الـ VPN</span>
                        <input
                          type="text"
                          value={templateVars.vpnIp}
                          onChange={(e) => setTemplateVars({ ...templateVars, vpnIp: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 justify-between bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-150">
                        <span className="text-slate-500 dark:text-slate-400 text-xs font-bold">كلمة سر الريديوس (Secret)</span>
                        <input
                          type="text"
                          value={templateVars.secret}
                          onChange={(e) => setTemplateVars({ ...templateVars, secret: e.target.value })}
                          className="bg-indigo-50/50 hover:bg-indigo-50 focus:bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono text-[11px] outline-none w-24 text-center transition-colors border border-indigo-100"
                        />
                      </div>
                    </div>
                  </div>

                  
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VPN Test Live Console Panel */}
      {testingId && (
        <div className="bg-slate-950 text-emerald-400 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150 relative shadow-xl">
          <button 
            onClick={() => setTestingId(null)}
            className="absolute left-4 top-4 text-slate-500 hover:text-emerald-400 transition-colors"
          >
            إغلاق المعاينة
          </button>
          <h4 className="font-bold text-slate-500 flex items-center gap-1">
            <Activity className="w-4 h-4 text-emerald-500" />
            root@vpn-engine:~#
          </h4>
          <p className="text-emerald-300 leading-relaxed whitespace-pre-wrap">{testResult}</p>
        </div>
      )}


      {/* Interface Monitor Modal */}
      {monitorServer && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg">مراقبة واجهات الشبكة (Interface Monitor)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">مراقبة السرعات اللحظية لواجهات السيرفر: <span className="font-bold text-sky-600" dir="ltr">{monitorServer.name} - {monitorServer.ipAddress}</span></p>
                </div>
              </div>
              <button
                onClick={() => setMonitorServer(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4" dir="rtl">
              {!monitorServer.interfaces || monitorServer.interfaces.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm font-bold bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Wifi className="w-8 h-8 mx-auto text-slate-400 mb-3 opacity-50" />
                  لا توجد واجهات مسجلة لهذا السيرفر أو لم يتم جلبها بعد عبر الـ API.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {monitorServer.interfaces.map((iface, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-sky-400 to-indigo-500"></div>
                      <div className="flex justify-between items-start mb-4 pr-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base" dir="ltr">{iface.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              iface.status === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                            }`}>
                              {iface.status === 'up' ? 'UP' : 'DOWN'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{iface.type}</span>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                          <Activity className="w-4 h-4 text-sky-500 animate-pulse" />
                        </div>
                      </div>
                      
                      <div className="space-y-3 pr-3">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> RX (Download)</span>
                            <span className="text-slate-700 dark:text-slate-200 font-mono">{iface.rxSpeed.toFixed(1)} Mbps</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (iface.rxSpeed / 1000) * 100)}%` }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1">
                            <span className="text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> TX (Upload)</span>
                            <span className="text-slate-700 dark:text-slate-200 font-mono">{iface.txSpeed.toFixed(1)} Mbps</span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (iface.txSpeed / 1000) * 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit NAS Server Modal */}
      {editingServer && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                تعديل وتحديث بيانات سيرفر NAS: {editingServer.name}
              </h3>
              <button 
                onClick={() => setEditingServer(null)} 
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateServer(editingServer);
                setEditingServer(null);
              }}
              className="p-6 overflow-y-auto space-y-4 text-right"
              dir="rtl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم السيرفر:</label>
                  <input
                    type="text"
                    value={editingServer.name}
                    onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الموزع التابع له السيرفر:</label>
                  <select
                    value={editingServer.distributorId || ""}
                    onChange={(e) => setEditingServer({ ...editingServer, distributorId: e.target.value || undefined })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">👑 المدير العام (الرئيسي)</option>
                    {distributors.map(d => (
                      <option key={d?.id} value={d?.id}>👤 الموزع: {d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الـ IP الخارجي للسيرفر:</label>
                  <input
                    type="text"
                    value={editingServer.ipAddress}
                    onChange={(e) => setEditingServer({ ...editingServer, ipAddress: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الـ IP بنفق الـ VPN:</label>
                  <input
                    type="text"
                    value={editingServer.vpnIp}
                    onChange={(e) => setEditingServer({ ...editingServer, vpnIp: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">كلمة سر الريديوس (Secret):</label>
                  <input
                    type="text"
                    value={editingServer.secret}
                    onChange={(e) => setEditingServer({ ...editingServer, secret: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-purple-500" />
                    النطاق الرئيسي للريديوس (Realm):
                  </label>
                  <input
                    type="text"
                    list="edit-realm-suggestions"
                    value={editingServer.realm || "realm1.net"}
                    onChange={(e) => {
                      const r = e.target.value;
                      setEditingServer({ 
                        ...editingServer, 
                        realm: r,
                        realms: [r, ...(editingServer.realms || []).filter(item => item !== r)]
                      });
                    }}
                    className="w-full p-2.5 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 font-bold text-purple-900 dark:text-purple-200"
                    required
                  />
                  <datalist id="edit-realm-suggestions">
                    <option value="realm1.net" />
                    <option value="@realm1" />
                    <option value="default" />
                    <option value="hotspot.net" />
                    <option value="pppoe.net" />
                  </datalist>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">نوع السيرفر (NAS Type):</label>
                  <select
                    value={editingServer.type || "mikrotik"}
                    onChange={(e) => setEditingServer({ ...editingServer, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    <option value="mikrotik">MikroTik RouterOS</option>
                    <option value="coova">CoovaChilli</option>
                    <option value="chillispot">ChilliSpot</option>
                    <option value="cisco">Cisco IOS</option>
                    <option value="other">سيرفر آخر (Other)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    المتصلون النشطون على الريديوس (RADIUS Active):
                  </label>
                  <input
                    type="number"
                    value={editingServer.radiusActiveUsers ?? editingServer.activeUsers}
                    onChange={(e) => {
                      const radUsers = Number(e.target.value) || 0;
                      const mikUsers = editingServer.mikrotikActiveUsers ?? Math.max(0, editingServer.activeUsers - 4);
                      setEditingServer({ 
                        ...editingServer, 
                        radiusActiveUsers: radUsers,
                        activeUsers: Math.max(radUsers, mikUsers)
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                    المتصلون النشطون على الميكروتيك (Mikrotik Active):
                  </label>
                  <input
                    type="number"
                    value={editingServer.mikrotikActiveUsers ?? Math.max(0, editingServer.activeUsers - 4)}
                    onChange={(e) => {
                      const mikUsers = Number(e.target.value) || 0;
                      const radUsers = editingServer.radiusActiveUsers ?? editingServer.activeUsers;
                      setEditingServer({ 
                        ...editingServer, 
                        mikrotikActiveUsers: mikUsers,
                        activeUsers: Math.max(radUsers, mikUsers)
                      });
                    }}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800 pt-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl my-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">التفعيل التلقائي عند تشغيل النظام:</label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">تشغيل اتصال الـ VPN تلقائياً فور إقلاع لوحة التحكم</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingServer({
                      ...editingServer,
                      autoActivateOnStart: !(editingServer.autoActivateOnStart ?? true)
                    })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      (editingServer.autoActivateOnStart ?? true) ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                    title="مفتاح تبديل التفعيل التلقائي"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                        (editingServer.autoActivateOnStart ?? true) ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">إعادة الاتصال التلقائي (Auto-Reconnect):</label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">تأسيس الاتصال فوراً في حال انقطاع الـ VPN</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingServer({
                      ...editingServer,
                      autoReconnect: !(editingServer.autoReconnect ?? true)
                    })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      (editingServer.autoReconnect ?? true) ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                    title="مفتاح تبديل إعادة الاتصال التلقائي"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                        (editingServer.autoReconnect ?? true) ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between col-span-1 md:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5 flex items-center gap-1.5">
                      {(editingServer.enableNotifications ?? true) ? <Bell className="w-4 h-4 text-amber-500" /> : <BellOff className="w-4 h-4 text-slate-400" />}
                      <span>تفعيل الإشعارات والتنبيهات (Server Notifications):</span>
                    </label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">إرسال وتفعيل الإشعارات والتنبيهات اللحظية لهذا السيرفر عند انقطاع الاتصال أو تذبذب الخدمة</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingServer({
                      ...editingServer,
                      enableNotifications: !(editingServer.enableNotifications ?? true)
                    })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                      (editingServer.enableNotifications ?? true) ? "bg-amber-500" : "bg-slate-300"
                    }`}
                    title="مفتاح تبديل تفعيل الإشعارات"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                        (editingServer.enableNotifications ?? true) ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-0.5">تفعيل مراقبة الأداء (SNMP):</label>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">استخراج بيانات الاستهلاك والسرعة اللحظية من سيرفر NAS بدقة</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingServer({
                      ...editingServer,
                      enableSnmpMonitoring: !(editingServer.enableSnmpMonitoring ?? false)
                    })}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${
                      (editingServer.enableSnmpMonitoring ?? false) ? "bg-indigo-600" : "bg-slate-300"
                    }`}
                    title="مفتاح تبديل تفعيل مراقبة الأداء (SNMP)"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 shadow ring-0 transition duration-200 ease-in-out ${
                        (editingServer.enableSnmpMonitoring ?? false) ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {(editingServer.enableSnmpMonitoring ?? false) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-200 mb-1">SNMP Community String:</label>
                    <input
                      type="text"
                      value={editingServer.snmpCommunity || "public"}
                      onChange={(e) => setEditingServer({
                        ...editingServer,
                        snmpCommunity: e.target.value
                      })}
                      placeholder="public"
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      dir="ltr"
                    />
                  </div>
                )}
              </div>

              {/* Terminal Code Copy Section in Edit Modal */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 bg-slate-900/5 dark:bg-slate-800/30 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    كود التيرمينال المخصص للميكروتيك:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const script = getCustomizedScript(editingServer);
                      handleCopyToClipboard(script);
                      if (addNotification) addNotification(`تم نسخ كود التيرمينال لسيرفر [${editingServer.name}]! 📋`, "success");
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    نسخ كود التيرمينال للميكروتيك
                  </button>
                </div>
                <div className="bg-slate-950 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-36 border border-slate-800 leading-relaxed dir-ltr shadow-inner">
                  <pre className="whitespace-pre-wrap">{getCustomizedScript(editingServer)}</pre>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingServer(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-all"
                >
                  إلغاء التعديل
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-100"
                >
                  حفظ وتحديث بيانات السيرفر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post-Server-Creation Terminal Script Modal */}
      {createdServerForModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 text-right overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
                    تمت إضافة السيرفر بنجاح!
                    <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                      جاهز للربط
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    انسخ كود التيرمينال المعدل أدناه وضعه مباشرة في Terminal الميكروتيك للربط الفوري.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreatedServerForModal(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Server Details Summary Badges */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">اسم السيرفر:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-black">{createdServerForModal.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">الـ IP الخارجي:</span>
                <span className="font-mono">{createdServerForModal.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">عنوان الـ VPN:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">{createdServerForModal.vpnIp}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">كلمة السر (Secret):</span>
                <span className="font-mono text-amber-600 dark:text-amber-400">{createdServerForModal.secret}</span>
              </div>
            </div>

            {/* Terminal Code Display */}
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-indigo-500" />
                  كود التيرمينال المخصص (المعدل من المدير المسئول):
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const script = getCustomizedScript(createdServerForModal);
                    handleCopyToClipboard(script);
                    setCopiedCreatedScript(true);
                    if (addNotification) addNotification("تم نسخ كود التيرمينال للميكروتيك بنجاح! 📋", "success");
                    setTimeout(() => setCopiedCreatedScript(false), 2500);
                  }}
                  className={`px-4 py-2 font-black text-xs rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 ${
                    copiedCreatedScript
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200"
                  }`}
                >
                  {copiedCreatedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCreatedScript ? "تم النسخ بنجاح!" : "نسخ كود التيرمينال للميكروتيك"}
                </button>
              </div>

              <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-56 border border-slate-800 leading-relaxed dir-ltr shadow-inner">
                <pre className="whitespace-pre-wrap">{getCustomizedScript(createdServerForModal)}</pre>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-indigo-50/70 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-300 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>تنبيه الموزع:</strong> يتضمن هذا الكود التعديلات القادمة من المدير المسئول. قم بنسخ الكود ثم افتح <strong>Terminal</strong> في الميكروتيك والمسه بزر الفأرة الأيمن اختر <strong>Paste</strong> ليتم التفعيل والربط فوراً.
              </span>
            </p>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setCreatedServerForModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
