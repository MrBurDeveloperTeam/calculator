import React from 'react';
import { GlobalState } from '../types';
import { X, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  state: GlobalState;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose, onConfirm, state }) => {
  if (!isOpen) return null;

  // --- Calculation Logic for Summary ---
  
  // 1. Fixed Overhead (Sum of List)
  const overheadTotal = state.overhead.items.reduce((acc, i) => acc + i.monthlyCost, 0);
  
  // 2. Staff Cost Rate
  // Calculate total monthly hours based on clinic settings
  const totalMonthlyHours = state.clinicSettings.workingDaysPerWeek * state.clinicSettings.hoursPerDay * 4.3333;
  
  const totalStaffCost = state.staff.members.reduce((acc, m) => acc + m.salary + m.benefits + m.bonus, 0);

  const staffHourly = totalMonthlyHours > 0 
    ? totalStaffCost / totalMonthlyHours
    : 0;

  // 3. Depreciation Monthly (Sum of List)
  const depMonthly = state.depreciation.assets.reduce((acc, asset) => {
      const months = asset.lifespanYears * 12;
      return acc + (months > 0 ? (asset.purchasePrice - asset.resaleValue) / months : 0);
  }, 0);

  // 4. Consumables (Total of current list)
  const consumablesTotal = state.consumables.items.reduce((acc, item) => acc + item.cost, 0);

  // 8. Regulatory Monthly
  const regMonthly = ((state.regulatory.annualApc + state.regulatory.annualXray + state.regulatory.annualInsurance) / 12) + state.regulatory.monthlyWaste;

  // 10. Owner Target
  const ownerTarget = (1 - (state.owner.riskBufferPercent / 100)) > 0
    ? (state.owner.desiredNetIncome + state.owner.personalTax) / (1 - (state.owner.riskBufferPercent / 100))
    : 0;

  const { currencySymbol } = state.clinicSettings;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Save className="w-5 h-5 text-teal-600" />
            Save Configuration
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-start gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800 text-sm">Warning: Overwrite Defaults</p>
              <p className="text-amber-700 text-xs mt-1">
                This will save your current inputs as the new default configuration. 
                Next time you open the app, these values will be loaded automatically.
              </p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Snapshot Summary</h4>
          <div className="space-y-3">
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Fixed Overhead (Monthly)</span>
                <span className="font-bold text-slate-800">{currencySymbol} {overheadTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Staff Hourly Cost</span>
                <span className="font-bold text-slate-800">{currencySymbol} {staffHourly.toFixed(2)} /hr</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Equip. Depreciation</span>
                <span className="font-bold text-slate-800">{currencySymbol} {depMonthly.toFixed(2)} /mo</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Consumables List Total</span>
                <span className="font-bold text-slate-800">{currencySymbol} {consumablesTotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-slate-600">Regulatory Costs</span>
                <span className="font-bold text-slate-800">{currencySymbol} {regMonthly.toFixed(2)} /mo</span>
             </div>
             <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Owner Target Revenue</span>
                <span className="font-bold text-teal-600">{currencySymbol} {ownerTarget.toFixed(2)} /mo</span>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-teal-600 text-white font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Confirm Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveModal;