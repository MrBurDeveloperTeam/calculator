import React, { useEffect, useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ViewState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HistoryTab from './components/HistoryTab';
import Toast from './components/Toast';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import ClinicSettings from './components/ClinicSettings';
import ROICalculatorModal from './components/ROICalculatorModal';
import SmartForecastingModal from './components/SmartForecastingModal';
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
import { useSsoExchange } from './lib/ssoExchange';
import { set } from 'zod/v4';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  // const { data, isLoading: isSsoLoading, error } = useSsoExchange();

  if (isLoading ) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin border-opacity-50"></div>
      </div>
    );
  }

  if (!user ) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewState>('settings');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { toast, hideToast, modalState, closeModal } = useCalculator();

  const logOut = async () => {
    await signOut().then((res) => {
      console.log("Logged out successfully, navigating to login page.");
      navigate('/login', { replace: true });
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
      />

      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30">
          <span className="font-bold text-slate-800">DentalSuite Pro</span>
          <div className="flex items-center gap-2">
            <button onClick={logOut} className="p-2 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md">
              <LogOut className="w-5 h-5" />
            </button>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Desktop Header Actions (Optional padding logic) */}
        <div className="hidden lg:flex justify-end p-4 absolute top-0 right-0 z-20">
          <button onClick={logOut} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
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
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CalculatorProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppContent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </CalculatorProvider>
    </AuthProvider>
  );
};

export default App;
