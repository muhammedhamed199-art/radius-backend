/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from "react";
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  Filter, 
  Search, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Database, 
  Users, 
  SlidersHorizontal,
  Calendar,
  Sparkles,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { Customer, SpeedOffer, CustomerStatus, ConnectionType } from "../types";

interface ConsumptionReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  offers: SpeedOffer[];
}

export default function ConsumptionReportPdfModal({
  isOpen,
  onClose,
  customers,
  offers
}: ConsumptionReportPdfModalProps) {
  // Filters State
  const [selectedOfferId, setSelectedOfferId] = useState<string>("all");
  const [selectedConnectionType, setSelectedConnectionType] = useState<string>("all");
  const [consumptionAlertFilter, setConsumptionAlertFilter] = useState<string>("all"); // "all" | "near_limit" | "exceeded" | "normal"
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"consumption_desc" | "ratio_desc" | "name_asc">("consumption_desc");
  const [pdfOrientation, setPdfOrientation] = useState<"landscape" | "portrait">("landscape");

  const printRef = useRef<HTMLDivElement>(null);

  // Filter and Sort Customers Data
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const offer = offers.find(o => o?.id === customer.offerId);
      
      // 1. Offer filter
      if (selectedOfferId !== "all" && customer.offerId !== selectedOfferId) {
        return false;
      }

      // 2. Connection Type filter
      if (selectedConnectionType !== "all" && customer.connectionType !== selectedConnectionType) {
        return false;
      }

      // 3. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = customer.name.toLowerCase().includes(q);
        const matchesUsername = customer.username.toLowerCase().includes(q);
        const matchesPhone = customer.phone?.toLowerCase().includes(q);
        if (!matchesName && !matchesUsername && !matchesPhone) return false;
      }

      // 4. Consumption alert level filter
      if (consumptionAlertFilter !== "all" && offer) {
        const limitGB = offer.isUnlimitedQuota ? 0 : (offer.limitGB || 0);
        const ratio = limitGB > 0 ? (customer.consumptionGB / limitGB) * 100 : 0;

        if (consumptionAlertFilter === "exceeded" && ratio < 100) return false;
        if (consumptionAlertFilter === "near_limit" && (ratio < 80 || ratio >= 100)) return false;
        if (consumptionAlertFilter === "normal" && ratio >= 80) return false;
      }

      return true;
    }).sort((a, b) => {
      const offerA = offers.find(o => o?.id === a.offerId);
      const offerB = offers.find(o => o?.id === b.offerId);
      
      const limitA = offerA?.isUnlimitedQuota ? 0 : (offerA?.limitGB || 0);
      const limitB = offerB?.isUnlimitedQuota ? 0 : (offerB?.limitGB || 0);

      const ratioA = limitA > 0 ? (a.consumptionGB / limitA) * 100 : 0;
      const ratioB = limitB > 0 ? (b.consumptionGB / limitB) * 100 : 0;

      if (sortBy === "consumption_desc") {
        return b.consumptionGB - a.consumptionGB;
      } else if (sortBy === "ratio_desc") {
        return ratioB - ratioA;
      } else {
        return a.name.localeCompare(b.name, "ar");
      }
    });
  }, [customers, offers, selectedOfferId, selectedConnectionType, consumptionAlertFilter, searchQuery, sortBy]);

  // Overall Statistics for report
  const stats = useMemo(() => {
    const totalCount = filteredCustomers.length;
    const totalConsumedGB = filteredCustomers.reduce((acc, c) => acc + c.consumptionGB, 0);
    
    let totalAllocatedGB = 0;
    let exceededCount = 0;
    let nearLimitCount = 0;

    filteredCustomers.forEach(c => {
      const offer = offers.find(o => o?.id === c.offerId);
      if (offer && !offer.isUnlimitedQuota && offer.limitGB) {
        totalAllocatedGB += offer.limitGB;
        const ratio = (c.consumptionGB / offer.limitGB) * 100;
        if (ratio >= 100) exceededCount++;
        else if (ratio >= 80) nearLimitCount++;
      }
    });

    const averageConsumedGB = totalCount > 0 ? (totalConsumedGB / totalCount).toFixed(1) : "0";

    return {
      totalCount,
      totalConsumedGB: totalConsumedGB.toFixed(1),
      totalAllocatedGB: totalAllocatedGB > 0 ? totalAllocatedGB.toFixed(0) : "غير محدود",
      averageConsumedGB,
      exceededCount,
      nearLimitCount
    };
  }, [filteredCustomers, offers]);

  if (!isOpen) return null;

  // Direct Browser Window Print handler for perfect PDF saving
  const handlePrintPdf = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      alert("⚠️ يرجى السماح بالنوافذ المنبثقة (Popups) لطباعة أو حفظ تقرير PDF.");
      return;
    }

    const todayStr = new Date().toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير استهلاك بيانات المشتركين - ${new Date().toISOString().split("T")[0]}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            background-color: #ffffff;
            color: #0f172a;
            margin: 0;
            padding: 20px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 ${pdfOrientation};
            margin: 12mm;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 8px 10px;
            font-size: 11px;
            text-align: right;
          }
          th {
            background-color: #f8fafc !important;
            color: #1e293b !important;
            font-weight: 800;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .no-print {
            display: none !important;
          }
        </style>
      </head>
      <body>
        <div className="max-w-full mx-auto">
          ${printContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Download printable HTML report
  const handleDownloadHtmlReport = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;

    const htmlString = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير استهلاك المشتركين PDF</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
          body { font-family: 'Cairo', sans-serif; padding: 20px; background: #f8fafc; }
        </style>
      </head>
      <body>
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          ${printContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlString], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscriber_consumption_report_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Toolbar Header */}
        <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg md:text-xl flex items-center gap-2">
                مولد تقارير استهلاك البيانات التفصيلي (PDF Consumption Report)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد تقرير رسمي جاهز للطباعة أو التصدير لـ PDF يوضح استهلاك كل مشترك مقابل سعة الباقات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPdf}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/30"
            >
              <Printer className="w-4 h-4" />
              طباعة / حفظ كـ PDF 🖨️
            </button>

            <button
              onClick={handleDownloadHtmlReport}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 border border-slate-700"
              title="تنزيل نسخة مستند تقرير كاملة"
            >
              <Download className="w-4 h-4" />
              تنزيل HTML
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar (Filters & Customizations) */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-4 border-b border-slate-200 dark:border-slate-700 shrink-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالاسم أو اسم الدخول..."
              className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Offer Filter */}
          <div>
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع الباقات والعروض</option>
              {offers.map(o => (
                <option key={o?.id} value={o?.id}>{o.name} ({o.speed})</option>
              ))}
            </select>
          </div>

          {/* Consumption Alert Filter */}
          <div>
            <select
              value={consumptionAlertFilter}
              onChange={(e) => setConsumptionAlertFilter(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="all">جميع مستويات الاستهلاك</option>
              <option value="exceeded">🔴 تجاوزوا السعة (100%+)</option>
              <option value="near_limit">🟡 قاربوا على النفاد (80% - 99%)</option>
              <option value="normal">🟢 استهلاك طبيعي (&lt; 80%)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
            >
              <option value="consumption_desc">الترتيب حسب الأعلى استهلاكاً (GB)</option>
              <option value="ratio_desc">الترتيب حسب نسبة استهلاك الباقة (%)</option>
              <option value="name_asc">الترتيب أبدياً بحسب الاسم</option>
            </select>
          </div>

          {/* Page Layout Orientation */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setPdfOrientation("landscape")}
              className={`flex-1 py-1 px-2 text-[11px] font-extrabold rounded-lg transition-all ${
                pdfOrientation === "landscape" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              أفقي Landscape
            </button>
            <button
              onClick={() => setPdfOrientation("portrait")}
              className={`flex-1 py-1 px-2 text-[11px] font-extrabold rounded-lg transition-all ${
                pdfOrientation === "portrait" ? "bg-indigo-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              عمودي Portrait
            </button>
          </div>

        </div>

        {/* Printable Live PDF Preview Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-100/70 dark:bg-white">
          <div 
            ref={printRef}
            className="bg-white p-8 md:p-10 rounded-2xl shadow-md border border-slate-200 max-w-full mx-auto space-y-6 text-slate-800"
          >
            {/* REPORT DOCUMENT HEADER */}
            <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 text-indigo-700 font-black text-xs tracking-wide uppercase mb-1">
                  <Database className="w-4 h-4" />
                  RADIUS NETWORK MANAGEMENT SYSTEM
                </div>
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  تقرير استهلاك بيانات المشتركين التفصيلي
                </h1>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  رصد دقيق لكميات البيانات المستهلكة (GB) مقارنة بسعة وسقف الباقة المخصصة لكل حساب
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-right text-xs space-y-1 min-w-[200px]">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400 font-bold">رقم التقرير:</span>
                  <span className="font-bold text-slate-800">REP-{new Date().getFullYear()}-{(Math.random() * 8999 + 1000).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400 font-bold">تاريخ الاصدار:</span>
                  <span className="font-bold text-slate-800">{new Date().toISOString().split("T")[0]}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-400 font-bold">وقت التقرير:</span>
                  <span className="font-bold text-slate-800">{new Date().toLocaleTimeString("ar-EG")}</span>
                </div>
              </div>
            </div>

            {/* STATS SUMMARY CARDS INSIDE PDF */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                <span className="block text-[10px] font-bold text-slate-500">إجمالي المشتركين</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">{stats.totalCount}</span>
              </div>

              <div className="bg-orange-50 p-3 rounded-xl border border-orange-200/70 text-center">
                <span className="block text-[10px] font-bold text-orange-700">الاستهلاك الكلي</span>
                <span className="text-base font-extrabold text-orange-900 font-mono">{stats.totalConsumedGB} GB</span>
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200/70 text-center">
                <span className="block text-[10px] font-bold text-indigo-700">السعة المحددة المخصصة</span>
                <span className="text-base font-extrabold text-indigo-900 font-mono">{stats.totalAllocatedGB} {typeof stats.totalAllocatedGB === "number" ? "GB" : ""}</span>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/70 text-center">
                <span className="block text-[10px] font-bold text-amber-700">اقتربوا من النفاد (&gt;80%)</span>
                <span className="text-base font-extrabold text-amber-800 font-mono">{stats.nearLimitCount} مشترك</span>
              </div>

              <div className="bg-rose-50 p-3 rounded-xl border border-rose-200/70 text-center col-span-2 md:col-span-1">
                <span className="block text-[10px] font-bold text-indigo-700">تجاوزوا الباقة (&gt;100%)</span>
                <span className="text-base font-extrabold text-rose-900 font-mono">{stats.exceededCount} مشترك</span>
              </div>
            </div>

            {/* DETAILED CONSUMPTION TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden table-scroll-container">
              <table className="w-full text-right border-collapse min-w-[850px] sticky-table">
                <thead className="sticky-thead">
                  <tr className="bg-slate-900 text-white text-[11px] font-black">
                    <th className="p-2.5 w-8 text-center border-l border-slate-800">#</th>
                    <th className="p-2.5 border-l border-slate-800">اسم المشترك / الحساب</th>
                    <th className="p-2.5 border-l border-slate-800">نوع الاتصال</th>
                    <th className="p-2.5 border-l border-slate-800">الباقة والسرعة المحددة</th>
                    <th className="p-2.5 border-l border-slate-800 text-center">سعة الباقة</th>
                    <th className="p-2.5 border-l border-slate-800 text-center">البيانات المستهلكة</th>
                    <th className="p-2.5 border-l border-slate-800 text-center">نسبة الاستهلاك</th>
                    <th className="p-2.5 border-l border-slate-800 text-center">المتبقي من الباقة</th>
                    <th className="p-2.5 text-center">حالة الاشتراك</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد بيانات مطابقة لمعايير الفرز المحددة.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, idx) => {
                      const offer = offers.find(o => o?.id === customer.offerId);
                      const isUnlimited = offer?.isUnlimitedQuota || !offer?.limitGB;
                      const limitGB = offer?.limitGB || 0;
                      const consumedGB = customer.consumptionGB || 0;
                      
                      const ratio = isUnlimited || limitGB === 0 ? 0 : Math.round((consumedGB / limitGB) * 100);
                      const remainingGB = isUnlimited ? "غير محدود" : Math.max(0, limitGB - consumedGB).toFixed(1);

                      let badgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
                      let barColor = "bg-emerald-500";
                      let statusLabel = "طبيعي";

                      if (!isUnlimited) {
                        if (ratio >= 100) {
                          badgeBg = "bg-rose-50 text-rose-800 border-rose-200 font-bold";
                          barColor = "bg-indigo-600";
                          statusLabel = "تجاوز الباقة ⚠️";
                        } else if (ratio >= 80) {
                          badgeBg = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
                          barColor = "bg-amber-500";
                          statusLabel = "وشك النفاد 🟡";
                        }
                      }

                      return (
                        <tr key={customer?.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                          <td className="p-2.5 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          
                          <td className="p-2.5 font-bold text-slate-900">
                            <div>{customer.name}</div>
                            <div className="text-[10px] font-mono text-indigo-600 font-semibold">{customer.username}</div>
                          </td>

                          <td className="p-2.5 text-slate-600 text-[11px] font-semibold">
                            {customer.connectionType}
                          </td>

                          <td className="p-2.5 font-bold text-slate-800">
                            <div>{offer?.name || "باقة غير معروفة"}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{offer?.speed || "—"}</div>
                          </td>

                          <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                            {isUnlimited ? "غير محدود" : `${limitGB} GB`}
                          </td>

                          <td className="p-2.5 text-center font-mono font-black text-slate-900 bg-orange-50/40">
                            {consumedGB.toFixed(1)} GB
                          </td>

                          <td className="p-2.5 text-center">
                            {isUnlimited ? (
                              <span className="text-[10px] font-bold text-slate-400">مفتوح</span>
                            ) : (
                              <div className="space-y-1 max-w-[100px] mx-auto">
                                <div className="flex justify-between text-[10px] font-mono font-bold">
                                  <span>{ratio}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                  <div 
                                    style={{ width: `${Math.min(100, ratio)}%` }} 
                                    className={`h-full rounded-full ${barColor}`} 
                                  />
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                            {isUnlimited ? "∞" : `${remainingGB} GB`}
                          </td>

                          <td className="p-2.5 text-center">
                            <span className={`px-2 py-1 rounded-lg border text-[10px] inline-block ${badgeBg}`}>
                              {isUnlimited ? customer.status : statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* REPORT FOOTER & STAMP SECTION */}
            <div className="pt-8 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs font-bold text-slate-600">
              <div className="space-y-8">
                <span className="block text-slate-400 text-[11px]">مسؤول قسم الريديوس والدعم:</span>
                <div className="border-b border-dashed border-slate-300 w-32 mx-auto"></div>
                <span className="block text-[10px] text-slate-400">التوقيع / Verification</span>
              </div>

              <div className="space-y-8">
                <span className="block text-slate-400 text-[11px]">ختم إدارة الشبكة:</span>
                <div className="w-16 h-16 rounded-full border-2 border-slate-300 border-dashed mx-auto flex items-center justify-center text-[9px] text-slate-400 font-mono">
                  SEAL / STAMP
                </div>
              </div>

              <div className="space-y-8">
                <span className="block text-slate-400 text-[11px]">اعتماد المدير العام:</span>
                <div className="border-b border-dashed border-slate-300 w-32 mx-auto"></div>
                <span className="block text-[10px] text-slate-400">Approved</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
