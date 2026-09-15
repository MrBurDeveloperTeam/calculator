import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Check } from 'lucide-react';

interface PlanSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  existingName?: string;
  mode: 'create' | 'update';
}

const PlanSaveModal: React.FC<PlanSaveModalProps> = ({ isOpen, onClose, onConfirm, existingName = '', mode }) => {
  const [name, setName] = useState(existingName);

  // Reset name when modal opens/closes or existingName changes
  useEffect(() => {
    if (isOpen) {
        setName(existingName);
    }
  }, [isOpen, existingName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-slate-900/5">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                <div className="p-1.5 bg-blue-100 rounded-md text-blue-700">
                    <FileText className="w-5 h-5" />
                </div>
                {mode === 'create' ? 'Save Financial Plan' : 'Update Plan'}
            </h3>
            <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
        
        {/* Body */}
        <div className="p-6 bg-white">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Plan Name
            </label>
            <div className="relative">
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q1 Aggressive Growth Target"
                    className="block w-full h-12 px-4 bg-white text-gray-900 border border-gray-300 rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-bold shadow-sm placeholder-gray-400 transition-all outline-none"
                    autoFocus
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                   {name.trim() && <Check className="w-4 h-4 text-emerald-500" />}
                </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                Give your scenario a clear name. You can access it later from the <strong>History Tab</strong> to review or edit.
            </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                className="px-4 py-2 text-sm text-gray-600 font-bold hover:bg-gray-200 rounded-sm transition-colors"
            >
                Cancel
            </button>
            <button 
                onClick={() => {
                    if(name.trim()) onConfirm(name);
                }}
                disabled={!name.trim()}
                className="px-6 py-2 text-sm bg-blue-600 text-white font-bold rounded-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-900/10 flex items-center gap-2 transition-all active:scale-[0.98]"
            >
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Save Plan' : 'Update Plan'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlanSaveModal;
