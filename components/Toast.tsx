import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
      <div
        role="status"
        aria-live="polite"
        className="relative flex w-[min(420px,calc(100vw-2rem))] items-center gap-4 overflow-hidden rounded-2xl border border-emerald-100 border-l-[6px] border-l-emerald-500 bg-gradient-to-br from-white via-white to-emerald-50 px-5 py-4 pr-12 text-slate-800 shadow-[0_14px_35px_rgba(15,23,42,0.14)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
          <Check className="h-6 w-6 text-emerald-700" strokeWidth={2.5} />
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold leading-6 text-slate-800">Success</p>
          <p className="text-sm leading-5 text-slate-500">{message}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss message"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
