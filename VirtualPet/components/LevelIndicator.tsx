import React, { useState } from 'react';
import { PetStats } from '../types';

interface LevelIndicatorProps {
  stats: PetStats;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ stats }) => {
  const [isOpen, setIsOpen] = useState(false);

  const bodyPath = "M 40 30 Q 70 70 100 65 Q 130 70 160 30 Q 190 80 180 150 Q 170 195 100 190 Q 30 195 20 150 Q 10 80 40 30 Z";

  const whiskersPath = `
    M 45 115 L 5 105
    M 45 135 L 5 145
    M 155 115 L 195 105
    M 155 135 L 195 145
  `;

  const fillHeightRange = 165;
  const fillBottomY = 195;
  const xpPercent = Math.min(100, Math.max(0, stats.xp)) / 100;
  const fillY = fillBottomY - (xpPercent * fillHeightRange);

  return (
    <div
        className="
            absolute
            right-[calc(env(safe-area-inset-right)_+_0.75rem)]
            top-[calc(env(safe-area-inset-top)_+_0.5rem)]
            z-40
            flex flex-col items-end
            animate-in fade-in slide-in-from-right-4 duration-700
            lg:right-[calc(env(safe-area-inset-right)_+_1.5rem)]
            lg:top-[calc(env(safe-area-inset-top)_+_0.75rem)]
        "
    >
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="
                group relative
                h-12 w-12 shrink-0
                appearance-none
                !border-0
                !bg-transparent
                !shadow-none
                p-0
                outline-none ring-0
                cursor-pointer
                transition-transform duration-200
                hover:scale-105 active:scale-95
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-amber-400/70
                sm:h-20 sm:w-20
            "
            title={`Level ${stats.level}`}
            aria-expanded={isOpen}
        >
            <svg
                viewBox="0 0 200 200"
                className="pet-icon-no-tile h-full w-full overflow-visible"
            >
                <defs>
                    <clipPath id="body-mask-lvl">
                        <path d={bodyPath} />
                    </clipPath>
                    <linearGradient id="fill-gradient-lvl" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                </defs>

                <path
                    d={bodyPath}
                    className="fill-transparent stroke-black stroke-[4]"
                />

                <g clipPath="url(#body-mask-lvl)">
                    <rect
                        x="0"
                        y={fillY}
                        width="200"
                        height="200"
                        fill="url(#fill-gradient-lvl)"
                        className="transition-all duration-700 ease-out"
                    />
                </g>
                <path d={bodyPath} className="fill-none stroke-black stroke-[4px] pointer-events-none" />
                <path
                  d={whiskersPath}
                  className="fill-none stroke-slate-600/60 stroke-[3px]"
                  strokeLinecap="round"
                />

                <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-5xl font-black fill-slate-800 pointer-events-none select-none"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    {stats.level}
                </text>

                <text
                    x="100"
                    y="150"
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-[18px] font-bold fill-slate-700/70 tracking-widest pointer-events-none select-none"
                    style={{ fontFamily: 'Fredoka, sans-serif' }}
                >
                    LVL
                </text>
            </svg>
        </button>

        {isOpen && (
            <div
                className="
                    absolute right-0 top-20
                    w-[min(16rem,calc(100vw_-_1.5rem))]
                    rounded-2xl border border-white/50
                    bg-white/90 p-5
                    shadow-2xl backdrop-blur-xl
                    animate-in fade-in zoom-in-95 origin-top-right
                    lg:top-24
                "
            >
                <div className="text-center">
                    <h3 className="text-xl font-bold text-slate-800">Level {stats.level}</h3>
                    <div className="text-sm font-semibold text-slate-500 mt-1">
                        {Math.floor(stats.xp)} / 100 XP
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full mt-2 overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, Math.max(0, stats.xp))}%` }}
                        />
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default LevelIndicator;
