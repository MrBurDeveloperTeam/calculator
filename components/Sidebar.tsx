import React from 'react';
import { ViewState } from '../types';
import type { ThemePreference } from '../lib/themeSync';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Armchair, 
  Syringe, 
  Sparkles, 
  TestTube2, 
  Megaphone, 
  ShieldCheck, 
  Landmark, 
  Wallet,
  Calculator,
  Settings,
  History,
  Monitor
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  theme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

const MENU_ITEMS: { id: ViewState; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'settings', label: 'Clinic Settings', icon: Settings },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'history', label: 'Plan History', icon: History },
  { id: 'procedure_builder', label: 'Profitability Builder', icon: Calculator },
  { id: 'overhead', label: 'Fixed Overhead', icon: Building2 },
  { id: 'staff', label: 'Staff Costs', icon: Users },
  { id: 'depreciation', label: 'Equip. Depreciation', icon: Armchair },
  { id: 'consumables', label: 'Consumables', icon: Syringe },
  { id: 'sterilization', label: 'Sterilization', icon: Sparkles },
  { id: 'lab', label: 'Lab & Outsourcing', icon: TestTube2 },
  { id: 'marketing', label: 'Marketing (CAC)', icon: Megaphone },
  { id: 'regulatory', label: 'Regulatory', icon: ShieldCheck },
  { id: 'financial', label: 'Financial & Tax', icon: Landmark },
  { id: 'owner', label: 'Owner Comp', icon: Wallet },
];

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, theme, onThemeChange }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 flex-shrink-0 gap-3">
          <a href="https://app.snabbb.com/">
            <img src="/Snabbb (White).png" alt="Snabbb Logo" className="h-8 w-auto hover:opacity-80 transition-opacity" />
          </a>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1 hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium
                  ${isActive 
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Snabbb Theme Sync */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Monitor className="w-4 h-4" />
            Snabbb Theme
          </label>
          <select
            value={theme}
            onChange={(event) => onThemeChange(event.target.value as ThemePreference)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-200 outline-none transition-colors focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            aria-label="Choose Snabbb theme"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Inherits from Snabbb and syncs across Snabbb subdomains.
          </p>
          <p className="text-xs text-slate-500 text-center">v3.1 • Visual Suite</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
