/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Cpu, 
  Database, 
  ArrowUpRight, 
  UserCheck, 
  Award,
  FileText,
  Printer,
  Coins,
  Calculator,
  DollarSign,
  ArrowRightLeft,
  Sparkles
} from "lucide-react";
import { Customer, SpeedOffer, Currency, Distributor } from "../types";
import { DEFAULT_CURRENCIES } from "../utils/constants";
import ConsumptionReportPdfModal from "./ConsumptionReportPdfModal";

interface StatsViewProps {
  customers: Customer[];
  offers: SpeedOffer[];
  currencies?: Currency[];
  defaultCurrency?: string;
  distributors?: Distributor[];
}

export default function StatsView({
  customers,
  offers,
  currencies = DEFAULT_CURRENCIES,
  defaultCurrency = "LYD",
  distributors = []
}: StatsViewProps) {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [showPdfReportModal, setShowPdfReportModal] = useState<boolean>(false);

  // Live Currency Converter State in Subscriber Statistics Interface
  const [convertAmount, setConvertAmount] = useState<number>(100);
  const [fromCurrCode, setFromCurrCode] = useState<string>("USD");
  const [toCurrCode, setToCurrCode] = useState<string>("LYD");

  // Overview Target Currency Filter State
  const [targetRevenueCurr, setTargetRevenueCurr] = useState<string>(defaultCurrency);

  const convertVal = (amt: number, fromCode: string, toCode: string): number => {
    if (!amt || amt <= 0 || fromCode === toCode) return amt;
    const f = currencies.find(c => c.code === fromCode);
    const t = currencies.find(c => c.code === toCode);
    if (!f || !t || f.exchangeRate <= 0 || t.exchangeRate <= 0) return amt;
    return (amt / f.exchangeRate) * t.exchangeRate;
  };

  // Swap currencies helper
  const handleSwapCurrencies = () => {
    setFromCurrCode(toCurrCode);
    setToCurrCode(fromCurrCode);
  };

  // Calculate Total Subscriber Revenue in target currency
  const totalSubscribersRevenue = customers.reduce((acc, cust) => {
    const offer = offers.find(o => o?.id === cust.offerId);
    if (!offer || !offer.price) return acc;
    const offerCurr = offer.currency || defaultCurrency;
    const convertedPrice = convertVal(offer.price, offerCurr, targetRevenueCurr);
    return acc + convertedPrice;
  }, 0);

  // Calculate Total Distributor Balances in target currency
  const totalDistributorBalances = distributors.reduce((acc, dist) => {
    const distCurr = dist.currency || defaultCurrency;
    const convertedBal = convertVal(dist.balance, distCurr, targetRevenueCurr);
    return acc + convertedBal;
  }, 0);

  // 1. Calculate Top 5 Customers by Consumption
  const top5Customers = [...customers]
    .sort((a, b) => b.consumptionGB - a.consumptionGB)
    .slice(0, 5);

  const maxConsumption = top5Customers.length > 0 ? top5Customers[0].consumptionGB : 1;

  // 2. Package Distribution Count
  const packageStats = offers.map(offer => {
    const count = customers.filter(c => c.offerId === offer?.id).length;
    return {
      name: offer.name,
      speed: offer.speed,
      count
    };
  });

  const maxPackageCount = Math.max(...packageStats.map(p => p.count), 1);

  // 3. Overall server general calculations
  const totalSubscribers = customers.length;
  const activeSubs = customers.filter(c => c.status === "نشط").length;
  const totalTrafficGB = customers.reduce((acc, c) => acc + c.consumptionGB, 0);
  const averageTrafficGB = totalSubscribers > 0 ? (totalTrafficGB / totalSubscribers).toFixed(1) : "0";

  // 4. Simulated hourly peak bandwidth chart data (24 Hours representation)
  // Let's generate a list of 12 timestamps (every 2 hours) with simulated Mbps rates
  const hourlyTraffic = [
    { hour: "12 AM", rate: 45 },
    { hour: "2 AM", rate: 20 },
    { hour: "4 AM", rate: 12 },
    { hour: "6 AM", rate: 18 },
    { hour: "8 AM", rate: 55 },
    { hour: "10 AM", rate: 85 },
    { hour: "12 PM", rate: 95 },
    { hour: "2 PM", rate: 110 },
    { hour: "4 PM", rate: 130 },
    { hour: "6 PM", rate: 175 }, // Peak
    { hour: "8 PM", rate: 210 }, // Highest Peak
    { hour: "10 PM", rate: 190 }
  ];

  const maxHourlyRate = Math.max(...hourlyTraffic.map(t => t.rate), 1);

  // 5. Distributor Rankings (Current Month)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const distributorRankings = distributors.map(dist => {
    const distCustomers = customers.filter(c => c.distributorId === dist?.id);
    
    let currentMonthSubCount = 0;
    
    const currentMonthFinancialAmount = distCustomers.reduce((acc, c) => {
      const matchedReceiptsThisMonth = (c.archivedReceipts || [])
        .filter(r => {
          const d = new Date(r.date);
          return r.status === "matched" && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
      
      currentMonthSubCount += matchedReceiptsThisMonth.length;
      return acc + matchedReceiptsThisMonth.reduce((sum, r) => sum + r.amount, 0);
    }, 0);

    return {
      distributor: dist,
      subCount: currentMonthSubCount,
      totalFinancialAmount: currentMonthFinancialAmount
    };
  }).sort((a, b) => b.totalFinancialAmount - a.totalFinancialAmount);

  const exportDistributorReport = () => {
    const headers = ["الموزع", "اسم المستخدم", "عدد الاشتراكات المقبولة (الشهر الحالي)", "إجمالي المبالغ المقبولة (الشهر الحالي)"];
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n"
      + distributorRankings.map(d => `${d.distributor.name},${d.distributor.username},${d.subCount},${d.totalFinancialAmount}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_الموزعين_${currentMonth + 1}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Title block */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-500" />
            لوحة التقارير البيانية والإحصائيات
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            رصد إحصائي فوري لأعلى مستخدمي الشبكة استهلاكاً، معدلات النطاق العريض الإجمالية، وتوزيع المشتركين على العروض وسرعات السيرفر.
          </p>
        </div>

        <button
          onClick={() => setShowPdfReportModal(true)}
          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold text-xs rounded-2xl transition-all flex items-center gap-2.5 shadow-lg shadow-slate-900/20 shrink-0 border border-slate-800 dark:border-slate-700"
        >
          <FileText className="w-4 h-4 text-orange-400" />
          توليد تقرير استهلاك المشتركين (PDF) 📄
        </button>
      </div>

      {/* Real-time Currency Converter & Financial Stats Widget */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Coins className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-extrabold text-base md:text-lg text-slate-900 flex items-center gap-2">
                أداة تحويل العملات اللحظية والتحليل المالي للمشتركين
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              محاسبة فورية وإيرادات رقمية محولة لحظياً حسب أسعار الصرف المحددة بالربط التلقائي.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/60 shrink-0">
            <span className="text-xs text-slate-300 font-bold px-2">عرض التقارير المالية بـ:</span>
            <select
              value={targetRevenueCurr}
              onChange={(e) => setTargetRevenueCurr(e.target.value)}
              className="bg-amber-500 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl border-none focus:outline-none cursor-pointer"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.symbol}) - {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Summary Cards converted to Target Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">إجمالي مبيعات باقات المشتركين:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {totalSubscribersRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-amber-300">
                {currencies.find(c => c.code === targetRevenueCurr)?.symbol || targetRevenueCurr}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              (محسوبة ديناميكياً لكافة المشتركين)
            </span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 space-y-1">
            <span className="text-[11px] text-slate-400 font-bold block">إجمالي أرصدة شبكة الموزعين:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-sky-400 font-mono">
                {totalDistributorBalances.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-amber-300">
                {currencies.find(c => c.code === targetRevenueCurr)?.symbol || targetRevenueCurr}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 block font-mono">
              (محسوبة لكافة محافظ الموزعين)
            </span>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 p-4 rounded-2xl border border-indigo-700/50 space-y-1">
            <span className="text-[11px] text-indigo-200 font-bold block">إجمالي الحجم المالي للشبكة:</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-amber-400 font-mono">
                {(totalSubscribersRevenue + totalDistributorBalances).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold text-slate-900">
                {currencies.find(c => c.code === targetRevenueCurr)?.symbol || targetRevenueCurr}
              </span>
            </div>
            <span className="text-[10px] text-indigo-300/70 block font-mono">
              (السيولة الإجمالية للباقات والأرصدة)
            </span>
          </div>
        </div>

        {/* Interactive Real-Time Currency Converter */}
        <div className="bg-white/70 p-5 rounded-2xl border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-amber-400 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-400" />
              أداة تحويل العملات اللحظية المباشرة (Live Instant Currency Converter)
            </h4>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
              تحديث الصرف فوري ⚡
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-3">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">المبلغ المراد تحويله:</label>
              <input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                min={0}
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">من عملة:</label>
              <select
                value={fromCurrCode}
                onChange={(e) => setFromCurrCode(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1 flex items-center justify-center pb-1">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl border border-slate-700 transition-all active:scale-95 shadow-sm"
                title="تبديل اتجاه التحويل"
              >
                <ArrowRightLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] text-slate-400 font-bold mb-1">إلى عملة:</label>
              <select
                value={toCurrCode}
                onChange={(e) => setToCurrCode(e.target.value)}
                className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 p-2.5 rounded-xl text-center">
              <span className="block text-[9px] text-amber-300 font-bold">النتيجة اللحظية:</span>
              <span className="text-sm font-black text-amber-400 font-mono block">
                {convertVal(convertAmount, fromCurrCode, toCurrCode).toLocaleString(undefined, { maximumFractionDigits: 2 })} {currencies.find(c => c.code === toCurrCode)?.symbol}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-400 font-mono">
            <span>
              سعر الصرف المعتمد: 1 {fromCurrCode} = {(convertVal(1, fromCurrCode, toCurrCode)).toFixed(4)} {toCurrCode}
            </span>
            <span>
              الرمز الأساسي للنظام: {currencies.find(c => c.isBase)?.code || "USD"}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-400">إجمالي كمية البيانات المستهلكة</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{totalTrafficGB.toFixed(1)} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">جيجابايت</span></span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-400">معدل الاستهلاك لكل مشترك</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">{averageTrafficGB} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">جيجابايت</span></span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-400">كفاءة تشغيل الشبكة</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">
              {totalSubscribers > 0 ? Math.round((activeSubs / totalSubscribers) * 100) : 100}% <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">نشطون</span>
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 dark:text-slate-400">استجابة سيرفر الريديوس</span>
            <span className="text-lg font-extrabold text-slate-800 dark:text-white">12ms <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">(ممتازة)</span></span>
          </div>
        </div>
      </div>

      {/* Grid: Top 5 and Package Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Most Consuming Customers (Leaderboard) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                أول 5 عملاء الأكثر استهلاكاً للبيانات
              </h3>
              <span className="text-xs bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 px-2 py-1 rounded font-bold border border-amber-200/50 dark:border-amber-800/40">الأكثر نشاطاً</span>
            </div>

            {/* Custom Bar Chart representing Consumption */}
            <div className="space-y-4">
              {top5Customers.map((customer, index) => {
                const widthPercent = Math.max(10, Math.round((customer.consumptionGB / maxConsumption) * 100));
                const speedOffer = offers.find(o => o?.id === customer.offerId)?.name || "باقة غير معروفة";
                
                return (
                  <div 
                    key={customer?.id}
                    className="space-y-1.5"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-[10px]">{index + 1}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{customer.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400">({speedOffer})</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800 dark:text-white">{customer.consumptionGB.toFixed(1)} GB</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden relative">
                      <div 
                        style={{ width: `${widthPercent}%` }}
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-l ${
                          index === 0 ? "from-orange-600 to-orange-400" :
                          index === 1 ? "from-amber-500 to-amber-400" :
                          "from-indigo-600 to-indigo-400"
                        }`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
            يتم تحديث الإحصائيات تلقائياً بناءً على سجلات استهلاك كروت الريديوس PPPoE وهوت سبوت.
          </div>
        </div>

        {/* Package Distribution Visualizer */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                توزيع المشتركين على الباقات والسرعات
              </h3>
              <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded font-bold border border-indigo-200/50 dark:border-indigo-800/40">حجم المبيعات</span>
            </div>

            {/* Custom Horizontal Package bars */}
            <div className="space-y-4">
              {packageStats.map((pkg, index) => {
                const percent = Math.round((pkg.count / maxPackageCount) * 100);
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">{pkg.name} ({pkg.speed})</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{pkg.count} مشترك</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${percent}%` }}
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 w-8 text-left">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
            تساعدك هذه النسب في معرفة العروض الأكثر طلباً وتوجيه طاقة السيرفر وفقاً لذلك.
          </div>
        </div>
      </div>

      {/* Network Traffic Hourly Peak Load */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-500" />
              معدل استهلاك السيرفر العام على مدار اليوم (Mbps)
            </h3>
            <p className="text-xs text-slate-400 mt-1">الرسم التوضيحي للأوقات الأعلى استهلاكاً للبيانات (Peak hours) لترتيب الأحمال.</p>
          </div>
          <span className="text-xs bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-red-200/50 dark:border-red-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> مباشر
          </span>
        </div>

        {/* Custom SVG Line Area Chart for peak load */}
        <div className="h-64 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
            {/* Background Grid Lines */}
            <line x1="0" y1="50" x2="800" y2="50" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />
            <line x1="0" y1="150" x2="800" y2="150" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="1" />

            {/* Area Path */}
            <path
              d={`
                M 0 200
                ${hourlyTraffic.map((t, index) => {
                  const x = (index / (hourlyTraffic.length - 1)) * 800;
                  const y = 180 - (t.rate / maxHourlyRate) * 150;
                  return `L ${x} ${y}`;
                }).join(" ")}
                L 800 200
                Z
              `}
              fill="url(#grad)"
              opacity="0.2"
            />

            {/* Line Path */}
            <path
              d={hourlyTraffic.map((t, index) => {
                const x = (index / (hourlyTraffic.length - 1)) * 800;
                const y = 180 - (t.rate / maxHourlyRate) * 150;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ")}
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
            />

            {/* Circles over points */}
            {hourlyTraffic.map((t, index) => {
              const x = (index / (hourlyTraffic.length - 1)) * 800;
              const y = 180 - (t.rate / maxHourlyRate) * 150;
              return (
                <g key={index} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#ef4444"
                    opacity="0"
                    className="hover:opacity-20 transition-all"
                  />
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Labels for Chart */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-2 text-[10px] text-slate-400 font-bold border-t border-slate-200 dark:border-slate-800">
            {hourlyTraffic.map((t, index) => (
              <span key={index}>{t.hour} ({t.rate}M)</span>
            ))}
          </div>
        </div>
      </div>

      {/* Distributor Rankings Report */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="w-full flex flex-wrap gap-4 items-center justify-center sm:justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              ترتيب الموزعين (الشهر الحالي)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ترتيب الموزعين بناءً على حجم الاشتراكات المحققة والمبالغ المالية المقبولة
            </p>
          </div>
          <button
            onClick={exportDistributorReport}
            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" />
            تصدير التقرير
          </button>
        </div>

        <div className="table-scroll-container">
          <table className="w-full text-right min-w-[550px] sticky-table">
            <thead className="sticky-thead">
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                <th className="pb-2 px-2 font-bold">المركز</th>
                <th className="pb-2 px-2 font-bold">الموزع</th>
                <th className="pb-2 px-2 font-bold text-center">الاشتراكات المقبولة</th>
                <th className="pb-2 px-2 font-bold text-left">إجمالي المبالغ</th>
              </tr>
            </thead>
            <tbody>
              {distributorRankings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500 text-sm font-bold">
                    لا يوجد بيانات متاحة للشهر الحالي
                  </td>
                </tr>
              ) : (
                distributorRankings.map((dr, index) => (
                  <tr key={dr.distributor?.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-2">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500" :
                        index === 1 ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" :
                        index === 2 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-500" :
                        "bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      }`}>
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{dr.distributor.name}</div>
                      <div className="text-xs text-slate-500">@{dr.distributor.username}</div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {dr.subCount} مشترك
                      </span>
                    </td>
                    <td className="py-2 px-2 text-left">
                      <span className="font-mono font-bold text-slate-800 dark:text-white text-sm">
                        {dr.totalFinancialAmount} {targetRevenueCurr}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consumption PDF Report Generator Modal */}
      <ConsumptionReportPdfModal
        isOpen={showPdfReportModal}
        onClose={() => setShowPdfReportModal(false)}
        customers={customers}
        offers={offers}
      />
    </div>
  );
}
