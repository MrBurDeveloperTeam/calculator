import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalState, CalculatorContextType, SavedPlan } from '../types';

const INITIAL_STATE: GlobalState = {
  clinicSettings: { clinicName: 'My Dental Clinic', workingDaysPerWeek: 5.5, hoursPerDay: 8, currencySymbol: 'RM' },
  overhead: {
    items: [
      { id: '1', name: 'Rent', monthlyCost: 3000 },
      { id: '2', name: 'Utilities', monthlyCost: 500 },
      { id: '3', name: 'Internet & Phone', monthlyCost: 150 },
      { id: '4', name: 'Cleaning Services', monthlyCost: 300 },
      { id: '5', name: 'Maintenance', monthlyCost: 200 }
    ]
  },
  staff: {
    members: [
      { id: '1', name: 'Dr. Associate', role: 'Dentist', salary: 8000, benefits: 1000, bonus: 500, workingDays: 5.5, workingHours: 8 },
      { id: '2', name: 'Sarah', role: 'Nurse', salary: 2500, benefits: 300, bonus: 100, workingDays: 5.5, workingHours: 8 }
    ]
  },
  depreciation: {
    assets: [
      { id: '1', name: 'Dental Chair Unit', purchasePrice: 45000, resaleValue: 5000, lifespanYears: 10 },
      { id: '2', name: 'X-Ray Machine', purchasePrice: 15000, resaleValue: 2000, lifespanYears: 8 }
    ]
  },
  consumables: { items: [{ id: '1', name: 'Bonding Agent', cost: 5 }, { id: '2', name: 'Composite', cost: 8 }] },
  sterilization: { pouchCost: 0.5, chemicalCost: 1.0, ppeCost: 2.0, electricityCost: 1.5, instrumentsPerCycle: 10 },
  lab: { labFee: 200, shippingCost: 20, markupPercent: 50 },
  marketing: { adSpend: 1000, agencyFees: 500, productionCosts: 200, newPatients: 20 },
  regulatory: { annualApc: 1000, annualXray: 500, annualInsurance: 2000, monthlyWaste: 150 },
  financial: { loanPrincipal: 0, monthlyInterest: 300, monthlyBankCharges: 50, transactionFeesPercent: 1.5, estMonthlyRevenue: 50000, taxRate: 24 },
  owner: { desiredNetIncome: 15000, riskBufferPercent: 10, personalTax: 2000 },
};

const EMPTY_STATE: GlobalState = {
  clinicSettings: { clinicName: '', workingDaysPerWeek: 0, hoursPerDay: 0, currencySymbol: '' },
  overhead: { items: [] },
  staff: { members: [] },
  depreciation: { assets: [] },
  consumables: { items: [] },
  sterilization: { pouchCost: 0, chemicalCost: 0, ppeCost: 0, electricityCost: 0, instrumentsPerCycle: 0 },
  lab: { labFee: 0, shippingCost: 0, markupPercent: 0 },
  marketing: { adSpend: 0, agencyFees: 0, productionCosts: 0, newPatients: 0 },
  regulatory: { annualApc: 0, annualXray: 0, annualInsurance: 0, monthlyWaste: 0 },
  financial: { loanPrincipal: 0, monthlyInterest: 0, monthlyBankCharges: 0, transactionFeesPercent: 0, estMonthlyRevenue: 0, taxRate: 0 },
  owner: { desiredNetIncome: 0, riskBufferPercent: 0, personalTax: 0 },
};

// Distinct keys for each calculator
const STORAGE_KEYS: Record<keyof GlobalState, string> = {
  clinicSettings: 'dental_calc_settings',
  overhead: 'dental_calc_overhead',
  staff: 'dental_calc_staff',
  depreciation: 'dental_calc_depreciation',
  consumables: 'dental_calc_consumables',
  sterilization: 'dental_calc_sterilization',
  lab: 'dental_calc_lab',
  marketing: 'dental_calc_marketing',
  regulatory: 'dental_calc_regulatory',
  financial: 'dental_calc_financial',
  owner: 'dental_calc_owner',
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({ message: '', isVisible: false });

  // Load state from localStorage individually for each key
  const [state, setState] = useState<GlobalState>(() => {
    const loadedState = { ...INITIAL_STATE };
    (Object.keys(STORAGE_KEYS) as Array<keyof GlobalState>).forEach((key) => {
      try {
        const item = localStorage.getItem(STORAGE_KEYS[key]);
        if (item) {
          const parsed = JSON.parse(item);
          if (parsed) {
            loadedState[key] = { ...loadedState[key], ...parsed };
          }
        }
      } catch (e) {
        console.error(`Failed to load ${key}`, e);
      }
    });
    return loadedState;
  });

  // --- Saved Plans State ---
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);

  // Load Plans on Mount
  useEffect(() => {
    const plans = localStorage.getItem('dental_saved_plans');
    if (plans) {
      try {
        setSavedPlans(JSON.parse(plans));
      } catch (e) {
        console.error("Failed to load plans", e);
      }
    }
  }, []);

  // --- Global Modal State ---
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'ROI' | 'FORECAST' | null;
    initialData: SavedPlan | null;
  }>({
    isOpen: false,
    type: null,
    initialData: null
  });

  // Seed Data Injection for Procedures (Runs once on mount)
  useEffect(() => {
    const existing = localStorage.getItem('dental_saved_procedures');
    if (!existing || existing === '[]') {
      const SEED_DATA = [
        { id: 'seed_1', name: 'General Scaling & Polishing', price: 150, duration: 30, variableCost: 15 },
        { id: 'seed_2', name: 'Complex Wisdom Tooth Surgery', price: 800, duration: 60, variableCost: 60 },
        { id: 'seed_3', name: 'Zirconia Crown (Posterior)', price: 1500, duration: 90, variableCost: 400 }, // Mat 50 + Lab 350
        { id: 'seed_4', name: 'Whitening (Chairside)', price: 900, duration: 60, variableCost: 120 },
        { id: 'seed_5', name: 'Composite Filling (Large)', price: 250, duration: 45, variableCost: 25 },
      ];
      localStorage.setItem('dental_saved_procedures', JSON.stringify(SEED_DATA));
    }
  }, []);

  const updateSection = <K extends keyof GlobalState>(section: K, data: Partial<GlobalState[K]>) => {
    setState(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const saveSection = (section: keyof GlobalState, customMessage?: string) => {
    try {
      const data = state[section];
      localStorage.setItem(STORAGE_KEYS[section], JSON.stringify(data));
      setToast({ message: customMessage || 'Configuration saved!', isVisible: true });
    } catch (e) {
      console.error("Failed to save section", e);
    }
  };

  const resetAll = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      (Object.keys(STORAGE_KEYS) as Array<keyof GlobalState>).forEach((key) => {
        localStorage.removeItem(STORAGE_KEYS[key]);
      });
      setState(INITIAL_STATE);
      setToast({ message: 'All data reset to defaults.', isVisible: true });
    }
  };

  const loadSampleData = () => {
    if (confirm('Load sample data? This will overwrite current settings.')) {
      setState(INITIAL_STATE);
      (Object.keys(STORAGE_KEYS) as Array<keyof GlobalState>).forEach((key) => {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(INITIAL_STATE[key]));
      });
      setToast({ message: 'Sample data loaded.', isVisible: true });
    }
  };

  const clearAllData = () => {
    if (confirm('Clear ALL data? This will set everything to zero/empty.')) {
      setState(EMPTY_STATE);
      (Object.keys(STORAGE_KEYS) as Array<keyof GlobalState>).forEach((key) => {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(EMPTY_STATE[key]));
      });
      setToast({ message: 'All data cleared.', isVisible: true });
    }
  };

  const getTotalMonthlyHours = () => {
    const { workingDaysPerWeek, hoursPerDay } = state.clinicSettings;
    const total = workingDaysPerWeek * hoursPerDay * 4.3333;
    return total > 0 ? total : 1;
  };

  const getGlobalTotalMonthlyCost = () => {
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
  };

  // --- Plan Management Functions ---
  const savePlan = (plan: SavedPlan) => {
    const newPlans = [...savedPlans, plan];
    setSavedPlans(newPlans);
    localStorage.setItem('dental_saved_plans', JSON.stringify(newPlans));
    setToast({ message: 'Plan saved successfully!', isVisible: true });
  };

  const updatePlan = (plan: SavedPlan) => {
    const newPlans = savedPlans.map(p => p.id === plan.id ? plan : p);
    setSavedPlans(newPlans);
    localStorage.setItem('dental_saved_plans', JSON.stringify(newPlans));
    setToast({ message: 'Plan updated successfully!', isVisible: true });
  };

  const deletePlan = (id: string) => {
    const newPlans = savedPlans.filter(p => p.id !== id);
    setSavedPlans(newPlans);
    localStorage.setItem('dental_saved_plans', JSON.stringify(newPlans));
    setToast({ message: 'Plan deleted.', isVisible: true });
  };

  // --- Modal Control Functions ---
  const openModal = (type: 'ROI' | 'FORECAST', data: SavedPlan | null = null) => {
    setModalState({
      isOpen: true,
      type,
      initialData: data
    });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false, initialData: null }));
  };

  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));
  const showToast = (message: string) => setToast({ message, isVisible: true });

  return (
    <CalculatorContext.Provider value={{
      state,
      updateSection,
      resetAll,
      loadSampleData,
      clearAllData,
      saveSection,
      toast,
      hideToast,
      showToast,
      getTotalMonthlyHours,
      getGlobalTotalMonthlyCost,
      savedPlans,
      savePlan,
      updatePlan,
      deletePlan,
      modalState,
      openModal,
      closeModal
    }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error('useCalculator must be used within a CalculatorProvider');
  return context;
};
