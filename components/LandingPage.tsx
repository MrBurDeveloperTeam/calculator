import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, ChevronRight, Calculator, BarChart3, Clock } from 'lucide-react';
import LoginModal from './Auth/LoginModal';

const LandingPage: React.FC = () => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [defaultIsLogin, setDefaultIsLogin] = useState(true);

    const openLogin = () => {
        setDefaultIsLogin(true);
        setIsLoginModalOpen(true);
    };

    const openSignUp = () => {
        setDefaultIsLogin(false);
        setIsLoginModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header / Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center shadow-md">
                                <span className="text-xl font-bold text-white tracking-widest pl-1">DPS</span>
                            </div>
                            <span className="text-xl font-bold text-slate-900 tracking-tight">DentalSuite Pro</span>
                        </div>

                        {/* Navigation / Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={openLogin}
                                className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block px-2"
                            >
                                Log in
                            </button>
                            <button
                                onClick={openSignUp}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-lg shadow-sm shadow-blue-500/30 transition-all hover:shadow-md transform hover:-translate-y-[1px]"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Hero Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob" />
                <div className="absolute top-20 -left-20 w-72 h-72 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-32 lg:pb-24 relative z-10 flex flex-col lg:flex-row items-center gap-16">

                    {/* Hero Text */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 text-blue-700 text-sm font-bold mb-6 border border-blue-200/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            Smart Clinic Analytics Engine
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
                            Elevate your practice <br className="hidden lg:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                                profitability.
                            </span>
                        </h1>

                        <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                            The ultimate clinical modeling interface. Analyze treatments, optimize overheads, and forecast revenue accurately in real time with our comprehensive suite of calculators.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
                            <button
                                onClick={openSignUp}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-base py-3.5 px-8 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Start Calculating <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={openLogin}
                                className="w-full sm:w-auto text-slate-600 hover:text-slate-900 font-bold py-3.5 px-8 rounded-xl hover:bg-slate-100 transition-colors text-base"
                            >
                                Sign in to Dashboard
                            </button>
                        </div>
                    </div>

                    {/* Hero Visual Card / Mockup */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-in zoom-in-95 fade-in duration-1000 delay-300 fill-mode-both">
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                            {/* Browser-like Header */}
                            <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                                </div>
                            </div>
                            {/* Card Content Placeholder */}
                            <div className="p-8 aspect-video flex flex-col items-center justify-center gap-6 bg-slate-50 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                                <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner z-10">
                                    <Calculator className="w-10 h-10 text-blue-600" />
                                </div>
                                <div className="text-center z-10">
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">ROI Calculator</h3>
                                    <p className="text-sm text-slate-500 max-w-xs">Data-driven insights to maximize your clinical treatment margins.</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -left-8 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                            <div className="bg-green-100 p-2 rounded-lg text-green-600"><TrendingUp className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Revenue</p>
                                <p className="text-sm font-bold text-slate-900">+24.5%</p>
                            </div>
                        </div>
                        <div className="absolute -right-6 -bottom-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                            <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock className="w-5 h-5" /></div>
                            <div>
                                <p className="text-xs text-slate-500 font-semibold uppercase">Time Saved</p>
                                <p className="text-sm font-bold text-slate-900">12 hrs/wk</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Features Bar */}
                <div className="border-t border-slate-200 bg-white mt-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Calculator className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Advanced Modeling</h4>
                                    <p className="text-sm text-slate-500">Simulate pricing & overheads.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-teal-50 p-3 rounded-xl text-teal-600"><BarChart3 className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Real-time Forecasts</h4>
                                    <p className="text-sm text-slate-500">Track targets instantaneously.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-100 p-3 rounded-xl text-slate-600"><ShieldCheck className="w-6 h-6" /></div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Bank-grade Security</h4>
                                    <p className="text-sm text-slate-500">Safe & synchronized storage.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                defaultIsLogin={defaultIsLogin}
            />
        </div>
    );
};

export default LandingPage;
