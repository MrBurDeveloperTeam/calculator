import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, ShieldCheck, TrendingUp } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                // The trigger will automatically create the profile row
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-slate-50 font-sans">
            {/* Left Side - Visual Hero (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-950 overflow-hidden">
                <img
                    src="/login-bg.png"
                    alt="Dental Technology"
                    className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
                />
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/90 via-slate-900/50 to-teal-900/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-end p-16 xl:p-24 w-full h-full text-white">
                    <div className="mb-auto mt-8">
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-700">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <span className="text-2xl font-bold text-white tracking-widest pl-1">DPS</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">DentalSuite Pro</h1>
                        </div>
                    </div>

                    <div className="mb-12 space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
                        <h2 className="text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400 pb-2">
                            Elevate your practice profitability.
                        </h2>
                        <p className="text-lg text-slate-300 leading-relaxed font-light">
                            The ultimate clinical modeling interface. Analyze treatments, optimize overheads, and forecast revenue accurately in real time.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 text-sm text-slate-300 font-medium animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both">
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                            <ShieldCheck className="w-6 h-6 text-teal-400" />
                            <span>Bank-grade<br />Security</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                            <span>Precision<br />Analytics</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex flex-col flex-1 justify-center px-6 py-12 lg:px-20 xl:px-24 bg-slate-50 relative">

                {/* Mobile Header (Only visible on small screens) */}
                <div className="lg:hidden flex items-center justify-center gap-3 mb-10 mt-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-xl font-bold text-white tracking-widest pl-1">DPS</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">DentalSuite Pro</h1>
                </div>

                <div className="mx-auto w-full max-w-sm">
                    <div className="bg-white px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-slate-100 transition-all duration-300 animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                                {isLogin ? 'Welcome back' : 'Create an account'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-2">
                                {isLogin ? 'Please enter your credentials to login.' : 'Sign up to start tracking your clinic.'}
                            </p>
                        </div>

                        <form className="space-y-6" onSubmit={handleAuth}>
                            {!isLogin && (
                                <div className="space-y-1.5 group animate-in slide-in-from-top-2 fade-in duration-300">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
                                            placeholder="Dr. Jane Doe"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Email address
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
                                        placeholder="doctor@clinic.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Password
                                    </label>
                                    {isLogin && (
                                        <button type="button" className="text-xs font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-100/60 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm font-medium text-red-900 leading-snug">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-4 px-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] shadow-blue-500/30 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-[1px] active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : isLogin ? (
                                    <>
                                        Sign In <LogIn className="w-4 h-4 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Create Account <UserPlus className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center pt-6 relative">
                            <div className="absolute inset-0 flex items-center pointer-events-none" aria-hidden="true">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center">
                                <span className="px-4 bg-white text-sm text-slate-500">
                                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsLogin(!isLogin);
                                            setError(null);
                                        }}
                                        className="font-bold text-blue-600 hover:text-blue-500 transition-colors focus:outline-none focus:underline"
                                    >
                                        {isLogin ? 'Sign up' : 'Log in'}
                                    </button>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
