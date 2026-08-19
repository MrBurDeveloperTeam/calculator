import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GlobalState, CalculatorContextType, SavedPlan, SavedProcedure, CalculatorDataStatus, CalculatorDataOwnerId } from '../types';
import { useAuth } from './AuthContext';
import * as api from '../data/api';

const INITIAL_STATE: GlobalState = {
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

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState({ message: '', isVisible: false });
  const [state, setState] = useState<GlobalState>(INITIAL_STATE);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [savedProcedures, setSavedProcedures] = useState<SavedProcedure[]>([]);
  const [modalState, setModalState] = useState<{ isOpen: boolean; type: 'ROI' | 'FORECAST' | null; initialData: SavedPlan | null }>({ isOpen: false, type: null, initialData: null });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [calculatorDataStatus, setCalculatorDataStatus] = useState<CalculatorDataStatus>('loading');
  // Ownership of the currently accepted `state`/`savedPlans`/
  // `savedProcedures` — see the `CalculatorDataOwnerId` doc comment in
  // types.ts for why `calculatorDataStatus === 'ready'` alone is not a
  // safe render-time privacy gate.
  const [calculatorDataUserId, setCalculatorDataUserId] = useState<CalculatorDataOwnerId>(null);
  const { user } = useAuth(); // Hook into the authenticated session
  // Latest-request-wins guard for the fetch effect below. The PREVIOUS
  // version of this effect used a single shared `isFetchingRef` boolean
  // that (a) did not stop a late-resolving fetch from user A overwriting
  // state after the user switched to B (no `isMounted`/staleness check
  // was ever applied to the `setState`/`setSavedPlans`/... calls below),
  // and (b) could cause user B's fetch to be silently skipped entirely if
  // it started while A's fetch was still in flight (`if
  // (isFetchingRef.current) return;` returned before B's fetch ever
  // began, and nothing re-triggers the effect afterward since deps
  // already fired for B's id). Both are real correctness bugs, not
  // hypothetical — required to fix before `calculatorDataStatus` can
  // safely gate a grounded Data Chat answer (see the Phase-3 readiness
  // pass's "Fetch Race Check" finding). `requestIdRef` replaces that
  // boolean: every run of this effect owns a strictly increasing id, and
  // only the run whose id still matches when its fetch settles is allowed
  // to write state.
  const requestIdRef = useRef(0);

  // 1. Central Data Fetching on Login
  useEffect(() => {
    const requestId = ++requestIdRef.current;

    if (!user) {
      setState(INITIAL_STATE);
      setSavedPlans([]);
      setSavedProcedures([]);
      setIsDataLoaded(false);
      // Logged out — a stale previous user's 'ready' status must never
      // authorize a grounded answer for the (absent) current user. This
      // effect-driven reset is a backstop, not the primary boundary — the
      // primary boundary is the read-time `calculatorDataUserId ===
      // currentAuthenticatedUserId` check callers perform immediately,
      // which does not wait for this effect to run at all.
      setCalculatorDataStatus('loading');
      setCalculatorDataUserId(null);
      return;
    }

    setCalculatorDataStatus('loading');

    const fetchUserSupabaseData = async () => {
      try {
        const [
          settings,
          sterilization,
          lab,
          marketing,
          regulatory,
          financial,
          owner,
          overheadItems,
          staffMembers,
          assets,
          consumableItems,
          plans,
          procedures
        ] = await Promise.all([
          api.getSingularConfig<any>('calc_settings', user.id),
          api.getSingularConfig<any>('calc_sterilization_config', user.id),
          api.getSingularConfig<any>('calc_lab_config', user.id),
          api.getSingularConfig<any>('calc_marketing_config', user.id),
          api.getSingularConfig<any>('calc_regulatory_config', user.id),
          api.getSingularConfig<any>('calc_financial_config', user.id),
          api.getSingularConfig<any>('calc_owner_config', user.id),
          api.getListItems<any>('calc_overhead_items', user.id),
          api.getListItems<any>('calc_staff_members', user.id),
          api.getListItems<any>('calc_depreciation_assets', user.id),
          api.getListItems<any>('calc_consumable_items', user.id),
          api.getPlans(user.id),
          api.getProcedures(user.id)
        ]);

        // Latest-request-wins: a since-superseded run (user switched again
        // while this fetch was in flight) must never write state over the
        // current run's data — see the requestIdRef comment above.
        if (requestId !== requestIdRef.current) return;

        setState(prev => ({
          clinicSettings: {
            clinicName: settings?.clinic_name ?? prev.clinicSettings.clinicName,
            workingDaysPerWeek: settings?.working_days_per_week ?? prev.clinicSettings.workingDaysPerWeek,
            hoursPerDay: settings?.hours_per_day ?? prev.clinicSettings.hoursPerDay,
            currencySymbol: settings?.currency_symbol ?? prev.clinicSettings.currencySymbol
          },
          overhead: { items: overheadItems.map((i: any) => ({ ...i, monthlyCost: i.monthly_cost })) },
          staff: { members: staffMembers.map((i: any) => ({ ...i, workingDays: i.working_days, workingHours: i.working_hours })) },
          depreciation: { assets: assets.map((i: any) => ({ ...i, purchasePrice: i.purchase_price, resaleValue: i.resale_value, lifespanYears: i.lifespan_years })) },
          consumables: {
            items: consumableItems ?? prev.consumables.items
          }, sterilization: {
            pouchCost: sterilization?.pouch_cost ?? prev.sterilization.pouchCost,
            chemicalCost: sterilization?.chemical_cost ?? prev.sterilization.chemicalCost,
            ppeCost: sterilization?.ppe_cost ?? prev.sterilization.ppeCost,
            electricityCost: sterilization?.electricity_cost ?? prev.sterilization.electricityCost,
            instrumentsPerCycle: sterilization?.instruments_per_cycle ?? prev.sterilization.instrumentsPerCycle
          },
          lab: {
            labFee: lab?.lab_fee ?? prev.lab.labFee,
            shippingCost: lab?.shipping_cost ?? prev.lab.shippingCost,
            markupPercent: lab?.markup_percent ?? prev.lab.markupPercent
          },
          marketing: {
            adSpend: marketing?.ad_spend ?? prev.marketing.adSpend,
            agencyFees: marketing?.agency_fees ?? prev.marketing.agencyFees,
            productionCosts: marketing?.production_costs ?? prev.marketing.productionCosts,
            newPatients: marketing?.new_patients ?? prev.marketing.newPatients
          },
          regulatory: {
            annualApc: regulatory?.annual_apc ?? prev.regulatory.annualApc,
            annualXray: regulatory?.annual_xray ?? prev.regulatory.annualXray,
            annualInsurance: regulatory?.annual_insurance ?? prev.regulatory.annualInsurance,
            monthlyWaste: regulatory?.monthly_waste ?? prev.regulatory.monthlyWaste
          },
          financial: {
            loanPrincipal: financial?.loan_principal ?? prev.financial.loanPrincipal,
            monthlyInterest: financial?.monthly_interest ?? prev.financial.monthlyInterest,
            monthlyBankCharges: financial?.monthly_bank_charges ?? prev.financial.monthlyBankCharges,
            transactionFeesPercent: financial?.transaction_fees_percent ?? prev.financial.transactionFeesPercent,
            estMonthlyRevenue: financial?.est_monthly_revenue ?? prev.financial.estMonthlyRevenue,
            taxRate: financial?.tax_rate ?? prev.financial.taxRate
          },
          owner: {
            desiredNetIncome: owner?.desired_net_income ?? prev.owner.desiredNetIncome,
            riskBufferPercent: owner?.risk_buffer_percent ?? prev.owner.riskBufferPercent,
            personalTax: owner?.personal_tax ?? prev.owner.personalTax
          }
        }));

        setSavedPlans(plans);
        setSavedProcedures(procedures || []);

        setIsDataLoaded(true);
        setCalculatorDataStatus('ready');
        // Ownership is set ONLY together with an accepted success, for the
        // exact user this request was fetched for — never before, and
        // never for a stale/superseded request (already excluded by the
        // `requestId` check above).
        setCalculatorDataUserId(user.id);

      } catch (err) {
        console.error("Failed to load user data from Supabase", err);
        setToast({ message: 'Failed to sync data from cloud.', isVisible: true });
        if (requestId !== requestIdRef.current) return;
        setCalculatorDataStatus('error');
        // A failed fetch must never leave a previous successful owner's
        // data groundable — clear ownership rather than retaining it.
        setCalculatorDataUserId(null);
      }
    };

    fetchUserSupabaseData();
  }, [user?.id]);


  const updateSection = <K extends keyof GlobalState>(section: K, data: Partial<GlobalState[K]>) => {
    setState(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const saveSection = async (section: keyof GlobalState, customMessage?: string, explicitData?: any) => {
    try {
      const data = explicitData || state[section];

      // Mapping logic for Singular Configurations vs Arrays
      switch (section) {
        case 'clinicSettings':
          await api.updateSingularConfig('calc_settings', user!.id, {
            clinic_name: (data as any).clinicName,
            working_days_per_week: (data as any).workingDaysPerWeek,
            hours_per_day: (data as any).hoursPerDay,
            currency_symbol: (data as any).currencySymbol
          });
          break;
        case 'sterilization':
          await api.updateSingularConfig('calc_sterilization_config', user!.id, {
            pouch_cost: (data as any).pouchCost,
            chemical_cost: (data as any).chemicalCost,
            ppe_cost: (data as any).ppeCost,
            electricity_cost: (data as any).electricityCost,
            instruments_per_cycle: (data as any).instrumentsPerCycle
          });
          break;
        case 'lab':
          await api.updateSingularConfig('calc_lab_config', user!.id, {
            lab_fee: (data as any).labFee,
            shipping_cost: (data as any).shippingCost,
            markup_percent: (data as any).markupPercent
          });
          break;
        case 'marketing':
          await api.updateSingularConfig('calc_marketing_config', user!.id, {
            ad_spend: (data as any).adSpend,
            agency_fees: (data as any).agencyFees,
            production_costs: (data as any).productionCosts,
            new_patients: (data as any).newPatients
          });
          break;
        case 'regulatory':
          await api.updateSingularConfig('calc_regulatory_config', user!.id, {
            annual_apc: (data as any).annualApc,
            annual_xray: (data as any).annualXray,
            annual_insurance: (data as any).annualInsurance,
            monthly_waste: (data as any).monthlyWaste
          });
          break;
        case 'financial':
          await api.updateSingularConfig('calc_financial_config', user!.id, {
            loan_principal: (data as any).loanPrincipal,
            monthly_interest: (data as any).monthlyInterest,
            monthly_bank_charges: (data as any).monthlyBankCharges,
            transaction_fees_percent: (data as any).transactionFeesPercent,
            est_monthly_revenue: (data as any).estMonthlyRevenue,
            tax_rate: (data as any).taxRate
          });
          break;
        case 'owner':
          await api.updateSingularConfig('calc_owner_config', user!.id, {
            desired_net_income: (data as any).desiredNetIncome,
            risk_buffer_percent: (data as any).riskBufferPercent,
            personal_tax: (data as any).personalTax
          });
          break;

        // Batch Arrays (Deleted and completely replaced for simplicity on 'save')
        case 'overhead':
          await api.syncEntireList(
            'calc_overhead_items',
            user!.id,
            (data as any).items.map((i: any) => ({ id: i.id, name: i.name, monthly_cost: i.monthlyCost }))
          );
          break;
        case 'staff':
          await api.syncEntireList(
            'calc_staff_members',
            user!.id,
            (data as any).members.map((i: any) => ({
              id: i.id, name: i.name, role: i.role, salary: i.salary,
              benefits: i.benefits, bonus: i.bonus, working_days: i.workingDays, working_hours: i.workingHours
            }))
          );
          break;
        case 'depreciation':
          await api.syncEntireList(
            'calc_depreciation_assets',
            user!.id,
            (data as any).assets.map((i: any) => ({
              id: i.id, name: i.name, purchase_price: i.purchasePrice, resale_value: i.resaleValue, lifespan_years: i.lifespanYears
            }))
          );
          break;
        case 'consumables':
          await api.syncEntireList('calc_consumable_items', user!.id, (data as any).items);
          break;
      }

      setToast({ message: customMessage || 'Saved to Cloud Database', isVisible: true });
    } catch (e) {
      console.error("Failed to save section to Supabase", e);
      setToast({ message: 'Error saving data to cloud.', isVisible: true });
    }
  };

  const resetAll = () => {
    // Currently disabled for cloud integrity, could implement delete cascader
    setToast({ message: 'Cloud reset not implemented yet.', isVisible: true });
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

  // --- Remote Plan Management Functions ---
  const savePlan = async (plan: SavedPlan) => {
    try {
      await api.upsertPlan(user!.id, plan);
      setSavedPlans(prev => [...prev.filter(p => p.id !== plan.id), plan]);
      setToast({ message: 'Plan saved to Cloud!', isVisible: true });
    } catch (e) {
      console.error("Error saving plan:", e);
      setToast({ message: 'Error saving plan.', isVisible: true });
    }
  };

  const updatePlan = async (plan: SavedPlan) => {
    try {
      await api.upsertPlan(user!.id, plan);
      setSavedPlans(prev => prev.map(p => p.id === plan.id ? plan : p));
      setToast({ message: 'Plan updated in Cloud!', isVisible: true });
    } catch (e) {
      console.error("Error updating plan:", e);
      setToast({ message: 'Error updating plan.', isVisible: true });
    }
  };

  const deletePlan = async (id: string) => {
    try {
      await api.deletePlan(id);
      setSavedPlans(prev => prev.filter(p => p.id !== id));
      setToast({ message: 'Plan removed from Cloud.', isVisible: true });
    } catch (e) {
      console.error("Error deleting plan:", e);
      setToast({ message: 'Error deleting plan.', isVisible: true });
    }
  };

  // --- Remote Procedure Management Functions ---
  const saveProcedure = async (procedure: SavedProcedure) => {
    try {
      // In Supabase, upsert is driven by ID. 
      await api.upsertProcedure(user!.id, procedure);
      setSavedProcedures(prev => [...prev.filter(p => p.id !== procedure.id), procedure]);
      setToast({ message: 'Procedure saved to Cloud!', isVisible: true });
    } catch (e) {
      console.error("Error saving procedure:", e);
      setToast({ message: 'Error saving procedure.', isVisible: true });
    }
  };

  const updateProcedure = async (procedure: SavedProcedure) => {
    try {
      await api.upsertProcedure(user!.id, procedure);
      setSavedProcedures(prev => prev.map(p => p.id === procedure.id ? procedure : p));
      setToast({ message: 'Procedure updated in Cloud!', isVisible: true });
    } catch (e) {
      console.error("Error updating procedure:", e);
      setToast({ message: 'Error updating procedure.', isVisible: true });
    }
  };

  const deleteProcedure = async (id: string) => {
    try {
      await api.deleteProcedure(id);
      setSavedProcedures(prev => prev.filter(p => p.id !== id));
      setToast({ message: 'Procedure removed from Cloud.', isVisible: true });
    } catch (e) {
      console.error("Error deleting procedure:", e);
      setToast({ message: 'Error deleting procedure.', isVisible: true });
    }
  };

  // --- Modal Control Functions ---
  const openModal = (type: 'ROI' | 'FORECAST', data: SavedPlan | null = null) => {
    setModalState({ isOpen: true, type, initialData: data });
  };
  const closeModal = () => setModalState(prev => ({ ...prev, isOpen: false, initialData: null }));
  const hideToast = () => setToast(prev => ({ ...prev, isVisible: false }));
  const showToast = (message: string) => setToast({ message, isVisible: true });

  return (
    <CalculatorContext.Provider value={{
      state,
      updateSection,
      resetAll,
      saveSection,
      toast,
      hideToast,
      showToast,
      getTotalMonthlyHours,
      getGlobalTotalMonthlyCost,
      calculatorDataStatus,
      calculatorDataUserId,
      savedPlans,
      savePlan,
      updatePlan,
      deletePlan,
      savedProcedures,
      saveProcedure,
      updateProcedure,
      deleteProcedure,
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
