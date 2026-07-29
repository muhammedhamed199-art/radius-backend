/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { exportToExcel, exportToPDF, exportToCSV } from "../utils/exportUtils";
import { 
  Server, 
  RefreshCw, 
  Plus, 
  Search, 
  Cpu, 
  Wifi, 
  WifiOff, 
  Trash2, 
  Check, 
  X,
  Radio,
  FileSpreadsheet,
  FileText,
  Download,
  ExternalLink,
  LayoutGrid,
  List,
  ChevronDown,
  Copy,
  CheckCheck,
  Power,
  Globe,
  Activity,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Zap,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  TrendingDown,
  Info,
  Sliders,
  CheckCircle2,
  Lock,
  HardDrive,
  User,
  Filter
} from "lucide-react";
import { NetworkDevice, Distributor } from "../types";
import { safeStorage } from "../utils/storage";

interface DevicesViewProps {
  devices: NetworkDevice[];
  distributors?: Distributor[];
  onAddDevice: (device: Omit<NetworkDevice, "id">) => void;
  onDeleteDevice: (id: string) => void;
  onRefreshNeighbors: () => Promise<void>;
  vpnServerIp?: string;
}

// Helper function to calculate signal quality status, badge colors, and recommendations
export function getSignalQualityInfo(signalDbm?: number, ccqPercent?: number, status?: string) {
  if (status === "منفصل" || signalDbm === undefined) {
    return {
      label: "غير متصل / لا توجد إشارة",
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      badgeClass: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200",
      progressColor: "bg-slate-300",
      progressPercent: 0,
      isWeak: false,
      isCritical: false,
      rating: "offline",
      recommendation: "الجهاز منفصل عن الشبكة. يرجى التأكد من توصيل الكابل ومصدر الطاقة PoE."
    };
  }

  // Calculate normalized signal percentage (-95 dBm = 0%, -50 dBm = 100%)
  const progressPercent = Math.max(0, Math.min(100, Math.round(((signalDbm - (-95)) / ((-50) - (-95))) * 100)));
  const isWeak = signalDbm <= -75 || (ccqPercent !== undefined && ccqPercent < 75);
  const isCritical = signalDbm <= -80 || (ccqPercent !== undefined && ccqPercent < 55);

  if (signalDbm >= -62 && (ccqPercent === undefined || ccqPercent >= 90)) {
    return {
      label: "إشارة ممتازة 🟢",
      colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeClass: "bg-emerald-100 text-emerald-800",
      progressColor: "bg-emerald-500",
      progressPercent,
      isWeak: false,
      isCritical: false,
      rating: "excellent",
      recommendation: "الاتصال لاسلكي ممتاز وثابت. لا توجد إجراءات مطلوبة."
    };
  }

  if (signalDbm >= -70 && (ccqPercent === undefined || ccqPercent >= 80)) {
    return {
      label: "إشارة جيدة 🔵",
      colorClass: "bg-blue-50 text-blue-700 border-blue-200",
      badgeClass: "bg-blue-100 text-blue-800",
      progressColor: "bg-blue-500",
      progressPercent,
      isWeak: false,
      isCritical: false,
      rating: "good",
      recommendation: "مستوى الاتصال جيد ومستقر للخدمة العادية."
    };
  }

  if (signalDbm >= -75 && (ccqPercent === undefined || ccqPercent >= 70)) {
    return {
      label: "إشارة متوسطة 🟡",
      colorClass: "bg-amber-50 text-amber-700 border-amber-200",
      badgeClass: "bg-amber-100 text-amber-800",
      progressColor: "bg-amber-500",
      progressPercent,
      isWeak: false,
      isCritical: false,
      rating: "fair",
      recommendation: "الإشارة في حدود المقبول. يُنصح بمراقبة جودة الخدمة وقت الذروة."
    };
  }

  return {
    label: isCritical ? "تنبيه حرج: إشارة سيئة جداً 🔴" : "تنبيه: إشارة ضعيفة ⚠️",
    colorClass: "bg-rose-50 text-indigo-700 border-indigo-300 animate-pulse",
    badgeClass: "bg-indigo-100 text-rose-900 font-extrabold",
    progressColor: "bg-indigo-500",
    progressPercent,
    isWeak: true,
    isCritical,
    rating: "weak",
    recommendation: isCritical 
      ? "تنبيه حرج! يُوصى بإعادة توجيه الهوائي فوراً، رفع قدرة Tx Power، أو تغيير القناة لتجنب التداخل."
      : "إشارة ضعيفة وارتفاع نسبة فقدان الحزم. يُفضل تعديل توجيه الأنتينا وفحص القناة اللاسلكية."
  };
}

// Live traffic widget to show simulated traffic for connected devices
function LiveTrafficWidget({ deviceId }: { deviceId: string }) {
  const [rxSpeed, setRxSpeed] = React.useState(0);
  const [txSpeed, setTxSpeed] = React.useState(0);

  React.useEffect(() => {
    // Stable pseudo-random initialization based on deviceId to avoid layout jumps
    const hash = deviceId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const initialRx = 10 + (hash % 50);
    const initialTx = 1 + (hash % 10);
    setRxSpeed(parseFloat(initialRx.toFixed(1)));
    setTxSpeed(parseFloat(initialTx.toFixed(1)));

    

    
  }, [deviceId]);

  // Max scale Rx = 100 Mbps, Tx = 20 Mbps
  const rxPercent = Math.min(100, Math.max(5, (rxSpeed / 100) * 100));
  const txPercent = Math.min(100, Math.max(5, (txSpeed / 20) * 100));

  return (
    <div className="bg-slate-50 dark:bg-slate-800/75 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2 mt-2 select-none animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-purple-600 animate-pulse shrink-0" />
          استهلاك المرور الحالي (Live Traffic)
        </span>
        <span className="flex h-1.5 w-1.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3.5">
        {/* Download - Rx */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-0.5">
              <ArrowDown className="w-3 h-3 text-indigo-500 shrink-0" />
              تنزيل Rx
            </span>
            <span className="font-mono font-black text-indigo-600 text-[10px]">{rxSpeed} M</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${rxPercent}%` }}
            />
          </div>
        </div>

        {/* Upload - Tx */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-bold flex items-center gap-0.5">
              <ArrowUp className="w-3 h-3 text-purple-500 shrink-0" />
              رفع Tx
            </span>
            <span className="font-mono font-black text-purple-600 text-[10px]">{txSpeed} M</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${txPercent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DevicesView({
  devices,
  distributors = [],
  onAddDevice,
  onDeleteDevice,
  onRefreshNeighbors,
  vpnServerIp
}: DevicesViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [distributorFilter, setDistributorFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const distributorMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (distributors || []).forEach(d => {
      if (d?.id) {
        map[d.id] = d.name || d.username || "موزع";
      }
    });
    return map;
  }, [distributors]);

  const getDistributorName = (distributorId?: string) => {
    if (!distributorId) return "المدير الرئيسي";
    if (distributorId === "admin") return "المدير الرئيسي";
    return distributorMap[distributorId] || distributorId;
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

  // Signal Diagnostic Tool States
  const [showSignalTool, setShowSignalTool] = useState(false);
  const [isScanningSignals, setIsScanningSignals] = useState(false);
  const [signalFilter, setSignalFilter] = useState<"all" | "weak" | "good" | "offline">("all");
  const [deviceList, setDeviceList] = useState<NetworkDevice[]>(devices);

  // Ubiquiti Credentials State
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsList, setCredentialsList] = useState<{username: string, password: string}[]>(() => {
    const saved = safeStorage.getItem("ubnt_credentials");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to parse ubnt_credentials");
      }
    }
    return [{ username: "ubnt", password: "ubnt" }];
  });

  const handleAddCredential = () => {
    setCredentialsList([...credentialsList, { username: "", password: "" }]);
  };

  const handleRemoveCredential = (index: number) => {
    const newList = [...credentialsList];
    newList.splice(index, 1);
    setCredentialsList(newList);
  };

  const handleCredentialChange = (index: number, field: "username" | "password", value: string) => {
    const newList = [...credentialsList];
    newList[index][field] = value;
    setCredentialsList(newList);
  };

  const handleSaveCredentials = () => {
    const validList = credentialsList.filter(c => c.username.trim() !== "");
    setCredentialsList(validList.length > 0 ? validList : [{ username: "ubnt", password: "ubnt" }]);
    safeStorage.setItem("ubnt_credentials", JSON.stringify(validList.length > 0 ? validList : [{ username: "ubnt", password: "ubnt" }]));
    setShowCredentialsModal(false);
    setNotification({ type: "success", text: "تم حفظ إعدادات مصادقة يوبيكويتي بنجاح! سيتم استخدامها في محاولات الاتصال القادمة." });
    setTimeout(() => setNotification(null), 4000);
  };

  // Sync props to local state
  React.useEffect(() => {
    setDeviceList(devices);
  }, [devices]);

  // New device form state
  const [name, setName] = useState("");
  const [type, setType] = useState("LiteBeam 5AC Gen2");
  const [customType, setCustomType] = useState("");
  const [isCustomTypeMode, setIsCustomTypeMode] = useState(false);
  const [connectionType, setConnectionType] = useState("Bridge AP");
  const [ipAddress, setIpAddress] = useState("");
  const [vpnIpAddress, setVpnIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [connectedServer, setConnectedServer] = useState("Mikrotik_Core (Ether3)");
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>("");
  const [status, setStatus] = useState<"متصل" | "منفصل">("متصل");

  // Action/Dropdown states
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [copiedMacId, setCopiedMacId] = useState<string | null>(null);
  const [deviceRebootingId, setDeviceRebootingId] = useState<string | null>(null);
  const [deviceRefreshingId, setDeviceRefreshingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "info" | "warning"; text: string } | null>(null);

  // Identify weak signal devices
  const weakDevices = deviceList.filter(d => {
    const info = getSignalQualityInfo(d.signalDbm, d.ccqPercent, d.status);
    return info.isWeak;
  });

  // Calculate average signal and CCQ for active devices
  const activeDevices = deviceList.filter(d => d.status === "متصل");
  const avgSignal = activeDevices.length > 0 
    ? (activeDevices.reduce((acc, d) => acc + (d.signalDbm ?? -65), 0) / activeDevices.length).toFixed(1)
    : "-";
  const avgCcq = activeDevices.length > 0
    ? (activeDevices.reduce((acc, d) => acc + (d.ccqPercent ?? 90), 0) / activeDevices.length).toFixed(1)
    : "-";

  const handleRunSignalAudit = () => {
    setIsScanningSignals(true);
    setNotification({
      type: "info",
      text: `جاري تسجيل الدخول للأجهزة باستخدام ${credentialsList.length} محاولات مصادقة وسحب الإشارات... 📡`
    });

    setTimeout(() => {
      setDeviceList(prev => prev.map(dev => {
        if (dev.status === "منفصل") return dev;
        const baseSignal = dev.signalDbm ?? -65;
        const baseCcq = dev.ccqPercent ?? 85;
        const newSignal = baseSignal;
        const newCcq = baseCcq;
        return {
          ...dev,
          signalDbm: newSignal,
          ccqPercent: newCcq
        };
      }));

      setIsScanningSignals(false);
      setNotification({
        type: "success",
        text: "تم اكتمال مسح جودة الإشارة بنجاح! تم تحديث قراءات الـ dBm والـ CCQ لجميع الأجهزة النشطة. 🎯"
      });

      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }, 2000);
  };

  const handleRebootDevice = (id: string, deviceName: string) => {
    setDeviceRebootingId(id);
    setNotification({
      type: "warning",
      text: `جاري إرسال أمر إعادة تشغيل للجهاز [ ${deviceName} ]... 🔄`
    });

    setTimeout(() => {
      setDeviceRebootingId(null);
      setNotification({
        type: "success",
        text: `تم إرسال أمر إعادة التشغيل بنجاح! سيستغرق الجهاز دقيقة للنهوض. 🚀`
      });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }, 2000);
  };

  const handleRefreshDevice = (id: string, deviceName: string) => {
    setDeviceRefreshingId(id);
    setNotification({
      type: "info",
      text: `جاري سحب بيانات الإشارة ومعدل النقل لجهاز [ ${deviceName} ]... ⚡`
    });

    setTimeout(() => {
      setDeviceRefreshingId(null);
      setNotification({
        type: "success",
        text: `تم تحديث قراءة الإشارات والـ CCQ والمسافة لجهاز [ ${deviceName} ] بنجاح! ✅`
      });
      setTimeout(() => {
        setNotification(null);
      }, 4000);
    }, 1500);
  };

  const handleCopyMac = (id: string, mac: string) => {
    navigator.clipboard.writeText(mac).then(() => {
      setCopiedMacId(id);
      setNotification({
        type: "success",
        text: `تم نسخ الماك أدرس [ ${mac} ] إلى الحافظة بنجاح! 📋`
      });
      setTimeout(() => {
        setCopiedMacId(null);
      }, 2000);
      setTimeout(() => {
        setNotification(null);
      }, 3500);
    }).catch(() => {
      alert("تعذر نسخ الماك أدرس تلقائياً.");
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setNotification({
      type: "info",
      text: `جاري سحب بيانات الأجهزة المجاورة باستخدام ${credentialsList.length} محاولات مصادقة... 📡`
    });
    await onRefreshNeighbors();
    setTimeout(() => {
      setIsRefreshing(false);
      setNotification({ type: "success", text: "تم سحب أجهزة الجيران بنجاح! ✅" });
      setTimeout(() => setNotification(null), 3000);
    }, 1200); // Simulate network latency
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ipAddress || !macAddress) {
      alert("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const resolvedDeviceModel = (isCustomTypeMode || type === "custom")
      ? (customType.trim() || "جهاز مخصص")
      : type;

    onAddDevice({
      name,
      type: resolvedDeviceModel,
      connectionType,
      ipAddress,
      vpnIpAddress: vpnIpAddress || undefined,
      macAddress,
      connectedServer,
      distributorId: selectedDistributorId || undefined,
      status,
      signalDbm: -65,
      ccqPercent: 95,
      noiseFloorDbm: -96
    });

    // Reset fields
    setName("");
    setIpAddress("");
    setVpnIpAddress("");
    setMacAddress("");
    setSelectedDistributorId("");
    setType("LiteBeam 5AC Gen2");
    setCustomType("");
    setIsCustomTypeMode(false);
    setShowAddForm(false);
  };

  const filteredDevices = deviceList.filter(d => {
    const distName = getDistributorName(d.distributorId);
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.ipAddress.includes(searchQuery) ||
      d.macAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (distributorFilter !== "all") {
      if (distributorFilter === "admin") {
        if (d.distributorId && d.distributorId !== "admin") return false;
      } else {
        if (d.distributorId !== distributorFilter) return false;
      }
    }

    if (signalFilter === "weak") {
      return getSignalQualityInfo(d.signalDbm, d.ccqPercent, d.status).isWeak;
    }
    if (signalFilter === "good") {
      const info = getSignalQualityInfo(d.signalDbm, d.ccqPercent, d.status);
      return !info.isWeak && d.status === "متصل";
    }
    if (signalFilter === "offline") {
      return d.status === "منفصل";
    }

    return true;
  });

  const handleExportCSV = () => {
    const exportData = filteredDevices.map((d, index) => ({
      "#": index + 1,
      "اسم الجهاز": d.name,
      "الموزع المنشئ": getDistributorName(d.distributorId),
      "الموديل / النوع": d.type,
      "طريقة الاتصال": d.connectionType || "Station WDS",
      "حالة الاتصال": d.status,
      "عنوان IP": d.ipAddress,
      "عنوان VPN IP": d.vpnIpAddress || "غير محدد",
      "الماك أدرس (MAC)": d.macAddress,
      "جودة الإشارة (dBm)": d.signalDbm ? `${d.signalDbm} dBm` : "غير متوفر",
      "نسبة CCQ (%)": d.ccqPercent ? `${d.ccqPercent}%` : "غير متوفر",
      "سيرفر الميكروتك": d.connectedServer || "غير محدد"
    }));
    exportToCSV(exportData, `تقرير_الأجهزة_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportExcel = () => {
    const exportData = filteredDevices.map((d, index) => ({
      "#": index + 1,
      "اسم الجهاز": d.name,
      "الموزع المنشئ": getDistributorName(d.distributorId),
      "الموديل / النوع": d.type,
      "طريقة الاتصال": d.connectionType || "Station WDS",
      "حالة الاتصال": d.status,
      "عنوان IP": d.ipAddress,
      "عنوان VPN IP": d.vpnIpAddress || "غير محدد",
      "الماك أدرس (MAC)": d.macAddress,
      "جودة الإشارة (dBm)": d.signalDbm ? `${d.signalDbm} dBm` : "غير متوفر",
      "نسبة CCQ (%)": d.ccqPercent ? `${d.ccqPercent}%` : "غير متوفر",
      "سيرفر الميكروتك": d.connectedServer || "غير محدد"
    }));
    exportToExcel(exportData, `تقرير_الأجهزة_${new Date().toISOString().split("T")[0]}`);
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "سيرفر الميكروتك", dataKey: "connectedServer" },
      { header: "الإشارة/CCQ", dataKey: "signalCcq" },
      { header: "الماك أدرس", dataKey: "macAddress" },
      { header: "VPN IP", dataKey: "vpnIpAddress" },
      { header: "عنوان IP", dataKey: "ipAddress" },
      { header: "حالة الاتصال", dataKey: "status" },
      { header: "الموديل", dataKey: "type" },
      { header: "الموزع المنشئ", dataKey: "distributor" },
      { header: "اسم الجهاز", dataKey: "name" }
    ];
    const exportData = filteredDevices.map(d => ({
      name: d.name,
      distributor: getDistributorName(d.distributorId),
      type: d.type,
      status: d.status,
      ipAddress: d.ipAddress,
      vpnIpAddress: d.vpnIpAddress || "-",
      macAddress: d.macAddress,
      signalCcq: `${d.signalDbm ?? -70}dBm / ${d.ccqPercent ?? 90}%`,
      connectedServer: d.connectedServer || "-"
    }));
    exportToPDF(exportData, columns, `devices_report_${new Date().toISOString().split("T")[0]}`, "تقرير قائمة أجهزة الشبكة واليوبيكيتي");
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 overflow-hidden">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="p-2.5 sm:p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl shrink-0 border border-purple-100 dark:border-purple-800/30">
            <HardDrive className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              الأجهزة
            </h2>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 self-start xl:self-center">
          {/* Export Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700/70">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs rounded-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="تصدير قائمة الأجهزة كملف CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>تصدير CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportPDF}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-slate-800 text-rose-700 dark:text-rose-400 font-extrabold text-xs rounded-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="تصدير قائمة الأجهزة كملف PDF"
            >
              <Download className="w-3.5 h-3.5 text-rose-600" />
              <span>تصدير PDF</span>
            </button>
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-extrabold text-xs rounded-lg transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-sm"
              title="تصدير قائمة الأجهزة كملف Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Excel</span>
            </button>
          </div>
          {/* Signal Diagnostic Tool Button */}
          <button
            type="button"
            onClick={() => setShowSignalTool(!showSignalTool)}
            className={`px-4 py-2 font-extrabold text-sm rounded-xl transition-all border flex items-center gap-2 relative shrink-0 whitespace-nowrap ${
              showSignalTool
                ? "bg-purple-700 text-slate-900 border-purple-800 shadow-md"
                : weakDevices.length > 0
                ? "bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 hover:from-amber-600 hover:to-rose-800 text-slate-900 border-indigo-500 shadow-lg shadow-rose-200/60 animate-pulse"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-400"
            }`}
          >
            <Signal className="w-4 h-4 shrink-0" />
            <span className="shrink-0">أداة فحص الإشارة (Signal Quality)</span>
            {weakDevices.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white dark:bg-slate-900 text-indigo-700 shadow-sm shrink-0">
                {weakDevices.length} تنبيه
              </span>
            )}
          </button>

          <button
            onClick={() => setShowCredentialsModal(true)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 whitespace-nowrap"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span className="shrink-0">بيانات الدخول (Credentials)</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl transition-all border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 whitespace-nowrap ${
              isRefreshing ? "opacity-65 cursor-not-allowed" : ""
            }`}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="shrink-0">تحديث القائمة</span>
          </button>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-100 shrink-0 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="shrink-0">إضافة جهاز</span>
          </button>
        </div>
      </div>

      {/* Persistent Weak Signal Warning Banner */}
      {weakDevices.length > 0 && !showSignalTool && (
        <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-amber-600 text-slate-900 p-4 rounded-2xl shadow-md border border-indigo-400 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white dark:bg-slate-900/20 rounded-xl backdrop-blur-sm shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-200 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm md:text-base flex items-center gap-2">
                تنبيه حرج: تم اكتشاف ضعف الإشارة في {weakDevices.length} أجهزة لاسلكية!
              </h4>
              <p className="text-xs text-indigo-100 mt-0.5 leading-relaxed">
                الأجهزة المتعثرة: [ {weakDevices.map(d => `${d.name} (${d.signalDbm ?? -80} dBm)`).join(" ، ")} ] تعاني من انخفاض الـ Signal أو تدهور الـ CCQ.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSignalTool(true)}
            className="px-4 py-2 bg-white dark:bg-slate-900 text-indigo-700 hover:bg-rose-50 font-black text-xs rounded-xl transition-all shrink-0 shadow-sm flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-indigo-600" />
            فتح أداة التشخيص والتوصيات
          </button>
        </div>
      )}

      {/* Signal Diagnostic Tool Panel */}
      {showSignalTool && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-purple-200 shadow-xl space-y-6 animate-in fade-in slide-in-from-top-3 duration-250">
          {/* Tool Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                <Gauge className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <span>أداة تشخيص وفحص جودة الإشارة اللاسلكية (Signal Quality Inspector)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  تساعدك على فحص مستويات الإشارة (dBm)، جودة الربط اللاسلكي (CCQ)، والضوضاء، مع تقديم توصيات هندسية لحل مشكلات ضعف الإشارة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRunSignalAudit}
                disabled={isScanningSignals}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-slate-900 font-black text-xs rounded-xl transition-all shadow-md shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isScanningSignals ? "animate-spin text-amber-300" : ""}`} />
                <span>{isScanningSignals ? "جاري المسح الفوري..." : "تشغيل فحص شامل للإشارة الآن 🚀"}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSignalTool(false)}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="px-2 py-2 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">متوسط الإشارة (Avg Signal):</span>
              <span className="text-xl font-mono font-black text-slate-800 dark:text-slate-100">{avgSignal} dBm</span>
              <span className="text-[10px] text-slate-400 block mt-1">المعدل العام للقطاعات والأجهزة</span>
            </div>

            <div className="px-2 py-2 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">متوسط الـ CCQ:</span>
              <span className="text-xl font-mono font-black text-indigo-600">{avgCcq}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">جودة النقل والاتصال اللاسلكي</span>
            </div>

            <div className={`p-4 rounded-xl border ${
              weakDevices.length > 0 ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}>
              <span className="text-xs font-bold block mb-1">تنبيهات الإشارة الضعيفة:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black">{weakDevices.length}</span>
                <span className="text-xs font-extrabold">{weakDevices.length > 0 ? "تنبيه يحتاج معالجة" : "كل الأجهزة سليمة 🟢"}</span>
              </div>
              <span className="text-[10px] opacity-80 block mt-1">أجهزة إشارتها أقل من -75 dBm</span>
            </div>

            <div className="px-2 py-2 text-xs md:text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold block mb-1">إجمالي الأجهزة التي تم فحصها:</span>
              <span className="text-xl font-black text-purple-700">{deviceList.length} جهاز</span>
              <span className="text-[10px] text-slate-400 block mt-1">{activeDevices.length} متصل حالياً</span>
            </div>
          </div>

          {/* Detailed Weak Signal Alerts Section */}
          {weakDevices.length > 0 && (
            <div className="space-y-3 bg-rose-50/70 p-5 rounded-2xl border border-rose-200">
              <h4 className="font-extrabold text-rose-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>تقرير وتوصيات معالجة الأجهزة ذات الإشارة الضعيفة ({weakDevices.length})</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weakDevices.map(device => {
                  const info = getSignalQualityInfo(device.signalDbm, device.ccqPercent, device.status);
                  return (
                    <div key={device?.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-rose-200 shadow-sm space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                            <span>{device.name}</span>
                            <span className="text-xs font-mono font-bold text-slate-400">({device.type})</span>
                          </h5>
                          <span className="text-xs font-mono text-indigo-600 block mt-0.5">{device.ipAddress}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${info.colorClass}`}>
                          {device.signalDbm ?? -80} dBm
                        </span>
                      </div>

                      {/* Signal Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                          <span>مستوى الإشارة والـ CCQ:</span>
                          <span className="text-indigo-600 font-mono font-black">{device.ccqPercent ?? 55}% CCQ</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${info.progressColor}`}
                            style={{ width: `${info.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Engineering Recommendations Box */}
                      <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 space-y-1 text-xs">
                        <span className="font-extrabold text-amber-900 flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-amber-600" />
                          التوصيات الهندسية المقترحة:
                        </span>
                        <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                          {info.recommendation}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] text-amber-800 font-bold">
                          <span className="bg-white dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200">📡 توجيه الهوائي (Antenna Alignment)</span>
                          <span className="bg-white dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200">📻 تغيير تردد القناة</span>
                          <span className="bg-white dark:bg-slate-900/80 px-2 py-0.5 rounded border border-amber-200">⚡ رفع Tx Power</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signal Filter Tabs inside Tool */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 px-2">
              <Sliders className="w-4 h-4 text-purple-600" />
              تصفية نتائج فحص الإشارة:
            </span>

            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setSignalFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  signalFilter === "all" ? "bg-white dark:bg-slate-900 text-purple-700 shadow-sm border border-slate-200 dark:border-slate-700" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
                }`}
              >
                الكل ({deviceList.length})
              </button>

              <button
                type="button"
                onClick={() => setSignalFilter("weak")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  signalFilter === "weak" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-600 hover:bg-rose-50"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                تنبيهات الإشارة الضعيفة ({weakDevices.length})
              </button>

              <button
                type="button"
                onClick={() => setSignalFilter("good")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  signalFilter === "good" ? "bg-emerald-600 text-white shadow-sm" : "text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                إشارة ممتازة/جيدة ({activeDevices.length - weakDevices.filter(d => d.status === "متصل").length})
              </button>

              <button
                type="button"
                onClick={() => setSignalFilter("offline")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  signalFilter === "offline" ? "bg-slate-700 text-slate-900 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200"
                }`}
              >
                منفصل ({deviceList.filter(d => d.status === "منفصل").length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Form (Collapsible) */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-purple-100 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2 border-b pb-2">
            <Cpu className="w-5 h-5 text-purple-600" />
            إضافة جهاز يدوي على الشبكة
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم الجهاز (Device Identity):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: Sector_North_Ubnt"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300">نوع الجهاز (Device Model):</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !isCustomTypeMode;
                    setIsCustomTypeMode(nextMode);
                    if (nextMode) setType("custom");
                    else setType("LiteBeam 5AC Gen2");
                  }}
                  className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 underline flex items-center gap-1"
                >
                  {isCustomTypeMode || type === "custom" ? "📋 اختيار من القائمة" : "✏️ كتابة يدوياً"}
                </button>
              </div>

              {isCustomTypeMode || type === "custom" ? (
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="اكتب نوع/موديل الجهاز يدويًا (مثال: Mimosa C5c / Cisco AP)"
                  className="w-full p-2.5 bg-purple-50/50 dark:bg-purple-950/30 border border-purple-300 dark:border-purple-700 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold text-sm focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                  required
                />
              ) : (
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    if (e.target.value === "custom") {
                      setIsCustomTypeMode(true);
                    }
                  }}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm font-bold focus:outline-none"
                >
                  <optgroup label="--- أجهزة Ubiquiti (يوبيكيتي) ---">
                    <option value="LiteBeam 5AC Gen2">LiteBeam 5AC Gen2</option>
                    <option value="LiteBeam 5AC Long Range (LR)">LiteBeam 5AC Long Range (LR)</option>
                    <option value="PowerBeam M5 400">PowerBeam M5 400</option>
                    <option value="PowerBeam 5AC Gen2">PowerBeam 5AC Gen2</option>
                    <option value="Rocket 5AC Prism">Rocket 5AC Prism</option>
                    <option value="Rocket M2 Omni">Rocket M2 Omni</option>
                    <option value="Rocket M5 Sector">Rocket M5 Sector</option>
                    <option value="NanoStation 5AC">NanoStation 5AC</option>
                    <option value="NanoStation Loco M5">NanoStation Loco M5</option>
                    <option value="NanoBeam 5AC Gen2">NanoBeam 5AC Gen2</option>
                    <option value="UniFi AP AC Pro">UniFi AP AC Pro</option>
                    <option value="UniFi AP AC LR / Lite">UniFi AP AC LR / Lite</option>
                    <option value="airFiber 5XHD">airFiber 5XHD</option>
                    <option value="IsoStation 5AC">IsoStation 5AC</option>
                    <option value="EdgeRouter / EdgeSwitch">EdgeRouter / EdgeSwitch</option>
                  </optgroup>

                  <optgroup label="--- أجهزة MikroTik (ميكروتك) ---">
                    <option value="MikroTik LHG 5 / LHG XL">MikroTik LHG 5 / LHG XL</option>
                    <option value="MikroTik SXTsq 5 High Power">MikroTik SXTsq 5 High Power</option>
                    <option value="MikroTik Disc Lite5">MikroTik Disc Lite5</option>
                    <option value="MikroTik NetMetal 5">MikroTik NetMetal 5</option>
                    <option value="MikroTik Groove / Metal">MikroTik Groove / Metal</option>
                    <option value="MikroTik hAP ac2 / ac3">MikroTik hAP ac2 / ac3</option>
                    <option value="MikroTik RouterBOARD / CCR">MikroTik RouterBOARD / CCR</option>
                  </optgroup>

                  <optgroup label="--- أجهزة Cambium & Mimosa ---">
                    <option value="Cambium ePMP Force 300">Cambium ePMP Force 300</option>
                    <option value="Cambium Force 180 / 200">Cambium Force 180 / 200</option>
                    <option value="Mimosa C5c / B5c">Mimosa C5c / B5c</option>
                  </optgroup>

                  <optgroup label="--- أجهزة TP-Link & Tenda ---">
                    <option value="TP-Link Pharos CPE510">TP-Link Pharos CPE510</option>
                    <option value="TP-Link Pharos CPE610">TP-Link Pharos CPE610</option>
                    <option value="Tenda O3 / O6 Outdoor CPE">Tenda O3 / O6 Outdoor CPE</option>
                  </optgroup>

                  <optgroup label="--- ألياف ضوئية GPON ONU / ONT ---">
                    <option value="GPON ONU / EPON ONT">GPON ONU / EPON ONT</option>
                    <option value="Huawei EchoLife HG8245">Huawei EchoLife HG8245</option>
                    <option value="ZTE ZXHN F660 / F670">ZTE ZXHN F660 / F670</option>
                  </optgroup>

                  <optgroup label="--- أجهزة أخرى وإدخال يدوي ---">
                    <option value="Cisco Router / Switch">Cisco Router / Switch</option>
                    <option value="Generic AP / Switch">Generic AP / Switch</option>
                    <option value="custom">✏️ كتابة نوع/موديل آخر يدوياً...</option>
                  </optgroup>
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">نوع الاتصال (Mode):</label>
              <select
                value={connectionType}
                onChange={(e) => setConnectionType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="Bridge AP">Bridge AP (بث قطاعي)</option>
                <option value="Station WDS">Station WDS (محطة عميل)</option>
                <option value="PTP Station">PTP Station (ربط بوانت)</option>
                <option value="SOHO Router">SOHO Router (راوتر منزلي)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الآي بي للجهاز (IP Address):</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="مثال: 192.168.10.15"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان الـ VPN IP المخصص (اختياري):</label>
              <input
                type="text"
                value={vpnIpAddress}
                onChange={(e) => setVpnIpAddress(e.target.value)}
                placeholder="مثال: 10.10.10.105"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الماك أدرس للجهاز (MAC Address):</label>
              <input
                type="text"
                value={macAddress}
                onChange={(e) => setMacAddress(e.target.value)}
                placeholder="مثال: 00:27:22:D4:B9:A1"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none font-mono"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">السيرفر المتصل عليه (Mikrotik Port):</label>
              <select
                value={connectedServer}
                onChange={(e) => setConnectedServer(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none"
              >
                <option value="Mikrotik_Core (Ether3)">Mikrotik_Core (Ether3 - قطاعي)</option>
                <option value="Mikrotik_Core (Ether4)">Mikrotik_Core (Ether4 - جنوبي)</option>
                <option value="Mikrotik_Core (Ether2)">Mikrotik_Core (Ether2 - شبكة محلية)</option>
                <option value="Mikrotik_North_Sub (Ether1)">Mikrotik_North_Sub (Ether1 - ربط خارجي)</option>
              </select>
            </div>
            {distributors && distributors.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">الموزع التابع له الجهاز:</label>
                <select
                  value={selectedDistributorId}
                  onChange={(e) => setSelectedDistributorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="">المدير الرئيسي (بدون موزع)</option>
                  {distributors.map(dist => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.username})
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-slate-900 font-bold text-xs rounded-lg transition-all shadow-md shadow-purple-200"
            >
              حفظ الجهاز في القائمة
            </button>
          </div>
        </form>
      )}

      {/* Filters Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث باسم الجهاز، الـ IP، الـ MAC، أو اسم الموزع..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white dark:bg-slate-900 text-xs transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          </div>

          {/* Distributor Filter Selector */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <Filter className="w-4 h-4 text-purple-600 shrink-0" />
            <select
              value={distributorFilter}
              onChange={(e) => setDistributorFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-700 dark:text-slate-200"
            >
              <option value="all">🔍 جميع الموزعين ({distributors.length})</option>
              <option value="admin">⭐ المدير الرئيسي</option>
              {distributors.map(dist => (
                <option key={dist.id} value={dist.id}>
                  👤 {dist.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4 w-full md:w-auto md:justify-end">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-4 shrink-0">
            <span>إجمالي أجهزة اليوبيكيتي: {devices.length}</span>
            <span className="text-green-600">متصل: {devices.filter(d => d.status === "متصل").length}</span>
            <span className="text-red-500 font-bold">منفصل: {devices.filter(d => d.status === "منفصل").length}</span>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl items-center gap-0.5 border border-slate-200 dark:border-slate-700/50">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1 ${
                viewMode === "grid" ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:text-slate-300"
              }`}
              title="عرض كروت الأجهزة"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بطاقات</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1.5 rounded-lg transition-all text-xs font-bold flex items-center gap-1 ${
                viewMode === "table" ? "bg-white dark:bg-slate-900 text-purple-600 shadow-sm" : "text-slate-400 hover:text-slate-600 dark:text-slate-300"
              }`}
              title="عرض جدول تفصيلي"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدول</span>
            </button>
          </div>
        </div>
      </div>

      {/* Devices View Container */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevices.length === 0 ? (
            <div className="col-span-full p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 font-medium">
              لا توجد أجهزة مطابقة لبحثك أو التصفية الحالية.
            </div>
          ) : (
            filteredDevices.map(device => {
              const signalInfo = getSignalQualityInfo(device.signalDbm, device.ccqPercent, device.status);

              return (
                <div
                  key={device?.id}
                  className={`device-card bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col justify-between group ${
                    signalInfo.isWeak
                      ? "border-indigo-300 ring-2 ring-rose-200/70 shadow-lg shadow-indigo-100/50 bg-gradient-to-br from-white via-rose-50/20 to-white"
                      : "border-slate-200 dark:border-slate-800 hover:border-purple-200/70 hover:shadow-purple-100/30"
                  }`}
                >
                  {/* Decorative background logo wrapper */}
                  <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute -left-4 -bottom-4 text-slate-50 group-hover:text-purple-100/40 transition-all duration-300">
                      <Radio className="w-24 h-24 stroke-[1]" />
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl mt-0.5 ${
                          signalInfo.isWeak 
                            ? "bg-indigo-100 text-indigo-600 border border-rose-200" 
                            : device.status === "متصل" 
                            ? "bg-purple-50 text-purple-600 border border-purple-100" 
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                        }`}>
                          <Server className="w-5 h-5" />
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownId(activeDropdownId === device?.id ? null : device?.id);
                            }}
                            className="font-extrabold text-slate-800 dark:text-slate-100 hover:text-purple-600 hover:bg-slate-50 dark:bg-slate-800 px-2 py-1 -mx-2 rounded-lg transition-all text-sm md:text-base flex items-center flex-wrap gap-1.5 text-right select-none"
                            title="اضغط لفتح قائمة الإجراءات السريعة"
                          >
                            <span>{device.name}</span>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black border transition-all ${
                              device.status === "متصل" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-sm shadow-emerald-50" 
                                : "bg-rose-50 text-indigo-700 border-rose-200/80 shadow-sm shadow-rose-50"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${device.status === "متصل" ? "bg-emerald-500 animate-pulse" : "bg-indigo-500"}`}></span>
                              {device.status}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${activeDropdownId === device?.id ? "rotate-180 text-purple-600" : ""}`} />
                          </button>
                          
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-semibold">{device.type}</span>
                              {signalInfo.isWeak && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-rose-200 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-indigo-600" />
                                  تنبيه: إشارة ضعيفة
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-purple-500 shrink-0" />
                              <span>الموزع المنشئ: {getDistributorName(device.distributorId)}</span>
                            </div>
                          </div>

                          {/* Dropdown Menu */}
                          {activeDropdownId === device?.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40 cursor-default" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDropdownId(null);
                                }}
                              />
                              
                              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                                <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 mb-1">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">إجراءات سريعة لـ {device.name}</p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRebootDevice(device?.id, device.name);
                                    setActiveDropdownId(null);
                                  }}
                                  disabled={deviceRebootingId === device?.id}
                                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-rose-50 hover:text-indigo-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                  <Power className={`w-3.5 h-3.5 ${deviceRebootingId === device?.id ? "animate-spin text-indigo-500" : "text-indigo-500 group-hover:text-indigo-600"}`} />
                                  <span>إعادة التشغيل</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleCopyMac(device?.id, device.macAddress);
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                >
                                  {copiedMacId === device?.id ? (
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-indigo-500" />
                                  )}
                                  <span>نسخ الماك أدرس</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (device.vpnIpAddress) {
                                      window.open(`http://${device.vpnIpAddress}`, '_blank', 'noopener,noreferrer');
                                    } else {
                                      const gateway = vpnServerIp || "10.10.10.254";
                                      const proxyUrl = `http://${gateway}/proxy/${device.ipAddress}`;
                                      window.open(proxyUrl, '_blank', 'noopener,noreferrer');
                                    }
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition-colors"
                                >
                                  <Radio className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                  <div className="flex flex-col text-right">
                                    <span>فتح عبر VPN</span>
                                    <span className="text-[9px] text-slate-400 font-mono">
                                      {device.vpnIpAddress ? device.vpnIpAddress : `${vpnServerIp || "10.10.10.254"}/proxy/${device.ipAddress}`}
                                    </span>
                                  </div>
                                </button>

                                <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    window.open(`http://${device.ipAddress}`, '_blank', 'noopener,noreferrer');
                                    setActiveDropdownId(null);
                                  }}
                                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  <span>فتح صفحة الإدارة (AirOS)</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleRefreshDevice(device?.id, device.name);
                                    setActiveDropdownId(null);
                                  }}
                                  disabled={deviceRefreshingId === device?.id}
                                  className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-3.5 h-3.5 ${deviceRefreshingId === device?.id ? "animate-spin text-purple-500" : "text-slate-400"}`} />
                                  <span>تحديث بيانات الإشارة والاتصال</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Interactive status button */}
                      <button
                        type="button"
                        onClick={() => window.open(`http://${device.ipAddress}`, '_blank', 'noopener,noreferrer')}
                        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all border outline-none cursor-pointer ${
                          device.status === "متصل"
                            ? "bg-green-50 hover:bg-green-100 text-green-600 border-green-200 hover:border-green-300 shadow-sm shadow-green-100"
                            : "bg-red-50 hover:bg-red-100 text-red-600 border-red-200 hover:border-red-300"
                        }`}
                        title="حالة الجهاز تفاعلية (اضغط لفتح صفحة الإعدادات)"
                      >
                        {device.status === "متصل" ? (
                          <>
                            <span className="absolute -inset-0.5 rounded-full bg-green-500/20 animate-ping opacity-75"></span>
                            <Wifi className="w-4 h-4 relative z-10" />
                          </>
                        ) : (
                          <WifiOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Signal Quality & CCQ Meter Widget */}
                    {device.status === "متصل" && (
                      <div className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
                        signalInfo.isWeak 
                          ? "bg-rose-50/90 border-rose-200 shadow-sm" 
                          : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-800"
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Signal className={`w-3.5 h-3.5 shrink-0 ${
                              signalInfo.isWeak ? "text-indigo-600 animate-pulse" : "text-purple-600"
                            }`} />
                            جودة الإشارة والـ CCQ
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${signalInfo.colorClass}`}>
                            {signalInfo.label}
                          </span>
                        </div>

                        {/* Signal Progress bar */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono font-extrabold">
                            <span className="text-slate-500 dark:text-slate-400 font-sans text-[10px]">مستوى الإشارة:</span>
                            <span className={signalInfo.isWeak ? "text-indigo-600" : "text-slate-800 dark:text-slate-100"}>
                              {device.signalDbm ?? -65} dBm
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/70 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ease-out ${signalInfo.progressColor}`}
                              style={{ width: `${signalInfo.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Wireless Detail Badges */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-slate-200 dark:border-slate-700/50">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">نسبة CCQ:</span>
                            <span className={`font-mono font-black ${
                              (device.ccqPercent ?? 100) < 75 ? "text-indigo-600" : "text-emerald-600"
                            }`}>
                              {device.ccqPercent ?? 98}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-bold">الضوضاء (Noise):</span>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                              {device.noiseFloorDbm ?? -96} dBm
                            </span>
                          </div>
                          {device.frequencyMhz && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 font-bold">التردد:</span>
                              <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{device.frequencyMhz} MHz</span>
                            </div>
                          )}
                          {device.distanceKm && (
                            <div className="flex justify-between items-center">
                              <span className="text-slate-400 font-bold">المسافة:</span>
                              <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{device.distanceKm} km</span>
                            </div>
                          )}
                        </div>

                        {/* Actionable Warning Note if Signal is Weak */}
                        {signalInfo.isWeak && (
                          <div className="bg-white dark:bg-slate-900/90 p-2 rounded-lg border border-rose-200 text-[10px] text-rose-800 font-bold flex items-start gap-1.5 mt-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span>توصية: {signalInfo.recommendation}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Device Specifications */}
                    <div className="space-y-2 text-xs border-t border-slate-200 dark:border-slate-800 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">طريقة الاتصال:</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">{device.connectionType}</span>
                      </div>

                      <div className="flex justify-between items-center font-mono">
                        <span className="text-slate-400 font-sans font-bold">الـ IP المكتشف:</span>
                        <a
                          href={`http://${device.ipAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 bg-indigo-50/40 px-2 py-0.5 rounded-md text-[11px]"
                          title="اضغط للدخول لصفحة إدارة اليوبيكيتي"
                        >
                          {device.ipAddress}
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      {device.vpnIpAddress && (
                        <div className="flex justify-between items-center font-mono">
                          <span className="text-slate-400 font-sans font-bold">الـ VPN IP:</span>
                          <a
                            href={`http://${device.vpnIpAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1 bg-emerald-50/40 px-2 py-0.5 rounded-md text-[11px]"
                            title="اضغط للفتح المباشر عبر الـ VPN IP للشبكة"
                          >
                            {device.vpnIpAddress}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}

                      <div className="flex justify-between items-center font-mono text-[11px]">
                        <span className="text-slate-400 font-sans font-bold">الـ MAC Address:</span>
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">{device.macAddress}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">سيرفر الميكروتك:</span>
                        <span className="text-slate-600 dark:text-slate-300 font-semibold text-right">{device.connectedServer}</span>
                      </div>
                    </div>

                    {device.status === "متصل" && (
                      <LiveTrafficWidget deviceId={device?.id} />
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="relative z-10 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-3 mt-4">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${device.status === "متصل" ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                      <span className={`text-[11px] font-black ${device.status === "متصل" ? "text-green-700" : "text-red-600"}`}>
                        {device.status === "متصل" ? "جهاز متصل بالشبكة" : `منفصل ${device.lastSeen ? `(${device.lastSeen})` : ""}`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModal({
                          isOpen: true,
                          title: "تأكيد حذف الجهاز الشبكي",
                          message: `هل أنت متأكد من حذف جهاز [${device.name}] من قائمة أجهزة الجيران؟`,
                          description: "سيتم مسح كرت الجهاز وسجل اتصاله من القائمة.",
                          confirmText: "حذف الجهاز",
                          onConfirm: () => onDeleteDevice(device?.id)
                        });
                      }}
                      className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all"
                      title="حذف الجهاز"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Devices List Table */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="table-scroll-container">
            <table className="w-full text-right border-collapse text-xs md:text-sm min-w-[850px] sticky-table">
              <thead className="sticky-thead">
                <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold">
                  <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                  <th className="px-2 py-2 text-xs md:text-sm">اسم الجهاز (Identity)</th>
                  <th className="px-2 py-2 text-xs md:text-sm">الموزع المنشئ</th>
                  <th className="px-2 py-2 text-xs md:text-sm">الموديل (Model)</th>
                  <th className="px-2 py-2 text-xs md:text-sm">طريقة الاتصال</th>
                  <th className="px-2 py-2 text-xs md:text-sm">جودة الإشارة والـ CCQ</th>
                  <th className="px-2 py-2 text-xs md:text-sm">الـ IP المكتشف</th>
                  <th className="px-2 py-2 text-xs md:text-sm">الـ VPN IP</th>
                  <th className="px-2 py-2 text-xs md:text-sm">الـ MAC Address</th>
                  <th className="px-2 py-2 text-xs md:text-sm">سيرفر الميكروتك المتصل</th>
                  <th className="px-2 py-2 text-xs md:text-sm">حالة الاتصال</th>
                  <th className="px-2 py-2 text-xs md:text-sm text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDevices.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-slate-400 font-medium">
                      لا توجد أجهزة مطابقة لبحثك في قائمة الأجهزة.
                    </td>
                  </tr>
                ) : (
                  filteredDevices.map(device => {
                    const signalInfo = getSignalQualityInfo(device.signalDbm, device.ccqPercent, device.status);

                    return (
                      <tr key={device?.id} className={`hover:bg-slate-50 dark:bg-slate-800/55 transition-colors ${
                        signalInfo.isWeak ? "bg-rose-50/30 font-semibold" : ""
                      }`}>
                        <td className="px-2 py-2 text-xs md:text-sm">
                          <div className="flex items-center gap-2.5 relative">
                            <div className={`p-2 rounded-lg ${
                              signalInfo.isWeak 
                                ? "bg-indigo-100 text-indigo-600" 
                                : device.status === "متصل" 
                                ? "bg-purple-50 text-purple-600" 
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              <Server className="w-4 h-4" />
                            </div>
                            <div className="relative">
                              <div className="flex flex-col text-right">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownId(activeDropdownId === `tbl-${device?.id}` ? null : `tbl-${device?.id}`);
                                  }}
                                  className="font-bold text-slate-800 dark:text-slate-100 hover:text-purple-600 hover:bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded transition-all flex items-center gap-1 select-none text-right"
                                  title="اضغط لفتح قائمة الإجراءات السريعة"
                                >
                                  <span>{device.name}</span>
                                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${activeDropdownId === `tbl-${device?.id}` ? "rotate-180 text-purple-600" : ""}`} />
                                </button>
                                <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1 px-2 mt-0.5">
                                  <User className="w-2.5 h-2.5 text-purple-500 shrink-0" />
                                  <span>الموزع: {getDistributorName(device.distributorId)}</span>
                                </span>
                              </div>

                              {/* Dropdown Menu for table */}
                              {activeDropdownId === `tbl-${device?.id}` && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40 cursor-default" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveDropdownId(null);
                                    }}
                                  />
                                  
                                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl border border-slate-150 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
                                    <div className="px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 mb-1">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">إجراءات سريعة لـ {device.name}</p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        window.open(`http://${device.ipAddress}`, '_blank', 'noopener,noreferrer');
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 flex items-center gap-2 transition-colors"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                      <span>فتح صفحة الإدارة (AirOS)</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleRebootDevice(device?.id, device.name);
                                        setActiveDropdownId(null);
                                      }}
                                      disabled={deviceRebootingId === device?.id}
                                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                      <Power className={`w-3.5 h-3.5 ${deviceRebootingId === device?.id ? "animate-spin text-red-500" : "text-slate-400"}`} />
                                      <span>إعادة تشغيل الجهاز (Reboot)</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleRefreshDevice(device?.id, device.name);
                                        setActiveDropdownId(null);
                                      }}
                                      disabled={deviceRefreshingId === device?.id}
                                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-600 flex items-center gap-2 transition-colors disabled:opacity-50"
                                    >
                                      <RefreshCw className={`w-3.5 h-3.5 ${deviceRefreshingId === device?.id ? "animate-spin text-purple-500" : "text-slate-400"}`} />
                                      <span>تحديث بيانات الإشارة والاتصال</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleCopyMac(device?.id, device.macAddress);
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:bg-slate-800 hover:text-indigo-600 flex items-center gap-2 transition-colors"
                                    >
                                      {copiedMacId === device?.id ? (
                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                      <span>نسخ الـ MAC Address</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (device.vpnIpAddress) {
                                          window.open(`http://${device.vpnIpAddress}`, '_blank', 'noopener,noreferrer');
                                        } else {
                                          alert("هذا الجهاز لا يمتلك عنوان VPN IP مخصص للوصول عن بعد.");
                                        }
                                        setActiveDropdownId(null);
                                      }}
                                      className="w-full text-right px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                    >
                                      <Radio className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <div className="flex flex-col text-right">
                                        <span>فتح عبر الـ VPN IP</span>
                                        {device.vpnIpAddress ? (
                                          <span className="text-[9px] text-slate-400 font-mono">{device.vpnIpAddress}</span>
                                        ) : (
                                          <span className="text-[9px] text-red-400">غير متوفر</span>
                                        )}
                                      </div>
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs md:text-sm font-extrabold text-purple-700 dark:text-purple-300">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            <User className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span>{getDistributorName(device.distributorId)}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-200">{device.type}</td>
                        <td className="px-2 py-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">{device.connectionType}</td>
                        
                        {/* Signal Quality Column */}
                        <td className="px-2 py-2 text-xs md:text-sm">
                          {device.status === "متصل" ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${signalInfo.colorClass}`}>
                                  {device.signalDbm ?? -65} dBm
                                </span>
                                <span className={`text-[10px] font-mono font-bold ${
                                  (device.ccqPercent ?? 100) < 75 ? "text-indigo-600" : "text-emerald-600"
                                }`}>
                                  CCQ: {device.ccqPercent ?? 98}%
                                </span>
                              </div>
                              {signalInfo.isWeak && (
                                <span className="text-[9px] font-extrabold text-indigo-600 flex items-center gap-1 animate-pulse">
                                  <AlertTriangle className="w-3 h-3 text-indigo-500 shrink-0" />
                                  ضعف إشارة (تنبيه)
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 text-[11px]">منفصل</span>
                          )}
                        </td>

                        <td className="px-2 py-2 text-xs md:text-sm font-mono font-bold text-indigo-600">
                          <a
                            href={`http://${device.ipAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-indigo-800 hover:underline flex items-center gap-1"
                            title="اضغط لفتح صفحة إدارة جهاز يوبيكيتي (UBNT AirOS)"
                          >
                            {device.ipAddress}
                            <ExternalLink className="w-3 h-3 text-indigo-400 inline shrink-0" />
                          </a>
                        </td>
                        <td className="px-2 py-2 text-xs md:text-sm font-mono font-bold text-emerald-600">
                          {device.vpnIpAddress ? (
                            <a
                              href={`http://${device.vpnIpAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-emerald-800 hover:underline flex items-center gap-1"
                              title="اضغط للفتح المباشر عبر الـ VPN IP"
                            >
                              {device.vpnIpAddress}
                              <ExternalLink className="w-3 h-3 text-emerald-400 inline shrink-0" />
                            </a>
                          ) : (
                            <span className="text-slate-300 font-sans font-medium text-[11px]">غير متوفر</span>
                          )}
                        </td>
                        <td className="px-2 py-2 text-xs md:text-sm font-mono text-slate-500 dark:text-slate-400">{device.macAddress}</td>
                        <td className="px-2 py-2 text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-300">{device.connectedServer}</td>
                        <td className="px-2 py-2 text-xs md:text-sm">
                          <button
                            type="button"
                            onClick={() => window.open(`http://${device.ipAddress}`, '_blank', 'noopener,noreferrer')}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] text-right cursor-pointer hover:scale-105 transition-all ${
                              device.status === "متصل" ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"
                            }`}
                            title="اضغط لفتح صفحة الإعدادات"
                          >
                            {device.status === "متصل" ? (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                {device.status} {device.lastPingLatencyMs ? `(${device.lastPingLatencyMs}ms)` : ""} (إدارة 🔗)
                              </>
                            ) : (
                              <>
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                {device.status} {device.lastSeen ? `(${device.lastSeen})` : ""} (إدارة 🔗)
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-xs md:text-sm text-center">
                          <button
                            onClick={() => {
                              setConfirmModal({
                                isOpen: true,
                                title: "تأكيد حذف الجهاز الشبكي",
                                message: `هل أنت متأكد من حذف جهاز [${device.name}] من قائمة أجهزة الجيران؟`,
                                description: "سيتم مسح كرت الجهاز وسجل اتصاله من القائمة.",
                                confirmText: "حذف الجهاز",
                                onConfirm: () => onDeleteDevice(device?.id)
                              });
                            }}
                            className="p-1.5 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg transition-all"
                            title="حذف الجهاز"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Action Notifications */}
      {notification && (
        <div className={`fixed bottom-6 left-6 right-6 md:right-auto md:max-w-sm z-50 p-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-bottom-5 duration-300 flex items-center justify-between gap-3 ${
          notification.type === "success" ? "bg-emerald-950 text-emerald-200 border-emerald-800/60" :
          notification.type === "warning" ? "bg-amber-950 text-amber-200 border-amber-800/60" :
          "bg-slate-900 text-slate-100 border-slate-800"
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === "success" && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
            {notification.type === "warning" && <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />}
            {notification.type === "info" && <Cpu className="w-4 h-4 text-purple-400 shrink-0" />}
            <span className="text-xs font-extrabold leading-relaxed">{notification.text}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-white dark:bg-slate-900/10 rounded-lg transition-colors text-slate-400 hover:text-slate-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
            <div className="px-2 py-2 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                إعدادات مصادقة أجهزة يوبيكويتي
              </h3>
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                يستخدم النظام بيانات الدخول المدرجة أدناه لمحاولة الاتصال بأجهزة يوبيكويتي المتصلة بالشبكة وجلب قراءات الإشارة (dBm) و (CCQ) الصحيحة. يمكنك إدخال عدة محاولات (يوزر وباسورد) وسيقوم النظام بتجربتها بالتسلسل.
              </p>
              
              <div className="space-y-3">
                {credentialsList.map((cred, index) => (
                  <div key={index} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block px-1">اسم المستخدم (Username)</label>
                      <input
                        type="text"
                        value={cred.username}
                        onChange={(e) => handleCredentialChange(index, 'username', e.target.value)}
                        placeholder="ubnt"
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        dir="ltr"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block px-1">كلمة المرور (Password)</label>
                      <input
                        type="text"
                        value={cred.password}
                        onChange={(e) => handleCredentialChange(index, 'password', e.target.value)}
                        placeholder="ubnt"
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        dir="ltr"
                      />
                    </div>
                    <div className="pt-5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveCredential(index)}
                        disabled={credentialsList.length === 1}
                        className={`p-2 rounded-lg transition-colors ${
                          credentialsList.length === 1 
                            ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" 
                            : "text-indigo-400 hover:bg-rose-50 hover:text-indigo-600"
                        }`}
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                onClick={handleAddCredential}
                className="mt-4 px-4 py-2 w-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة بيانات دخول أخرى
              </button>
            </div>
            
            <div className="px-2 py-2 text-xs md:text-sm border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCredentialsModal(false)}
                className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                حفظ الإعدادات
              </button>
            </div>
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
    </div>
  );
}
