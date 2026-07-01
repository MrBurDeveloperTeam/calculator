import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInDual, signUpDual } from '../../lib/odooApi';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, X } from 'lucide-react';
import { loginOdoo } from '@/lib/loginOdoo';
import applink from '@/lib/app_link';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    defaultIsLogin?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, defaultIsLogin = true }) => {
    const [isLogin, setIsLogin] = useState(defaultIsLogin);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Load saved email if it exists
        const savedEmail = localStorage.getItem('snabbb_remembered_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
        setIsLogin(defaultIsLogin);
        setError(null);
    }, [isOpen, defaultIsLogin]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (rememberMe) {
                localStorage.setItem('snabbb_remembered_email', email);
            } else {
                localStorage.removeItem('snabbb_remembered_email');
            }

            if (isLogin) {
                await signInDual({ email, password });
                onClose();
                navigate('/');
            } else {
                await signUpDual({ email, password, fullName });
                onClose();
                navigate('/');
            }
        } catch (err: any) {
            const { data } =  await loginOdoo(email, password); 
          data && data?.result && data.result?.uid
          if (data && data.result && data.result.uid) {
            const applinkData = await applink(data.result);
            console.log('Applink response:', applinkData);
          }
          return data;
            // setError(err.message || 'An error occurred during authentication.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 animate-in zoom-in-95 duration-200">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8 pr-8">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                        {isLogin ? 'Please enter your credentials to login.' : 'Sign up to start tracking your clinic.'}
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleAuth}>
                    {!isLogin && (
                        <div className="space-y-1.5 group">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Full Name
                            </label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
                                placeholder="Dr. Jane Doe"
                            />
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
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
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
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder:text-slate-400 font-medium text-slate-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {/* Remember Me - only show for login */}
                    {isLogin && (
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setRememberMe(!rememberMe)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                                    rememberMe
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-slate-300 hover:border-blue-400'
                                }`}
                                aria-label="Remember me"
                            >
                                {rememberMe && (
                                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                            <span
                                className="text-sm font-medium text-slate-600 cursor-pointer select-none"
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                Remember me
                            </span>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-100/60 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-900 leading-snug">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] shadow-blue-500/30 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-[1px] active:translate-y-0 mt-2"
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

                <div className="mt-6 text-center pt-5 border-t border-slate-100">
                    <span className="text-sm text-slate-500">
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
    );
};

export default LoginModal;
