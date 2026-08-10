import React from 'react';

interface CoinIndicatorProps {
  amount: number;
}

const CoinIndicator: React.FC<
  CoinIndicatorProps
> = ({ amount }) => {
  return (
    <div
      className="
        flex cursor-default select-none
        items-center gap-1
        rounded-full
        border border-white/40
        bg-white/30
        px-2 py-1
        text-slate-800
        shadow-lg
        backdrop-blur-md
        transition-all duration-700
        hover:scale-105
        hover:bg-white/40
      "
    >
      <div className="text-base drop-shadow-sm">
        💰
      </div>

      <span className="text-sm font-black tracking-wide text-black">
        {amount}
      </span>
    </div>
  );
};

export default CoinIndicator;