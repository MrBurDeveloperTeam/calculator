import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  variant?: 'save' | 'danger';
  isProcessing?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Save',
  variant = 'save',
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="confirmation-modal relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className={`confirmation-warning rounded-lg p-4 flex items-start gap-3 border ${variant === 'danger' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            <AlertTriangle className={`confirmation-warning-icon w-5 h-5 flex-shrink-0 mt-0.5 ${variant === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
            <p className={`confirmation-warning-text text-sm leading-relaxed ${variant === 'danger' ? 'text-red-800' : 'text-amber-800'}`}>
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-6 py-2 rounded-lg text-white font-bold transition-colors shadow-lg flex items-center gap-2 text-sm disabled:cursor-not-allowed disabled:opacity-60 ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'}`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isProcessing ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
