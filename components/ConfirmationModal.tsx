import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
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
          <div className="confirmation-warning bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="confirmation-warning-icon w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="confirmation-warning-text text-amber-800 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex items-center gap-2 text-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;