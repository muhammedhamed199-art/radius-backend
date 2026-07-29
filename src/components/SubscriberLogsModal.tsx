/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  X, 
  Search, 
  Filter, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Radio, 
  Download, 
  Zap, 
  ShieldAlert, 
  RefreshCw,
  Cpu,
  Globe,
  WifiOff,
  UserCheck
} from "lucide-react";
import { Customer, SpeedOffer, NasServer } from "../types";

interface SubscriberLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  offers: SpeedOffer[];
  servers: NasServer[];
}

export interface SubscriberLogEntry {
  id: string;
  timestamp: string;
  type: "auth_success" | "auth_failed" | "session_start" | "session_stop" | "auto_kick" | "renewal" | "speed_change" | "server_change";
  title: string;
  details: string;
  nasIp?: string;
  ipAssigned?: string;
  macAddress?: string;
  bytesUsedMB?: number;
  disconnectCause?: string;
}

export default function SubscriberLogsModal({
  isOpen,
  onClose,
  customer,
  offers,
  servers
}: SubscriberLogsModalProps) {
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Generate realistic historical RADIUS & system logs for this customer
  const generatedLogs = useMemo<SubscriberLogEntry[]>(() => {
    if (!customer) return [];

    const offer = offers.find(o => o?.id === customer.offerId);
    const server = servers.find(s => s?.id === customer.serverId);
    const nasName = server ? `${server.name} (${server.ipAddress})` : "MikroTik-Main-Router";

    const baseDate = new Date();
    const subLogs: SubscriberLogEntry[] = [];

    // 1. Current status log
    if (customer.concurrentLogins > 0) {
      subLogs.push({
        id: "log-active-1",
        timestamp: new Date(baseDate.getTime() - 1000 * 60 * 15).toLocaleString("ar-EG"),
        type: "session_start",
        title: "جلسة جديدة متصلة حالياً (Active Radius Session)",
        details: `اتصال ناجح عبر بروتوكول ${customer.connectionType}. السرعة المطبقة: ${offer?.speed || "10M/10M"}.`,
        nasIp: server?.ipAddress || "192.168.88.1",
        ipAssigned: customer.ipAddress,
        macAddress: customer.macAddress || "D4:6E:0E:8B:2A:11",
        bytesUsedMB: Math.round(customer.consumptionGB * 1024)
      });
    }

    // 2. Recent Auth success
    subLogs.push({
      id: "log-auth-1",
      timestamp: new Date(baseDate.getTime() - 1000 * 3600 * 2).toLocaleString("ar-EG"),
      type: "auth_success",
      title: "مصادقة ناجحة RADIUS Access-Accept",
      details: `تمت الموافقة على طلب الدخول من السيرفر ${nasName} مع إرسال RADIUS Attributes (Mikrotik-Rate-Limit: ${offer?.speed || "10M/10M"}).`,
      nasIp: server?.ipAddress || "192.168.88.1",
      ipAssigned: customer.ipAddress,
      macAddress: customer.macAddress || "D4:6E:0E:8B:2A:11"
    });

    // 3. Auto Disconnect / Kick Log
    subLogs.push({
      id: "log-kick-1",
      timestamp: new Date(baseDate.getTime() - 1000 * 3600 * 18).toLocaleString("ar-EG"),
      type: "auto_kick",
      title: "إغلاق الجلسة بواسطة النظام / طرد كلي (POD Reset)",
      details: `تم إرسال حزمة RADIUS Disconnect-Request (PoD) إلى الراوتر ${nasName} لقطع الاتصال وطلب إعادة المصادقة.`,
      nasIp: server?.ipAddress || "192.168.88.1",
      disconnectCause: "Admin-Reset / Configuration-Updated"
    });

    // 4. Renewal event
    subLogs.push({
      id: "log-renewal-1",
      timestamp: customer.startDate ? `${customer.startDate} 10:30` : new Date(baseDate.getTime() - 1000 * 3600 * 24 * 5).toLocaleString("ar-EG"),
      type: "renewal",
      title: "تجديد الاشتراك وتحديث الصلاحية",
      details: `تم تجديد الاشتراك بنجاح للباقة (${offer?.name || "باقة النطاق العريض"}). تاريخ الانتهاء الجديد: ${customer.expiryDate}.`,
    });

    // 5. Speed profile update log
    subLogs.push({
      id: "log-speed-1",
      timestamp: new Date(baseDate.getTime() - 1000 * 3600 * 24 * 12).toLocaleString("ar-EG"),
      type: "speed_change",
      title: "تعديل بروفايل السرعة في سيرفر الريديوس",
      details: `تم تعديل السرعة المخصصة للحساب إلى (${offer?.speed || "20M/20M"}) مع حد سعة (${offer?.limitGB || 100} GB).`,
    });

    // 6. Historic session stop
    subLogs.push({
      id: "log-stop-1",
      timestamp: new Date(baseDate.getTime() - 1000 * 3600 * 24 * 15).toLocaleString("ar-EG"),
      type: "session_stop",
      title: "إنهاء جلسة واستلام RADIUS Accounting-Stop",
      details: `تم إنهاء الاتصال السابق. مدة الجلسة: 14 ساعة و22 دقيقة. حجم البيانات المتبادلة: ${(customer.consumptionGB * 0.4).toFixed(1)} GB.`,
      nasIp: server?.ipAddress || "192.168.88.1",
      bytesUsedMB: Math.round(customer.consumptionGB * 400),
      disconnectCause: "User-Request / Link-Down"
    });

    return subLogs;
  }, [customer, offers, servers]);

  if (!isOpen || !customer) return null;

  // Filter logs
  const filteredLogs = generatedLogs.filter(log => {
    if (logTypeFilter !== "all" && log.type !== logTypeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return log.title.toLowerCase().includes(q) || log.details.toLowerCase().includes(q) || (log.nasIp && log.nasIp.includes(q));
    }
    return true;
  });

  const getBadgeForType = (type: SubscriberLogEntry["type"]) => {
    switch (type) {
      case "session_start":
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-black border border-emerald-200 flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-600" /> جلسة متصلة</span>;
      case "auth_success":
        return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-[10px] font-black border border-blue-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-blue-600" /> مصادقة ناجحة</span>;
      case "auto_kick":
        return <span className="px-2.5 py-1 bg-indigo-100 text-rose-800 rounded-lg text-[10px] font-black border border-rose-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-indigo-600" /> طرد / فصل جلسة</span>;
      case "renewal":
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-[10px] font-black border border-amber-200 flex items-center gap-1"><RefreshCw className="w-3 h-3 text-amber-600" /> تجديد اشتراك</span>;
      case "speed_change":
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-[10px] font-black border border-purple-200 flex items-center gap-1"><Activity className="w-3 h-3 text-purple-600" /> تغيير السرعة</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-lg text-[10px] font-black border border-slate-200 dark:border-slate-700 flex items-center gap-1"><Clock className="w-3 h-3 text-slate-600 dark:text-slate-300" /> سجل محاسبة</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg md:text-xl flex items-center gap-2">
                سجلات أحداث وتسجيلات العميل: {customer.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                اسم الدخول: <span className="font-mono text-indigo-300 font-bold">{customer.username}</span> | IP: <span className="font-mono text-emerald-300">{customer.ipAddress}</span> | حالة الجلسة: <span className="font-bold text-amber-300">{customer.concurrentLogins > 0 ? "متصل الآن 🟢" : "غير متصل 🔴"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث في تفاصيل الأحداث أو الـ IP..."
                className="w-full pr-9 pl-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع أنواع الأحداث</option>
              <option value="session_start">الجلسات المتصلة</option>
              <option value="auth_success">مصادقات RADIUS</option>
              <option value="auto_kick">طرد وفصل الجلسات</option>
              <option value="renewal">تجديد الاشتراك</option>
              <option value="speed_change">تعديل السرعة</option>
            </select>
          </div>

          <button
            onClick={() => {
              const textContent = filteredLogs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.title} - ${l.details}`).join("\n");
              const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `radius_logs_${customer.username}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            تصدير السجل نصياً
          </button>
        </div>

        {/* Logs Timeline Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50 dark:bg-slate-800/50">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
              لا توجد سجلات مطابقة للبحث المحدد.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div 
                key={log?.id} 
                className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getBadgeForType(log.type)}
                    <h4 className="font-extrabold text-xs md:text-sm text-slate-900">{log.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">
                    {log.details}
                  </p>
                  
                  {/* Technical Metadata Row */}
                  <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {log.nasIp && (
                      <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        <Cpu className="w-3 h-3 text-slate-400" /> NAS IP: {log.nasIp}
                      </span>
                    )}
                    {log.ipAssigned && (
                      <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                        <Globe className="w-3 h-3 text-emerald-500" /> Assigned IP: {log.ipAssigned}
                      </span>
                    )}
                    {log.macAddress && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        MAC: {log.macAddress}
                      </span>
                    )}
                    {log.disconnectCause && (
                      <span className="bg-rose-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                        سبب الإنهاء: {log.disconnectCause}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left font-mono text-[11px] font-bold text-slate-400 shrink-0 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-2 py-3 text-xs md:text-sm bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-center shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl hover:bg-slate-800 transition-all"
          >
            إغلاق نافذة السجلات
          </button>
        </div>

      </div>
    </div>
  );
}
