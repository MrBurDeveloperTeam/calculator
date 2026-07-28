import React, { useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { ArrowRight, TrendingUp, AlertCircle, Calculator, Wand2 } from 'lucide-react';
import { ViewState } from '../types';
import DataIntegrityCheck from './DataIntegrityCheck';

interface DashboardProps {
    onNavigate: (view: ViewState) => void;
}

const SummaryCard: React.FC<{
  label: string;
  value: string;
  onClick: () => void;
  color?: string;
}> = ({ label, value, onClick, color = "bg-white" }) => (
  <div
    onClick={onClick}
    className={`${color} min-w-0 overflow-hidden p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-md transition-all group`}
  >
    <p className="text-sm font-medium text-slate-500 mb-1">
      {label}
    </p>

    <div className="flex min-w-0 items-center justify-between gap-3">
      <span className="min-w-0 break-all text-xl sm:text-2xl font-bold text-slate-800">
        {value}
      </span>

      <ArrowRight className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-teal-600 transition-colors" />
    </div>
  </div>
);

type Timeframe = 'hourly' | 'daily' | 'monthly' | 'quarterly' | 'yearly';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, }) => {
    const { state, getTotalMonthlyHours, getGlobalTotalMonthlyCost, openModal } = useCalculator();
    const [timeframe, setTimeframe] = useState<Timeframe>('monthly');

    // --- Derived Calculations ---

    // 1. Overhead (Sum of List)
    const overheadCost = state.overhead.items.reduce((acc, i) => acc + i.monthlyCost, 0);

    // 2. Staff (Sum of List)
    const staffCost = state.staff.members.reduce((acc, member) => acc + member.salary + member.benefits + member.bonus, 0);

    // 3. Depreciation (Sum of List)
    const depCost = state.depreciation.assets.reduce((acc, asset) => {
        const months = asset.lifespanYears * 12;
        return acc + (months > 0 ? (asset.purchasePrice - asset.resaleValue) / months : 0);
    }, 0);

    // 8. Regulatory
    const regCost = ((state.regulatory.annualApc + state.regulatory.annualXray + state.regulatory.annualInsurance) / 12) + state.regulatory.monthlyWaste;

    // 9. Financial (Includes Tax Est & Trans Fees based on Est Revenue)
    const transFeeAmount = state.financial.estMonthlyRevenue * (state.financial.transactionFeesPercent / 100);
    const taxEstimate = state.financial.estMonthlyRevenue * (state.financial.taxRate / 100);
    const finCost = state.financial.monthlyInterest + state.financial.monthlyBankCharges + transFeeAmount + taxEstimate;

    // 10. Owner Comp (Included as fixed cost per requirements)
    const ownerCost = state.owner.desiredNetIncome;

    // Total Monthly Operation Cost (Using Centralized Logic)
    const totalMonthlyFixed = getGlobalTotalMonthlyCost();

    // Timeframe Conversion Factors
    const totalMonthlyHours = getTotalMonthlyHours();
    const daysPerMonth = state.clinicSettings.workingDaysPerWeek * 4.3333;

    const getTimeframeData = () => {
        switch (timeframe) {
            case 'yearly':
                return {
                    value: totalMonthlyFixed * 12,
                    label: 'Estimated Annual OpEx',
                    subtext: 'Total projected fixed costs for the entire year.',
                    colorClass: 'text-rose-600',
                    bgClass: 'bg-rose-50',
                    borderClass: 'border-rose-100'
                };
            case 'quarterly':
                return {
                    value: totalMonthlyFixed * 3,
                    label: 'Quarterly OpEx',
                    subtext: 'Projected costs for a 3-month period.',
                    colorClass: 'text-orange-600',
                    bgClass: 'bg-orange-50',
                    borderClass: 'border-orange-100'
                };
            case 'monthly':
                return {
                    value: totalMonthlyFixed,
                    label: 'Monthly OpEx',
                    subtext: 'Base recurring costs per month.',
                    colorClass: 'text-slate-800',
                    bgClass: 'bg-white',
                    borderClass: 'border-slate-200'
                };
            case 'daily':
                return {
                    value: daysPerMonth > 0 ? totalMonthlyFixed / daysPerMonth : 0,
                    label: 'Daily Burn Rate',
                    subtext: `Cost per day (based on ${state.clinicSettings.workingDaysPerWeek} days/week).`,
                    colorClass: 'text-teal-600',
                    bgClass: 'bg-teal-50',
                    borderClass: 'border-teal-100'
                };
            case 'hourly':
                return {
                    value: totalMonthlyHours > 0 ? totalMonthlyFixed / totalMonthlyHours : 0,
                    label: 'Clinic Hourly Rate',
                    subtext: `Cost to keep the clinic open for 1 hour (${totalMonthlyHours.toFixed(0)} hrs/mo).`,
                    colorClass: 'text-emerald-600',
                    bgClass: 'bg-emerald-50',
                    borderClass: 'border-emerald-100'
                };
        }
    };

    const currentData = getTimeframeData();

    return (
        <div className="dashboard-page w-full min-w-0 space-y-8 overflow-x-hidden animate-in fade-in duration-500 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Clinic Pulse Dashboard</h1>
                    <p className="text-slate-500">Real-time overview of your practice metrics.</p>
                </div>
                <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Calculations Active</span>
                </div>
            </div>

            {/* Hero Card: Interactive OpEx Timeframe Toggle */}
            <div
                className={`w-full min-w-0 overflow-hidden rounded-2xl p-1 shadow-sm border ${currentData.borderClass} ${currentData.bgClass} transition-colors duration-300`}
            >
                <div className="min-w-0 bg-white/50 rounded-xl p-4 sm:p-6 md:p-8 backdrop-blur-sm">
                    {/* Segmented Control */}
                    <div className="w-full mb-8">
                        <div className="grid w-full grid-cols-5 gap-1 rounded-lg bg-slate-100 p-1 shadow-inner">
                            {(['hourly', 'daily', 'monthly', 'quarterly', 'yearly'] as Timeframe[]).map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`
                                min-w-0 whitespace-nowrap rounded-md
                                px-1 py-1.5 text-[10px] sm:px-3 sm:text-sm
                                font-medium transition-all capitalize
                                ${
                                    timeframe === tf
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                }
                                `}
                            >
                                {tf}
                            </button>
                            ))}
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-slate-500 font-semibold uppercase tracking-widest text-xs mb-3">{currentData.label}</p>
                        <h2
                            className={`max-w-full break-all text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4 ${currentData.colorClass} transition-all duration-300`}
                        >
                            {state.clinicSettings.currencySymbol} {currentData.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h2>
                        <p className="text-slate-400 text-sm max-w-md mx-auto mb-4">
                            {currentData.subtext}
                        </p>

                        {/* Time Sensitivity Note */}
                        <div className="dashboard-time-note block w-full max-w-md mx-auto break-words bg-indigo-50 border border-indigo-100 rounded-lg px-3 sm:px-4 py-2 text-center text-xs text-indigo-800">
                            <p className="dashboard-time-note-primary font-medium">
                                Time Engine Active: Based on{' '}
                                {state.clinicSettings.workingDaysPerWeek} days/week ×{' '}
                                {state.clinicSettings.hoursPerDay} hours/day
                            </p>

                            <p className="dashboard-time-note-secondary mt-0.5">
                                Total Clinical Capacity:{' '}
                                <strong>{totalMonthlyHours.toFixed(1)} hours/month</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="font-semibold text-slate-800 text-lg border-b border-slate-200 pb-2">Category Breakdowns (Monthly)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SummaryCard
                    label="Fixed Overhead"
                    value={`${state.clinicSettings.currencySymbol} ${overheadCost.toFixed(2)}`}
                    onClick={() => onNavigate('overhead')}
                />
                <SummaryCard
                    label="Staff Costs"
                    value={`${state.clinicSettings.currencySymbol} ${staffCost.toFixed(2)}`}
                    onClick={() => onNavigate('staff')}
                />
                <SummaryCard
                    label="Equip. Depreciation"
                    value={`${state.clinicSettings.currencySymbol} ${depCost.toFixed(2)}`}
                    onClick={() => onNavigate('depreciation')}
                />
                <SummaryCard
                    label="Regulatory"
                    value={`${state.clinicSettings.currencySymbol} ${regCost.toFixed(2)}`}
                    onClick={() => onNavigate('regulatory')}
                />
                <SummaryCard
                    label="Financial Costs"
                    value={`${state.clinicSettings.currencySymbol} ${finCost.toFixed(2)}`}
                    onClick={() => onNavigate('financial')}
                />
                <SummaryCard
                    label="Owner Compensation"
                    value={`${state.clinicSettings.currencySymbol} ${ownerCost.toFixed(2)}`}
                    onClick={() => onNavigate('owner')}
                />
            </div>

            {/* Note & Action Card */}
            <div className="w-full min-w-0 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex min-w-0 gap-4 items-start">
                    <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold text-blue-800">Financial Planning & Scenarios</h4>
                        <p className="text-blue-600 text-sm mt-1 max-w-xl">
                            This dashboard summarizes your <strong>Fixed OpEx</strong>.
                            Variable costs (Consumables, Lab Fees) are incurred per-patient.
                            Use the Scenario Planner tools to simulate profit and capacity.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* <button 
                        onClick={() => openModal('ROI')}
                        className="flex-shrink-0 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-xl shadow-sm font-bold flex items-center gap-2 transition-all"
                    >
                        <Calculator className="w-5 h-5" />
                        Quick ROI Check
                    </button> */}
                    <button
                        onClick={() => openModal('FORECAST')}
                        className="w-full sm:w-auto flex-shrink-0 justify-center text-center whitespace-normal bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 font-bold flex items-center gap-2 transition-all"
                    >
                        <Wand2 className="w-5 h-5" />
                        {/* Forecast Profit Targets */}
                        ROI Calculation Simulator
                    </button>
                </div>
            </div>

            {/* Debugging Tool */}
            <DataIntegrityCheck />
        </div>
    );
};

export default Dashboard;
