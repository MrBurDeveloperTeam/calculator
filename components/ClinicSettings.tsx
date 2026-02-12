import React, { useState, useEffect } from 'react';
import { useCalculator } from '../context/CalculatorContext';
import { 
    Save,
    Clock,
    Plus, 
    Trash2, 
    Copy,
    Info
} from 'lucide-react';
import StyledInput from './StyledInput';
import CollapsibleSection from './CollapsibleSection';
import ConfirmationModal from './ConfirmationModal';
import { ClinicSettingsData, OverheadItem, StaffMember, Asset } from '../types';

// --- Helper Component for List Items (Overhead & Assets) ---
const ListItem: React.FC<{ 
    onRemove: () => void;
    children: React.ReactNode;
}> = ({ 
    onRemove, 
    children 
}) => (
    <div className="flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-blue-300 transition-colors mb-3">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {children}
        </div>
        <button 
            onClick={onRemove}
            className="text-slate-300 hover:text-red-500 p-3 rounded-lg hover:bg-red-50 transition-colors mt-0.5"
            title="Remove Item"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    </div>
);

const ClinicSettings: React.FC = () => {
    const { state, updateSection, saveSection, showToast } = useCalculator();

    // --- Local State for Manual Sync ---
    const [localSettings, setLocalSettings] = useState<ClinicSettingsData>(state.clinicSettings);
    const [localOverheadItems, setLocalOverheadItems] = useState<OverheadItem[]>(state.overhead.items);
    const [localStaffMembers, setLocalStaffMembers] = useState<StaffMember[]>(state.staff.members);
    const [localAssets, setLocalAssets] = useState<Asset[]>(state.depreciation.assets);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; section: 'params' | 'overhead' | 'staff' | 'assets' | null }>({
        isOpen: false,
        section: null
    });

    // Calculated local summary
    const monthlyCapacityHours = localSettings.workingDaysPerWeek * localSettings.hoursPerDay * 4.3333;
    const totalOverhead = localOverheadItems.reduce((acc, i) => acc + i.monthlyCost, 0);
    const totalStaff = localStaffMembers.reduce((acc, m) => acc + m.salary + m.benefits + m.bonus, 0);
    const totalAssets = localAssets.reduce((acc, a) => acc + a.purchasePrice, 0);

    // --- Helpers ---
    const preventNegative = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (['-', 'e', 'E', '+'].includes(e.key)) {
            e.preventDefault();
        }
    };

    // --- Validation ---
    const validateParams = () => {
        if (localSettings.workingDaysPerWeek <= 0 || localSettings.workingDaysPerWeek > 7) {
            showToast("Working days must be > 0 and ≤ 7.");
            return false;
        }
        if (localSettings.hoursPerDay <= 0 || localSettings.hoursPerDay > 24) {
            showToast("Hours per day must be > 0 and ≤ 24.");
            return false;
        }
        return true;
    };

    const validateOverhead = () => {
        for (const item of localOverheadItems) {
            if (!item.name.trim()) {
                showToast("All overhead items must have a name.");
                return false;
            }
            if (item.monthlyCost < 0) {
                showToast("Costs cannot be negative.");
                return false;
            }
        }
        return true;
    };

    const validateStaff = () => {
        for (const member of localStaffMembers) {
            if (!member.name.trim()) {
                showToast("All staff members must have a name.");
                return false;
            }
            if (member.salary < 0 || member.benefits < 0 || member.bonus < 0) {
                showToast("Salaries and benefits cannot be negative.");
                return false;
            }
            if ((member.workingDays || 0) > 7 || (member.workingHours || 0) > 24) {
                 showToast("Invalid staff schedule detected.");
                 return false;
            }
        }
        return true;
    };

    const validateAssets = () => {
        for (const asset of localAssets) {
            if (!asset.name.trim()) {
                showToast("All assets must have a name.");
                return false;
            }
            if (asset.purchasePrice < 0 || asset.resaleValue < 0 || asset.lifespanYears < 0) {
                showToast("Asset values cannot be negative.");
                return false;
            }
        }
        return true;
    };

    // --- Handlers ---
    
    // 1. Operating Parameters
    const handleSaveParams = () => {
        if (validateParams()) {
            setConfirmModal({ isOpen: true, section: 'params' });
        }
    };

    // 2. Overhead Handlers
    const addOverhead = () => {
        setLocalOverheadItems(prev => [...prev, { id: Date.now().toString(), name: '', monthlyCost: 0 }]);
    };
    const updateOverhead = (id: string, field: 'name' | 'monthlyCost', value: any) => {
        setLocalOverheadItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };
    const removeOverhead = (id: string) => {
        setLocalOverheadItems(prev => prev.filter(i => i.id !== id));
    };
    const handleSaveOverhead = () => {
        if (validateOverhead()) {
             setConfirmModal({ isOpen: true, section: 'overhead' });
        }
    };

    // 3. Staff Handlers
    const addStaff = () => {
        setLocalStaffMembers(prev => [...prev, { 
            id: Date.now().toString(), 
            name: '', 
            role: '', 
            salary: 0, 
            benefits: 0, 
            bonus: 0,
            workingDays: localSettings.workingDaysPerWeek,
            workingHours: localSettings.hoursPerDay
        }]);
    };
    const duplicateStaff = (id: string) => {
        const member = localStaffMembers.find(m => m.id === id);
        if (member) {
             const index = localStaffMembers.findIndex(m => m.id === id);
             const copy = { ...member, id: Date.now().toString(), name: `${member.name} (Copy)` };
             const newList = [...localStaffMembers];
             newList.splice(index + 1, 0, copy);
             setLocalStaffMembers(newList);
        }
    };
    const updateStaff = (id: string, field: string, value: any) => {
        setLocalStaffMembers(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
    };
    const removeStaff = (id: string) => {
        setLocalStaffMembers(prev => prev.filter(m => m.id !== id));
    };
    const handleSaveStaff = () => {
        if (validateStaff()) {
            setConfirmModal({ isOpen: true, section: 'staff' });
        }
    };

    // 4. Assets Handlers
    const addAsset = () => {
        setLocalAssets(prev => [...prev, { id: Date.now().toString(), name: '', purchasePrice: 0, resaleValue: 0, lifespanYears: 0 }]);
    };
    const updateAsset = (id: string, field: string, value: any) => {
        setLocalAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
    };
    const removeAsset = (id: string) => {
        setLocalAssets(prev => prev.filter(a => a.id !== id));
    };
    const handleSaveAssets = () => {
        if (validateAssets()) {
            setConfirmModal({ isOpen: true, section: 'assets' });
        }
    };

    // --- Modal Confirmation Handler ---
    const executeSave = () => {
        const { section } = confirmModal;
        if (section === 'params') {
            updateSection('clinicSettings', localSettings);
            saveSection('clinicSettings', 'Operating Parameters saved.');
        } else if (section === 'overhead') {
            updateSection('overhead', { items: localOverheadItems });
            saveSection('overhead', 'Fixed Overhead saved.');
        } else if (section === 'staff') {
            updateSection('staff', { members: localStaffMembers });
            saveSection('staff', 'Staff Roster saved.');
        } else if (section === 'assets') {
            updateSection('depreciation', { assets: localAssets });
            saveSection('depreciation', 'Assets saved.');
        }
        setConfirmModal({ isOpen: false, section: null });
    };

    return (
        <div className="max-w-5xl mx-auto animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Master Clinic Setup</h1>
                <p className="text-slate-500 mt-1">Configure your entire clinic's operational baseline in one place.</p>
            </div>

            {/* Section 1: Operating Parameters */}
            <CollapsibleSection 
                title="1. Operating Parameters" 
                total={0} 
                defaultOpen={true} 
                subtitle="Core clinic settings" 
                colorClass="text-slate-600"
                hideTotal={true}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-2 mb-4">
                    {/* Column A: Clinic Identity */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2 mb-2">
                             <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Clinic Identity</h4>
                        </div>
                        <StyledInput 
                            label="Clinic Name"
                            type="text"
                            value={localSettings.clinicName}
                            onChange={(v) => setLocalSettings(prev => ({...prev, clinicName: v}))}
                            placeholder="My Dental Clinic"
                            className="mb-0"
                        />
                         <div className="w-full md:w-1/2">
                            <StyledInput 
                                label="Currency Symbol"
                                type="text"
                                value={localSettings.currencySymbol}
                                onChange={(v) => setLocalSettings(prev => ({...prev, currencySymbol: v}))}
                                placeholder="RM"
                                className="mb-0"
                            />
                         </div>
                    </div>

                    {/* Column B: Operational Schedule */}
                    <div className="space-y-4">
                        <div className="border-b border-slate-100 pb-2 mb-2">
                             <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Operational Schedule</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <StyledInput 
                                label="Days per Week" 
                                value={localSettings.workingDaysPerWeek} 
                                onChange={(v) => setLocalSettings(prev => ({...prev, workingDaysPerWeek: v}))} 
                                type="number"
                                min={0} max={7}
                                onKeyDown={preventNegative}
                                placeholder="5.5"
                                className="mb-0"
                            />
                            <StyledInput 
                                label="Hours per Day" 
                                value={localSettings.hoursPerDay} 
                                onChange={(v) => setLocalSettings(prev => ({...prev, hoursPerDay: v}))} 
                                type="number"
                                min={0} max={24}
                                onKeyDown={preventNegative}
                                placeholder="8"
                                className="mb-0"
                            />
                        </div>
                    </div>
                </div>

                {/* Capacity Engine Result Bar */}
                <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-2 overflow-visible">
                     <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-lg text-white shadow-sm">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-blue-900 font-bold text-base">Calculated Monthly Capacity</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                <p className="text-blue-600 text-xs">Used for hourly rate calculations.</p>
                                
                                {/* Educational Tooltip */}
                                <div className="group relative">
                                    <button className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100/50 px-2 py-0.5 rounded-md hover:bg-blue-100 transition-colors border border-blue-200 cursor-help">
                                        <Info className="w-3 h-3" /> Why 4.33 wks?
                                    </button>
                                    
                                    {/* Tooltip Content */}
                                    <div className="absolute left-0 bottom-full mb-2 w-72 p-4 bg-slate-800 text-slate-100 text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                                        <div className="flex items-start gap-3 mb-2">
                                            <div className="bg-slate-700 p-1.5 rounded-lg text-blue-300">
                                                <Info className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">Standard Accounting Year</p>
                                                <p className="font-mono text-blue-300 mt-0.5">52 weeks ÷ 12 months = 4.3333</p>
                                            </div>
                                        </div>
                                        <p className="leading-relaxed opacity-90 border-t border-slate-700 pt-2 mt-2">
                                            We use this multiplier to account for months with 30/31 days. Using just "4 weeks" (28 days) would underestimate your yearly capacity by almost a full month of revenue.
                                        </p>
                                        <div className="absolute left-6 bottom-[-6px] w-3 h-3 bg-slate-800 rotate-45"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-3xl font-bold text-blue-800">
                            ≈ {monthlyCapacityHours.toFixed(1)} <span className="text-sm font-medium text-blue-600">hrs/mo</span>
                        </p>
                     </div>
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
                    <button 
                        onClick={handleSaveParams} 
                        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg shadow-md transition-all font-bold"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Parameters</span>
                    </button>
                </div>
            </CollapsibleSection>

            {/* Section 2: Fixed Overhead */}
            <CollapsibleSection title="2. Fixed Overhead Register" total={totalOverhead} subtitle="Recurring monthly facility costs" colorClass="text-blue-600">
                <div className="space-y-2">
                    {localOverheadItems.map((item) => (
                        <ListItem key={item.id} onRemove={() => removeOverhead(item.id)}>
                            <div className="md:col-span-8">
                                <StyledInput 
                                    type="text" 
                                    placeholder="Item Name (e.g. Rent)"
                                    value={item.name}
                                    onChange={(v) => updateOverhead(item.id, 'name', v)}
                                    className="mb-0"
                                />
                            </div>
                            <div className="md:col-span-4">
                                <StyledInput 
                                    type="currency" 
                                    placeholder="Cost"
                                    min={0}
                                    onKeyDown={preventNegative}
                                    value={item.monthlyCost}
                                    onChange={(v) => updateOverhead(item.id, 'monthlyCost', v)}
                                    className="mb-0"
                                />
                            </div>
                        </ListItem>
                    ))}
                    <button 
                        onClick={addOverhead}
                        className="w-full py-4 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        <Plus className="w-5 h-5" /> Add Overhead Item
                    </button>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-blue-50">
                    <button 
                        onClick={handleSaveOverhead} 
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition-all font-bold"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Overhead</span>
                    </button>
                </div>
            </CollapsibleSection>

            {/* Section 3: Staff Roster */}
            <CollapsibleSection title="3. Staff Roster" total={totalStaff} subtitle="Monthly payroll and benefits" colorClass="text-indigo-600">
                <div className="space-y-4">
                    {localStaffMembers.map((member) => (
                        <div key={member.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition-all">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-4 items-start">
                                
                                {/* 1. Identity (Cols 1-3) */}
                                <div className="md:col-span-3 flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Identity</label>
                                    <StyledInput 
                                        type="text" 
                                        placeholder="Staff Name" 
                                        value={member.name} 
                                        onChange={(v) => updateStaff(member.id, 'name', v)} 
                                        className="mb-0" 
                                        inputClassName="h-10"
                                    />
                                    <StyledInput 
                                        type="text" 
                                        placeholder="Role / Position" 
                                        value={member.role} 
                                        onChange={(v) => updateStaff(member.id, 'role', v)} 
                                        className="mb-0" 
                                        inputClassName="h-10 text-sm"
                                    />
                                </div>

                                {/* 2. Compensation (Cols 4-8) */}
                                <div className="md:col-span-5 flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Compensation</label>
                                    <StyledInput 
                                        type="currency" 
                                        placeholder="Base Salary" 
                                        min={0}
                                        onKeyDown={preventNegative}
                                        value={member.salary} 
                                        onChange={(v) => updateStaff(member.id, 'salary', v)} 
                                        className="mb-0" 
                                        inputClassName="h-10"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <StyledInput 
                                            type="currency" 
                                            placeholder="EPF/SOCSO" 
                                            min={0}
                                            onKeyDown={preventNegative}
                                            value={member.benefits} 
                                            onChange={(v) => updateStaff(member.id, 'benefits', v)} 
                                            className="mb-0" 
                                            inputClassName="h-10"
                                        />
                                        <StyledInput 
                                            type="currency" 
                                            placeholder="Bonus" 
                                            min={0}
                                            onKeyDown={preventNegative}
                                            value={member.bonus} 
                                            onChange={(v) => updateStaff(member.id, 'bonus', v)} 
                                            className="mb-0" 
                                            inputClassName="h-10"
                                        />
                                    </div>
                                </div>

                                {/* 3. Schedule (Cols 9-11) */}
                                <div className="md:col-span-3 flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Schedule</label>
                                    <div className="grid grid-cols-2 gap-2">
                                         <div>
                                            <StyledInput 
                                                type="number" 
                                                value={member.workingDays ?? localSettings.workingDaysPerWeek} 
                                                onChange={(v) => updateStaff(member.id, 'workingDays', v)} 
                                                className="mb-0" 
                                                min={0} max={7}
                                                onKeyDown={preventNegative}
                                                inputClassName="h-10"
                                            />
                                            <span className="text-[10px] text-slate-400 font-semibold text-center block mt-1">Days/Wk</span>
                                         </div>
                                         <div>
                                            <StyledInput 
                                                type="number" 
                                                value={member.workingHours ?? localSettings.hoursPerDay} 
                                                onChange={(v) => updateStaff(member.id, 'workingHours', v)} 
                                                className="mb-0" 
                                                min={0} max={24}
                                                onKeyDown={preventNegative}
                                                inputClassName="h-10"
                                            />
                                            <span className="text-[10px] text-slate-400 font-semibold text-center block mt-1">Hrs/Day</span>
                                         </div>
                                    </div>
                                </div>

                                {/* 4. Actions (Col 12) */}
                                <div className="md:col-span-1 flex flex-col justify-center items-center h-full pt-6 gap-2">
                                    <button 
                                        onClick={() => duplicateStaff(member.id)}
                                        className="text-slate-300 hover:text-indigo-500 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                                        title="Duplicate Staff"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => removeStaff(member.id)}
                                        className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Remove Staff"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                    <button 
                        onClick={addStaff}
                        className="w-full py-4 border-2 border-dashed border-indigo-200 rounded-xl text-indigo-600 font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                        <Plus className="w-5 h-5" /> Add Staff Member
                    </button>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-indigo-50">
                    <button 
                        onClick={handleSaveStaff} 
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition-all font-bold"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Staff Roster</span>
                    </button>
                </div>
            </CollapsibleSection>

            {/* Section 4: Assets */}
            <CollapsibleSection title="4. Asset & Equipment Register" total={totalAssets} subtitle="For depreciation calculation" colorClass="text-gray-600">
                <div className="space-y-2">
                    <div className="hidden md:grid grid-cols-12 gap-3 px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <div className="col-span-5">Asset Name</div>
                        <div className="col-span-3">Purchase Price</div>
                        <div className="col-span-2">Lifespan (Yrs)</div>
                        <div className="col-span-2">Resale Value</div>
                    </div>
                    {localAssets.map((asset) => (
                        <ListItem key={asset.id} onRemove={() => removeAsset(asset.id)}>
                            <div className="md:col-span-5">
                                <StyledInput type="text" placeholder="Equipment Name" value={asset.name} onChange={(v) => updateAsset(asset.id, 'name', v)} className="mb-0" />
                            </div>
                            <div className="md:col-span-3">
                                <StyledInput 
                                    type="currency" 
                                    placeholder="Price" 
                                    min={0}
                                    onKeyDown={preventNegative}
                                    value={asset.purchasePrice} 
                                    onChange={(v) => updateAsset(asset.id, 'purchasePrice', v)} 
                                    className="mb-0" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <StyledInput 
                                    type="number" 
                                    placeholder="Yrs" 
                                    min={0}
                                    onKeyDown={preventNegative}
                                    value={asset.lifespanYears} 
                                    onChange={(v) => updateAsset(asset.id, 'lifespanYears', v)} 
                                    className="mb-0" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <StyledInput 
                                    type="currency" 
                                    placeholder="Resale" 
                                    min={0}
                                    onKeyDown={preventNegative}
                                    value={asset.resaleValue} 
                                    onChange={(v) => updateAsset(asset.id, 'resaleValue', v)} 
                                    className="mb-0" 
                                />
                            </div>
                        </ListItem>
                    ))}
                    <button 
                        onClick={addAsset}
                        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        <Plus className="w-5 h-5" /> Add Asset
                    </button>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-100">
                    <button 
                        onClick={handleSaveAssets} 
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition-all font-bold"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Assets</span>
                    </button>
                </div>
            </CollapsibleSection>

            {/* Confirmation Modal */}
            <ConfirmationModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={executeSave}
                title="Save Changes?"
                message="This will update your clinic's financial baseline and trigger a global recalculation. Are you sure?"
            />

        </div>
    );
};

export default ClinicSettings;