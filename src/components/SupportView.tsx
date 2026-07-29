/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  User, 
  Clock, 
  Check, 
  Trash2, 
  HelpCircle,
  FileText,
  MessageCircle,
  X
} from "lucide-react";
import { SupportTicket, UserRole } from "../types";

interface SupportViewProps {
  tickets: SupportTicket[];
  onAddTicket: (ticket: Omit<SupportTicket, "id" | "replies" | "status">) => void;
  onAddReply: (ticketId: string, reply: { senderName: string; senderRole: UserRole; message: string }) => void;
  onDeleteTicket: (id: string) => void;
  onCloseTicket: (id: string) => void;
  currentUser?: { name: string; role: string; username: string };
}

export default function SupportView({
  tickets,
  onAddTicket,
  onAddReply,
  onDeleteTicket,
  onCloseTicket,
  currentUser
}: SupportViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets.length > 0 ? tickets[0]?.id : null);

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

  // Add Ticket fields
  const [senderName, setSenderName] = useState(currentUser?.name || "");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [senderRole, setSenderRole] = useState<UserRole>(
    currentUser?.role.includes("مدير") ? UserRole.ADMIN : UserRole.DISTRIBUTOR
  );

  // Sync sender name when modal opens or currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setSenderName(currentUser.name);
      setSenderRole(currentUser.role.includes("مدير") ? UserRole.ADMIN : UserRole.DISTRIBUTOR);
    }
  }, [currentUser, showAddModal]);

  // Reply text field
  const [replyText, setReplyText] = useState("");

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !title || !message) return;

    onAddTicket({
      senderName,
      senderRole,
      title,
      message,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16)
    });

    setSenderName(currentUser?.name || "");
    setTitle("");
    setMessage("");
    setShowAddModal(false);
    
    // Automatically select the newly created ticket
    setTimeout(() => {
      if (tickets.length > 0) {
        setSelectedTicketId(tickets[0]?.id);
      }
    }, 100);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    const role = currentUser?.role.includes("مدير") ? UserRole.ADMIN : UserRole.DISTRIBUTOR;
    const name = currentUser?.name || "مستخدم النظام";

    onAddReply(selectedTicketId, {
      senderName: name,
      senderRole: role,
      message: replyText
    });

    setReplyText("");
  };

  const activeTicket = tickets.find(t => t?.id === selectedTicketId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-indigo-600" />
            مركز الدعم الفني والرسائل المتبادلة
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            منصة تواصل تفاعلية تتيح للموزعين والموظفين ترك تذاكر دعم فني بخصوص مشاكل الشبكة، والرد الفوري عليها من قبل المدير المسؤول.
          </p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100 shrink-0"
        >
          <Plus className="w-4 h-4" />
          إنشاء تذكرة دعم جديدة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Tickets List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 h-[550px] flex flex-col">
          <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs md:text-sm border-b pb-3 mb-3 flex items-center gap-1.5 shrink-0">
            <MessageCircle className="w-4 h-4 text-indigo-500" />
            قائمة التذاكر الواردة والطلبات
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5">
            {tickets.length === 0 ? (
              <div className="text-center py-20 text-slate-400 font-medium">
                لا توجد تذاكر دعم فني نشطة حالياً.
              </div>
            ) : (
              tickets.map((ticket) => {
                const isActive = ticket?.id === selectedTicketId;
                return (
                  <div
                    key={ticket?.id}
                    onClick={() => setSelectedTicketId(ticket?.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isActive 
                        ? "border-indigo-500 bg-indigo-50/50" 
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:bg-slate-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-100 truncate max-w-[150px]">{ticket.title}</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        ticket.status === "مفتوح" ? "bg-red-100 text-red-700" :
                        ticket.status === "تم الرد" ? "bg-green-100 text-green-700" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                      }`}>{ticket.status}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                      <span className="text-indigo-600">{ticket.senderName}</span>
                      <span>•</span>
                      <span>{ticket.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Ticket Chat & Responses */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-[550px] flex flex-col overflow-hidden">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base">{activeTicket.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-1">مرسلة بواسطة: {activeTicket.senderName} ({activeTicket.senderRole}) • {activeTicket.date}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onCloseTicket(activeTicket?.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold transition-all border border-slate-700"
                  >
                    إغلاق التذكرة
                  </button>
                  <button
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: "تأكيد حذف تذكرة الدعم",
                        message: "هل ترغب بحذف تذكرة الدعم الفني هذه نهائياً؟",
                        description: "سيتم مسح التذكرة وكافة الردود التابعة لها.",
                        confirmText: "حذف التذكرة",
                        onConfirm: () => {
                          onDeleteTicket(activeTicket?.id);
                          setSelectedTicketId(tickets.length > 1 ? tickets[0]?.id : null);
                        }
                      });
                    }}
                    className="p-1 hover:bg-red-950 text-red-400 rounded transition-all"
                    title="حذف التذكرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Thread Container */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50 dark:bg-slate-800/50">
                {/* Distributor Message (The Original ticket post) */}
                <div className="flex items-start gap-3 text-xs md:text-sm max-w-[85%] bg-white dark:bg-slate-900 p-4 rounded-2xl border shadow-sm">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-100">{activeTicket.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{activeTicket.date}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                      {activeTicket.message}
                    </p>
                  </div>
                </div>

                {/* Responses List */}
                {activeTicket.replies.map((reply) => {
                  const isAdmin = reply.senderRole === UserRole.ADMIN;
                  return (
                    <div 
                      key={reply?.id} 
                      className={`flex items-start gap-3 text-xs md:text-sm max-w-[85%] p-4 rounded-2xl border shadow-sm ${
                        isAdmin 
                          ? "bg-slate-900 border-slate-800 text-slate-900 mr-auto flex-row-reverse" 
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 ml-auto"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isAdmin ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className={`flex items-center gap-2 ${isAdmin ? "flex-row-reverse" : ""}`}>
                          <span className={`font-bold ${isAdmin ? "text-indigo-400" : "text-slate-800 dark:text-slate-100"}`}>{reply.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{reply.date}</span>
                        </div>
                        <p className={`leading-relaxed font-medium ${isAdmin ? "text-slate-100" : "text-slate-700 dark:text-slate-200"}`}>
                          {reply.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              {activeTicket.status !== "مغلق" ? (
                <form onSubmit={handleSendReply} className="px-2 py-3 text-xs md:text-sm bg-white dark:bg-slate-900 border-t flex gap-2 shrink-0">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="اكتب رد الدعم الفني الإداري هنا والمقترحات للحل..."
                    className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    required
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1 shadow-lg shadow-indigo-100"
                  >
                    <Send className="w-3.5 h-3.5 rotate-180" />
                    إرسال الرد
                  </button>
                </form>
              ) : (
                <div className="px-2 py-3 text-xs md:text-sm bg-slate-100 dark:bg-slate-800 text-center text-slate-400 font-bold text-xs shrink-0">
                  ⚠️ هذه التذكرة مغلقة بالكامل حالياً. لا يمكن إضافة ردود جديدة.
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
              <HelpCircle className="w-16 h-16 text-slate-200 mb-2" />
              <p className="text-sm font-bold">يرجى اختيار تذكرة دعم فني من القائمة لعرض تفاصيل الردود والحلول.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="bg-indigo-950 text-slate-900 p-5 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-400" />
                إنشاء تذكرة دعم فني جديدة للشبكة
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-indigo-900 rounded-lg text-indigo-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">اسم مرسل التذكرة (الموظف/الموزع):</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="مثال: سليمان الغامدي"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">دور الموظف:</label>
                <select
                  value={senderRole}
                  onChange={(e) => setSenderRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none"
                >
                  <option value={UserRole.DISTRIBUTOR}>موزع فرعي</option>
                  <option value={UserRole.ADMIN}>مدير شبكة</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">عنوان المشكلة الفنية (الموضوع):</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: مشكلة تغطية في السيكتور الجنوبي"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">تفاصيل ومحتوى الرسالة بالكامل:</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب تفاصيل العطل، المنطقة، وأسماء العملاء المتأثرين..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-lg transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-200"
                >
                  إرسال التذكرة للمراجعة
                </button>
              </div>
            </form>
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
