import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, LogOut, Check } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Tasdiqlash",
  cancelLabel = "Bekor qilish",
  onConfirm,
  onCancel,
  variant = 'danger'
}: ConfirmModalProps) {
  // Select icon and button colors based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
          iconBg: 'bg-rose-50 dark:bg-rose-950/40',
          btnConfirm: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500/20 shadow-rose-100 dark:shadow-none',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
          iconBg: 'bg-amber-50 dark:bg-amber-950/40',
          btnConfirm: 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500/20 shadow-amber-100 dark:shadow-none',
        };
      case 'info':
      default:
        return {
          icon: <LogOut className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
          iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
          btnConfirm: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500/20 shadow-indigo-100 dark:shadow-none',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-100 dark:border-slate-800 shadow-xl z-10"
            id="custom-confirm-modal"
          >
            <div className="flex gap-4">
              {/* Variant Icon */}
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
                {styles.icon}
              </div>

              {/* Text content */}
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-800/60">
              <button
                type="button"
                onClick={onCancel}
                className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer focus:ring-4 active:scale-95 ${styles.btnConfirm}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
