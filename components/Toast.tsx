import React, { useEffect } from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';
import { ToastVariant } from '../types';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: ToastVariant;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'success', onClose }) => {
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
    <>
      <style>{`
        :root[data-theme="dark"] .toast-success-title {
          color: #172554 !important;
        }
        :root[data-theme="dark"] .toast-success-message {
          color: #475569 !important;
        }
        :root[data-theme="dark"] .toast-success-icon {
          color: #047857 !important;
        }
        :root[data-theme="dark"] .toast-dismiss-button {
          color: #64748b !important;
        }
        :root[data-theme="dark"] .toast-dismiss-button:hover {
          color: #334155 !important;
        }
        .toast-warning-title {
          color: #78350f;
        }
        .toast-warning-message {
          color: #92400e;
        }
        .toast-warning-icon {
          color: #b45309;
        }
        .toast-warning-card {
          border-color: #fde68a;
          border-left-color: #f59e0b;
          background: linear-gradient(135deg, #ffffff, #fffbeb);
        }
        :root[data-theme="dark"] .toast-warning-title {
          color: #78350f !important;
        }
        :root[data-theme="dark"] .toast-warning-message {
          color: #92400e !important;
        }
        :root[data-theme="dark"] .toast-warning-icon {
          color: #b45309 !important;
        }
      `}</style>
      <div className="fixed top-4 right-4 z-50 animate-fade-in-up">
      <div
        role="status"
        aria-live="polite"
        className={`relative flex w-[min(420px,calc(100vw-2rem))] items-center gap-4 overflow-hidden rounded-2xl border border-l-[6px] px-5 py-4 pr-12 text-slate-800 shadow-[0_14px_35px_rgba(15,23,42,0.14)] ${type === 'warning' ? 'toast-warning-card' : 'border-emerald-100 border-l-emerald-500 bg-gradient-to-br from-white via-white to-emerald-50'}`}
      >
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${type === 'warning' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
          {type === 'warning' ? (
            <AlertTriangle className="toast-warning-icon h-6 w-6" strokeWidth={2.5} />
          ) : (
            <Check className="toast-success-icon h-6 w-6 text-emerald-700" strokeWidth={2.5} />
          )}
        </div>
        <div className="min-w-0">
          <p className={`${type === 'warning' ? 'toast-warning-title' : 'toast-success-title'} text-base font-bold leading-6`}>{type === 'warning' ? 'Warning' : 'Success'}</p>
          <p className={`${type === 'warning' ? 'toast-warning-message' : 'toast-success-message'} text-sm leading-5`}>{message}</p>
        </div>
        <button
          onClick={onClose}
          aria-label="Dismiss message"
          className="toast-dismiss-button absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      </div>
    </>
  );
};

export default Toast;
