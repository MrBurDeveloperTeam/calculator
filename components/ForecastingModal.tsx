import React, { useState, useEffect, useMemo } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { SavedProcedure } from '../types';
import { X, Target, RefreshCw, Clock, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Compass } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import StyledInput from './StyledInput';

interface ForecastingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Timeframe = 'daily' | 'monthly' | 'quarterly' | 'yearly';

const ForecastingModal: React.FC<ForecastingModalProps> = ({ isOpen, onClose }) => {
  const { state, getGlobalTotalMonthlyCost } = useCalculator();
  const { currencySymbol, hoursPerDay, workingDaysPerWeek } = state.clinicSettings;
  
  const [savedProcedures, setSavedProcedures] = useState<SavedProcedure[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [targetProfit, setTargetProfit] = useState<number>(5000);

  // Load Saved Procedures
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dental_saved_procedures');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedProcedures(parsed);
          // Initialize quantities
          const initialQty: Record<string, number> = {};
          parsed.forEach((p: SavedProcedure) => initialQty[p.id] = 0);
          setQuantities(initialQty);
        } catch (e) {
          console.error("Failed to load saved procedures", e);
        }
      }
    }
  }, [isOpen]);

  // --- Core Logic ---

  // 1. Determine Constraints (OpEx & Time Capacity) based on Timeframe
  const constraints = useMemo(() => {
    const monthlyFixedCost = getGlobalTotalMonthlyCost();
    const daysPerMonth = workingDaysPerWeek * 4.3333;
    const monthlyCapacityHours = hoursPerDay * daysPerMonth;

    switch (timeframe) {
      case 'daily':
        return {
          label: '1 Day',
          fixedCost: daysPerMonth > 0 ? monthlyFixedCost / daysPerMonth : 0,
          capacityHours: hoursPerDay,
          multiplier: 1 // for text display mostly
        };
      case 'quarterly':
        return {
          label: '1 Quarter (3 Mos)',
          fixedCost: monthlyFixedCost * 3,
          capacityHours: monthlyCapacityHours * 3,
          multiplier: 3
        };
      case 'yearly':
        return {
          label: '1 Year',
          fixedCost: monthlyFixedCost * 12,
          capacityHours: monthlyCapacityHours * 12,
          multiplier: 12
        };
      case 'monthly':
      default:
        return {
          label: '1 Month',
          fixedCost: monthlyFixedCost,
          capacityHours: monthlyCapacityHours,
          multiplier: 1
        };
    }
  }, [timeframe, getGlobalTotalMonthlyCost, hoursPerDay, workingDaysPerWeek]);

  // 2. Real-Time Calculation (The "Reality Check")
  const results = useMemo(() => {
    let revenue = 0;
    let variableCost = 0;
    let timeUsedMinutes = 0;
    let totalProcedures = 0;

    savedProcedures.forEach(proc => {
      const qty = quantities[proc.id] || 0;
      if (qty > 0) {
        revenue += proc.price * qty;
        variableCost += proc.variableCost * qty;
        timeUsedMinutes += proc.duration * qty;
        totalProcedures += qty;
      }
    });

    const timeUsedHours = timeUsedMinutes / 60;
    const grossMargin = revenue - variableCost;
    const netProfit = grossMargin - constraints.fixedCost;
    const isProfitable = netProfit >= targetProfit;
    const isOverCapacity = timeUsedHours > constraints.capacityHours;

    return {
      revenue,
      variableCost,
      fixedCost: constraints.fixedCost,
      netProfit,
      timeUsedHours,
      totalProcedures,
      isProfitable,
      isOverCapacity
    };
  }, [quantities, savedProcedures, constraints, targetProfit]);

  // --- Handlers ---
  const handleQtyChange = (id: string, val: number) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(0, val) }));
  };

  const handleReset = () => {
    setQuantities({});
  };

  // --- Chart Data Preparation ---
  const profitChartData = [
    { name: 'Target', value: targetProfit, fill: '#94a3b8' }, // Slate-400
    { name: 'Forecast', value: results.netProfit, fill: results.netProfit >= targetProfit ? '#10b981' : '#f43f5e' } // Emerald or Rose
  ];

  const timeChartData = [
    { name: 'Available', value: constraints.capacityHours, fill: '#94a3b8' },
    { name: 'Used', value: results.timeUsedHours, fill: results.isOverCapacity ? '#f43f5e' : '#3b82f6' } // Rose or Blue
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-none shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-none text-white shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Profit Target Simulator</h2>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Goal-Seek Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
             >
                <RefreshCw className="w-4 h-4" /> Reset
             </button>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
               <X className="w-6 h-6" />
             </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 bg-slate-50">
           
           {/* LEFT PANEL: Inputs & Service Mixer */}
           <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-white overflow-y-auto">
              
              {/* Top Configuration Bar */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 space-y-4">
                 <div className="flex flex-col md:flex-row gap-6">
                    {/* Timeframe Selector */}
                    <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Timeframe</label>
                       <div className="flex border border-slate-300 bg-white rounded-none overflow-hidden">
                          {(['daily', 'monthly', 'quarterly', 'yearly'] as Timeframe[]).map((tf) => (
                             <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`flex-1 py-2 text-xs font-bold uppercase transition-colors border-r border-slate-200 last:border-0 ${timeframe === tf ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                             >
                                {tf}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Target Profit Input */}
                    <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Net Profit ({currencySymbol})</label>
                       <div className="relative">
                          <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                          <input 
                             type="number" 
                             value={targetProfit}
                             onChange={(e) => setTargetProfit(parseFloat(e.target.value) || 0)}
                             className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-bold text-slate-800"
                          />
                       </div>
                    </div>
                 </div>

                 {/* Context Banner */}
                 <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 p-3">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                       Time Capacity for {constraints.label}: <strong className="text-indigo-900">{constraints.capacityHours.toFixed(1)} Hours</strong> available (OpEx: {currencySymbol}{constraints.fixedCost.toLocaleString(undefined, {maximumFractionDigits:0})})
                    </span>
                 </div>
              </div>

              {/* Procedure Mixer Table */}
              <div className="p-0 flex-1">
                 <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <div className="flex-1">Procedure</div>
                    <div className="w-24 text-right">Margin</div>
                    <div className="w-24 text-center">Duration</div>
                    <div className="w-24 text-center">Qty</div>
                 </div>
                 
                 <div className="divide-y divide-slate-100">
                    {savedProcedures.length === 0 && (
                       <div className="p-8 text-center text-slate-400 text-sm">No procedures found. Please add them in the builder.</div>
                    )}
                    {savedProcedures.map(proc => {
                       const margin = proc.price - proc.variableCost;
                       return (
                          <div key={proc.id} className="px-6 py-3 flex items-center hover:bg-indigo-50/10 transition-colors">
                             <div className="flex-1">
                                <p className="font-bold text-slate-800 text-sm">{proc.name}</p>
                                <p className="text-[10px] text-slate-400">Price: {currencySymbol}{proc.price} | Cost: {currencySymbol}{proc.variableCost}</p>
                             </div>
                             <div className="w-24 text-right font-medium text-emerald-600 text-sm">
                                {currencySymbol}{margin.toFixed(0)}
                             </div>
                             <div className="w-24 text-center text-slate-500 text-xs">
                                {proc.duration} min
                             </div>
                             <div className="w-24 pl-4">
                                <input 
                                   type="number"
                                   min="0"
                                   className="w-full h-8 text-center border border-slate-300 rounded-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800"
                                   value={quantities[proc.id] || ''}
                                   onChange={(e) => handleQtyChange(proc.id, parseInt(e.target.value) || 0)}
                                   placeholder="0"
                                />
                             </div>
                          </div>
                       );
                    })}
                 </div>
              </div>
           </div>

           {/* RIGHT PANEL: Reality Check Dashboard (Sticky) */}
           <div className="lg:col-span-5 bg-slate-50 flex flex-col h-full overflow-hidden border-l border-slate-200 shadow-inner">
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                 
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-lg">Reality Check</h3>
                    <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-none ${results.isProfitable && !results.isOverCapacity ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                       {results.isProfitable && !results.isOverCapacity ? 'FEASIBLE' : 'ATTENTION NEEDED'}
                    </span>
                 </div>

                 {/* Visual 1: Financial Goal */}
                 <div className="bg-white p-5 border border-slate-200 shadow-sm relative">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Target className="w-4 h-4" /> Financial Progress
                    </h4>
                    <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} />
                             <Tooltip 
                                cursor={{fill: 'transparent'}}
                                formatter={(val: number) => [`${currencySymbol} ${val.toLocaleString()}`, '']}
                                contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                             />
                             <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                {profitChartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                    {/* Diff Indicator */}
                    <div className="absolute top-5 right-5 text-right">
                       <p className="text-xs text-slate-400">Net Profit</p>
                       <p className={`text-xl font-black ${results.isProfitable ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {currencySymbol} {results.netProfit.toLocaleString()}
                       </p>
                       {!results.isProfitable && (
                          <p className="text-xs text-rose-400 mt-1">Short by {currencySymbol} {(targetProfit - results.netProfit).toLocaleString()}</p>
                       )}
                    </div>
                 </div>

                 {/* Visual 2: Time Capacity */}
                 <div className="bg-white p-5 border border-slate-200 shadow-sm relative">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Clock className="w-4 h-4" /> Time Capacity
                    </h4>
                    <div className="h-40 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeChartData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                             <XAxis type="number" hide />
                             <YAxis dataKey="name" type="category" width={60} tick={{fontSize: 10, fontWeight: 600}} axisLine={false} tickLine={false} />
                             <Tooltip 
                                cursor={{fill: 'transparent'}}
                                formatter={(val: number) => [`${val.toFixed(1)} hrs`, '']}
                                contentStyle={{ borderRadius: '0px', border: '1px solid #e2e8f0', boxShadow: 'none' }}
                             />
                             <Bar dataKey="value" barSize={24} radius={[0, 4, 4, 0]}>
                                {timeChartData.map((entry, index) => (
                                   <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                     <div className="absolute top-5 right-5 text-right">
                       <p className="text-xs text-slate-400">Time Utilized</p>
                       <p className={`text-xl font-black ${results.isOverCapacity ? 'text-rose-500' : 'text-blue-600'}`}>
                          {results.timeUsedHours.toFixed(1)} hrs
                       </p>
                       {results.isOverCapacity && (
                          <p className="text-xs text-rose-400 mt-1">Over by {(results.timeUsedHours - constraints.capacityHours).toFixed(1)} hrs</p>
                       )}
                    </div>
                 </div>

                 {/* Visual 3: The Verdict */}
                 <div className={`p-5 border-l-4 shadow-sm ${results.isProfitable && !results.isOverCapacity ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-200 border-slate-500'}`}>
                    <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-2">
                       {results.isProfitable && !results.isOverCapacity ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-slate-600" />}
                       Scenario Verdict
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       To make <strong>{currencySymbol}{targetProfit.toLocaleString()}</strong> in {constraints.label}, you need to perform <strong>{results.totalProcedures} procedures</strong>.
                    </p>
                    
                    {results.isOverCapacity ? (
                       <p className="text-sm font-bold text-rose-600 mt-2">
                          ⚠️ Impossible! This workload requires {results.timeUsedHours.toFixed(1)} hours, but you only have {constraints.capacityHours.toFixed(1)} hours available.
                       </p>
                    ) : (
                       <p className="text-sm text-slate-600 mt-2">
                          This requires <strong>{results.timeUsedHours.toFixed(1)} hours</strong> ({((results.timeUsedHours / constraints.capacityHours) * 100).toFixed(0)}% capacity).
                          {results.isProfitable ? <span className="text-emerald-600 font-bold block mt-1">You are on track to hit your target!</span> : <span className="text-rose-600 font-bold block mt-1">Increase volume or price to hit profit target.</span>}
                       </p>
                    )}
                 </div>

                 {/* KPI Strip */}
                 <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">Total Revenue</p>
                       <p className="text-lg font-bold text-slate-800">{currencySymbol}{results.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                       <p className="text-[10px] uppercase font-bold text-slate-400">Fixed Cost Allocation</p>
                       <p className="text-lg font-bold text-slate-600">{currencySymbol}{constraints.fixedCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                    </div>
                 </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default ForecastingModal;
