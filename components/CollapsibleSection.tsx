import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  total: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
  subtitle?: string;
  colorClass?: string;
  hideTotal?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  total, 
  children, 
  defaultOpen = true,
  subtitle,
  colorClass = "text-teal-600",
  hideTotal = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-6 shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <div className="flex flex-col items-start text-left">
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {!hideTotal && (
            <div className="text-right">
               <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Subtotal</p>
               <p className={`font-bold text-lg ${colorClass}`}>
                 ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </p>
            </div>
          )}
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-3 bg-white border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;