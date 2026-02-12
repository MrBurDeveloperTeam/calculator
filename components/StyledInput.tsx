import React from 'react';

interface StyledInputProps {
  label?: string;
  value: number | string;
  onChange: (value: any) => void;
  type?: 'currency' | 'percent' | 'number' | 'text';
  helperText?: React.ReactNode;
  placeholder?: string;
  className?: string; // Container class override
  inputClassName?: string; // Input element class override
  disabled?: boolean;
  min?: number | string;
  max?: number | string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const StyledInput: React.FC<StyledInputProps> = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  helperText,
  placeholder,
  className = "mb-5",
  inputClassName = "h-12",
  disabled = false,
  min,
  max,
  onKeyDown
}) => {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>}
      <div className={`relative flex rounded-xl shadow-sm ring-1 ring-slate-200 transition-all ${!disabled ? 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1' : 'opacity-60 bg-slate-50'}`}>
        
        {/* Adornment Left (Currency) */}
        {type === 'currency' && (
          <div className={`pointer-events-none absolute inset-y-0 left-0 flex items-center bg-slate-100 border-r border-slate-200 rounded-l-xl px-4 ${inputClassName}`}>
            <span className="text-slate-500 sm:text-sm font-bold">RM</span>
          </div>
        )}
        
        <input
          type={type === 'text' ? 'text' : 'number'}
          value={value === 0 && type !== 'text' ? '' : value}
          onChange={(e) => {
             if (type === 'text') {
                 onChange(e.target.value);
             } else {
                 // Note: we still allow raw input here, validation happens in logic
                 const val = parseFloat(e.target.value);
                 onChange(isNaN(val) ? '' : val); // Use empty string for NaN to allow clearing input
             }
          }}
          disabled={disabled}
          min={min}
          max={max}
          onKeyDown={onKeyDown}
          className={`
            block w-full ${inputClassName} rounded-xl border-0
            bg-white text-slate-900 font-semibold placeholder:text-slate-400
            focus:ring-0 sm:text-sm sm:leading-6
            ${type === 'currency' ? 'pl-16' : 'pl-4'}
            ${type === 'percent' ? 'pr-14' : 'pr-4'}
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          `}
          placeholder={placeholder}
        />
        
        {/* Adornment Right (Percent) */}
        {type === 'percent' && (
          <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center bg-slate-100 border-l border-slate-200 rounded-r-xl px-4 ${inputClassName}`}>
            <span className="text-slate-500 sm:text-sm font-bold">%</span>
          </div>
        )}
      </div>
      {helperText && <div className="mt-1.5 text-xs text-slate-500">{helperText}</div>}
    </div>
  );
};

export default StyledInput;