import { exportToExcel, exportToPDF } from "../utils/exportUtils";
import React, { useState, useMemo } from "react";
import { Customer, ArchivedReceipt, SpeedOffer, CustomerStatus, Distributor } from "../types";
import { Search, Trash2, CheckCircle, XCircle, CreditCard, Filter, AlertTriangle, FileText, Eye, X, ImageIcon, BarChart3, Calendar, Users, BellRing, FileSpreadsheet, Download, Sparkles, Ban, ShieldAlert, CheckCircle2, RotateCcw, MessageSquare, Send, ChevronDown, ChevronUp, ChevronRight, Layers, Building2, Clock } from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";
import OcrMatchEngine from "./OcrMatchEngine";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

interface ReceiptsReviewViewProps {
  servers?: any;
  customers: Customer[];
  offers: SpeedOffer[];
  onUpdateCustomer: (customer: Customer) => void;
  onAddNotification: (message: string, type?: "success" | "error" | "warning" | "info") => void;
  distributors?: Distributor[];
  onUpdateDistributor?: (d: Distributor) => void;
  distributorOffers?: any[];
}

export default function ReceiptsReviewView({
  customers,
  offers,
  onUpdateCustomer,
  onAddNotification,
  distributors = [],
  onUpdateDistributor,
  distributorOffers = []
}: ReceiptsReviewViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "matched" | "unmatched">("pending");
  const [filterDate, setFilterDate] = useState<string>(""); // YYYY-MM-DD
  const [filterDistributor, setFilterDistributor] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
    type: "approve" | "reject";
  } | null>(null);

  const [detailsModal, setDetailsModal] = useState<{
    isOpen: boolean;
    receipt: (ArchivedReceipt & { customer: Customer }) | null;
  }>({
    isOpen: false,
    receipt: null
  });

  const [viewMode, setViewMode] = useState<"grouped" | "all">("grouped");
  const [expandedDistributorIds, setExpandedDistributorIds] = useState<string[]>([]);
  const [groupedSearch, setGroupedSearch] = useState("");
  const [groupSubFilterStatus, setGroupSubFilterStatus] = useState<Record<string, "all" | "pending" | "matched" | "unmatched">>({});

  // Extract all receipts from all customers
  const allCustomerReceipts = customers.flatMap(c => 
    (c.archivedReceipts || []).map(r => ({ ...r, customer: c, isDistributor: false }))
  );
  
  const allDistributorReceipts = distributors.flatMap(d =>
    (d.archivedReceipts || []).map(r => ({ ...r, customer: { ...d, distributorId: d?.id, isDistributorRef: true } as unknown as Customer, isDistributor: true }))
  );

  const allReceipts = [...allCustomerReceipts, ...allDistributorReceipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group receipts by Distributor
  const distributorGroups = useMemo(() => {
    const groupsMap = new Map<string, {
      distributorId: string;
      name: string;
      username: string;
      pendingCount: number;
      pendingAmount: number;
      matchedCount: number;
      matchedAmount: number;
      unmatchedCount: number;
      unmatchedAmount: number;
      totalCount: number;
      totalAmount: number;
      receipts: (ArchivedReceipt & { customer: Customer })[];
    }>();

    // Group for direct Admin / No distributor assigned
    groupsMap.set("admin", {
      distributorId: "admin",
      name: "إدارة النظام الرئيسية (المدير العام / مشتركين مباشرين)",
      username: "admin",
      pendingCount: 0,
      pendingAmount: 0,
      matchedCount: 0,
      matchedAmount: 0,
      unmatchedCount: 0,
      unmatchedAmount: 0,
      totalCount: 0,
      totalAmount: 0,
      receipts: []
    });

    // Groups for registered distributors
    (distributors || []).forEach(d => {
      groupsMap.set(d.id, {
        distributorId: d.id,
        name: d.name,
        username: d.username,
        pendingCount: 0,
        pendingAmount: 0,
        matchedCount: 0,
        matchedAmount: 0,
        unmatchedCount: 0,
        unmatchedAmount: 0,
        totalCount: 0,
        totalAmount: 0,
        receipts: []
      });
    });

    allReceipts.forEach(r => {
      let distId = r.customer?.distributorId;
      if (r.isDistributor) {
        distId = r.customer.id;
      }
      const key = (distId && groupsMap.has(distId)) ? distId : "admin";
      const group = groupsMap.get(key)!;

      group.receipts.push(r);
      group.totalCount += 1;
      group.totalAmount += (r.amount || 0);

      if (r.status === "pending") {
        group.pendingCount += 1;
        group.pendingAmount += (r.amount || 0);
      } else if (r.status === "matched") {
        group.matchedCount += 1;
        group.matchedAmount += (r.amount || 0);
      } else if (r.status === "unmatched") {
        group.unmatchedCount += 1;
        group.unmatchedAmount += (r.amount || 0);
      }
    });

    return Array.from(groupsMap.values())
      .filter(g => g.totalCount > 0)
      .sort((a, b) => b.pendingAmount - a.pendingAmount || b.totalAmount - a.totalAmount);
  }, [allReceipts, distributors]);

  const toggleExpandDistributor = (distId: string) => {
    setExpandedDistributorIds(prev =>
      prev.includes(distId) ? prev.filter(x => x !== distId) : [...prev, distId]
    );
  };

    const filteredReceipts = allReceipts.filter(r => {
    const matchesSearch = r.customer.name.includes(searchTerm) || r.customer.username.includes(searchTerm) || r?.id.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesDate = !filterDate || r.date.startsWith(filterDate);
    const matchesDistributor = filterDistributor === "all" || r.customer.distributorId === filterDistributor;
    return matchesSearch && matchesStatus && matchesDate && matchesDistributor;
  });


  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    let valA: any, valB: any;
    switch (sortField) {
      case "date":
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
        break;
      case "amount":
        valA = a.amount;
        valB = b.amount;
        break;
      case "customer":
        valA = a.customer.name;
        valB = b.customer.name;
        break;
      case "status":
        valA = a.status;
        valB = b.status;
        break;
      default:
        valA = new Date(a.date).getTime();
        valB = new Date(b.date).getTime();
    }
    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const exportExcel = () => {
    const data = sortedReceipts.map(r => ({
      "رقم الإيصال": r?.id,
      "التاريخ": new Date(r.date).toLocaleString('ar-SA'),
      "المشترك": r.customer.name,
      "اسم المستخدم": r.customer.username,
      "المبلغ": r.amount,
      "الوصف": r.message,
      "الحالة": r.status === "matched" ? "مقبولة" : r.status === "unmatched" ? "مرفوضة" : "قيد المراجعة"
    }));
    exportToExcel(data, "الإيصالات");
  };

  const exportPDF = () => {
    const columns = [
      { header: "الحالة", dataKey: "status" },
      { header: "المبلغ", dataKey: "amount" },
      { header: "المشترك", dataKey: "customer" },
      { header: "التاريخ", dataKey: "date" },
      { header: "رقم الإيصال", dataKey: "id" }
    ];
    const data = sortedReceipts.map(r => ({
      id: r?.id,
      date: new Date(r.date).toLocaleString('ar-SA'),
      customer: r.customer.name,
      amount: r.amount,
      status: r.status === "matched" ? "مقبولة" : r.status === "unmatched" ? "مرفوضة" : "قيد المراجعة"
    }));
    exportToPDF(data, columns, "receipts", "تقارير الإيصالات");
  };

  const monthStats = useMemo(() => {
    const now = new Date();
    const currentMonthReceipts = allReceipts.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const matchedVolume = currentMonthReceipts.filter(r => r.status === "matched").reduce((sum, r) => sum + r.amount, 0);
    const unmatchedVolume = currentMonthReceipts.filter(r => r.status === "unmatched").reduce((sum, r) => sum + r.amount, 0);
    const pendingVolume = currentMonthReceipts.filter(r => r.status === "pending").reduce((sum, r) => sum + r.amount, 0);

    const matchedCount = currentMonthReceipts.filter(r => r.status === "matched").length;
    const unmatchedCount = currentMonthReceipts.filter(r => r.status === "unmatched").length;
    const pendingCount = currentMonthReceipts.filter(r => r.status === "pending").length;

    const data = [
      { name: "مقبولة", الحجم: matchedVolume, العدد: matchedCount, color: "#10b981" },
      { name: "مرفوضة", الحجم: unmatchedVolume, العدد: unmatchedCount, color: "#f43f5e" },
      { name: "قيد المراجعة", الحجم: pendingVolume, العدد: pendingCount, color: "#f59e0b" },
    ];

    return {
      matchedVolume, unmatchedVolume, pendingVolume,
      matchedCount, unmatchedCount, pendingCount,
      totalVolume: matchedVolume + unmatchedVolume + pendingVolume,
      totalCount: currentMonthReceipts.length,
      data
    };
  }, [allReceipts]);

  const handleApprove = (receipt: ArchivedReceipt, customer: Customer) => {
    // Check if it's a distributor
    const isDistributor = (customer as any).isDistributorRef === true;

    if (isDistributor && onUpdateDistributor) {
      const offerToApply = distributorOffers.find(o => o?.id === receipt.offerId) || distributorOffers[0];
      const dist = distributors.find(d => d.id === customer.id);
      if (dist) {
        const now = new Date();
        let startDate = now;
        if (dist.subscriptionStatus === "نشط" && dist.subscriptionEndDate) {
          const currentEnd = new Date(dist.subscriptionEndDate);
          if (currentEnd > now) {
            startDate = currentEnd;
          }
        }
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (offerToApply?.durationMonths === 0 ? 1200 : (offerToApply?.durationMonths || 1)));
        const newExpiryStr = endDate.toISOString();

        const updatedReceipts = dist.archivedReceipts?.map(r => 
          r?.id === receipt?.id ? { ...r, status: "matched" as const, rejectReason: "", processedDate: new Date().toISOString() } : r
        ) || [];

        let newBalance = dist.balance || 0;
        if (offerToApply && receipt.amount > offerToApply.price) {
          newBalance += (receipt.amount - offerToApply.price);
        }

        const updatedDistributor: any = {
          ...dist,
          subscriptionStatus: "نشط",
          subscriptionEndDate: newExpiryStr,
          subscriptionOfferId: offerToApply?.id || dist.subscriptionOfferId,
          balance: newBalance,
          archivedReceipts: updatedReceipts
        };

        onUpdateDistributor(updatedDistributor);
        onAddNotification(`تم تفعيل اشتراك السيرفر للموزع ${dist.name} بنجاح.`, "success");
        setConfirmModal(null);
        return;
      }
    }

    // Regular customer logic
    const offerToApply = offers.find(o => o?.id === receipt.offerId) || offers[0];
    const now = new Date().getTime();
    const currentExpiry = new Date(customer.expiryDate).getTime();
    const daysRemaining = Math.ceil((currentExpiry - now) / (1000 * 60 * 60 * 24));
    
    const baseDate = daysRemaining > 0 ? new Date(customer.expiryDate) : new Date();
    baseDate.setDate(baseDate.getDate() + 30);
    const newExpiryStr = baseDate.toISOString().split("T")[0];

    const updatedReceipts = customer.archivedReceipts?.map(r => 
      r?.id === receipt?.id ? { ...r, status: "matched" as const, processedDate: new Date().toISOString() } : r
    ) || [];

    let newBalance = customer.balance || 0;
    if (offerToApply && receipt.amount > offerToApply.price) {
      newBalance += (receipt.amount - offerToApply.price);
    }

    const updatedCustomer: any = {
      ...customer,
      status: "نشط",
      expiryDate: newExpiryStr,
      offerId: offerToApply?.id || customer.offerId,
      consumptionGB: 0.0,
      balance: newBalance,
      archivedReceipts: updatedReceipts
    };

    onUpdateCustomer(updatedCustomer);
    onAddNotification(`تم تفعيل الاشتراك للمشترك ${customer.name} بنجاح وإرسال التنبيه.`, "success");
    setConfirmModal(null);
    
    // In a real app, send WhatsApp/SMS here
  };

  const [distributorNotification, setDistributorNotification] = useState<{
    show: boolean;
    distributorName: string;
    customerName: string;
    reason: string;
  } | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    receipt: ArchivedReceipt | null;
    customer: Customer | null;
    reason: string;
  }>({
    isOpen: false,
    receipt: null,
    customer: null,
    reason: ""
  });

  const handleReject = (receipt: ArchivedReceipt, customer: Customer, reason: string) => {
    const isDistributor = (customer as any).isDistributorRef === true;

    if (isDistributor && onUpdateDistributor) {
      const dist = distributors.find(d => d.id === customer.id);
      if (dist) {
        const updatedReceipts = dist.archivedReceipts?.map(r => 
          r?.id === receipt?.id ? { ...r, status: "unmatched" as const, rejectReason: reason, processedDate: new Date().toISOString() } : r
        ) || [];

        const updatedDistributor: Distributor = {
          ...dist,
          archivedReceipts: updatedReceipts
        };

        onUpdateDistributor(updatedDistributor);
        onAddNotification(`تم رفض إيصال الموزع ${dist.name}.`, "warning");
        setRejectModal({ isOpen: false, receipt: null, customer: null, reason: "" });
        return;
      }
    }

    // Customer logic
    const updatedReceipts = customer.archivedReceipts?.map(r => 
      r?.id === receipt?.id ? { ...r, status: "unmatched" as const, rejectReason: reason, processedDate: new Date().toISOString() } : r
    ) || [];

    const updatedCustomer: Customer = {
      ...customer,
      archivedReceipts: updatedReceipts
    };

    onUpdateCustomer(updatedCustomer);
    onAddNotification(`تم رفض الإيصال وتحديث حالة المشترك ${customer.name}.`, "warning");
    
    if (customer.distributorId) {
      const distributorName = distributors.find(d => d?.id === customer.distributorId)?.name || 'الموزع';
      setDistributorNotification({
        show: true,
        distributorName,
        customerName: customer.name,
        reason
      });
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        setDistributorNotification(prev => prev ? { ...prev, show: false } : null);
      }, 6000);
    } else {
      onAddNotification(`تم إرسال إشعار للمشترك ${customer.name} بسبب الرفض.`, "info");
    }

    setRejectModal({ isOpen: false, receipt: null, customer: null, reason: "" });
  };

  const handleDelete = (receipt: ArchivedReceipt, customer: Customer) => {
    const isDistributor = (customer as any).isDistributorRef === true;

    if (isDistributor && onUpdateDistributor) {
      const dist = distributors.find(d => d.id === customer.id);
      if (dist) {
        const updatedReceipts = dist.archivedReceipts?.filter(r => r?.id !== receipt?.id) || [];
        const updatedDistributor: Distributor = {
          ...dist,
          archivedReceipts: updatedReceipts
        };
        onUpdateDistributor(updatedDistributor);
        onAddNotification(`تم حذف الإيصال للموزع ${dist.name}.`, "success");
        setConfirmModal(null);
        return;
      }
    }

    const updatedReceipts = customer.archivedReceipts?.filter(r => r?.id !== receipt?.id) || [];
    
    const updatedCustomer: Customer = {
      ...customer,
      archivedReceipts: updatedReceipts
    };

    onUpdateCustomer(updatedCustomer);
    onAddNotification("تم حذف الإيصال نهائياً.", "success");
    setConfirmModal(null);
  };

  // Batch Auto-Audit and Reject non-matching receipts
  const handleBatchAutoAuditAndReject = () => {
    const pendingReceipts = allReceipts.filter(r => r.status === "pending");
    if (pendingReceipts.length === 0) {
      onAddNotification("لا توجد إيصالات قيد الانتظار حالياً لفحصها.", "info");
      return;
    }

    let rejectedCount = 0;
    let approvedCount = 0;

    pendingReceipts.forEach(r => {
      const offerToApply = offers.find(o => o?.id === r.offerId) || offers[0];
      const expectedAmount = offerToApply ? offerToApply.price : r.amount;

      // Perform strict character and digit audit
      const extractedAmount = r.amount || 0;
      const isAmountMatched = extractedAmount === expectedAmount;

      const rawMsg = (r.message || "").trim();
      const customerPhone = (r.customer.phone || "").replace(/\D/g, "");
      const customerUsername = (r.customer.username || "").toLowerCase();
      const customerNameParts = (r.customer.name || "").toLowerCase().split(/\s+/).filter(Boolean);

      let isSenderMatched = false;
      if (customerPhone && rawMsg.replace(/\D/g, "").includes(customerPhone)) {
        isSenderMatched = true;
      } else if (customerUsername && rawMsg.toLowerCase().includes(customerUsername)) {
        isSenderMatched = true;
      } else if (customerNameParts.some(part => part.length >= 3 && rawMsg.toLowerCase().includes(part))) {
        isSenderMatched = true;
      }

      const numberMatches = rawMsg.match(/\d{6,14}/g);
      let extractedRefNo = r.id;
      if (numberMatches && numberMatches.length > 0) {
        extractedRefNo = numberMatches[numberMatches.length - 1];
      }

      const duplicateMatches = allReceipts.filter(other => {
        if (other.id === r.id) return false;
        if (other.status === "unmatched") return false;
        if (extractedRefNo.length >= 6 && (other.id.includes(extractedRefNo) || other.message.includes(extractedRefNo))) {
          return true;
        }
        return false;
      });

      const discrepancies: string[] = [];
      if (!isAmountMatched) discrepancies.push(`المبلغ المدفوع (${extractedAmount}) لا يتطابق مع ثمن الباقة المطلوبة (${expectedAmount})`);
      if (!isSenderMatched) discrepancies.push(`اسم أو رقم هاتف المحول بالإيصال لا يتطابق مع بيانات المشترك (${r.customer.name})`);
      if (duplicateMatches.length > 0) discrepancies.push(`الرقم المرجعي مكرر وتم استخدامه في عملية سابقة`);

      if (discrepancies.length > 0) {
        const autoReason = `[رفض تلقائي من نظام التدقيق]: ${discrepancies.join(" | ")}`;
        handleReject(r, r.customer, autoReason);
        rejectedCount++;
      } else {
        handleApprove(r, r.customer);
        approvedCount++;
      }
    });

    onAddNotification(`اكتمل التدقيق الآلي الصارم: تم تفعيل ${approvedCount} إيصال مطابق بنجاح، ورفض ${rejectedCount} إيصال غير مطابق مع إرسال تفاصيل الرفض للمشتركين.`, "success");
  };

  const presetRejectReasons = [
    "المبلغ المدفوع بالإيصال غير مطابق لثمن الباقة المطلوب.",
    "صورة الإيصال المرفقة غير واضحة أو تعذر قراءة بيانات التحويل.",
    "الرقم المرجعي مكرر وتم استخدام هذا الإيصال في عملية سابقة.",
    "اسم المحول أو رقم الحساب لا يتطابق مع بيانات حساب المشترك المسجلة.",
    "تاريخ الحوالة قديم وغير صالح لطلب التجديد الحالي."
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            مراجعة وتدقيق الإيصالات والتحويلات
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            التحكم اليدوي والنظام التلقائي لتدقيق الإيصالات، مع إرسال أسباب الرفض الفورية للمشتركين
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchAutoAuditAndReject}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all flex items-center gap-2"
            title="تشغيل التدقيق الآلي الصارم والرفض التلقائي لكافة الإيصالات المعلقة"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            التدقيق والرفض التلقائي الصارم
          </button>
          
          <button
            onClick={exportExcel}
            className="p-2.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={exportPDF}
            className="p-2.5 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Financial Reports Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">حجم التحويلات (الشهر الحالي)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthStats.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `${value} $`} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`${value} $`, 'الحجم']}
                />
                <Bar dataKey="الحجم" radius={[6, 6, 0, 0]}>
                  {monthStats.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm mb-4 self-start">ملخص الشهر</h3>
          <div className="w-full h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={monthStats.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="العدد"
                >
                  {monthStats.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [value, 'عدد الإيصالات']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-800 dark:text-white">{monthStats.totalCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">إيصال</span>
            </div>
          </div>
          
          <div className="w-full space-y-3 mt-4">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                مقبولة
              </div>
              <span>{monthStats.matchedVolume} $ ({monthStats.matchedCount})</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                مرفوضة
              </div>
              <span>{monthStats.unmatchedVolume} $ ({monthStats.unmatchedCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setViewMode("grouped")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
              viewMode === "grouped"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            تجميع الإيصالات حسب الموزعين
            {allReceipts.filter(r => r.status === "pending").length > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black animate-pulse">
                {allReceipts.filter(r => r.status === "pending").length} معلق
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode("all")}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-2 ${
              viewMode === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            جدول كل الإيصالات التفصيلي
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-[10px] font-black">
              {allReceipts.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 self-end sm:self-center">
          <span>إجمالي مبالغ الإيصالات المعلقة:</span>
          <span className="text-amber-600 dark:text-amber-400 font-black text-sm bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800">
            {distributorGroups.reduce((acc, g) => acc + g.pendingAmount, 0)} $ / ل.س
          </span>
        </div>
      </div>

      {viewMode === "grouped" ? (
        /* Grouped Receipts Summary Table */
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                تجميع المبالغ والإيصالات المعلقة حسب الموزع
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                اضغط على اسم الموزع أو زر التوسيع لعرض كشف حساب كافة الإيصالات التابعة له بالتفصيل ومعالجتها.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="بحث عن اسم الموزع..."
                value={groupedSearch}
                onChange={(e) => setGroupedSearch(e.target.value)}
                className="w-full pl-4 pr-9 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[750px]">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">اسم الموزع / المالك للباقات</th>
                  <th className="p-3 text-center">عدد الإيصالات المعلقة</th>
                  <th className="p-3 text-center">إجمالي المبلغ المعلق</th>
                  <th className="p-3 text-center">المقبولة (المبلغ / العدد)</th>
                  <th className="p-3 text-center">المرفوضة (المبلغ / العدد)</th>
                  <th className="p-3 text-center">إجمالي الحساب</th>
                  <th className="p-3 text-center">التفاصيل والتوسيع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                {distributorGroups
                  .filter(g => g.name.includes(groupedSearch) || g.username.includes(groupedSearch))
                  .map((group, idx) => {
                    const isExpanded = expandedDistributorIds.includes(group.distributorId);
                    const subFilter = groupSubFilterStatus[group.distributorId] || "all";
                    
                    const groupFilteredReceipts = group.receipts.filter(r => {
                      if (subFilter === "all") return true;
                      return r.status === subFilter;
                    });

                    return (
                      <React.Fragment key={group.distributorId}>
                        <tr 
                          onClick={() => toggleExpandDistributor(group.distributorId)}
                          className={`cursor-pointer transition-all hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 ${
                            isExpanded ? "bg-indigo-50/60 dark:bg-indigo-950/40 border-r-4 border-indigo-600" : ""
                          }`}
                        >
                          <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button 
                                type="button"
                                className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 shrink-0"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <div>
                                <div className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                  {group.name}
                                  {group.distributorId === "admin" && (
                                    <span className="text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-full font-extrabold">
                                      إدارة مباشرة
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-mono">@{group.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {group.pendingCount > 0 ? (
                              <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-black px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                {group.pendingCount} معلق
                              </span>
                            ) : (
                              <span className="text-slate-400">0</span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`font-black text-sm px-3 py-1 rounded-xl inline-block ${
                              group.pendingAmount > 0 
                                ? "bg-amber-500 text-white shadow-sm" 
                                : "text-slate-500 bg-slate-100 dark:bg-slate-800"
                            }`}>
                              {group.pendingAmount} $ / ل.س
                            </span>
                          </td>
                          <td className="p-3 text-center text-emerald-600 dark:text-emerald-400">
                            <div>{group.matchedAmount} $</div>
                            <div className="text-[10px] text-slate-400">({group.matchedCount} مقبول)</div>
                          </td>
                          <td className="p-3 text-center text-rose-600 dark:text-rose-400">
                            <div>{group.unmatchedAmount} $</div>
                            <div className="text-[10px] text-slate-400">({group.unmatchedCount} مرفوض)</div>
                          </td>
                          <td className="p-3 text-center font-extrabold text-slate-800 dark:text-slate-200">
                            <div>{group.totalAmount} $</div>
                            <div className="text-[10px] text-slate-400">({group.totalCount} إجمالي)</div>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpandDistributor(group.distributorId);
                              }}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 text-xs font-extrabold rounded-lg transition-colors flex items-center gap-1 mx-auto"
                            >
                              {isExpanded ? "إغلاق التفاصيل" : "عرض إيصالات الموزع"}
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Sub-Table for Distributor Receipts */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-900/90">
                            <td colSpan={8} className="p-4 border-b-2 border-indigo-300 dark:border-indigo-800">
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-inner">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-500" />
                                    <span className="font-black text-slate-800 dark:text-white text-xs">
                                      كشف تفصيلي لإيصالات: <span className="text-indigo-600 dark:text-indigo-400">{group.name}</span> ({group.receipts.length} إيصال)
                                    </span>
                                  </div>

                                  {/* Filter pills */}
                                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold">
                                    <button
                                      onClick={() => setGroupSubFilterStatus(prev => ({ ...prev, [group.distributorId]: "all" }))}
                                      className={`px-2.5 py-1 rounded-lg transition-colors ${subFilter === "all" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500"}`}
                                    >
                                      الكل ({group.totalCount})
                                    </button>
                                    <button
                                      onClick={() => setGroupSubFilterStatus(prev => ({ ...prev, [group.distributorId]: "pending" }))}
                                      className={`px-2.5 py-1 rounded-lg transition-colors ${subFilter === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-slate-500"}`}
                                    >
                                      المعلقة ({group.pendingCount})
                                    </button>
                                    <button
                                      onClick={() => setGroupSubFilterStatus(prev => ({ ...prev, [group.distributorId]: "matched" }))}
                                      className={`px-2.5 py-1 rounded-lg transition-colors ${subFilter === "matched" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500"}`}
                                    >
                                      المقبولة ({group.matchedCount})
                                    </button>
                                    <button
                                      onClick={() => setGroupSubFilterStatus(prev => ({ ...prev, [group.distributorId]: "unmatched" }))}
                                      className={`px-2.5 py-1 rounded-lg transition-colors ${subFilter === "unmatched" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500"}`}
                                    >
                                      المرفوضة ({group.unmatchedCount})
                                    </button>
                                  </div>
                                </div>

                                {groupFilteredReceipts.length === 0 ? (
                                  <div className="p-6 text-center text-slate-400 font-bold text-xs">
                                    لا توجد إيصالات بهذه الحالة للموزع ({group.name}).
                                  </div>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-right text-xs">
                                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                          <th className="p-2">رقم المرجع والتاريخ</th>
                                          <th className="p-2">اسم المشترك</th>
                                          <th className="p-2">تفاصيل الرسالة والحوالة</th>
                                          <th className="p-2">المبلغ</th>
                                          <th className="p-2">الحالة</th>
                                          <th className="p-2 text-center">إجراءات سريعة</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {groupFilteredReceipts.map(r => (
                                          <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-2 font-mono">
                                              <div className="font-black text-indigo-600 dark:text-indigo-400">{r.id}</div>
                                              <div className="text-[10px] text-slate-400">{new Date(r.date).toLocaleString('ar-SA')}</div>
                                            </td>
                                            <td className="p-2 font-bold">
                                              <div className="text-slate-800 dark:text-slate-100">{r.customer.name}</div>
                                              <div className="text-[10px] text-slate-400">@{r.customer.username}</div>
                                            </td>
                                            <td className="p-2">
                                              <div className="text-[11px] text-slate-600 dark:text-slate-300 max-w-xs truncate bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                                                {r.message || "لا توجد تفاصيل نصية"}
                                              </div>
                                            </td>
                                            <td className="p-2 font-black text-emerald-600 dark:text-emerald-400">
                                              {r.amount} $ / ل.س
                                            </td>
                                            <td className="p-2">
                                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                                r.status === "matched"
                                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                                  : r.status === "unmatched"
                                                  ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                              }`}>
                                                {r.status === "matched" ? "مقبول ومفعل" : r.status === "unmatched" ? "مرفوض" : "قيد المراجعة"}
                                              </span>
                                            </td>
                                            <td className="p-2 text-center">
                                              <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                  onClick={() => setDetailsModal({ isOpen: true, receipt: r })}
                                                  className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                                                  title="عرض الصورة والفحص الذكي"
                                                >
                                                  <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => setConfirmModal({
                                                    isOpen: true,
                                                    title: "تأكيد التفعيل والقبول اليدوي",
                                                    message: `هل تود القبول اليدوي وتفعيل اشتراك المشترك (${r.customer.name}) بقيمة ${r.amount}؟`,
                                                    confirmText: "نعم، قبول وتفعيل",
                                                    onConfirm: () => handleApprove(r, r.customer),
                                                    type: "approve"
                                                  })}
                                                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                                                  title="تفعيل يدوي"
                                                >
                                                  <CheckCircle className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => setRejectModal({
                                                    isOpen: true,
                                                    receipt: r,
                                                    customer: r.customer,
                                                    reason: r.rejectReason || ""
                                                  })}
                                                  className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                                                  title="رفض يدوي"
                                                >
                                                  <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Detailed All Receipts Table */
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم المرجع أو اسم المشترك..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-500 hidden sm:block" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="flex-1 sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
              />
            </div>
            {distributors.length > 1 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Users className="w-4 h-4 text-slate-500 hidden sm:block" />
                <select
                  value={filterDistributor}
                  onChange={(e) => setFilterDistributor(e.target.value)}
                  className="flex-1 sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">كل الموزعين</option>
                  {distributors.map(dist => (
                    <option key={dist?.id} value={dist?.id}>{dist.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="flex-1 sm:w-auto pl-8 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">كل الحالات</option>
                <option value="pending">قيد الانتظار</option>
                <option value="matched">تمت المطابقة (مفعل)</option>
                <option value="unmatched">مرفوض (غير مطابق)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-scroll-container">
          <table className="w-full text-right min-w-[750px] sticky-table">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky-thead">
              <tr>
                <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">رقم المرجع / التاريخ</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">المشترك</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">رقم الحساب المحول منه</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">المبلغ</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الحالة</th>
                <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sortedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400 font-bold">
                    لا توجد إيصالات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                sortedReceipts.map((r, index) => (
                  <tr key={r?.id} className={`transition-colors relative border-r-4 ${
                    r.status === "matched" 
                      ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" 
                      : r.status === "unmatched"
                      ? "border-indigo-500 bg-rose-50/30 dark:bg-rose-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      : "border-amber-500 bg-amber-50/30 dark:bg-amber-900/10 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  }`}>
                    <td className="px-2 py-2">
                      <div className="text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">{r?.id}</div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1">{new Date(r.date).toLocaleString('ar-SA')}</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {r.customer.name}
                        {(r as any).isDistributor && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">موزع</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">@{r.customer.username}</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-w-xs bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 line-clamp-2">
                        {r.message}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button 
                          onClick={() => setDetailsModal({ isOpen: true, receipt: r })}
                          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-md"
                        >
                          <Eye className="w-3 h-3" />
                          عرض تفاصيل التحويل
                        </button>
                        {r.imageUrl && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">
                            <ImageIcon className="w-3 h-3" />
                            مرفق صورة
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="text-sm font-black text-slate-900 dark:text-white">{r.amount} ريال</div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-col gap-2 items-start">
                        {r.status === "pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            قيد المراجعة
                          </span>
                        )}
                        {r.status === "matched" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            تمت المطابقة
                          </span>
                        )}
                        {r.status === "unmatched" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black bg-indigo-100 text-indigo-700 dark:bg-rose-900/40 dark:text-indigo-400">
                            <XCircle className="w-3.5 h-3.5" />
                            مرفوض
                          </span>
                        )}
                        
                        {r.systemMatched !== undefined && (
                          r.systemMatched ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              <CheckCircle className="w-3 h-3" />
                              مطابق برمجياً
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                              <AlertTriangle className="w-3 h-3" />
                              يحتاج تحقق يدوي
                            </span>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Always available Manual Approve button */}
                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            title: "تأكيد التفعيل والقبول اليدوي",
                            message: `هل تود التفعيل والقبول اليدوي لهذا الإيصال للمشترك (${r.customer.name}) بقيمة ${r.amount} ريال؟\nسيتم تمديد الاشتراك وتغيير الحالة إلى مقبول.`,
                            confirmText: "نعم، قبول وتفعيل يدوي",
                            onConfirm: () => handleApprove(r, r.customer),
                            type: "approve"
                          })}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-sm ${
                            r.status === "matched"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                          title="قبول وتفعيل يدوي"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {r.status === "matched" ? "مفعل (إعادة قبول)" : "تفعيل يدوي"}
                        </button>

                        {/* Always available Manual Reject / Reason button */}
                        <button
                          onClick={() => setRejectModal({
                            isOpen: true,
                            receipt: r,
                            customer: r.customer,
                            reason: r.rejectReason || ""
                          })}
                          className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                            r.status === "unmatched"
                              ? "bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-200"
                              : "bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                          }`}
                          title="رفض يدوي أو تعديل سبب الرفض"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {r.status === "unmatched" ? "تعديل سبب الرفض" : "رفض يدوي"}
                        </button>

                        <button
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            title: "تأكيد حذف الإيصال",
                            message: `هل أنت متأكد من رغبتك في حذف هذا الإيصال للمشترك ${r.customer.name} بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`,
                            confirmText: "نعم، حذف",
                            onConfirm: () => handleDelete(r, r.customer),
                            type: "reject"
                          })}
                          className="px-2 py-1.5 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                          title="حذف الإيصال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={confirmModal.confirmText}
          isDanger={confirmModal.type === "reject"}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}

      {/* Enhanced Rejection Dialog with Presets */}
      {rejectModal.isOpen && rejectModal.receipt && rejectModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between p-4 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900/50">
              <h3 className="font-black text-rose-900 dark:text-rose-200 flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                تحديد/تعديل سبب رفض الإيصال
              </h3>
              <button 
                onClick={() => setRejectModal({ isOpen: false, receipt: null, customer: null, reason: "" })}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">المشترك / الموزع:</span>
                  <span className="font-black text-slate-900 dark:text-white text-sm">{rejectModal.customer.name}</span>
                </div>
                <div className="text-left">
                  <span className="text-slate-500 block">المبلغ المعلن:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400 text-sm">{rejectModal.receipt.amount} ريال</span>
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  أسباب جاهزة للرفض (اضغط للاختيار السريع):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetRejectReasons.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRejectModal(prev => ({ ...prev, reason: preset }))}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 text-[11px] font-bold rounded-lg transition-colors text-right"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  سبب الرفض المخصص (سيصل مباشرة لصفحة وإشعارات المشترك):
                </label>
                <textarea
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  rows={3}
                  placeholder="اكتب سبب الرفض المفصل هنا ليظهر بوضوح للمشترك..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-2 text-indigo-900 dark:text-indigo-300 text-xs">
                <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  بمجرد الرفض، سيتلقى المشترك إشعاراً فورياً يتضمن هذا السبب، وستعرض صفحة المشترك تنبيهاً يوضح له سبب الرفض وإمكانية رفع إيصال جديد.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex gap-3">
              <button
                onClick={() => handleReject(rejectModal.receipt!, rejectModal.customer!, rejectModal.reason)}
                disabled={!rejectModal.reason.trim()}
                className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send className="w-4 h-4" />
                تأكيد الرفض وإرسال السبب للمشترك
              </button>
              <button
                onClick={() => setRejectModal({ isOpen: false, receipt: null, customer: null, reason: "" })}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsModal.isOpen && detailsModal.receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                تفاصيل الإيصال والتحويل
              </h3>
              <button 
                onClick={() => setDetailsModal({ isOpen: false, receipt: null })}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Receipt info */}
              <div>
                <h4 className="text-xs font-black text-slate-500 mb-2">رقم الحساب المحول منه (أو بيانات المحول)</h4>
                <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl whitespace-pre-wrap text-sm text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
                  {detailsModal.receipt.message}
                </div>
                {detailsModal.receipt.imageUrl && (
                  <div className="mt-3 p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl flex justify-center">
                    <img src={detailsModal.receipt.imageUrl} alt="صورة الإيصال المرفقة" className="max-h-64 rounded-xl object-contain" />
                  </div>
                )}
              </div>

              {/* Intelligent Matching Engine */}
              <div>
                <OcrMatchEngine 
                  receipt={detailsModal.receipt}
                  customer={detailsModal.receipt.customer}
                  expectedAmount={detailsModal.receipt.amount}
                  allReceipts={allReceipts}
                  onRejectWithReason={(reason) => {
                    const r = detailsModal.receipt;
                    setDetailsModal({ isOpen: false, receipt: null });
                    if (r) {
                      setRejectModal({
                        isOpen: true,
                        receipt: r,
                        customer: r.customer,
                        reason
                      });
                    }
                  }}
                  onApproveManual={() => {
                    const r = detailsModal.receipt;
                    setDetailsModal({ isOpen: false, receipt: null });
                    if (r) handleApprove(r, r.customer);
                  }}
                />
              </div>

              {/* Package details */}
              <div>
                <h4 className="text-xs font-black text-slate-500 mb-2">الباقة والتفاصيل المتأثرة</h4>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-indigo-800/50">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">اسم المشترك</span>
                    <span className="text-sm font-black text-indigo-900 dark:text-indigo-300">{detailsModal.receipt.customer.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-indigo-100 dark:border-indigo-800/50">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">الباقة المختارة للتجديد</span>
                    <span className="text-sm font-black text-indigo-900 dark:text-indigo-300">
                      {offers.find(o => o?.id === detailsModal.receipt?.offerId)?.name || "غير معروف"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">المبلغ المسجل</span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{detailsModal.receipt.amount} ريال</span>
                  </div>
                </div>
              </div>
              
              {/* Modal action buttons */}
              <div className="flex gap-3 pt-2">
                 <button
                   onClick={() => setConfirmModal({
                     isOpen: true,
                     title: "تأكيد حذف الإيصال",
                     message: `هل أنت متأكد من رغبتك في حذف هذا الإيصال للمشترك ${detailsModal.receipt?.customer.name} بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`,
                     confirmText: "نعم، حذف",
                     onConfirm: () => handleDelete(detailsModal.receipt!, detailsModal.receipt!.customer),
                     type: "reject"
                   })}
                   className="px-4 py-3 bg-indigo-100 hover:bg-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 text-indigo-700 dark:text-indigo-400 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                   <Trash2 className="w-4 h-4" />
                   حذف الإيصال
                 </button>
                 <button
                   onClick={() => setDetailsModal({ isOpen: false, receipt: null })}
                   className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold rounded-xl transition-all"
                 >
                   إغلاق التفاصيل
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distributor Notification Simulation */}
      {distributorNotification && distributorNotification.show && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-500 max-w-sm w-full">
          <div className="bg-white dark:bg-slate-900 border-l-4 border-indigo-500 rounded-2xl p-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-bounce" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  إشعار فوري للموزع
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">مباشر</span>
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-1 mb-2">
                  إلى: {distributorNotification.distributorName}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    <span className="font-bold">عزيزي الموزع،</span> تم رفض إيصال تحويل خاص بالمشترك <span className="font-bold text-indigo-600 dark:text-indigo-400">{distributorNotification.customerName}</span>.
                  </p>
                  <div className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>السبب: {distributorNotification.reason}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setDistributorNotification({ ...distributorNotification, show: false })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
