import React, { useState, useEffect, useRef } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { Plus, Trash2, Save, Calculator, UserPlus, Table2, Edit, Check, X, ArrowRight, TrendingUp, Users, Armchair, ChevronDown, ChevronUp, Calendar, AlertTriangle, TrendingDown, Search, Package, Clock, Equal, CircleDollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GlobalState, SavedProcedure, ProcedureRecipeItem } from '../types';
import ConfirmationModal from './ConfirmationModal';
import StyledInput from './StyledInput';
import ResultVisuals from './ResultVisuals';

// --- Theming Configuration ---
type ThemeType = 'foundation' | 'clinical' | 'external' | 'growth';

const THEME_CONFIG = {
  foundation: {
    headerBg: 'bg-slate-100',
    headerBorder: 'border-slate-200',
    iconContainer: 'bg-white',
    iconColor: 'text-slate-700',
    titleText: 'text-slate-800',
    button: 'bg-slate-700 hover:bg-slate-800',
    visualHeader: 'bg-slate-800'
  },
  clinical: {
    headerBg: 'bg-teal-50',
    headerBorder: 'border-teal-100',
    iconContainer: 'bg-white',
    iconColor: 'text-teal-600',
    titleText: 'text-teal-900',
    button: 'bg-teal-600 hover:bg-teal-700',
    visualHeader: 'bg-teal-700'
  },
  external: {
    headerBg: 'bg-indigo-50',
    headerBorder: 'border-indigo-100',
    iconContainer: 'bg-white',
    iconColor: 'text-indigo-600',
    titleText: 'text-indigo-900',
    button: 'bg-indigo-600 hover:bg-indigo-700',
    visualHeader: 'bg-indigo-700'
  },
  growth: {
    headerBg: 'bg-rose-50',
    headerBorder: 'border-rose-100',
    iconContainer: 'bg-white',
    iconColor: 'text-rose-600',
    titleText: 'text-rose-900',
    button: 'bg-rose-600 hover:bg-rose-700',
    visualHeader: 'bg-rose-700'
  }
};

// --- Local Components for Procedure Builder ---

const SharpInput = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  tooltip
}: {
  label: string;
  value: string | number;
  onChange: (val: any) => void;
  type?: 'text' | 'number' | 'currency';
  placeholder?: string;
  tooltip?: string;

}) => {
  const { state } = useCalculator();
  const { currencySymbol } = state.clinicSettings;

  return (
    <div className="group relative mb-4">
      {label && <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>}
      <div className="relative flex items-center border border-gray-300 bg-white hover:border-blue-400 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors rounded-sm overflow-hidden">
        {type === 'currency' && (
          <div className="pointer-events-none flex items-center pl-3 pr-2 bg-gray-50 border-r border-gray-200 h-10">
            <span className="text-gray-500 text-sm font-bold whitespace-nowrap">{currencySymbol}</span>
          </div>
        )}
        <input
          type={type === 'text' ? 'text' : 'number'}
          min="0"
          value={value === 0 && type !== 'text' ? '' : value}
          onChange={(e) => {
            if (type === 'text') {
              onChange(e.target.value);
            } else {
              // Constraint 2: No negatives
              const val = parseFloat(e.target.value);
              onChange(isNaN(val) ? 0 : Math.max(0, val));
            }
          }}
          className={`
            block flex-1 w-full min-w-0 border-0 bg-white py-2.5 px-3 text-gray-900 placeholder-gray-400 
            focus:ring-0 sm:text-sm font-medium
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        `}
          placeholder={placeholder}
        />
        {type === 'number' && label.toLowerCase().includes('duration') && (
          <span className="pr-3 text-gray-400 text-xs font-medium whitespace-nowrap">min</span>
        )}
      </div>

      {/* Constraint 4: Hover-Only Descriptions */}
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded-sm z-50 w-64 shadow-xl pointer-events-none animate-in fade-in slide-in-from-bottom-1 duration-200">
          {tooltip}
          <div className="absolute left-4 -bottom-1 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// --- Reusable Calculator Card ---
interface CalculatorCardProps {
  title: string;
  resultTitle: string;
  resultValue: string;
  section: keyof GlobalState | 'procedure';
  children: React.ReactNode;
  visualData?: { name: string; value: number; color: string }[];
  visualType?: 'cost' | 'profit';
  projectionData?: any;
  tooltipData?: { title: string; content: React.ReactNode };
  theme?: ThemeType;
  readOnly?: boolean;
  pageClassName?: string;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({
  title,
  resultTitle,
  resultValue,
  section,
  children,
  visualData = [],
  visualType = 'cost',
  projectionData,
  tooltipData,
  theme = 'foundation',
  readOnly = false,
  pageClassName = ''
}) => {
  const { saveSection } = useCalculator();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const styles = THEME_CONFIG[theme];

  const handleSave = () => {
    if (section !== 'procedure') {
      saveSection(section as keyof GlobalState);
      setIsModalOpen(false);
    }
  };

  return (
    <div className={`${pageClassName} max-w-6xl mx-auto animate-in fade-in duration-500`}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Panel */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-0 flex flex-col overflow-hidden">
          {/* Themed Header */}
          <div className={`calculator-card-header flex items-center gap-3 px-6 py-4 border-b ${styles.headerBg} ${styles.headerBorder}`}>
            <div className={`calculator-card-header-icon p-2 rounded-lg ${styles.iconContainer} ${styles.iconColor} shadow-sm`}>
              <Calculator className="w-5 h-5" />
            </div>
            <div className="flex-grow">
              <h2 className={`calculator-card-header-title text-lg font-bold ${styles.titleText}`}>{title}</h2>
              {readOnly && <p className="calculator-card-header-subtitle text-xs text-slate-500">Analytics View • Managed in Settings</p>}
            </div>
          </div>

          <div className="p-6 space-y-1 flex-grow">
            {children}
          </div>

          {!readOnly && section !== 'procedure' && (
            <div className="px-6 py-4 bg-gray-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center space-x-2 text-white px-5 py-2.5 rounded-lg transition-all shadow-md font-medium text-sm ${styles.button}`}
              >
                <Save className="w-4 h-4" />
                <span>Save Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Visual Panel */}
        <div className="lg:col-span-5">
          <div className="sticky top-6 h-auto">
            <ResultVisuals
              title={resultTitle}
              mainValue={resultValue}
              data={visualData}
              type={visualType}
              projectionData={projectionData}
              tooltipData={tooltipData}
              headerClassName={styles.visualHeader}
            />
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleSave}
        title={`Save ${title}?`}
        message={`This will overwrite the saved data for ${title} only. Other calculators will not be affected.`}
      />
    </div>
  );
};

// --- Procedure Profitability Library ---
export const ProcedureBuilder = () => {
  const { state, getTotalMonthlyHours, getGlobalTotalMonthlyCost, showToast, savedProcedures, saveProcedure, updateProcedure, deleteProcedure } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const consumablesList = state.consumables.items;
  const [editingId, setEditingId] = useState<string | null>(null);

  // Input State
  const [inputName, setInputName] = useState('');
  const [inputPrice, setInputPrice] = useState(0);
  const [inputDuration, setInputDuration] = useState(0);

  // Recipe State
  const [recipe, setRecipe] = useState<ProcedureRecipeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Centralized Cost Logic Integration ---
  const totalMonthlyFixed = getGlobalTotalMonthlyCost();
  const hoursPerMonth = getTotalMonthlyHours();
  const globalHourlyRate = hoursPerMonth > 0 ? totalMonthlyFixed / hoursPerMonth : 0;
  const globalMinuteRate = globalHourlyRate / 60;

  // Real-time Calculations for Live Analysis
  const currentFixedAllocated = inputDuration * globalMinuteRate;
  const currentTotalVariable = recipe.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  const currentTotalCost = currentTotalVariable + currentFixedAllocated;
  const currentNetProfit = inputPrice - currentTotalCost;
  const currentHourlyProfit = inputDuration > 0 ? (currentNetProfit / inputDuration) * 60 : 0;
  const currentMargin = inputPrice > 0 ? (currentNetProfit / inputPrice) * 100 : 0;

  // --- Recipe Management ---
  const handleAddConsumable = (item: { id: string, name: string, cost: number }) => {
    setRecipe(prev => {
      // Check if item already exists
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { id: item.id, name: item.name, cost: item.cost, quantity: 1 }];
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  const handleRemoveConsumable = (id: string) => {
    setRecipe(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number) => {
    setRecipe(prev => prev.map(item => item.id === id ? { ...item, quantity: Math.max(0, qty) } : item));
  };

  const filteredConsumables = consumablesList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveProcedure = () => {
    // Validation
    if (!inputName || inputName.trim() === '') {
      showToast("Procedure Name is required.");
      return;
    }
    if (inputDuration <= 0) {
      showToast("Duration must be greater than 0 minutes.");
      return;
    }

    const newProcedure: SavedProcedure = {
      id: editingId || crypto.randomUUID(),
      name: inputName,
      price: inputPrice,
      duration: inputDuration,
      variableCost: currentTotalVariable,
      recipe: recipe
    };

    if (editingId) {
      updateProcedure(newProcedure);
    } else {
      saveProcedure(newProcedure);
    }
    showToast(editingId ? "Procedure updated successfully!" : "Procedure saved to library!");
    resetForm();
  };

  const handleEdit = (proc: SavedProcedure) => {
    setInputName(proc.name);
    setInputPrice(proc.price);
    setInputDuration(proc.duration);

    if (proc.recipe && proc.recipe.length > 0) {
      setRecipe(proc.recipe);
    } else {
      // Migration for legacy items without a recipe: 
      if (proc.variableCost > 0) {
        setRecipe([{ id: crypto.randomUUID(), name: 'Legacy Material Cost', cost: proc.variableCost, quantity: 1 }]);
      } else {
        setRecipe([]);
      }
    }
    setEditingId(proc.id);
  };

  // --- Delete Workflow ---
  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowDeleteModal(true);
  };

  const executeDelete = () => {
    if (deleteTargetId) {
      deleteProcedure(deleteTargetId);
      if (editingId === deleteTargetId) resetForm();
      showToast('Procedure deleted successfully.');
    }
    setShowDeleteModal(false);
    setDeleteTargetId(null);
  };

  const resetForm = () => {
    setInputName('');
    setInputPrice(0);
    setInputDuration(0);
    setRecipe([]);
    setEditingId(null);
  };

  const visualData = [
    { name: 'Fixed Overhead', value: currentFixedAllocated, color: '#94a3b8' },
    { name: 'Variable Recipe', value: currentTotalVariable, color: '#3b82f6' },
    { name: 'Net Profit', value: currentNetProfit > 0 ? currentNetProfit : 0, color: '#22c55e' }
  ];

  const tooltipData = {
    title: "Understanding Profitability",
    content: (
      <span>
        Based on your clinic's operating costs, every minute in the chair costs <span className="group relative inline-block border-b-2 border-dotted border-blue-400 cursor-help font-bold text-blue-700">
          RM {globalMinuteRate.toFixed(2)}
          <span className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full right-0 mb-2 w-max max-w-xs z-[9999] p-3 bg-slate-800 text-slate-50 text-xs rounded-lg shadow-xl pointer-events-none text-center">
            <span className="block font-bold text-blue-300 mb-1">Cost Per Minute Formula</span>
            <span className="block mb-2 opacity-90">[ Total Monthly OpEx ] ÷ [ Total Monthly Minutes ]</span>
            <span className="block bg-slate-900/50 rounded p-2 border border-slate-700 font-mono">
              <span className="block border-b border-slate-600 pb-1 mb-1">
                RM {totalMonthlyFixed.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
              <span className="block text-slate-400 text-[10px] mb-1">
                {hoursPerMonth.toFixed(0)} hrs × 60
              </span>
              <span className="block font-bold text-emerald-400 pt-1 border-t border-slate-700">
                = RM {globalMinuteRate.toFixed(2)} / min
              </span>
            </span>
            <span className="absolute right-4 -bottom-1 w-2 h-2 bg-slate-800 rotate-45"></span>
          </span>
        </span>. For this {inputDuration} min procedure, the base time cost is RM {currentFixedAllocated.toFixed(2)}. Adding RM {currentTotalVariable.toFixed(2)} for consumables/lab gives a total break-even cost of RM {currentTotalCost.toFixed(2)}.
      </span>
    )
  };

  return (
    <CalculatorCard
      title="Procedure Profitability Builder"
      resultTitle="Net Profit (Current)"
      resultValue={`RM ${currentNetProfit.toFixed(2)}`}
      section="procedure"
      visualData={visualData}
      visualType="profit"
      projectionData={{ dailyRevenue: inputPrice, dailyCost: currentTotalCost, dailyProfit: currentNetProfit }}
      tooltipData={tooltipData}
      theme="foundation"
    >
      <div className={`p-4 rounded-lg border mb-6 transition-colors ${editingId ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
        <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 ${editingId ? 'text-amber-800' : 'text-slate-700'}`}>
          {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4 text-teal-600" />}
          {editingId ? 'Editing Procedure' : 'Add New Procedure'}
        </h4>

        {/* Row 1: Procedure Name (Full Width) */}
        <div className="mb-2">
          <SharpInput
            label="Procedure Name"
            value={inputName}
            onChange={setInputName}
            type="text"
            placeholder="e.g. Scaling"
          />
        </div>

        {/* Row 2: Price and Duration (Side-by-Side) */}
        <div className="grid grid-cols-2 gap-4 mb-2">
          <SharpInput
            label="Price to Patient"
            value={inputPrice}
            onChange={setInputPrice}
            type="currency"
            placeholder="0.00"
            tooltip="📈 Higher price directly improves Net Margin."
          />
          <SharpInput
            label="Duration"
            value={inputDuration}
            onChange={setInputDuration}
            type="number"
            placeholder="minutes"
            tooltip="📉 Faster procedures increase your Hourly Profit rate."
          />
        </div>

        {/* Row 3: DYNAMIC CONSUMABLES SELECTOR */}
        <div className="mb-6 bg-white p-4 rounded-sm border border-gray-200 shadow-sm">
          <h5 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-teal-600" /> Procedure Consumables & Lab
          </h5>

          {/* Search & Add Dropdown */}
          <div className="relative mb-4" ref={dropdownRef}>
            <div className="relative flex items-center border border-gray-300 bg-white focus-within:ring-1 focus-within:ring-blue-500 rounded-sm">
              <Search className="absolute left-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Consumables List..."
                className="w-full pl-10 pr-4 py-2 text-sm focus:outline-none bg-white text-gray-900 placeholder-gray-400 rounded-sm border-0"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-lg max-h-60 overflow-y-auto">
                {filteredConsumables.length > 0 ? (
                  filteredConsumables.map(item => (
                    <button
                      key={item.id}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center group text-gray-900"
                      onClick={() => handleAddConsumable(item)}
                    >
                      <span className="font-medium group-hover:text-teal-700">{item.name}</span>
                      <span className="text-gray-500 text-xs">{currencySymbol} {item.cost.toFixed(2)}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">No items found.</p>
                    <p className="text-xs text-gray-400 mt-1">Manage items in Clinic Settings &gt; Consumables</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Recipe Table */}
          {recipe.length > 0 ? (
            <div className="overflow-hidden border border-gray-200 rounded-sm mb-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Item</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Qty</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Subtotal</th>
                    <th className="px-3 py-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recipe.map(item => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 text-xs font-medium text-gray-700">{item.name}</td>
                      <td className="px-3 py-2 text-xs text-gray-500 text-right">{currencySymbol} {item.cost.toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          min="0"
                          className="w-12 h-6 text-center text-xs border border-gray-300 focus:ring-1 focus:ring-blue-500 rounded-sm bg-white text-gray-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, Math.max(0, parseFloat(e.target.value) || 0))}
                        />
                      </td>
                      <td className="px-3 py-2 text-xs font-bold text-gray-700 text-right">
                        {currencySymbol} {(item.cost * item.quantity).toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          onClick={() => handleRemoveConsumable(item.id)}
                          className="text-gray-300 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 text-xs font-bold text-gray-600 text-right">Total Consumable Cost:</td>
                    <td className="px-3 py-2 text-xs font-black text-gray-800 text-right">{currencySymbol} {currentTotalVariable.toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-sm mb-2">
              <p className="text-xs text-gray-400">No consumables added yet.</p>
            </div>
          )}

          <p className="text-[10px] text-gray-400 italic text-center mt-2">
            💡 Accurate recipes prevent hidden losses. Don't forget PPE and sterilization pouches!
          </p>
        </div>

        {/* Live Analysis Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-bold text-gray-700 text-sm">Projected Financial Performance</h5>
            {currentNetProfit < 0 && (
              <div className="flex items-center gap-1 text-red-600 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3 h-3" /> Loss Making Procedure
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Metric 1: Break Even */}
            <div className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Min Cost to Cover</p>
              <p className="text-lg font-bold text-gray-700 mt-1">{state.clinicSettings.currencySymbol} {currentTotalCost.toFixed(0)}</p>
            </div>

            {/* Metric 2: Net Profit */}
            <div className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Net Profit / Case</p>
              <div className={`flex items-center gap-1 mt-1 ${currentNetProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {currentNetProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-lg font-bold">{state.clinicSettings.currencySymbol} {currentNetProfit.toFixed(0)}</span>
              </div>
            </div>

            {/* Metric 3: Margin */}
            <div className="p-3 bg-white rounded-md border border-gray-100 shadow-sm">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Margin</p>
              <p className={`text-lg font-bold mt-1 ${currentMargin >= 30 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {currentMargin.toFixed(1)}%
              </p>
            </div>

            {/* Metric 4: Hourly Profit */}
            <div className="p-3 bg-blue-50 rounded-md border border-blue-100 shadow-sm">
              <p className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Profit Per Chair Hour</p>
              <p className="text-lg font-bold text-blue-700 mt-1">{state.clinicSettings.currencySymbol} {currentHourlyProfit.toFixed(0)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSaveProcedure} disabled={inputPrice <= 0 || inputDuration <= 0} className={`flex-1 text-white py-3 rounded-sm font-medium shadow-sm flex justify-center items-center gap-2 transition-all disabled:opacity-50 ${editingId ? 'bg-amber-600' : 'bg-slate-800'}`}>
            {editingId ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />} {editingId ? 'Update Procedure' : 'Save to Library'}
          </button>
          {editingId && <button onClick={resetForm} className="px-4 py-3 rounded-sm border border-gray-300 bg-white text-gray-600"><X className="w-4 h-4" /></button>}
        </div>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 text-sm flex items-center gap-2"><Table2 className="w-4 h-4 text-gray-400" /> Saved Treatments</h3>
          <span className="text-xs text-gray-500">Live Recalculation Active</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Procedure</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Break-Even</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-teal-600 uppercase">Profit</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {savedProcedures.map((item) => {
                const itemFixedCost = item.duration * globalMinuteRate;
                const itemBreakEven = item.variableCost + itemFixedCost;
                const itemProfit = item.price - itemBreakEven;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleEdit(item)}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 text-right font-medium">{state.clinicSettings.currencySymbol} {itemBreakEven.toFixed(0)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{state.clinicSettings.currencySymbol} {item.price.toFixed(0)}</td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${itemProfit >= 0 ? 'text-teal-600' : 'text-red-500'}`}>{state.clinicSettings.currencySymbol} {itemProfit.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {savedProcedures.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Library is empty.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900">Delete Procedure?</h3>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to remove this saved treatment? This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </CalculatorCard>
  );
};

// ... existing code for other calculators (OverheadCalculator, StaffCalculator, etc.) ...

// --- 1. Fixed Overhead ---
export const OverheadCalculator = () => {
  const { state, getTotalMonthlyHours } = useCalculator();
  const { items } = state.overhead;
  const { currencySymbol } = state.clinicSettings;

  const totalExpenses = items.reduce((acc, i) => acc + i.monthlyCost, 0);
  const operatingHours = getTotalMonthlyHours();
  const costPerHour = operatingHours > 0 ? totalExpenses / operatingHours : 0;

  const sortedItems = [...items].sort((a, b) => b.monthlyCost - a.monthlyCost);
  const visualData = sortedItems.slice(0, 5).map((item, i) => ({
    name: item.name,
    value: item.monthlyCost,
    color: ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'][i] || '#e0e7ff'
  }));

  const tooltipData = {
    title: "Facility Cost Analysis",
    content: `You have ${items.length} fixed expense items totaling ${currencySymbol} ${totalExpenses.toFixed(0)}/mo. Divided by your clinical capacity of ${operatingHours.toFixed(0)} hours, your facility costs ${currencySymbol} ${costPerHour.toFixed(2)} every single hour.`
  };

  return (
    <CalculatorCard
      title="Fixed Overhead Analysis"
      resultTitle="Facility Cost / Hour"
      resultValue={`${currencySymbol} ${costPerHour.toFixed(2)}`}
      section="overhead"
      visualData={visualData}
      tooltipData={tooltipData}
      theme="external"
      readOnly={true}
      pageClassName="fixed-overhead-page"
    >
      <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex justify-between items-center">
        <span>Calculation Logic:</span>
        <span className="font-mono font-medium">
          {currencySymbol} {totalExpenses.toLocaleString()} ÷ {operatingHours.toFixed(1)} hrs = <span className="text-indigo-600 font-bold">{currencySymbol} {costPerHour.toFixed(2)}/hr</span>
        </span>
      </div>
      <div className="fixed-overhead-info-card mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex items-center gap-2 border border-blue-100">
        <TrendingUp className="fixed-overhead-info-icon w-5 h-5 flex-shrink-0" />

        <span className="fixed-overhead-info-text">
          This is an Analytics View. Manage your overhead items in{' '}
          <strong>Clinic Settings</strong>.
        </span>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Expense Item</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Monthly Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-sm text-slate-700">{item.name}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900 text-right">{currencySymbol} {item.monthlyCost.toLocaleString()}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={2} className="px-4 py-4 text-center text-slate-400">No overhead items defined.</td></tr>}
          </tbody>
          <tfoot className="bg-slate-50 font-bold">
            <tr>
              <td className="px-4 py-3 text-slate-800">Total Monthly Overhead</td>
              <td className="px-4 py-3 text-right text-indigo-700">{currencySymbol} {totalExpenses.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CalculatorCard>
  );
};

// --- 2. Staff Cost (UPGRADED ANALYTICS) ---
export const StaffCalculator = () => {
  const { state, getTotalMonthlyHours } = useCalculator();
  const { members } = state.staff;
  const { currencySymbol, workingDaysPerWeek, hoursPerDay } = state.clinicSettings;

  const totalMonthlyCost = members.reduce((sum, m) => sum + m.salary + m.benefits + m.bonus, 0);
  const clinicTotalHours = getTotalMonthlyHours(); // The Clinic's Total Operating Hours

  // The "Clinic Burden" Rate (What the clinic pays per operating hour for ALL staff)
  const clinicHourlyCost = clinicTotalHours > 0 ? totalMonthlyCost / clinicTotalHours : 0;

  // Aggregate visual data
  const totalSalaries = members.reduce((sum, m) => sum + m.salary, 0);
  const totalBenefits = members.reduce((sum, m) => sum + m.benefits, 0);
  const totalBonus = members.reduce((sum, m) => sum + m.bonus, 0);

  const visualData = [
    { name: 'Base Salaries', value: totalSalaries, color: '#4338ca' },
    { name: 'Benefits (EPF)', value: totalBenefits, color: '#4f46e5' },
    { name: 'Bonuses', value: totalBonus, color: '#6366f1' }
  ];

  // Process data for the Bar Chart & Table (Efficiency)
  const staffEfficiencyData = members.map(m => {
    // Use individual schedule if available, else default to clinic settings
    const pDays = m.workingDays ?? workingDaysPerWeek;
    const pHours = m.workingHours ?? hoursPerDay;
    const personalMonthlyHours = pDays * pHours * 4.3333;

    const totalPay = m.salary + m.benefits + m.bonus;

    // True Hourly Rate = Pay / THEIR worked hours
    const trueHourlyRate = personalMonthlyHours > 0 ? totalPay / personalMonthlyHours : 0;

    // Clinic Burden = Pay / CLINIC operating hours
    const clinicBurden = clinicTotalHours > 0 ? totalPay / clinicTotalHours : 0;

    return {
      ...m,
      schedule: `${pDays}d @ ${pHours}h`,
      personalMonthlyHours,
      totalPay,
      trueHourlyRate,
      clinicBurden
    };
  }).sort((a, b) => b.trueHourlyRate - a.trueHourlyRate); // Sort by most expensive hourly rate

  return (
    <CalculatorCard
      title="Staff Cost Analytics"
      resultTitle="Avg. Hourly Staff Rate"
      resultValue={`${currencySymbol} ${clinicHourlyCost.toFixed(2)}`}
      section="staff"
      visualData={visualData}
      tooltipData={{ title: "Labor Efficiency", content: `Total payroll is ${currencySymbol} ${totalMonthlyCost.toLocaleString()}/mo. With ${clinicTotalHours.toFixed(0)} clinical hours, you spend ${currencySymbol} ${clinicHourlyCost.toFixed(2)} on staff for every open hour.` }}
      theme="external"
      readOnly={true}
      pageClassName="staff-cost-page"
    >
      <div className="staff-analytics-card mb-6 bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm flex items-center gap-2 border border-indigo-100">
        <Users className="staff-analytics-icon w-5 h-5 flex-shrink-0" />

        <span className="staff-analytics-text">
          Analytics View. Manage schedules & rosters in{' '}
          <strong>Clinic Settings</strong>.
        </span>
      </div>

      {/* BAR CHART: True Hourly Rate Comparison */}
      <div className="mb-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500" /> True Hourly Cost Comparison
        </h4>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={staffEfficiencyData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} interval={0} />
              <RechartsTooltip
                cursor={{ fill: '#f1f5f9' }}
                formatter={(val: number) => [`${currencySymbol} ${val.toFixed(2)}/hr`, 'True Cost']}
              />
              <Bar dataKey="trueHourlyRate" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
        <Table2 className="w-4 h-4 text-slate-500" /> Staff Efficiency Table
      </h4>
      <div className="overflow-hidden border border-slate-200 rounded-lg">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Staff Member</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Schedule</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Monthly Pay</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-indigo-600 uppercase">True Hourly</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase">Clinic Burden</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {staffEfficiencyData.map(m => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium text-slate-900 block">{m.name}</span>
                  <span className="text-xs text-slate-500">{m.role}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                  {m.schedule}
                  <div className="text-[10px] text-slate-400">({m.personalMonthlyHours.toFixed(0)} hrs)</div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-800 text-right font-medium">{currencySymbol} {m.totalPay.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-600 text-right">{currencySymbol} {m.trueHourlyRate.toFixed(2)}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-400 text-right">{currencySymbol} {m.clinicBurden.toFixed(2)}/hr</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CalculatorCard>
  );
};

// --- 3. Equipment Depreciation (UPGRADED VISUALIZATION) ---
export const DepreciationCalculator = () => {
  const { state, getTotalMonthlyHours } = useCalculator();
  const { assets } = state.depreciation;
  const { currencySymbol } = state.clinicSettings;
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);

  // 1. Calculate Aggregates
  const totalPurchase = assets.reduce((sum, a) => sum + a.purchasePrice, 0);
  const totalMonthlyDepreciation = assets.reduce((acc, asset) => {
    const months = asset.lifespanYears * 12;
    return acc + (months > 0 ? (asset.purchasePrice - asset.resaleValue) / months : 0);
  }, 0);

  const hours = getTotalMonthlyHours();
  const hourlyCost = hours > 0 ? totalMonthlyDepreciation / hours : 0;

  // 2. Prepare Chart Data (Aggregate Curve)
  const maxLifespan = Math.max(...assets.map(a => a.lifespanYears), 0);
  const chartData = [];
  const scheduleData = [];

  // Generate Year-by-Year Data
  for (let year = 0; year <= maxLifespan; year++) {
    let currentBookValue = 0;
    let yearlyExpense = 0;

    assets.forEach(asset => {
      if (year <= asset.lifespanYears) {
        const annualDep = (asset.purchasePrice - asset.resaleValue) / asset.lifespanYears;
        const val = asset.purchasePrice - (annualDep * year);
        currentBookValue += Math.max(val, asset.resaleValue);

        if (year > 0 && year <= asset.lifespanYears) {
          yearlyExpense += annualDep;
        }
      } else {
        currentBookValue += asset.resaleValue;
      }
    });

    chartData.push({ year: `Year ${year}`, value: currentBookValue });
    if (year > 0) {
      scheduleData.push({
        year,
        opening: chartData[year - 1].value,
        expense: yearlyExpense,
        closing: currentBookValue
      });
    }
  }

  // Visual: Top Assets by Value
  const sortedAssets = [...assets].sort((a, b) => b.purchasePrice - a.purchasePrice);
  const visualData = sortedAssets.slice(0, 5).map((a, i) => ({
    name: a.name,
    value: a.purchasePrice,
    color: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'][i] || '#fef3c7'
  }));

  return (
    <CalculatorCard
      title="Depreciation Analytics"
      resultTitle="Hourly Wear & Tear"
      resultValue={`${currencySymbol} ${hourlyCost.toFixed(2)}`}
      section="depreciation"
      visualData={visualData}
      tooltipData={{ title: "Hidden Costs", content: `Your equipment loses ${currencySymbol} ${totalMonthlyDepreciation.toFixed(0)} in value every month. Spread over your clinical hours, this adds to your hourly base cost.` }}
      theme="external"
      readOnly={true}
      pageClassName="depreciation-page"
    >
      <div className="depreciation-analytics-card mb-6 bg-amber-50 text-amber-800 p-4 rounded-xl text-sm flex items-center gap-2 border border-amber-100">
        <Armchair className="depreciation-analytics-icon w-5 h-5 flex-shrink-0" />

        <span className="depreciation-analytics-text">
          This is an Analytics View. Manage your assets in <strong>Clinic Settings</strong>.
        </span>
      </div>

      {/* CHART SECTION */}
      <div className="mb-8 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-500" /> Aggregate Depreciation Curve
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="year" fontSize={12} stroke="#94a3b8" />
              <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(val) => `${val / 1000}k`} />
              <RechartsTooltip
                formatter={(val: number) => [`${currencySymbol} ${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Book Value']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ASSET LIST */}
      <div className="overflow-hidden border border-slate-200 rounded-lg mb-4">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Asset</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Purchase Price</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase">Life</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Resale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {assets.map(a => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm text-slate-700 font-medium">{a.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencySymbol} {a.purchasePrice.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-slate-500 text-center">{a.lifespanYears} yrs</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{currencySymbol} {a.resaleValue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SCHEDULE TOGGLE */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => setIsScheduleOpen(!isScheduleOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" /> View Annual Schedule
          </span>
          {isScheduleOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {isScheduleOpen && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase">Year</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">Opening Value</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-amber-600 uppercase">Expense</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-slate-500 uppercase">Closing Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {scheduleData.map((row) => (
                  <tr key={row.year} className="odd:bg-white even:bg-slate-50">
                    <td className="px-4 py-2 text-xs font-bold text-slate-800">Year {row.year}</td>
                    <td className="px-4 py-2 text-xs text-slate-600 text-right">{currencySymbol} {row.opening.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2 text-xs font-bold text-amber-600 text-right">- {currencySymbol} {row.expense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-2 text-xs font-bold text-slate-800 text-right">{currencySymbol} {row.closing.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </CalculatorCard>
  );
};

// --- 4. Consumables (Dynamic) ---
export const ConsumablesCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { items } = state.consumables;

  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState(0);

  const addItem = () => {
    if (newItemName && newItemCost > 0) {
      updateSection('consumables', {
        items: [...items, { id: crypto.randomUUID(), name: newItemName, cost: newItemCost }]
      });
      setNewItemName('');
      setNewItemCost(0);
    }
  };

  const removeItem = (id: string) => {
    updateSection('consumables', { items: items.filter(i => i.id !== id) });
  };

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
  const sortedItems = [...items].sort((a, b) => b.cost - a.cost);
  const visualData = sortedItems.slice(0, 4).map(i => ({ name: i.name, value: i.cost, color: '#0d9488' }));

  return (
    <CalculatorCard
      title="Consumables & Materials"
      resultTitle="Total Material Cost"
      resultValue={`${currencySymbol} ${totalCost.toFixed(2)}`}
      section="consumables"
      visualData={visualData}
      tooltipData={{ title: "Variable Costs", content: "These costs scale with patient volume." }}
      theme="clinical"
    >
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <StyledInput label="" value={newItemName} onChange={setNewItemName} type="text" placeholder="Item Name" className="mb-0" />
          </div>
          <div className="w-32">
            <StyledInput label="" value={newItemCost} onChange={setNewItemCost} type="currency" placeholder="0.00" className="mb-0" />
          </div>
          <button onClick={addItem} className="bg-teal-600 text-white w-12 rounded-xl hover:bg-teal-700 flex items-center justify-center shadow-md"><Plus className="w-6 h-6" /></button>
        </div>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
            <span className="text-gray-900 font-medium">{item.name}</span>
            <div className="flex items-center space-x-4">
              <span className="font-bold text-teal-700">{currencySymbol} {item.cost.toFixed(2)}</span>
              <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        ))}
      </div>
    </CalculatorCard>
  );
};

// --- 5. Sterilization ---
export const SterilizationCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { pouchCost, chemicalCost, ppeCost, electricityCost, instrumentsPerCycle } = state.sterilization;
  const totalCycleCost = pouchCost + chemicalCost + ppeCost + electricityCost;
  const costPerPack = instrumentsPerCycle > 0 ? totalCycleCost / instrumentsPerCycle : 0;
  const visualData = [{ name: 'Pouch', value: pouchCost, color: '#0f766e' }, { name: 'Chemicals', value: chemicalCost, color: '#14b8a6' }, { name: 'PPE', value: ppeCost, color: '#2dd4bf' }];
  return (
    <CalculatorCard title="Sterilization Costs" resultTitle="Cost Per Sterile Pack" resultValue={`${currencySymbol} ${costPerPack.toFixed(2)}`} section="sterilization" visualData={visualData} theme="clinical">
      <StyledInput label="Autoclave Pouch Cost" value={pouchCost} onChange={(v) => updateSection('sterilization', { pouchCost: v })} type="currency" />
      <StyledInput label="Chemical Indicator Cost" value={chemicalCost} onChange={(v) => updateSection('sterilization', { chemicalCost: v })} type="currency" />
      <StyledInput label="PPE Cost (Gloves/Masks)" value={ppeCost} onChange={(v) => updateSection('sterilization', { ppeCost: v })} type="currency" />
      <StyledInput label="Est. Electricity Per Cycle" value={electricityCost} onChange={(v) => updateSection('sterilization', { electricityCost: v })} type="currency" />
      <div className="border-t border-slate-100 pt-4 mt-4"><StyledInput label="Avg. Instruments Per Cycle" value={instrumentsPerCycle} onChange={(v) => updateSection('sterilization', { instrumentsPerCycle: v })} type="number" placeholder="packs" /></div>
    </CalculatorCard>
  );
};

// --- 6. Lab ---
export const LabCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { labFee, shippingCost, markupPercent } = state.lab;
  const baseCost = labFee + shippingCost;
  const finalPrice = baseCost * (1 + (markupPercent / 100));
  const visualData = [{ name: 'Base Fee', value: labFee, color: '#0d9488' }, { name: 'Shipping', value: shippingCost, color: '#14b8a6' }, { name: 'Profit Margin', value: finalPrice - baseCost, color: '#22c55e' }];
  return (
    <CalculatorCard title="Lab & Outsourcing" resultTitle="Min. Patient Price" resultValue={`${currencySymbol} ${finalPrice.toFixed(2)}`} section="lab" visualData={visualData} theme="clinical">
      <StyledInput label="Lab Fee" value={labFee} onChange={(v) => updateSection('lab', { labFee: v })} type="currency" />
      <StyledInput label="Shipping" value={shippingCost} onChange={(v) => updateSection('lab', { shippingCost: v })} type="currency" />
      <div className="pt-2"><StyledInput label="Desired Markup %" value={markupPercent} onChange={(v) => updateSection('lab', { markupPercent: v })} type="percent" /></div>
    </CalculatorCard>
  );
};

// --- 7. Marketing ---
export const MarketingCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { adSpend, agencyFees, productionCosts, newPatients } = state.marketing;
  const totalSpend = adSpend + agencyFees + productionCosts;
  const cac = newPatients > 0 ? totalSpend / newPatients : 0;
  const visualData = [{ name: 'Ad Spend', value: adSpend, color: '#be123c' }, { name: 'Agency Fee', value: agencyFees, color: '#e11d48' }];
  return (
    <CalculatorCard title="Marketing & Acquisition" resultTitle="CAC Per Patient" resultValue={`${currencySymbol} ${cac.toFixed(2)}`} section="marketing" visualData={visualData} theme="growth">
      <StyledInput label="Monthly Ad Spend" value={adSpend} onChange={(v) => updateSection('marketing', { adSpend: v })} type="currency" />
      <StyledInput label="Agency Fees" value={agencyFees} onChange={(v) => updateSection('marketing', { agencyFees: v })} type="currency" />
      <StyledInput label="Production Costs" value={productionCosts} onChange={(v) => updateSection('marketing', { productionCosts: v })} type="currency" />
      <div className="border-t border-slate-100 pt-4 mt-4"><StyledInput label="Total New Patients" value={newPatients} onChange={(v) => updateSection('marketing', { newPatients: v })} type="number" placeholder="#" /></div>
    </CalculatorCard>
  );
};

// --- 8. Regulatory ---
export const RegulatoryCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { annualApc, annualXray, annualInsurance, monthlyWaste } = state.regulatory;
  const monthlyAmortized = (annualApc + annualXray + annualInsurance) / 12;
  const totalMonthly = monthlyAmortized + monthlyWaste;
  const visualData = [{ name: 'Licenses', value: (annualApc + annualXray) / 12, color: '#e11d48' }, { name: 'Insurance', value: annualInsurance / 12, color: '#f43f5e' }];
  return (
    <CalculatorCard title="Regulatory & Insurance" resultTitle="Regulatory Cost / Month" resultValue={`${currencySymbol} ${totalMonthly.toFixed(2)}`} section="regulatory" visualData={visualData} theme="growth">
      <StyledInput label="Annual APC Fee" value={annualApc} onChange={(v) => updateSection('regulatory', { annualApc: v })} type="currency" />
      <StyledInput label="Annual X-Ray License" value={annualXray} onChange={(v) => updateSection('regulatory', { annualXray: v })} type="currency" />
      <StyledInput label="Annual Indemnity Insurance" value={annualInsurance} onChange={(v) => updateSection('regulatory', { annualInsurance: v })} type="currency" />
      <div className="border-t border-slate-100 pt-4 mt-4"><StyledInput label="Monthly Waste Disposal Fee" value={monthlyWaste} onChange={(v) => updateSection('regulatory', { monthlyWaste: v })} type="currency" /></div>
    </CalculatorCard>
  );
};

// --- 9. Financial ---
export const FinancialCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { currencySymbol } = state.clinicSettings;
  const { monthlyInterest, monthlyBankCharges, transactionFeesPercent, estMonthlyRevenue, taxRate } = state.financial;
  const transFeeAmount = estMonthlyRevenue * (transactionFeesPercent / 100);
  const taxEstimate = estMonthlyRevenue * (taxRate / 100);
  const totalFinancial = monthlyInterest + monthlyBankCharges + transFeeAmount + taxEstimate;
  const visualData = [{ name: 'Interest', value: monthlyInterest, color: '#334155' }, { name: 'Trans. Fees', value: transFeeAmount, color: '#475569' }];
  return (
    <CalculatorCard title="Financial & Tax" resultTitle="Total Financial Cost" resultValue={`${currencySymbol} ${totalFinancial.toFixed(2)}`} section="financial" visualData={visualData} theme="foundation">
      <StyledInput label="Monthly Loan Interest" value={monthlyInterest} onChange={(v) => updateSection('financial', { monthlyInterest: v })} type="currency" />
      <StyledInput label="Bank Charges / Software" value={monthlyBankCharges} onChange={(v) => updateSection('financial', { monthlyBankCharges: v })} type="currency" />
      <div className="grid grid-cols-2 gap-4"><StyledInput label="Est. Monthly Revenue" value={estMonthlyRevenue} onChange={(v) => updateSection('financial', { estMonthlyRevenue: v })} type="currency" /><StyledInput label="Trans. Fee %" value={transactionFeesPercent} onChange={(v) => updateSection('financial', { transactionFeesPercent: v })} type="percent" /></div>
      <div className="border-t border-slate-100 pt-4 mt-4"><StyledInput label="Estimated Tax Rate" value={taxRate} onChange={(v) => updateSection('financial', { taxRate: v })} type="percent" /></div>
    </CalculatorCard>
  );
};

// --- 10. Owner Comp ---
export const OwnerCalculator = () => {
  const { state, updateSection } = useCalculator();
  const { desiredNetIncome, riskBufferPercent } = state.owner;
  const { currencySymbol } = state.clinicSettings;

  const riskMultiplier = 1 - (riskBufferPercent / 100);
  const requiredProfit = riskMultiplier > 0 ? desiredNetIncome / riskMultiplier : 0;
  const riskBufferAmount = requiredProfit - desiredNetIncome;

  const annualNetIncome = desiredNetIncome * 12;
  const annualRiskBuffer = riskBufferAmount * 12;
  const annualTotal = requiredProfit * 12;

  const visualData = [
    { name: 'Net Income', value: desiredNetIncome, color: '#22c55e' },
    { name: 'Risk Buffer', value: riskBufferAmount, color: '#f59e0b' } // Orange for risk
  ];

  return (
    <CalculatorCard
      title="Owner Compensation"
      resultTitle="Required Monthly Profit"
      resultValue={`${currencySymbol} ${requiredProfit.toFixed(2)}`}
      section="owner"
      visualData={visualData}
      theme="foundation"
      tooltipData={{ title: "Risk Buffer", content: `To safely take home ${currencySymbol} ${desiredNetIncome.toLocaleString()}, your clinic needs to generate an extra ${currencySymbol} ${riskBufferAmount.toLocaleString()} to cover unexpected downturns or taxes.` }}
    >
      <StyledInput
        label="Target Monthly Net Income"
        value={desiredNetIncome}
        onChange={(v) => updateSection('owner', { desiredNetIncome: v })}
        type="currency"
        placeholder="e.g. 15000"
      />
      <div className="pt-2 mb-6">
        <StyledInput
          label="Risk Buffer / Tax Provision %"
          value={riskBufferPercent}
          onChange={(v) => updateSection('owner', { riskBufferPercent: v })}
          type="percent"
          helperText="Recommended: 15-25% for taxes and rainy day fund."
        />
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
            Compensation Structure
          </h4>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 font-semibold">Component</th>
              <th className="px-4 py-3 font-semibold text-right">Monthly</th>
              <th className="px-4 py-3 font-semibold text-right">Annual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <tr>
              <td className="px-4 py-3 font-medium text-emerald-700">Owner's Net Pay</td>
              <td className="px-4 py-3 text-right font-bold text-emerald-600">
                {currencySymbol} {desiredNetIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right text-emerald-600">
                {currencySymbol} {annualNetIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="bg-amber-50">
              <td className="px-4 py-3 font-medium text-amber-700">
                Business Risk Buffer <span className="text-xs opacity-75">(@ {riskBufferPercent}%)</span>
              </td>
              <td className="px-4 py-3 text-right font-bold text-amber-600">
                {currencySymbol} {riskBufferAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right text-amber-600">
                {currencySymbol} {annualRiskBuffer.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
            <tr className="bg-slate-50 border-t border-slate-200">
              <td className="px-4 py-3 font-bold text-slate-800">Total Revenue Target</td>
              <td className="px-4 py-3 text-right font-black text-slate-900">
                {currencySymbol} {requiredProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-4 py-3 text-right font-bold text-slate-800">
                {currencySymbol} {annualTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CalculatorCard>
  );
};