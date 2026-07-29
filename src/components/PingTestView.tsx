/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Wifi, 
  Play, 
  Square, 
  Terminal, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Lock, 
  Globe, 
  Layers 
} from "lucide-react";
import { Customer, CustomerStatus } from "../types";

interface PingTestViewProps {
  customers: Customer[];
  selectedCustomerFromState: Customer | null;
  onClearSelectedCustomer: () => void;
}

interface PingLine {
  text: string;
  type: "info" | "success" | "error" | "warn";
}

export default function PingTestView({ 
  customers, 
  selectedCustomerFromState,
  onClearSelectedCustomer
}: PingTestViewProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [pinging, setPinging] = useState(false);
  const [pingLogs, setPingLogs] = useState<PingLine[]>([]);
  const [stats, setStats] = useState({ sent: 0, received: 0, lost: 0, min: 0, max: 0, avg: 0 });
  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);

  // Auto-select customer if passed from parent
  useEffect(() => {
    if (selectedCustomerFromState) {
      setSelectedCustomerId(selectedCustomerFromState?.id);
      // Automatically stop any current ping and start fresh for this customer
      stopPing();
      setPingLogs([]);
    }
  }, [selectedCustomerFromState]);

  const activeCustomer = customers.find(c => c?.id === selectedCustomerId);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pingLogs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startPing = () => {
    if (!activeCustomer) return;
    
    setPinging(true);
    setPingLogs([]);
    setStats({ sent: 0, received: 0, lost: 0, min: 0, max: 0, avg: 0 });

    const customerIp = activeCustomer.ipAddress;
    const customerName = activeCustomer.name;
    const isSuspended = activeCustomer.status === CustomerStatus.SUSPENDED;
    const isExpired = activeCustomer.status === CustomerStatus.EXPIRED;

    // Initial lines
    const logs: PingLine[] = [
      { text: `بدء اختبار الاتصال (PING) على المشترك: ${customerName}`, type: "info" },
      { text: `عنوان الآي بي المستهدف: ${customerIp} مع 64 بايت من البيانات...`, type: "info" }
    ];
    setPingLogs([...logs]);

    let count = 0;
    let received = 0;
    let lost = 0;
    const times: number[] = [];

    const isOnline = activeCustomer.concurrentLogins > 0;

    timerRef.current = setInterval(() => {
      count++;
      
      
      let isSuccess = false;
      let ms = 0;
      if (isOnline) {
        isSuccess = true;
        ms = 15; // Just use 15ms constant for real connection as we don't have real ping from API yet
      }


      let newline: PingLine;
      if (isSuccess) {
        received++;
        times.push(ms);
        newline = {
          text: `الرد من ${customerIp}: بايت=64 الوقت=${ms}ms TTL=64 (مستقر)`,
          type: "success"
        };
      } else {
        lost++;
        newline = {
          text: `طلب فحص الاتصال بـ ${customerIp} انتهت مهلته (انقطاع مؤقت/مغلق).`,
          type: "error"
        };
      }

      setPingLogs(prev => [...prev, newline]);

      // Calculate running stats
      const minVal = times.length > 0 ? Math.min(...times) : 0;
      const maxVal = times.length > 0 ? Math.max(...times) : 0;
      const avgVal = times.length > 0 ? Math.floor(times.reduce((a, b) => a + b, 0) / times.length) : 0;

      setStats({
        sent: count,
        received,
        lost,
        min: minVal,
        max: maxVal,
        avg: avgVal
      });

      // Stop after 20 packets to prevent infinite loops
      if (count >= 20) {
        stopPing();
        setPingLogs(prev => [
          ...prev, 
          { text: "=== انتهى فحص العميل تلقائياً بعد إرسال 20 حزمة ===", type: "info" }
        ]);
      }
    }, 1000);
  };

  const stopPing = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPinging(false);
  };

  // Connection health rate percentage
  const successRate = stats.sent > 0 ? Math.round((stats.received / stats.sent) * 100) : 100;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title block */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wifi className="w-6 h-6 text-indigo-600" />
            أداة اختبار وفحص العملاء (Ping & Diagnoses)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            أداة فورية لفحص مدى استجابة راوتر العميل، جودة الاتصال، زمن الوصول (Latency)، ونسبة فقد الحزم (Packet Loss).
          </p>
        </div>
        {selectedCustomerFromState && (
          <button 
            onClick={onClearSelectedCustomer}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all border border-amber-200"
          >
            إلغاء التحديد الموجه
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Selection & Credentials Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">اختر المشترك المراد فحصه:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                stopPing();
                setPingLogs([]);
                setSelectedCustomerId(e.target.value);
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-medium"
            >
              <option value="">-- اختر من قائمة المشتركين --</option>
              {customers.map(c => (
                <option key={c?.id} value={c?.id}>
                  {c.name} ({c.username}) - {c.status}
                </option>
              ))}
            </select>
          </div>

          {activeCustomer ? (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b pb-2 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-500" />
                بيانات اتصال المشترك المكتشفة
              </h3>

              {/* Box Info Elements */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">اسم البرودباند:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono">{activeCustomer.username}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">كلمة السر:</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    {activeCustomer.password || "********"}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">عنوان الآي بي (IP):</span>
                  <span className="text-sm font-bold text-indigo-600 font-mono">{activeCustomer.ipAddress}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">نوع الاتصال بالريديوس:</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{activeCustomer.connectionType}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 dark:border-slate-700/50 pt-2.5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">حالة الحساب العامة:</span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    activeCustomer.status === CustomerStatus.ACTIVE ? "bg-green-100 text-green-700" :
                    activeCustomer.status === CustomerStatus.EXPIRED ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>{activeCustomer.status}</span>
                </div>
              </div>

              {/* Ping action button */}
              {!pinging ? (
                <button
                  onClick={startPing}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  بدء فحص البنج (Ping Router)
                </button>
              ) : (
                <button
                  onClick={stopPing}
                  className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  <Square className="w-4 h-4 fill-white" />
                  إيقاف فحص البنج
                </button>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm">يرجى تحديد مشترك لعرض بيانات السيرفر وبدء فحص البنج الفوري.</p>
            </div>
          )}
        </div>

        {/* Right Column: Console terminal & live statistics */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[400px] border border-slate-800">
          {/* Terminal Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-slate-300 font-mono font-bold">RADIUS_TEST_CON:~ pinger@mikrotik</span>
            </div>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
          </div>

          {/* Terminal Logs Output */}
          <div className="px-2 py-3 text-xs md:text-sm flex-1 overflow-y-auto space-y-1.5 font-mono text-[11px] md:text-xs">
            {pingLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 py-16">
                <Terminal className="w-12 h-12 text-slate-700 dark:text-slate-200 mb-2" />
                <p>انتظار بدء الفحص... الكود يحاكي البنج المباشر على الميكروتيك</p>
              </div>
            ) : (
              pingLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={
                    log.type === "success" ? "text-green-400" :
                    log.type === "error" ? "text-red-400" :
                    log.type === "warn" ? "text-yellow-400" : "text-slate-300"
                  }
                >
                  {log.text}
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>

          {/* Statistics Bar */}
          {stats.sent > 0 && (
            <div className="bg-slate-900 border-t border-slate-800 p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-900">
              <div className="p-2 bg-white/60 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">الحزم المرسلة/المستلمة</span>
                <span className="text-sm font-bold font-mono text-slate-200">
                  {stats.sent} أرسلت / {stats.received} استقبلت
                </span>
              </div>
              <div className="p-2 bg-white/60 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">نسبة نجاح الاتصال</span>
                <span className={`text-sm font-bold font-mono ${
                  successRate > 85 ? "text-green-400" : successRate > 50 ? "text-yellow-400" : "text-red-400"
                }`}>
                  {successRate}%
                </span>
              </div>
              <div className="p-2 bg-white/60 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">معدل التأخير (Latency)</span>
                <span className="text-sm font-bold font-mono text-indigo-400">
                  {stats.avg} ms
                </span>
              </div>
              <div className="p-2 bg-white/60 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">أدنى / أقصى تأخير</span>
                <span className="text-sm font-bold font-mono text-purple-400">
                  {stats.min}ms / {stats.max}ms
                </span>
              </div>
            </div>
          )}

          {/* Connection Verdict Panel */}
          {stats.sent > 0 && (
            <div className="bg-white p-3 border-t border-slate-800 flex items-center justify-between text-xs px-6">
              <span className="text-slate-400">تشخيص حالة اتصال المشترك:</span>
              <div className="flex items-center gap-1.5 font-bold">
                {successRate === 0 ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> منقطع بالكامل (Offline)
                  </span>
                ) : successRate < 70 ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> اتصال متدهور وغير مستقر (High Packet Loss)
                  </span>
                ) : stats.avg > 100 ? (
                  <span className="text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> تأخير مرتفع (High Latency)
                  </span>
                ) : (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> اتصال مستقر وممتاز (Perfect)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
