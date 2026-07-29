import React, { useState, useMemo } from "react";
import { Customer, Distributor, Currency } from "../types";
import { DollarSign, Search, Filter, TrendingUp, Users, ArrowDown, ArrowUp, FileText , MessageSquare, Clock } from "lucide-react";
import FinancialReportModal from "./FinancialReportModal";
import WhatsAppReminderModal from "./WhatsAppReminderModal";

interface SubscriberFinancialsViewProps {
  customers: Customer[];
  distributors: Distributor[];
  currencies?: Currency[];
  defaultCurrency?: string;
  onUpdateCustomer: (customer: Customer) => void;
  isDistributorSession?: boolean;
}

export default function SubscriberFinancialsView({
  customers,
  distributors,
  currencies = [],
  defaultCurrency = "LYD",
  onUpdateCustomer,
  isDistributorSession = false
}: SubscriberFinancialsViewProps) {
  const [activeTab, setActiveTab] = useState<'subscribers' | 'distributors'>('subscribers');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDistributor, setFilterDistributor] = useState<string>("all");
  
  const [reportEntity, setReportEntity] = useState<{entity: Customer | Distributor, type: 'customer'|'distributor'} | null>(null);
  const [reminderCustomer, setReminderCustomer] = useState<Customer | null>(null);

  const handleSendManual = (customer: Customer, message: string) => {
    // In a real app this would call an API, here we just simulate
    alert(`تم إرسال رسالة الواتساب إلى ${customer.name}:

${message}`);
  };

  const handleSchedule = (customer: Customer, datetime: string, message: string) => {
    // In a real app this would save to the DB, here we simulate by alerting
    alert(`تم جدولة رسالة تذكير للعميل ${customer.name} في ${datetime}`);
    const updated = {
      ...customer,
      autoWhatsAppAlert: true,
      autoWhatsAppAlertLogs: [
        ...(customer.autoWhatsAppAlertLogs || []),
        { date: datetime, status: "pending" as const, message }
      ]
    };
    onUpdateCustomer(updated);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.includes(searchTerm) || c.username.includes(searchTerm);
    const matchesDistributor = filterDistributor === "all" || c.distributorId === filterDistributor;
    return matchesSearch && matchesDistributor;
  });

  const filteredDistributors = distributors.filter(d => {
    return d.name.includes(searchTerm) || d.username.includes(searchTerm);
  });

  const totalCustomerDebt = customers.reduce((acc, c) => acc + (c.debt || 0), 0);
  const totalCustomerBalance = customers.reduce((acc, c) => acc + (c.balance || 0), 0);
  const subscribersWithDebt = customers.filter(c => (c.debt || 0) > 0).length;

  const totalDistributorBalance = distributors.reduce((acc, d) => acc + (d.balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
      {reportEntity && (
        <FinancialReportModal 
          entity={reportEntity.entity}
          type={reportEntity.type}
          onClose={() => setReportEntity(null)}
          defaultCurrency={defaultCurrency}
        />
      )}
      
      <WhatsAppReminderModal
        isOpen={!!reminderCustomer}
        onClose={() => setReminderCustomer(null)}
        customer={reminderCustomer}
        onSendManual={handleSendManual}
        onSchedule={handleSchedule}
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-indigo-600" />
            الحسابات المالية والتقارير
          </h2>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
            متابعة الديون والأرصدة والوضع المالي واستخراج كشف الحساب
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'subscribers'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          حسابات المشتركين
        </button>
        {!isDistributorSession && (
          <button
            onClick={() => setActiveTab('distributors')}
          className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
            activeTab === 'distributors'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
            حسابات الموزعين
          </button>
        )}
      </div>

      {activeTab === 'subscribers' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <ArrowDown className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-500">إجمالي الديون (للمشتركين)</h3>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCustomerDebt.toFixed(2)} {defaultCurrency}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-500">إجمالي الأرصدة المتوفرة</h3>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalCustomerBalance.toFixed(2)} {defaultCurrency}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-500">مشتركون عليهم ديون</h3>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {subscribersWithDebt} مشترك
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم المشترك أو اسم المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
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
            </div>

            <div className="table-scroll-container">
              <table className="w-full text-right min-w-[700px] sticky-table">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky-thead">
                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">المشترك</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الرصيد المتاح</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الديون المسجلة</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الموزع التابع له</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="text-sm font-bold text-slate-500">لم يتم العثور على مشتركين مطابقين للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer, index) => (
                      <tr key={customer?.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-1 py-1 text-center text-slate-400 font-mono text-[10px] w-8">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</div>
                          <div className="text-xs text-slate-500 font-mono">@{customer.username}</div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                            (customer.balance || 0) > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {customer.balance || 0} {defaultCurrency}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                            (customer.debt || 0) > 0 ? "bg-indigo-100 text-indigo-700 dark:bg-rose-900/40 dark:text-indigo-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {customer.debt || 0} {defaultCurrency}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {distributors.find(d => d?.id === customer.distributorId)?.name || "مدير النظام"}
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => setReportEntity({ entity: customer, type: 'customer' })}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              كشف حساب
                            </button>
                            {(customer.debt || 0) > 0 && (
                              <button
                                onClick={() => setReminderCustomer(customer)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                                title="تنبيه بالدفع"
                              >
                                <MessageSquare className="w-4 h-4" />
                                تنبيه
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ArrowUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-500">إجمالي أرصدة الموزعين</h3>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {totalDistributorBalance.toFixed(2)} {defaultCurrency}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-500">عدد الموزعين</h3>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {distributors.length} موزع
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="relative w-full md:w-96">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث باسم الموزع أو اسم المستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="table-scroll-container">
              <table className="w-full text-right min-w-[600px] sticky-table">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky-thead">
                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400">#</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الموزع</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">الرصيد المتاح</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">عدد المشتركين</th>
                    <th className="px-2 py-2 text-xs font-black text-slate-500 dark:text-slate-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDistributors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-sm font-bold text-slate-500">لم يتم العثور على موزعين مطابقين للبحث</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDistributors.map((distributor, index) => (
                      <tr key={distributor?.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-1 py-1 text-center text-slate-400 font-mono text-[10px] w-8">
                          {index + 1}
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{distributor.name}</div>
                          <div className="text-xs text-slate-500 font-mono">@{distributor.username}</div>
                        </td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black ${
                            (distributor.balance || 0) > 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
                            {distributor.balance || 0} {defaultCurrency}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {distributor.customersCount} مشترك
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => setReportEntity({ entity: distributor, type: 'distributor' })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            كشف حساب
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
