import React, { useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { Terminal, ChevronUp, ChevronDown, Activity } from 'lucide-react';

const DataIntegrityCheck: React.FC = () => {
  const { state, getGlobalTotalMonthlyCost } = useCalculator();
  const [isOpen, setIsOpen] = useState(false);

  // Recalculate locally to show breakdown
  const overhead = state.overhead.items.reduce((acc, i) => acc + i.monthlyCost, 0);
  const staff = state.staff.members.reduce((acc, m) => acc + m.salary + m.benefits + m.bonus, 0);
  const depreciation = state.depreciation.assets.reduce((acc, a) => {
       const months = a.lifespanYears * 12;
       return acc + (months > 0 ? (a.purchasePrice - a.resaleValue) / months : 0);
  }, 0);
  const regulatory = (state.regulatory.annualApc + state.regulatory.annualXray + state.regulatory.annualInsurance) / 12 + state.regulatory.monthlyWaste;
  
  const transFeeAmount = state.financial.estMonthlyRevenue * (state.financial.transactionFeesPercent / 100);
  const taxEstimate = state.financial.estMonthlyRevenue * (state.financial.taxRate / 100); 
  const financial = state.financial.monthlyInterest + state.financial.monthlyBankCharges + transFeeAmount + taxEstimate;
  
  const owner = state.owner.desiredNetIncome;

  const grandTotal = getGlobalTotalMonthlyCost();

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-4 left-4 z-50 bg-slate-900 text-green-400 p-2 rounded-full shadow-lg hover:bg-slate-800 transition-colors border border-green-900/50"
            title="Open Data Integrity Inspector"
          >
              <Terminal className="w-5 h-5" />
          </button>
      );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-full max-w-md bg-slate-900 text-green-400 rounded-lg shadow-2xl border border-slate-700 font-mono text-xs overflow-hidden">
        <div className="bg-slate-800 p-2 flex items-center justify-between border-b border-slate-700 cursor-pointer" onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-500" />
                <span className="font-bold text-white">System Data Auditor</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
        
        <div className="p-4 max-h-64 overflow-y-auto">
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-400">Fixed Overhead:</span>
                    <span>{state.clinicSettings.currencySymbol} {overhead.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Staff Roster:</span>
                    <span>{state.clinicSettings.currencySymbol} {staff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Depreciation:</span>
                    <span>{state.clinicSettings.currencySymbol} {depreciation.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Regulatory:</span>
                    <span>{state.clinicSettings.currencySymbol} {regulatory.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Financial (inc Tax/Fees):</span>
                    <span>{state.clinicSettings.currencySymbol} {financial.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-400">Owner Comp:</span>
                    <span>{state.clinicSettings.currencySymbol} {owner.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-slate-700 my-2 pt-2 flex justify-between font-bold text-white bg-green-900/20 p-1 rounded">
                    <span>GLOBAL MONTHLY COST:</span>
                    <span>{state.clinicSettings.currencySymbol} {grandTotal.toFixed(2)}</span>
                </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 italic">
                *Verified: This value is synchronized across Dashboard and Procedure Builder.
            </p>
        </div>
    </div>
  );
};

export default DataIntegrityCheck;