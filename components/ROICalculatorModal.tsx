import React, { useState, useEffect, useMemo } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { SavedProcedure, SavedPlan } from '../types';
import { X, Calculator, RefreshCw, TrendingUp, TrendingDown, ArrowRight, Save } from 'lucide-react';
import PlanSaveModal from './PlanSaveModal';

interface ROICalculatorModalProps {
   isOpen: boolean;
   onClose: () => void;
   initialPlan?: SavedPlan | null;
}

const ROICalculatorModal: React.FC<ROICalculatorModalProps> = ({ isOpen, onClose, initialPlan }) => {
   const { state, savePlan, updatePlan, savedProcedures, getGlobalTotalMonthlyCost } = useCalculator();
   const { currencySymbol } = state.clinicSettings;
   const [quantities, setQuantities] = useState<Record<string, number>>({});
   const [showSaveModal, setShowSaveModal] = useState(false);

   // Initialize Quantities when Procedures or Modal changes
   useEffect(() => {
      if (isOpen) {
         if (initialPlan) {
            setQuantities(initialPlan.inputs);
         } else {
            setQuantities(prev => {
               const newQty = { ...prev };
               savedProcedures.forEach(p => {
                  if (newQty[p.id] === undefined) newQty[p.id] = 0;
               });
               return newQty;
            });
         }
      }
   }, [isOpen, initialPlan, savedProcedures]);

   // Fixed Monthly OpEx — sourced from CalculatorContext's canonical
   // getGlobalTotalMonthlyCost() (the same function ForecastingModal and
   // Molar's grounded cost-summary facts already use) rather than a local
   // reimplementation, so this modal can no longer numerically diverge
   // from either of those.
   const fixedOpEx = useMemo(() => getGlobalTotalMonthlyCost(), [getGlobalTotalMonthlyCost]);

   // Derived Calculations
   const calculations = useMemo(() => {
      let totalRevenue = 0;
      let totalVariableCost = 0;
      let timeUsedMinutes = 0;
      let totalProcedures = 0;

      savedProcedures.forEach(proc => {
         const qty = quantities[proc.id] || 0;
         totalRevenue += proc.price * qty;
         const procVarCost = proc.variableCost;
         totalVariableCost += procVarCost * qty;
         timeUsedMinutes += proc.duration * qty;
         totalProcedures += qty;
      });

      const grossMargin = totalRevenue - totalVariableCost;
      const netProfit = grossMargin - fixedOpEx;
      const coveragePercent = fixedOpEx > 0 ? (grossMargin / fixedOpEx) * 100 : 0;

      return { totalRevenue, totalVariableCost, grossMargin, netProfit, coveragePercent, timeUsedMinutes, totalProcedures };
   }, [quantities, savedProcedures, fixedOpEx]);

   const handleQtyChange = (id: string, val: number) => {
      setQuantities(prev => ({ ...prev, [id]: Math.max(0, val) }));
   };

   const handleReset = () => {
      const resetQty: Record<string, number> = {};
      savedProcedures.forEach(p => resetQty[p.id] = 0);
      setQuantities(resetQty);
   };

   // --- Save Logic ---
   const handleSaveConfirm = (name: string) => {
      const planData: SavedPlan = {
         id: initialPlan ? initialPlan.id : crypto.randomUUID(),
         name,
         date: new Date().toISOString(),
         type: 'ROI',
         timeframe: 'monthly', // ROI calc implies monthly usually
         inputs: quantities,
         results: {
            netProfit: calculations.netProfit,
            revenue: calculations.totalRevenue,
            timeUsedHours: calculations.timeUsedMinutes / 60,
            totalProcedures: calculations.totalProcedures,
            isProfitable: calculations.netProfit >= 0
         }
      };

      if (initialPlan) {
         updatePlan(planData);
      } else {
         savePlan(planData);
      }
      setShowSaveModal(false);
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
         ></div>

         {/* Modal Content */}
         <div className="relative bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 p-6 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
                     <Calculator className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-slate-800">Monthly Profitability Simulator</h2>
                     <p className="text-sm text-slate-500">Project your financial outcome based on service volume.</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <button
                     onClick={() => setShowSaveModal(true)}
                     className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold rounded-lg transition-colors shadow-sm"
                  >
                     <Save className="w-4 h-4 text-teal-600" />
                     {initialPlan ? 'Update Plan' : 'Save Scenario'}
                  </button>
                  <button
                     onClick={handleReset}
                     className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors"
                  >
                     <RefreshCw className="w-4 h-4" /> Reset
                  </button>
                  <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">

               {/* Left: Service Volume (Input) */}
               <div className="lg:col-span-7 p-6 overflow-y-auto bg-white border-r border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                     <ArrowRight className="w-4 h-4 text-indigo-600" /> Section A: Service Volume
                  </h3>

                  {savedProcedures.length === 0 ? (
                     <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500">No procedures found in Library.</p>
                        <p className="text-sm text-slate-400 mt-1">Go to "Profitability Builder" to save procedures first.</p>
                     </div>
                  ) : (
                     <div className="overflow-hidden border border-slate-200 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200">
                           <thead className="bg-slate-50">
                              <tr>
                                 <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Treatment</th>
                                 <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Margin/Unit</th>
                                 <th className="px-4 py-3 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider w-32">Qty (Month)</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 bg-white">
                              {savedProcedures.map(proc => {
                                 const margin = proc.price - proc.variableCost;
                                 return (
                                    <tr key={proc.id} className="hover:bg-indigo-50/30 transition-colors group">
                                       <td className="px-4 py-3">
                                          <p className="font-bold text-slate-700 text-sm">{proc.name}</p>
                                          <p className="text-xs text-slate-400">Price: {currencySymbol}{proc.price}</p>
                                       </td>
                                       <td className="px-4 py-3 text-right">
                                          <p className="font-medium text-emerald-600 text-sm">+{currencySymbol}{margin.toFixed(0)}</p>
                                       </td>
                                       <td className="px-4 py-2">
                                          <input
                                             type="number"
                                             min="0"
                                             className="w-full h-10 text-center font-bold text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-gray-300"
                                             value={quantities[proc.id] || 0}
                                             onChange={(e) => handleQtyChange(proc.id, parseInt(e.target.value) || 0)}
                                             onFocus={(e) => e.target.select()}
                                             placeholder="0"
                                          />
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  )}
               </div>

               {/* Right: Financial Waterfall (Results) */}
               <div className="lg:col-span-5 p-6 bg-slate-50 flex flex-col overflow-y-auto">
                  <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                     <TrendingUp className="w-4 h-4 text-emerald-600" /> Section B: Financial Outcome
                  </h3>

                  {/* Waterfall Cards */}
                  <div className="space-y-3 mb-8">
                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Service Revenue</p>
                           <p className="text-xs text-slate-400 mt-0.5">Price × Qty</p>
                        </div>
                        <p className="text-xl font-bold text-slate-800">{currencySymbol} {calculations.totalRevenue.toLocaleString()}</p>
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Less: Variable Costs</p>
                           <p className="text-xs text-slate-400 mt-0.5">Materials & Lab</p>
                        </div>
                        <p className="text-xl font-bold text-rose-500">- {currencySymbol} {calculations.totalVariableCost.toLocaleString()}</p>
                     </div>

                     {/* Gross Margin Line */}
                     <div className="border-t-2 border-slate-200 my-2"></div>

                     <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                        <div>
                           <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Gross Margin</p>
                           <p className="text-xs text-indigo-400 mt-0.5">Available to cover Overhead</p>
                        </div>
                        <p className="text-2xl font-bold text-indigo-700">{currencySymbol} {calculations.grossMargin.toLocaleString()}</p>
                     </div>

                     <div className="flex justify-center py-2">
                        <ArrowRight className="w-5 h-5 text-slate-300 rotate-90" />
                     </div>

                     <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center opacity-80">
                        <div>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Less: Fixed Monthly OpEx</p>
                           <p className="text-xs text-slate-400 mt-0.5">Facility, Staff, Loans, Owner</p>
                        </div>
                        <p className="text-xl font-bold text-slate-600">- {currencySymbol} {fixedOpEx.toLocaleString()}</p>
                     </div>
                  </div>

                  {/* Net Profit Result */}
                  <div className={`mt-auto p-6 rounded-2xl border-2 shadow-lg transition-colors duration-500 ${calculations.netProfit >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                     <p className="text-center text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Projected Net Profit</p>
                     <div className="text-center mb-4">
                        <h1 className={`text-5xl font-black ${calculations.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {calculations.netProfit < 0 ? '-' : '+'} {currencySymbol} {Math.abs(calculations.netProfit).toLocaleString()}
                        </h1>
                     </div>

                     <div className="flex justify-center">
                        {calculations.netProfit >= 0 ? (
                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-200 text-emerald-800 text-xs font-bold">
                              <TrendingUp className="w-3 h-3" /> Profitable Month
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-200 text-rose-800 text-xs font-bold">
                              <TrendingDown className="w-3 h-3" /> Below Break-Even
                           </span>
                        )}
                     </div>

                     {/* Progress Bar */}
                     <div className="mt-8">
                        <div className="flex justify-between text-xs font-bold mb-1">
                           <span className="text-slate-500">OpEx Coverage</span>
                           <span className={calculations.coveragePercent >= 100 ? 'text-emerald-600' : 'text-slate-600'}>{calculations.coveragePercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                           <div
                              className={`h-full transition-all duration-500 ${calculations.coveragePercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                              style={{ width: `${Math.min(calculations.coveragePercent, 100)}%` }}
                           ></div>
                        </div>
                     </div>
                  </div>

               </div>
            </div>
         </div>

         <PlanSaveModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
            onConfirm={handleSaveConfirm}
            existingName={initialPlan?.name}
            mode={initialPlan ? 'update' : 'create'}
         />
      </div>
   );
};

export default ROICalculatorModal;
