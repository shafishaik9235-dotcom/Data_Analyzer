import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          const icon = isSuccess ? (
            <CheckCircle2 className="w-5 h-5 text-[#286A50] shrink-0" />
          ) : isError ? (
            <AlertTriangle className="w-5 h-5 text-[#C54D58] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#7564D5] shrink-0" />
          );

          const borderBg = isSuccess
            ? 'bg-white border-[#C5E5D4] text-[#28263A]'
            : isError
            ? 'bg-white border-[#F9CFD2] text-[#28263A]'
            : 'bg-white border-[#E3DEF5] text-[#28263A]';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${borderBg}`}
            >
              <div className="mt-0.5">{icon}</div>
              <div className="flex-1 text-sm leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#777487] hover:text-[#28263A] p-0.5 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
