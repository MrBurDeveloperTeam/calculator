import { CostCategoryDefinition, Preset } from './types';
import { 
  Building2, 
  Users, 
  Armchair, 
  ShieldCheck, 
  Landmark, 
  Wallet, 
  Syringe, 
  Sparkles, 
  TestTube2, 
  Megaphone 
} from 'lucide-react';
import React from 'react';

// Map icon strings to components for rendering
export const IconMap: Record<string, React.FC<{ className?: string }>> = {
  Building2: (props) => <Building2 {...props} />,
  Users: (props) => <Users {...props} />,
  Armchair: (props) => <Armchair {...props} />,
  ShieldCheck: (props) => <ShieldCheck {...props} />,
  Landmark: (props) => <Landmark {...props} />,
  Wallet: (props) => <Wallet {...props} />,
  Syringe: (props) => <Syringe {...props} />,
  Sparkles: (props) => <Sparkles {...props} />,
  TestTube2: (props) => <TestTube2 {...props} />,
  Megaphone: (props) => <Megaphone {...props} />,
};

export const CATEGORIES: CostCategoryDefinition[] = [
  // Group A: Fixed Costs
  {
    id: 'fixed_overhead',
    name: 'Fixed Overhead',
    description: 'Rent, utilities, maintenance, cleaning',
    group: 'fixed',
    icon: 'Building2',
  },
  {
    id: 'staff_costs',
    name: 'Staff Costs',
    description: 'Salaries, benefits, EPF/SOCSO',
    group: 'fixed',
    icon: 'Users',
  },
  {
    id: 'equipment_depreciation',
    name: 'Equipment & Depreciation',
    description: 'Chairs, X-rays, renovations monthly value',
    group: 'fixed',
    icon: 'Armchair',
  },
  {
    id: 'regulatory_insurance',
    name: 'Regulatory & Insurance',
    description: 'APC, indemnity, waste management',
    group: 'fixed',
    icon: 'ShieldCheck',
  },
  {
    id: 'financial_taxes',
    name: 'Financial & Taxes',
    description: 'Loans, software, tax estimates',
    group: 'fixed',
    icon: 'Landmark',
  },
  {
    id: 'owner_comp',
    name: 'Owner Compensation',
    description: 'Base clinical salary + risk buffer',
    group: 'fixed',
    icon: 'Wallet',
  },
  // Group B: Variable Costs
  {
    id: 'consumables',
    name: 'Consumables & Materials',
    description: 'Bond, composite, burs, gauze, etc.',
    group: 'variable',
    icon: 'Syringe',
  },
  {
    id: 'sterilization',
    name: 'Sterilization',
    description: 'Pouches, chemicals, PPE per patient',
    group: 'variable',
    icon: 'Sparkles',
  },
  {
    id: 'lab_outsourcing',
    name: 'Laboratory',
    description: 'Lab fees for crowns, dentures, aligners',
    group: 'variable',
    icon: 'TestTube2',
  },
  {
    id: 'marketing',
    name: 'Marketing (CAC)',
    description: 'Ad spend/referral cost per patient',
    group: 'variable',
    icon: 'Megaphone',
  },
];

export const PRESETS: Preset[] = [
  {
    name: 'General Scaling',
    data: {
      procedureTimeMinutes: 30,
      variableCosts: {
        consumables: 15,
        sterilization: 8,
        lab_outsourcing: 0,
        marketing: 0,
      },
      profitMarginPercent: 40,
    }
  },
  {
    name: 'Root Canal',
    data: {
      procedureTimeMinutes: 90,
      variableCosts: {
        consumables: 45,
        sterilization: 12,
        lab_outsourcing: 0,
        marketing: 0,
      },
      profitMarginPercent: 50,
    }
  },
  {
    name: 'Crown Prep',
    data: {
      procedureTimeMinutes: 60,
      variableCosts: {
        consumables: 35,
        sterilization: 10,
        lab_outsourcing: 250, // Assuming lab fee is included here
        marketing: 50,
      },
      profitMarginPercent: 30,
    }
  }
];

export const INITIAL_CLINIC_CONFIG = {
  workingDaysPerMonth: 22,
  dailyHours: 8,
  fixedCosts: {
    fixed_overhead: 3000,
    staff_costs: 5000,
    equipment_depreciation: 1500,
    regulatory_insurance: 500,
    financial_taxes: 1000,
    owner_comp: 8000,
  }
};

export const INITIAL_PROCEDURE_CONFIG = {
  procedureTimeMinutes: 45,
  variableCosts: {
    consumables: 20,
    sterilization: 5,
    lab_outsourcing: 0,
    marketing: 0,
  },
  profitMarginPercent: 30,
};