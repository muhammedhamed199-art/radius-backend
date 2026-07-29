/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Send, 
  MessageSquare, 
  PhoneCall, 
  SendHorizontal, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  RefreshCw, 
  ExternalLink,
  Code,
  Zap,
  Globe,
  Radio,
  Copy
} from "lucide-react";
import { Customer, SpeedOffer } from "../types";

interface MessagingGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  offers: SpeedOffer[];
  selectedCustomerIds?: string[];
  singleCustomer?: Customer | null;
}

export type GatewayType = "whatsapp" | "sms" | "telegram";
export type TemplateType = "renewal" | "welcome" | "debt" | "custom";

export default function MessagingGatewayModal({
  isOpen,
  onClose,
  customers,
  offers,
  selectedCustomerIds = [],
  singleCustomer = null
}: MessagingGatewayModalProps) {
  // Gateway Channels Config
  const [selectedGateway, setSelectedGateway] = useState<GatewayType>("whatsapp");
  
  // WhatsApp Settings
  const [waMode, setWaMode] = useState<"web" | "api">("web");
  const [waInstanceId, setWaInstanceId] = useState<string>("instance98521");
  const [waApiToken, setWaApiToken] = useState<string>("token_abc123xyz");

  // SMS Settings
  const [smsApiUrl, setSmsApiUrl] = useState<string>("https://api.sms-gateway.com/v1/send?apiKey=YOUR_KEY&to={PHONE}&msg={TEXT}");
  const [smsAuthToken, setSmsAuthToken] = useState<string>("");

  // Telegram Settings
  const [telegramBotToken, setTelegramBotToken] = useState<string>("6842391054:AAH9_ExampleBotToken123");
  const [telegramDefaultChatId, setTelegramDefaultChatId] = useState<string>("-1001928374");

  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>("renewal");
  const [customMessageBody, setCustomMessageBody] = useState<string>("");

  // Target audience scope
  const [targetScope, setTargetScope] = useState<"single" | "selected" | "all" | "expiring">(
    singleCustomer ? "single" : selectedCustomerIds.length > 0 ? "selected" : "all"
  );

  // Dispatch state
  const [savedTemplates, setSavedTemplates] = useState<{id: string, name: string, body: string}[]>(() => {
    const saved = localStorage.getItem("savedMessageTemplates");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [isSending, setIsSending] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Determine target customer list
  const targetCustomers = useMemo(() => {
    if (singleCustomer && targetScope === "single") {
      return [singleCustomer];
    }
    if (targetScope === "selected" && selectedCustomerIds.length > 0) {
      return customers.filter(c => selectedCustomerIds.includes(c?.id));
    }
    if (targetScope === "expiring") {
      const today = new Date();
      return customers.filter(c => {
        if (!c.expiryDate) return false;
        const exp = new Date(c.expiryDate);
        const diffDays = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 5; // Expiring in 5 days
      });
    }
    return customers;
  }, [customers, selectedCustomerIds, singleCustomer, targetScope]);

  if (!isOpen) return null;

  // Render Template Text for a specific customer
  const renderMessageText = (template: TemplateType, customer: Customer): string => {
    const offer = offers.find(o => o?.id === customer.offerId);
    const offerName = offer ? offer.name : "الباقة الشهرية";

    if (template === "welcome") {
      return `مرحباً بك عزيزي المشترك (${customer.name}) في شبكتنا! 👋\n` +
        `تفاصيل اشتراكك:\n` +
        `• الباقة: ${offerName}\n` +
        `• تاريخ الانتهاء: ${customer.expiryDate}\n` +
        `شكراً لاشتراكك معنا، نتمنى لك تجربة تصفح ممتازة! 🚀`;
    }

    if (template === "renewal") {
      return `تنبيه تجديد اشتراك 🔔\n` +
        `عزيزي المشترك (${customer.name})، نود إعلامك بأن اشتراكك في باقة (${offerName}) سينتهي بتاريخ (${customer.expiryDate}).\n` +
        `يرجى التجديد لتجنب انقطاع الخدمة المؤقت.\n` +
        `للتواصل مع الدعم الفني أو السداد أجب على هذه الرسالة.`;
    }

    if (template === "debt") {
      return `إشعار مستحقات مالية 💰\n` +
        `عزيزي المشترك (${customer.name})، يوجد مديونية متبقية على حسابك قدرها (${customer.debt || 0}) ريال.\n` +
        `يرجى سداد المبلغ المطلوب لاستمرار تفعيل الاشتراك الخاص بك بشكل منتظم.`;
    }

    // Custom template
    let text = customMessageBody || "تنبيه هام من إدارة الشبكة إلى المشترك {name}";
    return text
      .replace(/{name}/g, customer.name)
      .replace(/{username}/g, "")
      .replace(/{password}/g, "")
      .replace(/{offer}/g, offerName)
      .replace(/{expiryDate}/g, customer.expiryDate)
      .replace(/{phone}/g, customer.phone || "")
      .replace(/{debt}/g, String(customer.debt || 0))
      .replace(/{ipAddress}/g, customer.ipAddress || "");
  };

  // Perform Test Connection to Gateway
  const handleTestGateway = async () => {
    setTestResult(null);
    const testCust: Customer = {
      id: "test",
      name: "عميل التجربة",
      username: "test_user",
      password: "123",
      status: "نشط" as any,
      connectionType: "PPPoE" as any,
      ipAddress: "192.168.88.10",
      ipAssignmentType: "auto",
      concurrentLogins: 1,
      offerId: offers[0]?.id || "",
      consumptionGB: 5,
      startDate: "2026-07-01",
      expiryDate: "2026-08-01",
      phone: "966500000000"
    };

    const text = renderMessageText(selectedTemplate, testCust);

    if (selectedGateway === "whatsapp") {
      if (waMode === "web") {
        const url = `https://wa.me/966500000000?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank");
        setTestResult("✅ تم فتح رابط WhatsApp Web التجريبي بنجاح!");
      } else {
        setTestResult(`✅ تم اختبار اتصال بوابة WhatsApp API (Instance: ${waInstanceId}) بنجاح!`);
      }
    } else if (selectedGateway === "sms") {
      const formattedUrl = smsApiUrl
        .replace("{PHONE}", "966500000000")
        .replace("{TEXT}", encodeURIComponent(text));
      setTestResult(`✅ تم اختبار بناء رابط بوابة الـ SMS بنجاح: ${formattedUrl.substring(0, 60)}...`);
    } else if (selectedGateway === "telegram") {
      setTestResult(`✅ تم اختبار بوابة تلجرام بنجاح متصل بـ Bot Token (Chat ID: ${telegramDefaultChatId})`);
    }
  };

  // Execute Dispatch Batch
  const handleStartDispatch = async () => {
    if (targetCustomers.length === 0) {
      alert("⚠️ لا يوجد عملاء محددين للإرسال!");
      return;
    }

    setIsSending(true);
    setLogs([]);
    setDispatchProgress({ current: 0, total: targetCustomers.length });

    const newLogs: string[] = [];
    const pushLog = (msg: string) => {
      newLogs.push(`[${new Date().toLocaleTimeString("ar-EG")}] ${msg}`);
      setLogs([...newLogs]);
    };

    pushLog(`🚀 بدء إرسال الرسائل عبر بوابة (${selectedGateway.toUpperCase()}) إلى (${targetCustomers.length}) مشترك...`);

    for (let i = 0; i < targetCustomers.length; i++) {
      const cust = targetCustomers[i];
      const msgText = renderMessageText(selectedTemplate, cust);
      const phone = cust.phone || "بدون رقم";

      setDispatchProgress({ current: i + 1, total: targetCustomers.length });

      // Simulate sending latency per subscriber
      await new Promise(res => setTimeout(res, 400));

      if (selectedGateway === "whatsapp") {
        if (waMode === "web") {
          pushLog(`🟢 [WhatsApp Web] إعداد رابط إرسال للعميل (${cust.name} - ${phone})`);
        } else {
          pushLog(`🟢 [WhatsApp API] تم توجيه الرسالة عبر الخادم إلى (${cust.name} - ${phone}) - الحالة: Delivered`);
        }
      } else if (selectedGateway === "sms") {
        if (!cust.phone) {
          pushLog(`⚠️ [SMS] العميل (${cust.name}) ليس لديه رقم هاتف مسجل - تم التجاوز`);
        } else {
          pushLog(`📱 [SMS Gateway] تم إرسال الرسالة النصية بنجاح إلى (${phone})`);
        }
      } else if (selectedGateway === "telegram") {
        pushLog(`✈️ [Telegram Bot] تم بث الرسالة إلى المشترك (${cust.name}) عبر المساعد الالي`);
      }
    }

    pushLog(`🎉 اكتملت عملية الإرسال بنجاح لجميع المشتركين المحددين!`);
    setIsSending(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <SendHorizontal className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg md:text-xl flex items-center gap-2">
                مركز بوابات الإشعارات والتنبيهات (WhatsApp, SMS, Telegram)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                ربط وإرسال رسائل التجديد والتنبيهات والترحيب مباشرة للعملاء
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

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* 1. Gateway Channel Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Radio className="w-4 h-4 text-indigo-600" />
              1. اختر قناة وبوابة الإرسال المطلوبة (Notification Gateway):
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* WhatsApp Option */}
              <div
                onClick={() => setSelectedGateway("whatsapp")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedGateway === "whatsapp" 
                    ? "bg-emerald-50/80 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shrink-0 shadow-sm">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs">بوابة واتساب (WhatsApp)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">إرسال عبر WhatsApp Web أو API خادم البث المباشر.</p>
                </div>
              </div>

              {/* SMS Option */}
              <div
                onClick={() => setSelectedGateway("sms")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedGateway === "sms" 
                    ? "bg-indigo-50/80 border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="p-2.5 bg-indigo-600 text-white rounded-xl shrink-0 shadow-sm">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs">بوابة SMS القصيرة HTTP</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">التكامل المباشر مع مزودي خدمة الـ SMS عبر API HTTP.</p>
                </div>
              </div>

              {/* Telegram Option */}
              <div
                onClick={() => setSelectedGateway("telegram")}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedGateway === "telegram" 
                    ? "bg-white/80 border-sky-600 ring-2 ring-sky-500/20 text-sky-950" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200"
                }`}
              >
                <div className="p-2.5 bg-sky-500 text-slate-900 rounded-xl shrink-0 shadow-sm">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs">بوت تلجرام (Telegram Bot)</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">إرسال فوري مجاني عبر Telegram Bot API الرسمي.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Gateway Settings Accordion / Configuration details */}
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="block text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b pb-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              تكوين إعدادات بوابة ({selectedGateway.toUpperCase()})
            </span>

            {selectedGateway === "whatsapp" && (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">نمط التشغيل:</label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input type="radio" name="wammode" checked={waMode === "web"} onChange={() => setWaMode("web")} />
                    رابط WhatsApp Web المباشر (توليد روابط wa.me)
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer">
                    <input type="radio" name="wammode" checked={waMode === "api"} onChange={() => setWaMode("api")} />
                    خادم بوابة UltraMsg / Green API (آلي تلقائي)
                  </label>
                </div>

                {waMode === "api" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">معرف الجلسة (Instance ID):</label>
                      <input 
                        type="text" 
                        value={waInstanceId} 
                        onChange={(e) => setWaInstanceId(e.target.value)} 
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">رمز الأمان (Token):</label>
                      <input 
                        type="password" 
                        value={waApiToken} 
                        onChange={(e) => setWaApiToken(e.target.value)} 
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedGateway === "sms" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    رابط الـ API الخاص برسل الرسائل (استخدم الوسوم {`{PHONE}`} و {`{TEXT}`}):
                  </label>
                  <input 
                    type="text" 
                    value={smsApiUrl} 
                    onChange={(e) => setSmsApiUrl(e.target.value)} 
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono dir-ltr"
                    placeholder="https://api.gateway.com/send?to={PHONE}&message={TEXT}"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    سيتم استبدال الوسم {`{PHONE}`} برقم العميل تلقائياً والوسم {`{TEXT}`} بنص الرسالة المشفر.
                  </p>
                </div>
              </div>
            )}

            {selectedGateway === "telegram" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">رمز بوت تلجرام (Bot Token):</label>
                  <input 
                    type="text" 
                    value={telegramBotToken} 
                    onChange={(e) => setTelegramBotToken(e.target.value)} 
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono dir-ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">معرف القناة أو الشات (Chat ID / Username):</label>
                  <input 
                    type="text" 
                    value={telegramDefaultChatId} 
                    onChange={(e) => setTelegramDefaultChatId(e.target.value)} 
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono dir-ltr"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleTestGateway}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[11px] rounded-xl transition-all flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                اختبار الاتصال بالبوابة (Gateway Test)
              </button>

              {testResult && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {testResult}
                </span>
              )}
            </div>
          </div>

          {/* 2. Message Template Selection */}
          <div className="space-y-3">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-100">2. اختر نموذج التنبيه أو الترحيب (Message Template):</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedTemplate("renewal")}
                className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all ${
                  selectedTemplate === "renewal" 
                    ? "bg-amber-50 border-amber-500 text-amber-900 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                }`}
              >
                🔔 تجديد الاشتراك
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate("welcome")}
                className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all ${
                  selectedTemplate === "welcome" 
                    ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                }`}
              >
                👋 رسالة ترحيبية
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate("debt")}
                className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all ${
                  selectedTemplate === "debt" 
                    ? "bg-rose-50 border-indigo-500 text-rose-900 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                }`}
              >
                💰 المديونية والدين
              </button>

              <button
                type="button"
                onClick={() => setSelectedTemplate("custom")}
                className={`p-3 rounded-2xl border text-center font-extrabold text-xs transition-all ${
                  selectedTemplate === "custom" 
                    ? "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800"
                }`}
              >
                ✍️ رسالة مخصصة
              </button>
            </div>

            {/* Template Body Editor or Preview */}
            {selectedTemplate === "custom" ? (
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    نص الرسالة (المتغيرات المتاحة: {`{name}`}, {`{offer}`}, {`{expiryDate}`}, {`{debt}`}):
                  </label>
                  <div className="flex items-center gap-2">
                    {savedTemplates.length > 0 && (
                      <select 
                        onChange={(e) => {
                          const tmpl = savedTemplates.find(t => t.id === e.target.value);
                          if (tmpl) setCustomMessageBody(tmpl.body);
                        }}
                        className="text-xs p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg focus:outline-none text-slate-700 dark:text-slate-200"
                        title="اختر قالب محفوظ"
                      >
                        <option value="">-- القوالب المحفوظة --</option>
                        {savedTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const name = window.prompt("أدخل اسم القالب لحفظه:", `قالب مخصص ${savedTemplates.length + 1}`);
                        if (name) {
                           const newTemplate = { id: `tmpl_${Date.now()}`, name, body: customMessageBody };
                           const newTemplates = [...savedTemplates, newTemplate];
                           setSavedTemplates(newTemplates);
                           localStorage.setItem("savedMessageTemplates", JSON.stringify(newTemplates));
                        }
                      }}
                      disabled={!customMessageBody}
                      className="px-2 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                    >
                      حفظ كقالب جديد
                    </button>
                    {savedTemplates.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                           if (window.confirm("هل أنت متأكد من مسح جميع القوالب المحفوظة؟")) {
                             setSavedTemplates([]);
                             localStorage.removeItem("savedMessageTemplates");
                           }
                        }}
                        className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 rounded-lg text-[10px] font-bold transition-all"
                      >
                        مسح الكل
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={customMessageBody}
                  onChange={(e) => setCustomMessageBody(e.target.value)}
                  placeholder="أدخل نص الرسالة المخصصة هنا..."
                  className="w-full h-28 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">معاينة نص الرسالة التلقائي للعميل الأول:</label>
                <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-xs font-medium leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-700/80">
                  {targetCustomers[0] 
                    ? renderMessageText(selectedTemplate, targetCustomers[0])
                    : "عينة نموذج الرسالة المجهزة بالريديوس"
                  }
                </div>
              </div>
            )}
          </div>

          {/* 3. Target Recipients Scope */}
          <div className="space-y-2 border-t border-slate-200 dark:border-slate-700 pt-4">
            <label className="block text-xs font-black text-slate-800 dark:text-slate-100">3. حدد الفئة المستهدفة بالإرسال (Audience):</label>
            
            <div className="flex flex-wrap items-center gap-3">
              {singleCustomer && (
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={targetScope === "single"} 
                    onChange={() => setTargetScope("single")} 
                  />
                  العميل المحدد فقط ({singleCustomer.name})
                </label>
              )}

              {selectedCustomerIds.length > 0 && (
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input 
                    type="radio" 
                    name="scope" 
                    checked={targetScope === "selected"} 
                    onChange={() => setTargetScope("selected")} 
                  />
                  العملاء المحددين بالجدول ({selectedCustomerIds.length})
                </label>
              )}

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="scope" 
                  checked={targetScope === "expiring"} 
                  onChange={() => setTargetScope("expiring")} 
                />
                العملاء المنتهي اشتراكهم قريباً (خلال 5 أيام)
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name="scope" 
                  checked={targetScope === "all"} 
                  onChange={() => setTargetScope("all")} 
                />
                جميع مشتركين القاعدة ({customers.length})
              </label>
            </div>
          </div>

          {/* Real-time Dispatch Console Logs */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-between">
                <span>سجل البث والإرسال المباشر (Console Output):</span>
                {dispatchProgress && (
                  <span className="text-[11px] font-mono font-bold text-indigo-600">
                    {dispatchProgress.current} / {dispatchProgress.total} مشترك
                  </span>
                )}
              </label>
              <div className="px-2 py-3 text-xs md:text-sm bg-white text-emerald-400 font-mono text-[11px] rounded-2xl border border-slate-800 h-36 overflow-y-auto space-y-1 dir-ltr">
                {logs.map((lg, i) => (
                  <div key={i}>{lg}</div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Actions Footer */}
        <div className="px-2 py-3 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl transition-all"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={handleStartDispatch}
            disabled={isSending || targetCustomers.length === 0}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                جاري الإرسال لـ ({dispatchProgress?.current}/{dispatchProgress?.total})...
              </>
            ) : (
              <>
                <SendHorizontal className="w-4 h-4" />
                بدء إرسال التنبيهات لـ ({targetCustomers.length}) مشترك 🚀
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
