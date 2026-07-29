import React, { useMemo, useState } from 'react';
import { Customer, Distributor, TransactionRecord } from '../types';
import { X, TrendingUp, DollarSign, FileText, ArrowUp, ArrowDown, Download, CheckSquare, Square, Settings, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface FinancialReportModalProps {
  entity: Customer | Distributor;
  type: 'customer' | 'distributor';
  onClose: () => void;
  defaultCurrency: string;
}

const COLORS = ['#10b981', '#f43f5e'];

export default function FinancialReportModal({ entity, type, onClose, defaultCurrency }: FinancialReportModalProps) {
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    date: true,
    type: true,
    amount: true,
    description: true,
    referenceId: true,
    processedBy: true
  });

  const transactions = useMemo(() => {
    if (entity.transactions && entity.transactions.length > 0) {
      return entity.transactions;
    }
    const dummy: TransactionRecord[] = [];
    const now = new Date();
    for (let i = 5; i >= 1; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 7);
      dummy.push({
        id: `txn_p_${i}`,
        date: date.toISOString(),
        type: 'payment',
        amount: 0,
        description: 'إيداع نقدي',
        referenceId: `INV-${1000 + i}`,
        processedBy: 'المدير'
      });
      const deductDate = new Date(date);
      deductDate.setDate(deductDate.getDate() + 2);
      dummy.push({
        id: `txn_d_${i}`,
        date: deductDate.toISOString(),
        type: 'deduction',
        amount: 0,
        description: 'خصم اشتراك',
        referenceId: `SUB-${2000 + i}`,
        processedBy: 'النظام'
      });
    }
    return dummy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entity]);

  const totalPayments = transactions.filter(t => t.type === 'payment').reduce((acc, t) => acc + t.amount, 0);
  const totalDeductions = transactions.filter(t => t.type === 'deduction').reduce((acc, t) => acc + t.amount, 0);

  const chartData = useMemo(() => {
    return transactions.slice().reverse().map(t => ({
      name: new Date(t.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' }),
      payment: t.type === 'payment' ? t.amount : 0,
      deduction: t.type === 'deduction' ? t.amount : 0,
    }));
  }, [transactions]);

  const pieData = [
    { name: 'إيداعات (مدفوعات)', value: totalPayments },
    { name: 'خصومات (مسحوبات)', value: totalDeductions },
  ];

  const handlePrint = () => {
    window.print();
  };

  const toggleColumn = (key: keyof typeof selectedColumns) => {
    setSelectedColumns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    
      <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-section, #print-section * {
            visibility: visible;
          }
          #print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      <div id="print-section" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm print:static print:inset-auto print:bg-white print:p-0" dir="rtl">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:w-full print:block print:max-h-none print:rounded-none">
        
        {/* Header - Hidden in Print, replaced by print header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                كشف حساب - {entity.name}
              </h2>
              <p className="text-sm font-bold text-slate-500">
                {type === 'customer' ? 'مشترك' : 'موزع'} | @{entity.username}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Settings className="w-4 h-4" />
                تخصيص التقرير
              </button>
              
              {showExportOptions && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-10">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">الأعمدة المعروضة في التقرير</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'date', label: 'التاريخ' },
                      { key: 'type', label: 'نوع العملية' },
                      { key: 'amount', label: 'المبلغ' },
                      { key: 'description', label: 'البيان' },
                      { key: 'referenceId', label: 'رقم الفاتورة/المرجع' },
                      { key: 'processedBy', label: 'الموظف/النظام' }
                    ].map(col => (
                      <button 
                        key={col.key}
                        onClick={() => toggleColumn(col.key as any)}
                        className="flex items-center gap-2 w-full text-right text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg"
                      >
                        {selectedColumns[col.key as keyof typeof selectedColumns] ? 
                          <CheckSquare className="w-4 h-4 text-indigo-600" /> : 
                          <Square className="w-4 h-4 text-slate-400" />
                        }
                        <span>{col.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setShowExportOptions(false);
                      handlePrint();
                    }}
                    className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-sm font-bold transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    طباعة / تصدير PDF
                  </button>
                </div>
              )}
            </div>

            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block p-8 border-b-2 border-slate-200 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">كشف حساب مالي</h1>
              <div className="text-slate-600 font-bold space-y-1">
                <p>الاسم: {entity.name}</p>
                <p>اسم المستخدم: @{entity.username}</p>
                <p>النوع: {type === 'customer' ? 'مشترك' : 'موزع'}</p>
              </div>
            </div>
            <div className="text-left text-slate-500 font-bold text-sm space-y-1">
              <p>تاريخ التقرير: {new Date().toLocaleDateString('ar-SA')}</p>
              <p>وقت التقرير: {new Date().toLocaleTimeString('ar-SA')}</p>
              <p>العملة: {defaultCurrency}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-8 print:overflow-visible">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:grid-cols-4 print:gap-4 print:break-inside-avoid">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 print:border-slate-300 print:bg-slate-50">
              <h3 className="text-xs font-bold text-slate-500 mb-1">الرصيد الحالي</h3>
              <div className="text-2xl font-black text-slate-900 dark:text-white print:text-black">
                {entity.balance || 0} {defaultCurrency}
              </div>
            </div>
            {type === 'customer' && (
              <div className="bg-rose-50 dark:bg-rose-900/10 p-5 rounded-2xl border border-indigo-100 dark:border-rose-900/30 print:border-slate-300 print:bg-white">
                <h3 className="text-xs font-bold text-indigo-500 print:text-slate-600 mb-1">الديون المستحقة</h3>
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 print:text-black">
                  {(entity as Customer).debt || 0} {defaultCurrency}
                </div>
              </div>
            )}
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 print:border-slate-300 print:bg-white">
              <h3 className="text-xs font-bold text-emerald-600 print:text-slate-600 mb-1">إجمالي المدفوعات</h3>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 print:text-black">
                {totalPayments} {defaultCurrency}
              </div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/30 print:border-slate-300 print:bg-white">
              <h3 className="text-xs font-bold text-orange-600 print:text-slate-600 mb-1">إجمالي الخصومات</h3>
              <div className="text-2xl font-black text-orange-600 dark:text-orange-400 print:text-black">
                {totalDeductions} {defaultCurrency}
              </div>
            </div>
          </div>

          {/* Charts Row - Hidden in print to save space/ink and focus on the table, or we can keep it */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:hidden">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                حركة الحساب (آخر العمليات)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="payment" name="إيداع" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="deduction" name="خصم" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-500" />
                توزيع العمليات
              </h3>
              <div className="flex-1 flex items-center justify-center min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-xs font-bold mt-2">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> إيداعات</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-500"></div> خصومات</div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm print:shadow-none print:border-slate-300">
            <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 print:bg-slate-100 print:border-slate-300">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm print:text-black">سجل العمليات بالتفصيل</h3>
            </div>
            <div className="table-scroll-container print:overflow-visible">
              <table className="w-full text-right print:text-black min-w-[650px] sticky-table">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 print:bg-white print:border-slate-300 sticky-thead">
                  <tr>
                    <th className="px-2 py-2 text-[10px] md:text-xs w-8 text-center text-slate-400 print:text-slate-800">#</th>
                    {selectedColumns.date && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">التاريخ</th>}
                    {selectedColumns.type && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">نوع العملية</th>}
                    {selectedColumns.amount && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">المبلغ</th>}
                    {selectedColumns.description && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">البيان</th>}
                    {selectedColumns.referenceId && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">رقم الفاتورة/المرجع</th>}
                    {selectedColumns.processedBy && <th className="px-2 py-2 text-xs font-black text-slate-500 print:text-slate-800">الموظف/النظام</th>}
                  </tr>
                </thead>
                <tbody>
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm font-bold text-slate-500">
                        لا توجد عمليات مسجلة
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, index) => (
                      <tr key={txn?.id} className="border-b border-slate-200 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 print:border-slate-300 print:break-inside-avoid">
                        <td className="px-1 py-1.5 text-center text-slate-400 font-mono text-[10px] print:text-xs w-8">
                          {index + 1}
                        </td>
                        {selectedColumns.date && (
                          <td className="px-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                            {new Date(txn.date).toLocaleDateString('ar-SA')} - {new Date(txn.date).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}
                          </td>
                        )}
                        {selectedColumns.type && (
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg print:border print:border-slate-300 print:bg-transparent ${
                              txn.type === 'payment' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 print:text-black' : 'bg-indigo-100 text-indigo-700 dark:bg-rose-900/30 dark:text-indigo-400 print:text-black'
                            }`}>
                              {txn.type === 'payment' ? <ArrowUp className="w-3 h-3 print:hidden" /> : <ArrowDown className="w-3 h-3 print:hidden" />}
                              {txn.type === 'payment' ? 'إيداع / دفع' : 'خصم'}
                            </span>
                          </td>
                        )}
                        {selectedColumns.amount && (
                          <td className="px-2 py-2 font-black text-sm text-slate-900 dark:text-slate-200 print:text-black">
                            <span className={`print:text-black ${txn.type === 'payment' ? 'text-emerald-600 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                              {txn.type === 'payment' ? '+' : '-'}{txn.amount} {defaultCurrency}
                            </span>
                          </td>
                        )}
                        {selectedColumns.description && (
                          <td className="px-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                            {txn.description}
                          </td>
                        )}
                        {selectedColumns.referenceId && (
                          <td className="px-2 py-2 text-xs font-mono text-slate-600 dark:text-slate-400 print:text-black">
                            {txn.referenceId || '-'}
                          </td>
                        )}
                        {selectedColumns.processedBy && (
                          <td className="px-2 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 print:text-black">
                            {txn.processedBy || 'النظام'}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-12 text-center text-sm font-bold text-slate-500">
            <p>هذا الكشف تم إصداره آلياً ولا يحتاج إلى توقيع.</p>
            <p className="mt-2">نظام إدارة المشتركين والموزعين</p>
          </div>

        </div>
      </div>
    </div>
  </>
  );
}
