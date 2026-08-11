import React, { useEffect, useMemo, useState } from 'react';
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
import { VirtualPetContainer } from './VirtualPet/VirtualPetContainer';
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
              triggerClassName="w-10 h-10 p-1 flex items-center justify-center overflow-hidden text-[var(--app-text-soft)] hover:bg-[var(--app-surface-muted)] rounded-full bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm transition-colors"            />
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
      <VirtualPetContainer
        isOpen={isVirtualPetOpen}
        onClose={() => setIsVirtualPetOpen(false)}
      />
    </div>
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
