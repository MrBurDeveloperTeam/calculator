import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ViewState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HistoryTab from './components/HistoryTab';
import Toast from './components/Toast';
import ProfileMenu from './components/ProfileMenu';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import ClinicSettings from './components/ClinicSettings';
import ROICalculatorModal from './components/ROICalculatorModal';
import SmartForecastingModal from './components/SmartForecastingModal';
import CatMascot from './components/CatMascot';
import MolarAIFloat from './components/MolarAIFloat';
import {
  PersonalizedInsightBridgeProvider,
  usePublishPersonalizedInsight,
  type PersonalizedInsightBridgeState,
} from './aiExperience/petDialogue/PersonalizedInsightBridge';
import { useProfitCalculatorPersonalizedInsight } from './aiExperience/hooks/useProfitCalculatorPersonalizedInsight';
import CalculatorVirtualPet from './petExperience/CalculatorVirtualPet';
import {
  OverheadCalculator,
  StaffCalculator,
  DepreciationCalculator,
  ConsumablesCalculator,
  SterilizationCalculator,
  LabCalculator,
  MarketingCalculator,
  RegulatoryCalculator,
  FinancialCalculator,
  OwnerCalculator,
  ProcedureBuilder
} from './components/CalculatorModules';
import {
  normalizeTheme,
  readStoredTheme,
  readThemeCookie,
  writeThemeCookie,
  writeStoredTheme,
  applyThemeToDocument,
  broadcastTheme,
  syncThemeFromOdoo,
  pushThemeToOdoo,
  THEME_SYNC,
  type ThemePreference,
} from './lib/themeSync';


const AuthManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin border-opacity-50"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage />
        <CatMascot disabled onCatClick={() => {}} />
        <MolarAIFloat disabled userContext="" onPetToggle={() => {}} />
      </>
    );
  }

  return <>{children}</>;
};

/**
 * Publishes the app-wide Profit personalized reminder — rendered as a
 * CHILD of <PersonalizedInsightBridgeProvider> (see AppContent's return
 * below), never as a hook called from AppContent's own body. That
 * distinction is the entire point of this component's existence: a hook
 * call executes as part of whichever component calls it, using that
 * component's OWN position in the tree — a component only "sees" the
 * Provider instances that wrap ITS OWN render, never a Provider it simply
 * returns as descendant JSX. `usePublishPersonalizedInsight` called
 * directly inside `AppContent`'s body was therefore reading/writing a
 * DIFFERENT (parent-scope, provider-less) context than the one
 * `<PersonalizedInsightBridgeProvider>` actually creates a few lines
 * later in the same return statement — a no-op publish into thin air,
 * which is why the bridge stayed `{status:'not_ready'}` forever and Cat
 * correctly waited but never received an update. Mounting this as an
 * actual descendant component of the Provider fixes that: this
 * component's own `useContext` calls (inside
 * `usePublishPersonalizedInsight`) now correctly resolve to the same
 * Provider instance CatMascot itself reads via `usePersonalizedInsightBridge()`.
 *
 * Always mounted for the entire authenticated app lifetime (a sibling of
 * the main view content inside the same Provider, not gated on
 * `currentView`) — this is what makes the reminder genuinely app-wide.
 * Renders nothing; it exists purely to keep this hook call in the correct
 * tree position. No new Supabase query: `useProfitCalculatorPersonalizedInsight`
 * is a pure `useMemo` over CalculatorContext's already-loaded `savedPlans`
 * (the exact same call Dashboard.tsx makes separately for its own inline
 * banner — see that file's own comment on why calling this pure hook
 * twice is deliberate reuse, not duplicated computation).
 */
const ProfitDialoguePublisher: React.FC = () => {
  const { user } = useAuth();
  const { savedPlans, openModal, calculatorDataStatus, calculatorDataUserId } = useCalculator();
  const profitInsight = useProfitCalculatorPersonalizedInsight();

  // CLOSURE SAFETY: this function closes over `profitInsight`/`savedPlans`
  // from THIS render. The bridge below captures this exact function
  // reference together with `profitInsight` from the SAME publish call —
  // CatMascot then freezes that pair in its own refs at adoption time and
  // never re-reads a later render's values, so a later savedPlans change
  // can never make the CTA open a DIFFERENT plan than the one Cat
  // actually displayed. `openModal`/`modalState` are already owned by
  // CalculatorContext and the modal itself already renders at AppContent
  // level regardless of `currentView` (see `<ROICalculatorModal>`/
  // `<SmartForecastingModal>`, both driven by `modalState`), so this works
  // identically from any internal view, including ones where Dashboard
  // was never mounted.
  const handleProfitInsightAction = useCallback(() => {
    if (!profitInsight) return;
    const planId = profitInsight.facts.planId;
    const plan = savedPlans.find((p) => p.id === planId);
    // If the referenced plan no longer exists in current state (e.g.
    // deleted since this candidate was evaluated), do nothing safely —
    // never fall back to a different plan, never fabricate data.
    if (!plan) return;
    openModal(plan.type, plan);
  }, [profitInsight, savedPlans, openModal]);

  // Unconditional: NOT gated on `currentView === 'dashboard'` — the
  // Profit reminder is an app-wide product requirement, so this runs
  // regardless of which internal view is currently mounted. Ownership is
  // checked FIRST (calculatorDataUserId === current authenticated user
  // id), THEN readiness (calculatorDataStatus === 'ready') — the exact
  // same two-step gate already established by resolveProfitDataQuery.ts
  // for Phase-3 Data Chat, reused here rather than re-derived. A stale
  // previous user's 'ready' status (e.g. right after logout/user-switch,
  // before CalculatorContext's fetch effect has run for the new user) is
  // therefore never treated as ready for the new user. See
  // aiExperience/petDialogue/PersonalizedInsightBridge.tsx's file header.
  // Memoized so this object keeps the same reference across renders where
  // none of its real semantic inputs changed — `profitInsight` is already
  // a stable useMemo result (useProfitCalculatorPersonalizedInsight.ts,
  // keyed off `savedPlans`) and `handleProfitInsightAction` is already a
  // stable useCallback result (above), so the only remaining source of a
  // fresh reference on every render was this object literal itself. See
  // PersonalizedInsightBridge.tsx's own Provider memoization — both were
  // required together to stop `usePublishPersonalizedInsight`'s effect
  // ([ctx, state] deps) from re-firing on every render.
  const personalizedInsightBridgeState: PersonalizedInsightBridgeState = useMemo(
    () =>
      calculatorDataUserId !== null && calculatorDataUserId === user?.id && calculatorDataStatus === 'ready'
        ? { status: 'ready', candidate: profitInsight, onAction: handleProfitInsightAction }
        : { status: 'not_ready' },
    [calculatorDataUserId, user?.id, calculatorDataStatus, profitInsight, handleProfitInsightAction],
  );
  usePublishPersonalizedInsight(personalizedInsightBridgeState);

  return null;
};

interface AppContentProps {
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

const AppContent: React.FC<AppContentProps> = ({ theme, onThemeChange }) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewState>('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVirtualPetOpen, setIsVirtualPetOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const {
    state,
    savedPlans,
    savedProcedures,
    toast,
    hideToast,
    modalState,
    closeModal,
    getGlobalTotalMonthlyCost,
    getTotalMonthlyHours,
  } = useCalculator();

  const aiContext = useMemo(() => {
    const totalMonthlyCost = getGlobalTotalMonthlyCost();
    const totalMonthlyHours = getTotalMonthlyHours();
    return [
      `Current view: ${currentView}`,
      `Clinic: ${state.clinicSettings.clinicName || 'Not set'}`,
      `Working days/week: ${state.clinicSettings.workingDaysPerWeek || 0}`,
      `Hours/day: ${state.clinicSettings.hoursPerDay || 0}`,
      `Currency: ${state.clinicSettings.currencySymbol || 'Not set'}`,
      `Total monthly cost: ${totalMonthlyCost}`,
      `Total monthly hours: ${totalMonthlyHours}`,
      `Saved plans: ${savedPlans.length}`,
      `Saved procedures: ${savedProcedures.length}`,
      `Overhead items: ${state.overhead.items.length}`,
      `Staff members: ${state.staff.members.length}`,
      `Consumables: ${state.consumables.items.length}`,
    ].join('\n');
  }, [currentView, getGlobalTotalMonthlyCost, getTotalMonthlyHours, savedPlans.length, savedProcedures.length, state]);

  useEffect(() => {
    const wheelOptions: AddEventListenerOptions = { capture: true, passive: false };

    const preventNumberInputScroll = (event: WheelEvent) => {
      const target = event.target;

      if (!(target instanceof HTMLInputElement) || target.type !== 'number') return;
      if (document.activeElement !== target) return;

      event.preventDefault();
      target.blur();
    };

    document.addEventListener('wheel', preventNumberInputScroll, wheelOptions);

    return () => {
      document.removeEventListener('wheel', preventNumberInputScroll, wheelOptions);
    };
  }, []);

  const logOut = async () => {
    await signOut().then((res) => {
    })
  }

  const renderView = () => {
    switch (currentView) {
      case 'settings': return <ClinicSettings />;
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'history': return <HistoryTab />;
      case 'procedure_builder': return <ProcedureBuilder />;
      case 'overhead': return <OverheadCalculator />;
      case 'staff': return <StaffCalculator />;
      case 'depreciation': return <DepreciationCalculator />;
      case 'consumables': return <ConsumablesCalculator />;
      case 'sterilization': return <SterilizationCalculator />;
      case 'lab': return <LabCalculator />;
      case 'marketing': return <MarketingCalculator />;
      case 'regulatory': return <RegulatoryCalculator />;
      case 'financial': return <FinancialCalculator />;
      case 'owner': return <OwnerCalculator />;
      default: return <ClinicSettings />;
    }
  };

  return (
    // <ProfitDialoguePublisher /> is a genuine DESCENDANT of this Provider
    // (rendered as JSX here, not called as a hook up in AppContent's own
    // body — see that component's own doc for why the distinction is
    // load-bearing), and CatMascot (the reader, always mounted below) is
    // its sibling — both consume the exact same Provider instance. See
    // aiExperience/petDialogue/PersonalizedInsightBridge.tsx.
    <PersonalizedInsightBridgeProvider>
    <ProfitDialoguePublisher />
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar
        currentView={currentView}
        onChangeView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        theme={theme}
        onThemeChange={onThemeChange}
      />

      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <a href="https://app.snabbb.com/">
              <img src="/Snabbb (Teal).png" alt="Snabbb Logo" className="h-6 w-auto hover:opacity-80 transition-opacity" />
            </a>
          </div>
          <div className="flex items-center gap-2">
            <ProfileMenu
              user={user}
              profile={profile}
              onSignOut={logOut}
              triggerClassName="p-2 text-[var(--app-text-soft)] hover:bg-[var(--app-surface-muted)] rounded-full border border-[var(--app-border)] transition-colors"
            />
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Desktop Header Actions (Optional padding logic) */}
        <div className="hidden lg:flex justify-end p-4 absolute top-0 right-0 z-20">
          <ProfileMenu user={user} profile={profile} onSignOut={logOut} />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto mt-4 lg:mt-12">
          {renderView()}
        </main>
      </div>

      {/* Global Modals for Planning */}
      <ROICalculatorModal
        isOpen={modalState.isOpen && modalState.type === 'ROI'}
        onClose={closeModal}
        initialPlan={modalState.initialData}
      />
      <SmartForecastingModal
        isOpen={modalState.isOpen && modalState.type === 'FORECAST'}
        onClose={closeModal}
        initialPlan={modalState.initialData}
      />

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      <div className={isVirtualPetOpen ? 'hidden' : 'contents'}>
        <CatMascot onCatClick={() => setIsVirtualPetOpen(true)} />
        <MolarAIFloat
          userContext={aiContext}
          onPetToggle={() => setIsVirtualPetOpen(true)}
        />
      </div>
      <CalculatorVirtualPet
        isOpen={isVirtualPetOpen}
        onClose={() => setIsVirtualPetOpen(false)}
        userId={user?.id ?? null}
      />
    </div>
    </PersonalizedInsightBridgeProvider>
  );
};

const App: React.FC = () => {
  // Snabbb theme inheritance: Worker-injected value/cookie first, mini-app fallback second.
  const [theme, setTheme] = useState<ThemePreference>(() => readStoredTheme() || 'light');

  useEffect(() => {
    const normalized = normalizeTheme(theme) || 'light';
    applyThemeToDocument(normalized);
  }, [theme]);

  useEffect(() => {
    syncThemeFromOdoo((odooTheme) => {
      setTheme((current) => (current === odooTheme ? current : odooTheme));
    });
  }, []);

  useEffect(() => {
    const handleStorageSync = (event: StorageEvent) => {
      if (event.key !== THEME_SYNC.localStorageKey && event.key !== 'snabbb-theme') return;
      const next = normalizeTheme(event.newValue);
      if (next) setTheme((current) => (current === next ? current : next));
    };

    const handleMessageSync = (event: MessageEvent) => {
      const data = event.data;
      if (!data || data.type !== THEME_SYNC.messageType) return;
      if (data.source === THEME_SYNC.appSource) return;

      const next = normalizeTheme(data.theme);
      if (next) setTheme((current) => (current === next ? current : next));
    };

    const handleSystemThemeChange = () => {
      setTheme((current) => {
        if (current === 'system') applyThemeToDocument('system');
        return current;
      });
    };

    let lastCookie = readThemeCookie();
    const cookieInterval = window.setInterval(() => {
      const currentCookie = readThemeCookie();
      if (currentCookie && currentCookie !== lastCookie) {
        lastCookie = currentCookie;
        setTheme((current) => (current === currentCookie ? current : currentCookie));
      }
    }, 1000);

    const mediaQuery = window.matchMedia?.('(prefers-color-scheme: dark)');

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('message', handleMessageSync);
    mediaQuery?.addEventListener?.('change', handleSystemThemeChange);
    mediaQuery?.addListener?.(handleSystemThemeChange);

    return () => {
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('message', handleMessageSync);
      mediaQuery?.removeEventListener?.('change', handleSystemThemeChange);
      mediaQuery?.removeListener?.(handleSystemThemeChange);
      window.clearInterval(cookieInterval);
    };
  }, []);

  const handleSetTheme = (newTheme: ThemePreference) => {
    const normalized = normalizeTheme(newTheme) || 'light';
    setTheme(normalized);
    writeThemeCookie(normalized);
    writeStoredTheme(normalized);
    broadcastTheme(normalized);
    void pushThemeToOdoo(normalized);
  };

  return (
    <AuthProvider>
      <CalculatorProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <AuthManager>
                  <AppContent theme={theme} onThemeChange={handleSetTheme} />
                </AuthManager>
              }
            />
          </Routes>
        </Router>
      </CalculatorProvider>
    </AuthProvider>
  );
};

export default App;
