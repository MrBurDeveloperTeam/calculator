import React, { useEffect, useState, useRef } from 'react';
import { useGameState } from '../hooks/useGameState';
import { TiArrowBack } from 'react-icons/ti';

const GAME_CONFIG: Record<string, { title: string; url: string; icon: string; gradient: string }> = {
    flappy: {
        title: 'Flappy Cat',
        url: '/games/flappy-cat/index.html',
        icon: '🕊️',
        gradient: 'from-yellow-400 to-orange-500'
    },
    paccat: {
        title: 'Pac-Cat',
        url: '/games/pac-cat/index.html',
        icon: '👻',
        gradient: 'from-blue-400 to-indigo-600'
    },
    tetris: {
        title: 'Tetris',
        url: '/games/tetris/index.html',
        icon: '🧱',
        gradient: 'from-red-400 to-pink-600'
    }
};

/**
 * Animated number component for the "increase" effect
 */
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(value);
    const frameRef = useRef<number>(0);
    const startValue = useRef(value);
    const endValue = useRef(value);
    const startTime = useRef(0);
    const duration = 3000; // 1 second animation

    useEffect(() => {
        if (value === displayValue) return;

        // Reset animation state
        startValue.current = displayValue;
        endValue.current = value;
        startTime.current = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime.current;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const easedProgress = 1 - Math.pow(1 - progress, 3);

            const current = Math.floor(startValue.current + (endValue.current - startValue.current) * easedProgress);
            setDisplayValue(current);

            if (progress < 1) {
                frameRef.current = requestAnimationFrame(animate);
            }
        };

        frameRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frameRef.current);
    }, [value]);

    return <span>{String(displayValue)}</span>;
};

interface GamePageProps {
    gameId: string;
    onClose: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ gameId, onClose }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isPortrait, setIsPortrait] = useState(false);
    const { stats, setStats } = useGameState();
    const [sessionCoins, setSessionCoins] = useState(0);

    // Sync score from games
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Update temporary display score
            if (event.data?.type === 'GAME_SCORE_UPDATE') {
                const totalScore = event.data.score || 0;
                setSessionCoins(Math.floor(totalScore / 100));
            }

            // Persistence: Only add to official total when game ends
            if (event.data?.type === 'GAME_OVER') {
                const totalScore = event.data.score || 0;
                const reward = Math.floor(totalScore / 100);

                if (reward > 0) {
                    setStats(prev => ({
                        ...prev,
                        coins: (prev.coins || 0) + reward,
                        happiness: Math.min(100, (prev.happiness || 0) + 15)
                    }));
                }
                setSessionCoins(0); // Clear pending
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [setStats]);

    // Prevent scroll when game is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Pac-Cat and Tetris need a landscape play area. Chromium/Android can
    // lock the real screen orientation; iOS Safari cannot, so portrait iPhones
    // use the rotated viewport below as a visual fallback.
    const requiresLandscape = gameId === 'paccat' || gameId === 'tetris';

    useEffect(() => {
        if (!requiresLandscape) {
            setIsPortrait(false);
            return;
        }

        const updateOrientation = () => {
            setIsPortrait(window.innerHeight > window.innerWidth);
        };

        updateOrientation();
        window.addEventListener('resize', updateOrientation);
        window.addEventListener('orientationchange', updateOrientation);

        const orientation = screen.orientation as ScreenOrientation & {
            lock?: (orientation: 'landscape') => Promise<void>;
            unlock?: () => void;
        };

        orientation?.lock?.('landscape').catch(() => {
            // Expected on iOS Safari and when fullscreen is not active.
            // The CSS rotation fallback handles those browsers.
        });

        return () => {
            window.removeEventListener('resize', updateOrientation);
            window.removeEventListener('orientationchange', updateOrientation);
            orientation?.unlock?.();
        };
    }, [requiresLandscape]);

    if (!gameId || !GAME_CONFIG[gameId]) {
        onClose();
        return null;
    }

    const config = GAME_CONFIG[gameId];

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black" style={{ fontFamily: "'Fredoka', sans-serif" }}>
            {/* Container - Full Screen */}
            <div className="relative w-full h-full animate-in zoom-in-95 fade-in duration-300">

                {/* Same back control used by the main cat page */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute left-[calc(env(safe-area-inset-left)+1.5rem)] top-[calc(env(safe-area-inset-top)+1.5rem)] z-[60] flex h-16 w-16 appearance-none items-center justify-center rounded-2xl border border-white/60 bg-white/75 p-0 text-slate-700 shadow-xl shadow-slate-900/10 backdrop-blur-md transition-all hover:-translate-x-0.5 hover:scale-105 hover:bg-white active:scale-95"
                    title="Back"
                    aria-label="Back"
                >
                    <TiArrowBack className="h-12 w-12" strokeWidth={0} />
                </button>

                {/* Landscape orientation notice */}
                {requiresLandscape && isPortrait && (
                <div className="absolute inset-0 z-[55] flex items-center justify-center bg-slate-950/95 px-8 text-white backdrop-blur-md">
                    <div className="flex max-w-sm flex-col items-center text-center">
                    <div className="mb-5 rotate-90 animate-pulse text-7xl">
                        📱
                    </div>

                    <h2 className="text-2xl font-black">
                        Rotate your device
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/70">
                        {config.title} requires landscape mode to play.
                    </p>
                    </div>
                </div>
                )}

                {/* Top UI Area */}
                <div className="absolute right-[calc(env(safe-area-inset-right)+1.5rem)] top-[calc(env(safe-area-inset-top)+1.5rem)] z-50 flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                        {/* Session Progress (Pending Coins) */}
                        {sessionCoins > 0 && (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-yellow-500/20 shadow-sm text-yellow-400 animate-in fade-in slide-in-from-top-2 duration-300">
                                <span className="text-[10px] font-black uppercase tracking-wider opacity-70">Coins</span>
                                <span className="font-black text-sm tracking-widest">+{sessionCoins}</span>
                            </div>
                        )}

                        {/* Accumulated Score Indicator (Persistent Wallet) */}
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/10 shadow-lg text-white transition-all duration-500 ring-1 ring-white/5">
                            <span className="text-xl">💰</span>
                            <span className="font-black text-lg tracking-widest min-w-[3ch] text-right">
                                <AnimatedCounter value={stats.coins || 0} />
                            </span>
                        </div>

                    </div>
                </div>

                {/* Game Iframe Wrapper */}
                <div className="absolute inset-0 bg-slate-900">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                <span className="text-white/60 text-sm">Loading {config.title}...</span>
                            </div>
                        </div>
                    )}

                    <iframe
                        src={config.url}
                        className="w-full h-full border-0 block"
                        title={config.title}
                        onLoad={() => setIsLoading(false)}
                        allow="autoplay; fullscreen"
                    />
                </div>
            </div>
        </div>
    );
};