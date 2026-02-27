import React, { useState, useEffect, useMemo } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { SavedProcedure, SavedPlan } from '../types';
import { X, Target, Wand2, Clock, AlertTriangle, RefreshCw, Zap, Scale, CheckCircle2, DollarSign, BarChart3, Save, Info } from 'lucide-react';
import PlanSaveModal from './PlanSaveModal';

interface SmartForecastingModalProps {
   isOpen: boolean;
   onClose: () => void;
   initialPlan?: SavedPlan | null;
}

type Timeframe = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
type Algorithm = 'balanced' | 'efficiency';

const SmartForecastingModal: React.FC<SmartForecastingModalProps> = ({ isOpen, onClose, initialPlan }) => {
   const { state, savePlan, updatePlan, savedProcedures: remoteProcedures } = useCalculator();
   const { currencySymbol, hoursPerDay, workingDaysPerWeek } = state.clinicSettings;

   // Sort procedures alphabetically
   const savedProcedures = useMemo(() => {
      return [...remoteProcedures].sort((a, b) => a.name.localeCompare(b.name));
   }, [remoteProcedures]);

   // --- State ---
   const [plan, setPlan] = useState<Record<string, number>>({});

   // Controls
   const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
   const [targetProfit, setTargetProfit] = useState<number>(5000);
   const [algorithm, setAlgorithm] = useState<Algorithm>('balanced');

   // Feedback
   const [isGenerated, setIsGenerated] = useState(false);

   // Save Modal State
   const [showSaveModal, setShowSaveModal] = useState(false);

   // Capacity Warning State
   const [showCapacityWarning, setShowCapacityWarning] = useState(false);
   const [pendingOverflowPlan, setPendingOverflowPlan] = useState<Record<string, number> | null>(null);

   // Load Procedures & Initial Plan Data
   useEffect(() => {
      if (isOpen) {
         if (initialPlan) {
            // Hydrate from Saved Plan
            setPlan(initialPlan.inputs);
            setTargetProfit(initialPlan.targetProfit || 5000);
            setTimeframe(initialPlan.timeframe);
            if (initialPlan.algorithm) setAlgorithm(initialPlan.algorithm);
            setIsGenerated(true);
         } else {
            // Init empty if empty
            if (Object.keys(plan).length === 0) {
               const initialQty: Record<string, number> = {};
               savedProcedures.forEach(p => initialQty[p.id] = 0);
               setPlan(initialQty);
               setIsGenerated(false);
            }
         }
      }
   }, [isOpen, initialPlan, savedProcedures]);

   // --- 1. OpEx Data Parity (Manual Summation) ---
   const monthlyFixedCost = useMemo(() => {
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

      return overhead + staff + depreciation + regulatory + financial + owner;
   }, [state]);

   // --- 2. Calculate Constraints ---
   const constraints = useMemo(() => {
      const daysPerMonth = workingDaysPerWeek * 4.3333;
      const monthlyCapacityHours = hoursPerDay * daysPerMonth;

      let capacityHours = 0;
      let fixedOpEx = 0;

      switch (timeframe) {
         case 'daily':
            capacityHours = hoursPerDay;
            fixedOpEx = daysPerMonth > 0 ? monthlyFixedCost / daysPerMonth : 0;
            break;
         case 'weekly':
            capacityHours = hoursPerDay * workingDaysPerWeek;
            fixedOpEx = monthlyFixedCost / 4.3333;
            break;
         case 'monthly':
            capacityHours = monthlyCapacityHours;
            fixedOpEx = monthlyFixedCost;
            break;
         case 'quarterly':
            capacityHours = monthlyCapacityHours * 3;
            fixedOpEx = monthlyFixedCost * 3;
            break;
         case 'yearly':
            capacityHours = monthlyCapacityHours * 12;
            fixedOpEx = monthlyFixedCost * 12;
            break;
         default:
            fixedOpEx = monthlyFixedCost;
            capacityHours = monthlyCapacityHours;
      }

      return { capacityHours, fixedOpEx };
   }, [timeframe, monthlyFixedCost, hoursPerDay, workingDaysPerWeek]);

   // --- 3. Real-Time Results ---
   const results = useMemo(() => {
      let revenue = 0;
      let totalVariableCost = 0;
      let timeUsedMinutes = 0;
      let totalProcedures = 0;

      savedProcedures.forEach(proc => {
         const qty = plan[proc.id] || 0;
         if (qty > 0) {
            revenue += proc.price * qty;
            totalVariableCost += proc.variableCost * qty;
            timeUsedMinutes += proc.duration * qty;
            totalProcedures += qty;
         }
      });

      const timeUsedHours = timeUsedMinutes / 60;
      const grossMargin = revenue - totalVariableCost;
      const netProfit = grossMargin - constraints.fixedOpEx;

      const profitProgress = targetProfit > 0 ? (netProfit / targetProfit) * 100 : 0;
      const timeProgress = constraints.capacityHours > 0 ? (timeUsedHours / constraints.capacityHours) * 100 : 0;

      return {
         revenue,
         grossMargin,
         netProfit,
         timeUsedHours,
         totalProcedures,
         profitProgress: Math.min(Math.max(profitProgress, 0), 100),
         timeProgress: Math.min(timeProgress, 100),
         isProfitMet: netProfit >= targetProfit,
         isTimeExceeded: timeUsedHours > (constraints.capacityHours + 0.001),
      };
   }, [plan, savedProcedures, constraints, targetProfit]);

   // --- 4. The "Auto-Suggest" Algorithms ---
   const generateSmartPlan = (allowOverflow: boolean = false) => {
      const newPlan: Record<string, number> = {};
      savedProcedures.forEach(p => newPlan[p.id] = 0);
      const requiredMargin = targetProfit + constraints.fixedOpEx;

      if (requiredMargin <= 0) {
         setPlan(newPlan);
         return;
      }

      const validProcedures = savedProcedures.filter(p => (p.price - p.variableCost) > 0);
      if (validProcedures.length === 0) return;

      const capacityMinutes = constraints.capacityHours * 60;

      // Helper to run simulation
      const runSimulation = (procedures: SavedProcedure[], enforceCapacity: boolean) => {
         const simPlan: Record<string, number> = {};
         savedProcedures.forEach(p => simPlan[p.id] = 0);

         // 1. Calculate Efficiency Scores & Prepare Data
         const scoredProcedures = procedures.map(p => {
            const unitMargin = p.price - p.variableCost;
            const durationHours = p.duration / 60;
            const hourlyProfit = durationHours > 0 ? unitMargin / durationHours : 0;
            return { ...p, unitMargin, hourlyProfit };
         });

         const totalEfficiencyScore = scoredProcedures.reduce((acc, p) => acc + p.hourlyProfit, 0);

         // 2. Proportional Allocation (Weighted Dist)
         let currentGrossMargin = 0;
         let currentUsedMinutes = 0;

         scoredProcedures.forEach(p => {
            if (totalEfficiencyScore > 0 && p.unitMargin > 0) {
               const targetShare = requiredMargin * (p.hourlyProfit / totalEfficiencyScore);
               // Floor the target share so we don't accidentally overshoot in a large batch
               const rawQty = Math.floor(targetShare / p.unitMargin);
               const qty = Math.max(1, rawQty); // FORCE at least 1 to ensure a truly "Balanced" round-robin feel

               simPlan[p.id] = qty;
               currentGrossMargin += qty * p.unitMargin;
               currentUsedMinutes += qty * p.duration;
            }
         });

         // 3. Reality Check (Strict Capacity Scaling)
         // If over capacity, scale EVERYTHING down proportionally to fit.
         if (enforceCapacity && currentUsedMinutes > capacityMinutes) {
            const scaleFactor = capacityMinutes / currentUsedMinutes;
            // Reset and re-apply scaled
            currentGrossMargin = 0;
            currentUsedMinutes = 0;

            scoredProcedures.forEach(p => {
               // Scale down and floor to be safe
               let qty = Math.floor(simPlan[p.id] * scaleFactor);
               // Try to preserve our forced baseline of 1 so it doesn't look empty
               qty = Math.max(1, qty);

               simPlan[p.id] = qty;
               currentGrossMargin += qty * p.unitMargin;
               currentUsedMinutes += qty * p.duration;
            });

            // If preserving the baseline of 1 pushed us over capacity, we MUST trim 
            // the least efficient procedures to zero.
            let trimIterations = 0;
            while (currentUsedMinutes > capacityMinutes && trimIterations < 1000) {
               // Find least efficient that still has > 0 quantity
               const toTrim = [...scoredProcedures]
                  .sort((a, b) => a.hourlyProfit - b.hourlyProfit)
                  .find(x => simPlan[x.id] > 0);

               if (!toTrim) break; // Safety break

               simPlan[toTrim.id]--;
               currentUsedMinutes -= toTrim.duration;
               currentGrossMargin -= toTrim.unitMargin;
               trimIterations++;
            }
         }


         // Sorts for Fine-Tuning
         const sortedByEfficiencyAsc = [...scoredProcedures].sort((a, b) => a.hourlyProfit - b.hourlyProfit);
         const sortedByEfficiencyDesc = [...scoredProcedures].sort((a, b) => b.hourlyProfit - a.hourlyProfit);

         // Check 1: Fill Gaps (Greedy Fill)
         // Use remaining time to add most efficient items or any items that fit
         let fillIterations = 0;
         while (fillIterations < 1000) {
            // STOP if target met (save capacity)
            if (currentGrossMargin >= requiredMargin) break;

            const candidate = sortedByEfficiencyDesc.find(p =>
               !enforceCapacity || (currentUsedMinutes + p.duration <= capacityMinutes)
            );

            if (!candidate) break; // No more room or no candidate fits

            simPlan[candidate.id]++;
            currentUsedMinutes += candidate.duration;
            currentGrossMargin += candidate.unitMargin;
            fillIterations++;
         }

         // Check 2: Upgrade Phase (Smart Multi-Swap)
         // If we are strictly enforcing capacity and haven't hit target, try to SWAP low eff for high eff.
         const maxSwapIterations = 2000;
         let swapIterations = 0;

         while (
            enforceCapacity &&
            currentGrossMargin < requiredMargin &&
            swapIterations < maxSwapIterations
         ) {
            // 1. Find a High Efficiency Candidate that DOESN'T fit
            // (If it fit, Fill Gaps would have taken it)
            const candidate = sortedByEfficiencyDesc.find(p =>
               currentUsedMinutes + p.duration > capacityMinutes
            );

            if (!candidate) break;

            // 2. Calculate Space Needed
            const spaceNeeded = (currentUsedMinutes + candidate.duration) - capacityMinutes;

            // 3. Find Low Efficiency Items to Remove to clear space
            // Must invoke a net positive profit change.
            let spaceCleared = 0;
            let lostMargin = 0;
            const toRemove: { id: string, qty: number }[] = [];

            // Iterate worst to best
            for (const worst of sortedByEfficiencyAsc) {
               if (simPlan[worst.id] > 0) {
                  // How many can we remove?
                  const available = simPlan[worst.id];
                  // We need to clear `spaceNeeded - spaceCleared`
                  // Each `worst` clears `worst.duration`
                  const neededCount = Math.ceil((spaceNeeded - spaceCleared) / worst.duration);
                  const take = Math.min(available, neededCount);

                  if (take > 0) {
                     toRemove.push({ id: worst.id, qty: take });
                     spaceCleared += take * worst.duration;
                     lostMargin += take * worst.unitMargin;
                  }

                  if (spaceCleared >= spaceNeeded) break;
               }
            }

            // 4. Do we have a valid swap?
            if (spaceCleared >= spaceNeeded && (candidate.unitMargin > lostMargin)) {
               // Execute Swap
               toRemove.forEach(r => {
                  simPlan[r.id] -= r.qty;
               });
               simPlan[candidate.id]++;

               currentUsedMinutes = currentUsedMinutes - spaceCleared + candidate.duration;
               currentGrossMargin = currentGrossMargin - lostMargin + candidate.unitMargin;
            } else {
               // Optimization Failed for this candidate.
               // We break here to avoid infinite loops, but ideally we'd try the next candidate.
               // For now, stopping is safer than looping forever.
               break;
            }

            swapIterations++;
         }

         const profitMet = currentGrossMargin >= requiredMargin;
         return { plan: simPlan, profitMet, timeUsedMinutes: currentUsedMinutes };
      };


      let proceduresToUse = validProcedures;
      if (algorithm === 'efficiency') {
         const scored = validProcedures.map(p => {
            const margin = p.price - p.variableCost;
            const hourlyProfit = p.duration > 0 ? (margin / p.duration) * 60 : 0;
            return { ...p, margin, hourlyProfit };
         }).sort((a, b) => b.hourlyProfit - a.hourlyProfit);
         proceduresToUse = scored.slice(0, 3);
      }

      // 1. Try Normal run (Respect Capacity)
      const normalResult = runSimulation(proceduresToUse, true);

      if (normalResult.profitMet) {
         // Success within capacity!
         setPlan(normalResult.plan);
         setIsGenerated(true);
      } else {
         // 2. Capacity reached but profit NOT met.
         // First, show the user the best we could do WITHIN capacity.
         setPlan(normalResult.plan);
         setIsGenerated(true);

         // Try "Overflow" run (Ignore Capacity) to see if it's even possible to hit target
         const overflowResult = runSimulation(proceduresToUse, false);

         if (overflowResult.profitMet) {
            // It IS possible if we exceed capacity.
            if (allowOverflow) {
               // If we are already allowed to overflow (re-run from modal), set it.
               setPlan(overflowResult.plan);
            } else {
               // Otherwise, prompt user with option to proceed with Overflow
               setPendingOverflowPlan(overflowResult.plan);
               setShowCapacityWarning(true);
            }
         }
         // If `overflowResult.profitMet` is also false, we already gave them the best normal result.
      }
   };

   const confirmOverflow = () => {
      if (pendingOverflowPlan) {
         setPlan(pendingOverflowPlan);
         setIsGenerated(true);
         setPendingOverflowPlan(null);
      }
      setShowCapacityWarning(false);
   };

   const handleQtyChange = (id: string, val: number) => {
      setPlan(prev => ({ ...prev, [id]: Math.max(0, val) }));
      setIsGenerated(false);
   };

   // --- Save Logic ---
   const handleSaveConfirm = (name: string) => {
      const planData: SavedPlan = {
         id: initialPlan ? initialPlan.id : crypto.randomUUID(),
         name,
         date: new Date().toISOString(),
         type: 'FORECAST',
         timeframe,
         targetProfit,
         algorithm,
         inputs: plan,
         results: {
            netProfit: results.netProfit,
            revenue: results.revenue,
            timeUsedHours: results.timeUsedHours,
            totalProcedures: results.totalProcedures,
            isProfitable: results.isProfitMet
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={onClose}
         ></div>

         <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-md text-white shadow-sm">
                     <Wand2 className="w-5 h-5" />
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-gray-900">
                        {/* Profit Target Simulator */}
                        ROI Calculation Simulator
                     </h2>
                     <p className="text-xs text-gray-500">Goal-Seek Engine {initialPlan && '• Editing Saved Plan'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button
                     onClick={() => setShowSaveModal(true)}
                     className="px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-sm hover:bg-blue-100 flex items-center gap-2 transition-colors"
                  >
                     <Save className="w-4 h-4" />
                     {initialPlan ? 'Update Plan' : 'Save Plan'}
                  </button>
                  <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-full transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>
            </div>

            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-gray-50">
               {/* Left Panel - Inputs */}
               <div className="lg:col-span-4 bg-white border-r border-gray-200 p-6 overflow-y-auto flex flex-col gap-6 shadow-sm z-10">
                  {/* 1. Timeframe */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">1. Timeframe</label>
                     <select
                        value={timeframe}
                        onChange={(e) => {
                           setTimeframe(e.target.value as Timeframe);
                           setPlan({});
                           setIsGenerated(false);
                        }}
                        className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-sm focus:ring-blue-500 focus:border-blue-500 block p-3 font-semibold"
                     >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                     </select>
                     <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-2 rounded-sm border border-blue-100">
                        <Clock className="w-3 h-3" />
                        <span>Capacity: <strong>{constraints.capacityHours.toFixed(0)} hrs</strong> | OpEx: <strong>{currencySymbol} {constraints.fixedOpEx.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                     </div>
                  </div>

                  {/* 2. Target */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">2. Net Profit Target ({currencySymbol})</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <DollarSign className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                           type="number"
                           value={targetProfit}
                           onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
                           className="w-full pl-9 pr-4 py-3 bg-white border border-gray-300 text-gray-900 text-lg font-bold rounded-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           placeholder="5000"
                        />
                     </div>
                     <p className="text-[10px] text-gray-400 mt-1">
                        Target is after deducting {currencySymbol}{constraints.fixedOpEx.toLocaleString(undefined, { maximumFractionDigits: 0 })} fixed costs.
                     </p>
                  </div>

                  {/* 3. Algorithm */}
                  <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">3. Strategy Engine</label>
                     <div className="grid grid-cols-1 gap-3">
                        <button
                           onClick={() => setAlgorithm('balanced')}
                           className={`flex items-center p-3 rounded-sm border transition-all text-left ${algorithm === 'balanced' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-300 hover:border-gray-400'}`}
                        >
                           <div className={`p-2 rounded-full mr-3 ${algorithm === 'balanced' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                              <Scale className="w-5 h-5" />
                           </div>
                           <div>
                              <span className="block text-sm font-bold text-gray-900">Balanced Mix</span>
                              <span className="block text-xs text-gray-500">Round-Robin fill across all procedures.</span>
                           </div>
                        </button>

                        <button
                           onClick={() => setAlgorithm('efficiency')}
                           className={`flex items-center p-3 rounded-sm border transition-all text-left ${algorithm === 'efficiency' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : 'bg-white border-gray-300 hover:border-gray-400'}`}
                        >
                           <div className={`p-2 rounded-full mr-3 ${algorithm === 'efficiency' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                              <Zap className="w-5 h-5" />
                           </div>
                           <div>
                              <span className="block text-sm font-bold text-gray-900">Max Efficiency</span>
                              <span className="block text-xs text-gray-500">Fill capacity with Top 3 earners first.</span>
                           </div>
                        </button>
                     </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100">
                     <button
                        onClick={() => generateSmartPlan(false)}
                        disabled={targetProfit <= 0}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                     >
                        <Wand2 className="w-5 h-5" />
                        <span>Auto-Generate Plan</span>
                     </button>
                     <button
                        onClick={() => setPlan({})}
                        className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 rounded-sm"
                     >
                        <RefreshCw className="w-3 h-3" /> Clear Values
                     </button>
                  </div>
               </div>

               {/* RIGHT PANEL: Results */}
               <div className="lg:col-span-8 flex flex-col overflow-hidden bg-gray-50">
                  <div className="p-6 border-b border-gray-200 bg-white shadow-sm z-20">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* NET PROFIT CHART */}
                        <div className="flex flex-col">
                           <div className="flex justify-between items-end mb-2 h-10">
                              <div className="flex flex-col justify-end">
                                 <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" /> Net Profit
                                 </span>
                                 <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3 inline" /> Gross margin less OpEx
                                 </p>
                              </div>
                              <div className="text-right">
                                 <span className={`text-xl font-black cursor-help group relative inline-block ${results.isProfitMet ? 'text-emerald-600' : 'text-gray-700'}`}>
                                    {currencySymbol} {results.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-56 p-2 bg-slate-800 text-white text-[10px] leading-tight rounded-md shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200 text-center font-sans font-normal">
                                       <div className="absolute bottom-full right-4 border-4 border-transparent border-b-slate-800"></div>
                                       This is the maximum amount of profit based on the opex timeframe.
                                    </div>
                                 </span>
                                 <span className="text-xs text-gray-400 font-medium block"> / {currencySymbol} {targetProfit.toLocaleString()}</span>
                              </div>
                           </div>

                           <div className="relative group cursor-help">
                              <div className="h-4 bg-gray-200 rounded-sm overflow-hidden">
                                 <div
                                    className={`h-full transition-all duration-700 ease-out ${results.isProfitMet ? 'bg-emerald-500' : 'bg-gray-500'}`}
                                    style={{ width: `${results.profitProgress}%` }}
                                 ></div>
                              </div>
                              {/* Hover Tooltip for Bar - OUTSIDE overflow-hidden */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-max p-2 bg-slate-800 text-white text-xs rounded-md shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                                    <span className="text-slate-400">Current:</span>
                                    <span className="font-bold font-mono">{currencySymbol} {results.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>

                                    <span className="text-slate-400">Remaining:</span>
                                    <span className="font-bold font-mono">{currencySymbol} {(targetProfit - results.netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                 </div>
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                              </div>
                           </div>
                        </div>

                        {/* TIME USED CHART */}
                        <div className="flex flex-col">
                           <div className="flex justify-between items-end mb-2 h-10">
                              <div className="flex flex-col justify-end">
                                 <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Time Used
                                 </span>
                                 <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                    <Info className="w-3 h-3 inline" /> Maximum time allowed
                                 </p>
                              </div>
                              <div className="text-right">
                                 <span className={`text-xl font-black ${results.isTimeExceeded ? 'text-rose-600' : 'text-blue-600'}`}>
                                    {results.timeUsedHours.toFixed(1)}
                                 </span>
                                 <span className="text-xs text-gray-400 font-medium block"> / {constraints.capacityHours.toFixed(0)} hrs</span>
                              </div>
                           </div>

                           <div className="relative group cursor-help">
                              <div className="h-4 bg-gray-200 rounded-sm overflow-hidden">
                                 <div
                                    className={`h-full transition-all duration-700 ease-out ${results.isTimeExceeded ? 'bg-rose-500' : 'bg-blue-500'}`}
                                    style={{ width: `${results.timeProgress}%` }}
                                 ></div>
                              </div>
                              {/* Hover Tooltip for Bar - OUTSIDE overflow-hidden */}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-max p-2 bg-slate-800 text-white text-xs rounded-md shadow-xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                                 <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-left">
                                    <span className="text-slate-400">Used:</span>
                                    <span className="font-bold font-mono">{results.timeUsedHours.toFixed(2)} hrs</span>

                                    <span className="text-slate-400">Remaining:</span>
                                    <span className="font-bold font-mono">{Math.max(0, constraints.capacityHours - results.timeUsedHours).toFixed(2)} hrs</span>
                                 </div>
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {results.isTimeExceeded && (
                        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                           <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                           <div>
                              <p className="text-sm text-rose-800 font-bold">⚠️ Capacity Exceeded!</p>
                              <p className="text-xs text-rose-700">You are booking {results.timeUsedHours.toFixed(0)} hours, but only have {constraints.capacityHours.toFixed(0)} hours available in this timeframe.</p>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-0">
                     <div className="bg-gray-100 px-6 py-3 border-b border-gray-200 flex text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                        <div className="flex-1">Procedure Name</div>
                        <div className="w-32 text-right">Margin/Unit</div>
                        <div className="w-24 text-center">Duration</div>
                        <div className="w-24 text-center">Qty</div>
                     </div>

                     <div className="divide-y divide-gray-200 bg-white">
                        {savedProcedures.length === 0 ? (
                           <div className="p-12 text-center text-gray-400">No procedures in library.</div>
                        ) : (
                           savedProcedures.map(proc => {
                              const qty = plan[proc.id] || 0;
                              const isActive = qty > 0;
                              const margin = proc.price - proc.variableCost;

                              return (
                                 <div key={proc.id} className={`px-6 py-3 flex items-center transition-colors hover:bg-gray-50 ${isActive ? 'bg-white' : 'bg-white opacity-80'}`}>
                                    <div className="flex-1">
                                       <p className={`font-bold text-sm text-gray-900`}>{proc.name}</p>
                                       <p className="text-[10px] text-gray-400">Gross Profit: {currencySymbol} {margin.toFixed(0)}</p>
                                    </div>
                                    <div className="w-32 text-right font-medium text-emerald-600 text-sm">
                                       {currencySymbol} {margin.toFixed(0)}
                                    </div>
                                    <div className="w-24 text-center text-gray-500 text-xs">
                                       {proc.duration} min
                                    </div>
                                    <div className="w-24 pl-4">
                                       <input
                                          type="number"
                                          min="0"
                                          className={`w-full h-10 text-center font-bold border rounded-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${isActive ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-900 bg-white'}`}
                                          value={qty || ''}
                                          onChange={(e) => handleQtyChange(proc.id, parseInt(e.target.value) || 0)}
                                          placeholder="0"
                                       />
                                    </div>
                                 </div>
                              );
                           })
                        )}
                     </div>
                  </div>

                  <div className={`p-4 border-t border-gray-200 ${results.isProfitMet && !results.isTimeExceeded ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                     <div className="flex items-center gap-3">
                        {results.isProfitMet && !results.isTimeExceeded ? (
                           <div className="p-2 bg-emerald-200 rounded-full">
                              <CheckCircle2 className="w-5 h-5 text-emerald-800" />
                           </div>
                        ) : (
                           <div className="p-2 bg-gray-200 rounded-full">
                              <Target className="w-5 h-5 text-gray-500" />
                           </div>
                        )}
                        <div>
                           <p className="text-sm font-bold text-gray-800">
                              {results.isProfitMet && !results.isTimeExceeded
                                 ? 'Feasible Plan! Target Met.'
                                 : 'Adjust plan to meet target within capacity.'}
                           </p>
                           <p className="text-xs text-gray-500">
                              Total Procedures: {results.totalProcedures} | Gross Margin: {currencySymbol} {results.grossMargin.toLocaleString()}
                           </p>
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

         {/* Exceed Capacity Confirmation Modal */}
         {showCapacityWarning && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCapacityWarning(false)}></div>
               <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-5 flex flex-col items-center text-center">
                     <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-rose-600" />
                     </div>
                     <h3 className="text-lg font-bold text-gray-900 mb-2">Capacity Exceeded</h3>
                     <p className="text-sm text-gray-600 mb-6">
                        To hit this profit target, we need to exceed your current time capacity. <br /><br />
                        This plan will use <strong>more hours</strong> than available. Do you want to proceed?
                     </p>
                     <div className="flex gap-3 w-full">
                        <button
                           onClick={() => setShowCapacityWarning(false)}
                           className="flex-1 py-2 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                           onClick={confirmOverflow}
                           className="flex-1 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition-colors shadow-sm"
                        >
                           Proceed Anyway
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SmartForecastingModal;
