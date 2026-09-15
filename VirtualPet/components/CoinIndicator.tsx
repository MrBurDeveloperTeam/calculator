import React from 'react';

interface CoinIndicatorProps {
  amount: number;
}

const CoinIndicator: React.FC<CoinIndicatorProps> = ({ amount }) => {
  return (
    <div className="
      flex h-12 sm:h-14
      shrink-0
      cursor-default select-none
      items-center gap-1
      rounded-full
      border border-white/40
      bg-white/30
      px-2 sm:px-3
      text-slate-800
      shadow-lg
      backdrop-blur-md
      transition-all duration-700
      hover:scale-105 hover:bg-white/40
    ">
      <div className="pet-icon-no-tile text-base sm:text-lg">
        💰
      </div>

      <span className="whitespace-nowrap text-sm font-black tracking-wide text-black sm:text-base">
        {amount}
      </span>
    </div>
  );
};

export default CoinIndicator;
