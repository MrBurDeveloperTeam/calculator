import React, { useState } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { Calendar, Trash2, ArrowRight, TrendingUp, Calculator, Clock, MousePointer2, AlertTriangle } from 'lucide-react';
import { SavedPlan } from '../types';

const HistoryTab: React.FC = () => {
    const { savedPlans, deletePlan, openModal, state } = useCalculator();
    const { currencySymbol } = state.clinicSettings;

    // --- Local State for Custom Modal ---
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); // Prevent opening the plan
        setDeleteTargetId(id);
        setShowDeleteModal(true);
    };

    const executeDelete = () => {
        if (deleteTargetId) {
            deletePlan(deleteTargetId);
        }
        setShowDeleteModal(false);
        setDeleteTargetId(null);
    };

    const handleOpen = (plan: SavedPlan) => {
        openModal(plan.type, plan);
    };

    if (savedPlans.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in">
                <div className="bg-slate-100 p-6 rounded-full mb-4">
                    <Calendar className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Saved Plans Yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-6">
                    Create forecasts in the Dashboard using the "Forecast Profit" or "ROI Check" tools, then save them here to track your goals.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => openModal('FORECAST')}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        Create New Forecast
                    </button>
                </div>
            </div>
        );
    }

    // Sort by date desc
    const sortedPlans = [...savedPlans].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500 pb-20 relative">
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Plan History</h1>
                <p className="text-slate-500 mt-1">Review and manage your saved financial scenarios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedPlans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => handleOpen(plan)}
                        className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className={`px-5 py-4 border-b border-slate-100 flex justify-between items-start ${plan.type === 'FORECAST' ? 'bg-indigo-50/50' : 'bg-teal-50/50'}`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {plan.type === 'FORECAST' ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
                                            Forecast
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-700 uppercase tracking-wider">
                                            ROI Check
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(plan.date).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors line-clamp-1">
                                    {plan.name}
                                </h3>
                            </div>
                            {plan.type === 'FORECAST' ? (
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                            ) : (
                                <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                                    <Calculator className="w-5 h-5" />
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="p-5 flex-1 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">Timeframe</span>
                                <span className="font-bold text-slate-700 capitalize">{plan.timeframe}</span>
                            </div>

                            {plan.type === 'FORECAST' && plan.targetProfit && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Target Profit</span>
                                    <span className="font-bold text-slate-700">{currencySymbol} {plan.targetProfit.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-slate-50 flex justify-between items-start">

                                {/* LEFT */}
                                <span className="text-xs text-slate-400">
                                    Net Profit
                                </span>

                                {/* RIGHT */}
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Projected Result
                                    </p>
                                    <span className={`text-xl font-black ${plan.results.isProfitable ? 'text-emerald-600' : 'text-rose-500'}`}>
                                        {currencySymbol} {plan.results.netProfit.toFixed(2)}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={(e) => handleDeleteClick(e, plan.id)}
                                className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                                title="Delete Plan"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                View Plan <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowDeleteModal(false)}
                    ></div>

                    {/* Modal Content */}
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <div className="flex items-center gap-3 text-red-600 mb-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">Delete Saved Plan?</h3>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Are you sure you want to remove this financial scenario? This cannot be undone.
                            </p>
                        </div>

                        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-md transition-colors"
                            >
                                Delete Plan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HistoryTab;
