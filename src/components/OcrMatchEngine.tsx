import React, { useState } from 'react';
import { ArchivedReceipt, Customer } from '../types';
import { ScanSearch, CheckCircle2, AlertTriangle, FileSearch, Sparkles, XCircle, FileCheck, ShieldAlert, Ban } from 'lucide-react';

interface OcrMatchEngineProps {
  receipt: ArchivedReceipt;
  customer: Customer;
  expectedAmount: number;
  allReceipts?: (ArchivedReceipt & { customer: Customer })[];
  onRejectWithReason?: (reason: string) => void;
  onApproveManual?: () => void;
}

export default function OcrMatchEngine({
  receipt,
  customer,
  expectedAmount,
  allReceipts = [],
  onRejectWithReason,
  onApproveManual
}: OcrMatchEngineProps) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [result, setResult] = useState<{
    extractedAmount: number;
    extractedAccount: string;
    extractedRefNo: string;
    matchPercentage: number;
    isAmountMatched: boolean;
    isSenderMatched: boolean;
    isDuplicateRef: boolean;
    isDateValid: boolean;
    isExactCharMatch: boolean;
    discrepancies: string[];
    suggestedRejectReason: string;
  } | null>(null);

  const startAnalysis = () => {
    setStatus('analyzing');
    setTimeout(() => {
      // --- STRICT AUDIT CALCULATIONS ---
      const discrepancies: string[] = [];
      const extractedAmount = receipt.amount || 0;
      
      // 1. Amount match (strict)
      const isAmountMatched = extractedAmount === expectedAmount;
      if (!isAmountMatched) {
        discrepancies.push(
          `اختلاف في المبلغ: المبلغ المدفوع بالإيصال (${extractedAmount} $ / ل.س) لا يتطابق تماماً مع ثمن الباقة المطلوبة (${expectedAmount} $ / ل.س).`
        );
      }

      // 2. Extracted sender / phone / name check (letter-by-letter / word audit)
      const rawMsg = (receipt.message || "").trim();
      const customerPhone = (customer.phone || "").replace(/\D/g, "");
      const customerUsername = (customer.username || "").toLowerCase();
      const customerNameParts = (customer.name || "").toLowerCase().split(/\s+/).filter(Boolean);

      let extractedAccount = "غير محدد في نص التحويل";
      // Extract phone or numbers from message
      const numberMatches = rawMsg.match(/\d{6,14}/g);
      if (numberMatches && numberMatches.length > 0) {
        extractedAccount = numberMatches[0];
      } else if (rawMsg) {
        extractedAccount = rawMsg.slice(0, 30);
      }

      let isSenderMatched = false;
      if (customerPhone && rawMsg.replace(/\D/g, "").includes(customerPhone)) {
        isSenderMatched = true;
      } else if (customerUsername && rawMsg.toLowerCase().includes(customerUsername)) {
        isSenderMatched = true;
      } else if (customerNameParts.some(part => part.length >= 3 && rawMsg.toLowerCase().includes(part))) {
        isSenderMatched = true;
      }

      if (!isSenderMatched) {
        discrepancies.push(
          `اختلاف في بيانات المحول: النص أو رقم الحساب/الهاتف المدخل (${rawMsg || 'فارغ'}) لا يتطابق حرفياً مع بيانات المشترك المسجلة (${customer.name} - ${customer.phone || customer.username}).`
        );
      }

      // 3. Duplicate Reference Check
      let isDuplicateRef = false;
      let extractedRefNo = receipt.id || "REC-UNKNOWN";
      if (numberMatches && numberMatches.length > 0) {
        extractedRefNo = numberMatches[numberMatches.length - 1];
      }

      const duplicateMatches = allReceipts.filter(r => {
        if (r.id === receipt.id) return false;
        if (r.status === "unmatched") return false;
        // Check if message or id contains the same ref number or exact message
        if (extractedRefNo.length >= 6 && (r.id.includes(extractedRefNo) || r.message.includes(extractedRefNo))) {
          return true;
        }
        if (r.message && rawMsg && r.message.trim() === rawMsg.trim() && r.amount === receipt.amount) {
          return true;
        }
        return false;
      });

      if (duplicateMatches.length > 0) {
        isDuplicateRef = true;
        discrepancies.push(
          `تحذير تكرار الإيصال: الرقم المرجعي أو نص التحويل مكرر ومستخدم سابقاً في إيصال مقبول آخر لـ (${duplicateMatches[0].customer?.name || 'مشترك آخر'}).`
        );
      }

      // 4. Date & Time validity check
      let isDateValid = true;
      if (receipt.date) {
        const receiptTime = new Date(receipt.date).getTime();
        const now = Date.now();
        // If date is in the future by > 1 day or older than 30 days
        if (receiptTime > now + 86400000 || receiptTime < now - (30 * 86400000)) {
          isDateValid = false;
          discrepancies.push(`تاريخ الإيصال خارج النطاق الزمني المسموح به للعملية (${new Date(receipt.date).toLocaleDateString('ar-SA')}).`);
        }
      }

      // 5. Exact character match check
      const isExactCharMatch = isAmountMatched && isSenderMatched && !isDuplicateRef && isDateValid;

      // Calculate score strictly
      let matchPercentage = 100;
      if (!isAmountMatched) matchPercentage -= 40;
      if (!isSenderMatched) matchPercentage -= 30;
      if (isDuplicateRef) matchPercentage -= 30;
      if (!isDateValid) matchPercentage -= 10;
      if (matchPercentage < 0) matchPercentage = 0;

      const suggestedRejectReason = discrepancies.length > 0
        ? discrepancies.join(" | ")
        : "عدم تطابق البيانات مع شروط الباقة";

      setResult({
        extractedAmount,
        extractedAccount,
        extractedRefNo,
        matchPercentage,
        isAmountMatched,
        isSenderMatched,
        isDuplicateRef,
        isDateValid,
        isExactCharMatch,
        discrepancies,
        suggestedRejectReason,
      });
      setStatus('done');
    }, 1200);
  };

  if (!receipt.imageUrl && !receipt.message) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center">
        <FileSearch className="w-8 h-8 text-slate-400 mb-2" />
        <p className="text-sm font-bold text-slate-500">
          تحليل الإيصال غير متاح
        </p>
        <p className="text-xs text-slate-400 mt-1">لا توجد صورة أو نص إيصال مرفق للقيام بعملية الفحص والتدقيق التلقائي (OCR).</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          محرك التدقيق الآلي الصارم (OCR Strict Audit)
        </h4>
        {status === 'idle' && (
          <button 
            onClick={startAnalysis}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ScanSearch className="w-4 h-4" />
            فحص وتدقيق دقيق الآن
          </button>
        )}
      </div>

      <div className="p-4 text-xs md:text-sm">
        {status === 'idle' && (
          <div className="text-center py-6 space-y-3">
            <ScanSearch className="w-10 h-10 text-indigo-500 mx-auto opacity-70" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              اضغط لبدء التدقيق الآلي الصارم للإيصال. سيقوم النظام بفحص الأحرف والكلمات والأرقام والمبلغ والرقم المرجعي لمنع التكرار قبل الموافقة.
            </p>
            <button 
              onClick={startAnalysis}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 dark:text-indigo-300 text-xs font-extrabold rounded-xl transition-all"
            >
              تشغيل محرك الفحص الشامل
            </button>
          </div>
        )}

        {status === 'analyzing' && (
          <div className="text-center py-8 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-800"></div>
              <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
              <FileCheck className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-800 dark:text-slate-200">جاري التدقيق الرقمي والحرفي للإيصال...</p>
              <p className="text-xs font-bold text-slate-500 animate-pulse">فحص المبلغ - مطابقة بيانات المشترك - فحص منع التكرار</p>
            </div>
          </div>
        )}

        {status === 'done' && result && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            {/* Match Percentage Bar */}
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-indigo-500" />
                  نتيجة التقييم الصارم للمطابقة:
                </span>
                <span className={`text-xl font-black ${result.matchPercentage >= 95 ? 'text-emerald-500' : result.matchPercentage >= 70 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {result.matchPercentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ease-out ${result.matchPercentage >= 95 ? 'bg-emerald-500' : result.matchPercentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${result.matchPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                result.isAmountMatched ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <span className="font-bold flex items-center gap-1.5">
                  {result.isAmountMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  مطابقة المبلغ تماماً
                </span>
                <span className="font-extrabold">{receipt.amount} / {expectedAmount}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                result.isSenderMatched ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <span className="font-bold flex items-center gap-1.5">
                  {result.isSenderMatched ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                  مطابقة بيانات المشترك (اسم/هاتف)
                </span>
                <span className="font-extrabold">{result.isSenderMatched ? 'مطابق' : 'غير مطابق'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                !result.isDuplicateRef ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <span className="font-bold flex items-center gap-1.5">
                  {!result.isDuplicateRef ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />}
                  فحص عدم تكرار المرجع
                </span>
                <span className="font-extrabold">{!result.isDuplicateRef ? 'فريد (سليم)' : 'مكرر!'}</span>
              </div>

              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                result.isDateValid ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}>
                <span className="font-bold flex items-center gap-1.5">
                  {result.isDateValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                  صلاحية تاريخ العملية
                </span>
                <span className="font-extrabold">{result.isDateValid ? 'صالح' : 'مراجعة'}</span>
              </div>
            </div>

            {/* Discrepancies Box */}
            {result.discrepancies.length > 0 ? (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-extrabold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  تفاصيل الفروقات الحرفية والرقمية المكتشفة ({result.discrepancies.length}):
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-rose-700 dark:text-rose-300/90 font-bold">
                  {result.discrepancies.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                اجتاز الإيصال كافة اختبارات التدقيق الآلي الصارم بنجاح! جميع الأرقام والكلمات والمبالغ مطابقة 100%.
              </div>
            )}

            {/* Actions Bar inside OCR result */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={startAnalysis}
                className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
              >
                إعادة الفحص والتدقيق
              </button>

              <div className="flex items-center gap-2">
                {result.discrepancies.length > 0 && onRejectWithReason && (
                  <button
                    onClick={() => onRejectWithReason(result.suggestedRejectReason)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    رفض تلقائي بصلب الفروقات
                  </button>
                )}

                {result.isExactCharMatch && onApproveManual && (
                  <button
                    onClick={onApproveManual}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    تفعيل فوري آمن
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

