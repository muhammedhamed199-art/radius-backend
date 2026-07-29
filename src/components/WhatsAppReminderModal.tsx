import React, { useState } from 'react';
import { Customer } from '../types';
import { X, MessageSquare, Clock, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSendManual: (customer: Customer, message: string) => void;
  onSchedule: (customer: Customer, date: string, message: string) => void;
}

export default function WhatsAppReminderModal({ isOpen, onClose, customer, onSendManual, onSchedule }: Props) {
  const [tab, setTab] = useState<'manual' | 'schedule'>('manual');
  const [message, setMessage] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  // Default message
  React.useEffect(() => {
    if (customer && isOpen) {
      setMessage(`مرحباً ${customer.name}،\nنود تذكيرك بأن لديك رصيد مستحق بقيمة ${customer.debt} ريال. يرجى المبادرة بالسداد لتجنب انقطاع الخدمة.`);
      setScheduleDate('');
      setScheduleTime('');
    }
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-500" />
            تنبيه دفع عبر الواتساب
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-2 py-3 text-xs md:text-sm border-b border-slate-200 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'manual' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            إرسال فوري
          </button>
          <button
            onClick={() => setTab('schedule')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${tab === 'schedule' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
          >
            جدولة تذكير آلي
          </button>
        </div>

        <div className="px-2 py-3 text-xs md:text-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">المشترك</label>
            <div className="text-sm font-medium text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              {customer.name} ({customer.phone || 'لا يوجد رقم هاتف'})
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">نص الرسالة</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-28 p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {tab === 'schedule' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">تاريخ التذكير</label>
                <div className="relative">
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full p-2.5 pl-8 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">وقت التذكير</label>
                <div className="relative">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full p-2.5 pl-8 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-2 py-3 text-xs md:text-sm border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            إلغاء
          </button>
          
          {tab === 'manual' ? (
            <button
              onClick={() => {
                onSendManual(customer, message);
                onClose();
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              disabled={!customer.phone}
            >
              <MessageSquare className="w-4 h-4" />
              إرسال الآن
            </button>
          ) : (
            <button
              onClick={() => {
                if (scheduleDate && scheduleTime) {
                  onSchedule(customer, `${scheduleDate}T${scheduleTime}`, message);
                  onClose();
                } else {
                  alert('الرجاء تحديد التاريخ والوقت');
                }
              }}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              حفظ الجدولة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
