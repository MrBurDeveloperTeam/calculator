import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { ViewState } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HistoryTab from './components/HistoryTab';
import Toast from './components/Toast';
import { CalculatorProvider, useCalculator } from './context/CalculatorContext';
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

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('settings'); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const { toast, hideToast, modalState, closeModal } = useCalculator();

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
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
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
    <CalculatorProvider>
      <AppContent />
    </CalculatorProvider>
  );
};

export default App;
