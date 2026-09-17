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

const getResolvedTheme = (): 'light' | 'dark' => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, theme, onThemeChange }) => {
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>(getResolvedTheme);
  const isDark = resolvedTheme === 'dark';

  React.useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const syncResolvedTheme = () => setResolvedTheme(getResolvedTheme());

    syncResolvedTheme();

    const observer = new MutationObserver(syncResolvedTheme);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleThemeToggle = () => {
    onThemeChange(isDark ? 'light' : 'dark');
  };

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
        fixed top-0 left-0 bottom-0 w-64 z-50 transition-all duration-300 ease-in-out flex flex-col border-r
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isDark
          ? 'bg-[#1B1F26] text-slate-200 border-[#303744]'
          : 'bg-white text-slate-700 border-slate-200'
        }
      `}>
        <div className={`h-16 flex items-center px-6 border-b flex-shrink-0 gap-3 ${isDark ? 'border-[#303744]' : 'border-slate-200'}`}>
          <a href="https://app.snabbb.com/">
            <img
              src="/Snabbb (White).png"
              alt="Snabbb Logo"
              className={`h-8 w-auto hover:opacity-80 transition-all ${isDark ? '' : 'brightness-0'}`}
            />
          </a>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1 hide-scrollbar">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            const activeClass = isDark
              ? 'bg-gradient-to-r from-[#162825] to-[#1B1F26] text-[#67C2B6] border-l-4 border-[#67C2B6] shadow-sm'
              : 'bg-gradient-to-r from-teal-50 to-white text-[#5B9F96] border-l-4 border-[#5B9F96] shadow-sm';

            const inactiveClass = isDark
              ? 'text-slate-100 hover:bg-[#242A31] hover:text-[#8FC9C2] border-l-4 border-transparent'
              : 'text-slate-600 hover:bg-teal-50/70 hover:text-teal-700 border-l-4 border-transparent';

            const iconClass = isActive
              ? isDark ? 'text-[#67C2B6]' : 'text-[#5B9F96]'
              : isDark ? 'text-slate-400' : 'text-slate-400';
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeView(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-left ${isActive ? activeClass : inactiveClass}`}
              >
                <Icon className={`w-5 h-5 transition-colors ${iconClass}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        {/* Snabbb Theme Sync */}
        <div className={`p-4 border-t ${isDark ? 'border-[#303744]' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Monitor className={`w-4 h-4 ${isDark ? 'text-[#7AB5AE]' : 'text-[#5B9F96]'}`} />
                <span className={`text-lg font-medium leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Theme
                </span>
              </div>
              <p className={`mt-1 text-sm ${isDark ? 'text-slate-300' : 'text-slate-400'}`}>
                Light / Dark
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label="Toggle Snabbb light and dark theme"
                onClick={handleThemeToggle}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:ring-offset-2 ${
                  isDark
                    ? 'bg-[#72BDB3] focus:ring-offset-[#1B1F26]'
                    : 'bg-slate-200 focus:ring-offset-white'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 rounded-full shadow-sm transition-transform duration-200 ${
                    isDark
                      ? 'translate-x-7 bg-[#1B1F26]'
                      : 'translate-x-1 bg-white'
                  }`}
                />
              </button>

              <span className={`w-10 text-sm font-medium ${isDark ? 'text-white' : 'text-slate-600'}`}>
                {isDark ? 'Dark' : 'Light'}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-start justify-between gap-3">
            <p className={`text-[10px] leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Inherits from Snabbb and syncs across Snabbb subdomains.
            </p>

            <button
              type="button"
              onClick={() => onThemeChange('system')}
              className={`flex-shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${
                theme === 'system'
                  ? isDark
                    ? 'bg-[#1D2C2A] text-[#8FC9C2] ring-1 ring-inset ring-[#2A4440]'
                    : 'bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200'
                  : isDark
                    ? 'text-slate-500 hover:bg-[#242A31] hover:text-[#8FC9C2]'
                    : 'text-slate-400 hover:bg-teal-50 hover:text-teal-700'
              }`}
              aria-label="Use system theme"
            >
              System
            </button>
          </div>

          <p className={`mt-3 text-xs text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            v3.1 • Visual Suite
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;