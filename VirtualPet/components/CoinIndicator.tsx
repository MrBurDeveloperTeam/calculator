import React from 'react';

interface CoinIndicatorProps {
  amount: number;
}

const CoinIndicator: React.FC<CoinIndicatorProps> = ({ amount }) => {
  return (
    <div
      className="
        absolute
        right-[calc(env(safe-area-inset-right)_+_5.5rem)]
        top-[calc(env(safe-area-inset-top)_+_1.25rem)]
        z-40
        flex min-w-0 items-center gap-1.5
        rounded-full border-0
        bg-transparent px-3 py-1.5
        text-black
        shadow-none
        animate-in fade-in slide-in-from-right-8
        select-none
        transition-all duration-700
        hover:scale-105
        sm:gap-2 sm:px-4 sm:py-2
        lg:right-[calc(env(safe-area-inset-right)_+_8rem)]
        lg:top-[calc(env(safe-area-inset-top)_+_2rem)]
      "
    >
      <span className="text-xl leading-none drop-shadow-sm sm:text-2xl">
        💰
      </span>

      <span className="max-w-20 truncate text-base font-black tracking-wide text-black sm:text-xl">
        {amount}
      </span>
    </div>
  );
};

export default CoinIndicator;