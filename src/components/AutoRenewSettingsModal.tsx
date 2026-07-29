import React, { useState, useEffect } from "react";
import { Customer } from "../types";
import { CalendarClock, Shield, Save, X, Calendar, MessageSquare, Clock } from "lucide-react";

interface AutoRenewSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onUpdateCustomer: (customer: Customer) => void;
}

export default function AutoRenewSettingsModal({
  isOpen,
  onClose,
  customer,
  onUpdateCustomer
}: AutoRenewSettingsModalProps) {
  const [autoRenew, setAutoRenew] = useState(false);
  const [autoRenewDate, setAutoRenewDate] = useState("");
  const [autoWhatsAppAlert, setAutoWhatsAppAlert] = useState(false);

  useEffect(() => {
    if (customer) {
      setAutoRenew(!!customer.autoRenew);
      // We will parse autoRenewDate or use the expiryDate as a fallback for the date input
      setAutoRenewDate(customer.autoRenewDate || customer.expiryDate?.split("T")[0] || "");
      setAutoWhatsAppAlert(!!customer.autoWhatsAppAlert);
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSave = () => {
    onUpdateCustomer({
      ...customer,
      autoRenew,
      autoRenewDate,
      autoWhatsAppAlert
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">إعدادات التجديد التلقائي</h2>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                المشترك: {customer.name} (@{customer.username})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Auto Renew Toggle */}
          <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={autoRenew}
                  onChange={(e) => setAutoRenew(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors ${autoRenew ? 'bg-indigo-500' : ''}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoRenew ? 'transform translate-x-5' : ''}`}></div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  تفعيل التجديد التلقائي للاشتراك
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  سيتم خصم قيمة الاشتراك وتجديده تلقائياً لتفادي انقطاع الخدمة عن المشترك.
                </p>
              </div>
            </label>
          </div>

          {/* Auto Renew Date Options */}
          {autoRenew && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300">
                تاريخ استحقاق التجديد التلقائي (تاريخ الدورة):
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  value={autoRenewDate}
                  onChange={(e) => setAutoRenewDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pr-10 pl-3 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                سيتم تشغيل عملية التجديد في هذا التاريخ من كل شهر أو دورة.
              </p>
            </div>
          )}

          {/* WhatsApp Alert Before 3 Days */}
          <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="relative flex items-center mt-0.5">
                <input
                  type="checkbox"
                  checked={autoWhatsAppAlert}
                  onChange={(e) => setAutoWhatsAppAlert(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full transition-colors ${autoWhatsAppAlert ? 'bg-emerald-500' : ''}`}></div>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${autoWhatsAppAlert ? 'transform translate-x-5' : ''}`}></div>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800 dark:text-slate-200">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  إرسال إشعار واتساب قبل 3 أيام
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  سيتم إرسال رسالة تذكيرية آلياً للمشترك عبر الواتساب قبل موعد الانتهاء (أو الاستحقاق) بـ 3 أيام لتذكيره بالرصيد.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Save className="w-4 h-4" />
            حفظ الإعدادات
          </button>
        </div>
      </div>
    </div>
  );
}
