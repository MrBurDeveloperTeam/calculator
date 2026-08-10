import React from 'react';

interface CoinIndicatorProps {
  amount: number;
}

const CoinIndicator: React.FC<CoinIndicatorProps> = ({ amount }) => {
  return (
    <div className="
      absolute
      right-[calc(env(safe-area-inset-right)_+_5.5rem)]
      top-[calc(env(safe-area-inset-top)_+_1.25rem)]
      z-40
      flex cursor-default select-none
      items-center gap-1
      rounded-full
      px-2 py-1
      text-slate-800
      transition-all duration-700
      hover:scale-105
    ">
      <div className="pet-icon-no-tile text-base">
        💰
      </div>

      <span className="text-sm font-black tracking-wide text-black">
        {amount}
      </span>
    </div>
  );
};

export default CoinIndicator;
