/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, X, CheckCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = "تأكيد الحذف النهائي",
  cancelText = "إلغاء الإجراء",
  isDanger = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Bar */}
        <div className={`h-1.5 w-full ${isDanger ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-500'}`} />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          title="إغلاق النافذة"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 text-center space-y-4">
          {/* Warning Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-inner">
            {isDanger ? (
              <Trash2 className="w-8 h-8 text-rose-500 animate-pulse" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-indigo-500" />
            )}
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{title}</h3>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-start">{message}</p>
            {description && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl border border-amber-200 dark:border-amber-800/50 text-right dir-rtl leading-relaxed mt-2">
                ⚠️ {description}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white text-xs font-bold rounded-2xl transition-all border border-slate-200 dark:border-slate-700/50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-3 text-xs font-extrabold rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                isDanger
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-rose-900/40 hover:shadow-rose-900/60"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
              }`}
            >
              {isDanger ? <Trash2 className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              <span>{confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
