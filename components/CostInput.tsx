import React from 'react';
import { IconMap } from '../constants';
import { CostCategoryDefinition } from '../types';

interface CostInputProps {
  category: CostCategoryDefinition;
  value: number;
  onChange: (id: string, value: number) => void;
}

const CostInput: React.FC<CostInputProps> = ({ category, value, onChange }) => {
  const Icon = IconMap[category.icon];

  return (
    <div className="flex items-center space-x-4 p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-400 transition-colors shadow-sm">
      <div className="flex-shrink-0 p-2 bg-teal-50 text-teal-600 rounded-md">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-grow min-w-0">
        <label htmlFor={category.id} className="block text-sm font-medium text-slate-700 truncate">
          {category.name}
        </label>
        <p className="text-xs text-slate-400 truncate">{category.description}</p>
      </div>
      <div className="flex-shrink-0 w-32 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-500 sm:text-sm">$</span>
        </div>
        <input
          type="number"
          id={category.id}
          min="0"
          step="10"
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(category.id, parseFloat(e.target.value) || 0)}
          className="block w-full pl-7 pr-3 py-2 sm:text-sm border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition-shadow bg-white text-right font-medium text-slate-900 placeholder-slate-300"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};

export default CostInput;