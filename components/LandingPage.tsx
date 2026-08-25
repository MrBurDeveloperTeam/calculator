import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, ChevronRight, Calculator, BarChart3, Clock, CheckCircle2, Quote, Star, Zap, XCircle, Check, MousePointerClick, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SNABBB_SIGNUP_URL } from '../constants/authLinks';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const [demoVolume, setDemoVolume] = useState(50);
    const demoOverhead = 15000;
    const demoRevenuePerTreatment = 800;
    const demoMaterialCost = 150;
    
    // Derived interactive demo values
    const demoGrossRevenue = demoVolume * demoRevenuePerTreatment;
    const demoTotalMaterialCost = demoVolume * demoMaterialCost;
    const demoNetProfit = demoGrossRevenue - demoOverhead - demoTotalMaterialCost;

    // FAQ State
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    const openLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header / Navbar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 items-center justify-between gap-2 h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <a href="https://app.snabbb.com/">
                                <img src="/Snabbb (Teal).png" alt="Snabbb Logo " className="h-8 sm:h-10 w-auto shrink-0 hover:opacity-80 transition-opacity" />
                            </a>
                        </div>

                        {/* Middle Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
                            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#demo" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Simulator</a>
                            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">How it Works</a>
                            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
                            <a href="#faq" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">FAQ</a>
                        </nav>

                        {/* Navigation / Actions */}
                        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
                            <button
                                onClick={openLogin}
                                className="whitespace-nowrap px-1 sm:px-2 text-[11px] sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                            >
                                Log In
                            </button>

                            <a
                                href={SNABBB_SIGNUP_URL}
                                className="whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-sm font-semibold py-2 px-2.5 sm:px-5 rounded-lg shadow-sm shadow-blue-500/30 transition-all hover:shadow-md transform hover:-translate-y-[1px]"
                            >
                                Sign Up
                            </a>
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
                            <a
                                href={SNABBB_SIGNUP_URL}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-base py-3.5 px-8 rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:shadow-xl transform hover:-translate-y-1"
                            >
                                Start Calculating <ChevronRight className="w-5 h-5" />
                            </a>
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

                {/* Features Showcase / Teaser Section */}
                <div id="features" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 mt-12 mb-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                            Everything you need to run a profitable clinic
                        </h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            Stop guessing your margins. Snabbb brings your entire financial ecosystem into one dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Teaser 1 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-blue-200 transition-colors group">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                                <Clock className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">True Hourly Chair Rate</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Calculate exactly how much it costs to keep your clinic running per hour. Factor in rent, staff, depreciation, and consumables automatically.
                            </p>
                            <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-4">
                                <div className="w-full space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500 font-bold"><span className="uppercase text-[10px]">Overhead</span><span>USD 8,400</span></div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5"><div className="bg-blue-500 h-1.5 rounded-full w-[60%]"></div></div>
                                    <div className="flex justify-between text-xs text-slate-500 font-bold mt-2"><span className="uppercase text-[10px]">Hourly Rate</span><span className="text-blue-600">USD 145/hr</span></div>
                                </div>
                            </div>
                        </div>

                        {/* Teaser 2 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-teal-200 transition-colors group">
                            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500 transition-all duration-300">
                                <BarChart3 className="w-6 h-6 text-teal-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Treatment ROI Engine</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Build treatment models down to the cotton roll. Know instantly if a procedure is profitable or if you are losing money on materials.
                            </p>
                            <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
                                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-teal-100 rounded-full mix-blend-multiply opacity-50 blur-xl"></div>
                                <div className="text-center z-10">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Profit Margin</div>
                                    <div className="text-2xl font-black text-teal-600">+42.8%</div>
                                </div>
                            </div>
                        </div>

                        {/* Teaser 3 */}
                        <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-100 hover:border-indigo-200 transition-colors group md:col-span-2 lg:col-span-1">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                                <ShieldCheck className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Forecasting</h3>
                            <p className="text-slate-600 leading-relaxed mb-6">
                                Set revenue goals and let the system reverse-engineer your targets. Know exactly how many treatments you need per month to hit your goals.
                            </p>
                            <div className="h-24 bg-slate-50 rounded-xl border border-slate-100 p-4 relative overflow-hidden flex items-end gap-2">
                                <div className="w-full bg-indigo-200 rounded-t-sm h-[30%]"></div>
                                <div className="w-full bg-indigo-300 rounded-t-sm h-[50%]"></div>
                                <div className="w-full bg-indigo-400 rounded-t-sm h-[70%]"></div>
                                <div className="w-full bg-indigo-600 rounded-t-sm h-[100%] relative">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 bg-white px-1 py-0.5 rounded shadow-sm">Target</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Demo Section */}
                <div id="demo" className="w-full bg-slate-50 py-16 lg:py-24 relative z-10 border-y border-slate-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="flex-1 lg:pr-8">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/50 text-indigo-700 text-sm font-bold mb-6 border border-indigo-200/50">
                                    <MousePointerClick className="w-4 h-4" /> Try it yourself
                                </div>
                                <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                                    See the impact of volume on your true margins.
                                </h2>
                                <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                                    A common mistake is looking only at gross revenue. Use this basic simulator to see how changes in a single treatment's volume dynamically impact your *actual* net profit after fixed overheads and consumable costs are factored in.
                                </p>
                                
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <h4 className="font-bold text-slate-900">Monthly Treatment Volume</h4>
                                            <p className="text-sm text-slate-500">Number of procedures performed</p>
                                        </div>
                                        <div className="text-2xl font-black text-indigo-600">{demoVolume}</div>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="150" 
                                        step="1"
                                        value={demoVolume}
                                        onChange={(e) => setDemoVolume(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 font-medium mt-2">
                                        <span>10/mo</span>
                                        <span>150/mo</span>
                                    </div>
                                </div>
                            </div>

                            {/* Demo Results Card */}
                            <div className="flex-1 w-full relative">
                                <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                    {/* decorative background glow */}
                                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 pointer-events-none" />
                                    
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <Calculator className="w-5 h-5 text-indigo-400" /> Simulated Results
                                    </h3>
                                    
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                            <span className="text-slate-400 font-medium">Gross Revenue (USD {demoRevenuePerTreatment}/ea)</span>
                                            <span className="text-white font-bold">USD {demoGrossRevenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                            <span className="text-slate-400 font-medium">Materials (USD {demoMaterialCost}/ea)</span>
                                            <span className="text-red-400 font-bold">- USD {demoTotalMaterialCost.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-slate-800">
                                            <span className="text-slate-400 font-medium">Fixed Overhead Allocation</span>
                                            <span className="text-red-400 font-bold">- USD {demoOverhead.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-6 border border-indigo-500/30">
                                        <div className="text-indigo-200 text-sm font-bold uppercase tracking-wider mb-1">True Net Profit</div>
                                        <div className="flex items-baseline gap-2">
                                            <span className={`text-4xl font-black ${demoNetProfit < 0 ? 'text-red-400' : 'text-white'}`}>
                                                {demoNetProfit < 0 ? '-' : ''}USD {Math.abs(demoNetProfit).toLocaleString()}
                                            </span>
                                        </div>
                                        {demoNetProfit < 0 && (
                                            <p className="text-xs text-red-400 mt-2 font-medium">Operating at a loss due to overhead.</p>
                                        )}
                                        {demoNetProfit > 0 && (
                                            <p className="text-xs text-emerald-400 mt-2 font-medium">Profitable margin achieved!</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comparison Section */}
                <div className="w-full bg-slate-50 py-20 lg:py-32 relative z-10 border-b border-slate-200/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                                Stop managing finances in the dark.
                            </h2>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                                The dental industry has evolved, but clinical financial management hasn't. See the difference.
                            </p>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8 justify-center items-center lg:items-stretch">
                            {/* The Old Way */}
                            <div className="flex-1 w-full max-w-lg bg-white rounded-[2rem] p-8 lg:p-10 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full mix-blend-multiply filter blur-2xl opacity-50 group-hover:bg-red-100 transition-colors" />
                                <h3 className="text-2xl font-bold text-slate-400 mb-8 flex items-center gap-3">
                                    <XCircle className="w-8 h-8 text-slate-300" /> The Old Way
                                </h3>
                                <ul className="space-y-8">
                                    <li className="flex items-start gap-4">
                                        <div className="bg-red-50 p-2 rounded-lg mt-1 shrink-0"><XCircle className="w-5 h-5 text-red-500" /></div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-lg">Guessing margins</p>
                                            <p className="text-slate-500 leading-relaxed">Pricing based on competitors instead of your actual operational costs.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-red-50 p-2 rounded-lg mt-1 shrink-0"><XCircle className="w-5 h-5 text-red-500" /></div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-lg">Messy spreadsheets</p>
                                            <p className="text-slate-500 leading-relaxed">Broken formulas and outdated data that nobody wants to update.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-red-50 p-2 rounded-lg mt-1 shrink-0"><XCircle className="w-5 h-5 text-red-500" /></div>
                                        <div>
                                            <p className="font-bold text-slate-700 text-lg">Invisible overheads</p>
                                            <p className="text-slate-500 leading-relaxed">Forgetting to factor in depreciation, sterilization, and idle chair time.</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            {/* The DentalSuite Way */}
                            <div className="flex-1 w-full max-w-lg bg-slate-900 rounded-[2rem] p-8 lg:p-10 border border-blue-900/50 shadow-2xl shadow-blue-900/20 relative overflow-hidden transform lg:-translate-y-4 lg:scale-[1.02]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-screen filter blur-[80px] opacity-30 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none" />
                                
                                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                    <CheckCircle2 className="w-8 h-8 text-blue-400" /> Snabbb
                                </h3>
                                <ul className="space-y-8 relative z-10 mb-10">
                                    <li className="flex items-start gap-4">
                                        <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0 border border-blue-500/30"><Check className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <p className="font-bold text-white text-lg">Mathematical precision</p>
                                            <p className="text-slate-300 leading-relaxed">Know your exact hourly chair rate and profit margin down to the cent.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0 border border-blue-500/30"><Check className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <p className="font-bold text-white text-lg">Centralized dashboard</p>
                                            <p className="text-slate-300 leading-relaxed">A clean, real-time UI that securely stores and updates your clinic's model.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-4">
                                        <div className="bg-blue-500/20 p-2 rounded-lg mt-1 shrink-0 border border-blue-500/30"><Check className="w-5 h-5 text-blue-400" /></div>
                                        <div>
                                            <p className="font-bold text-white text-lg">Actionable forecasting</p>
                                            <p className="text-slate-300 leading-relaxed">Input your revenue target and let the engine tell you exactly how to hit it.</p>
                                        </div>
                                    </li>
                                </ul>
                                <a href={SNABBB_SIGNUP_URL} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors relative z-10 shadow-lg shadow-blue-500/20">
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div id="how-it-works" className="w-full bg-slate-900 py-20 lg:py-32 relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                    
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
                                Data to Decisions in 3 Steps
                            </h2>
                            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                                No complex spreadsheets or financial degrees required. Our engine does the heavy lifting.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                            {/* Connecting Line (Desktop only) */}
                            <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-0.5 bg-slate-800" />
                            
                            {/* Step 1 */}
                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border-2 border-slate-700 shadow-xl relative z-10 shadow-blue-900/20">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">1</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Input Core Setup</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Enter your clinical operating hours, standard fixed costs, and staff salaries. We help you find your actual overhead.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border-2 border-slate-700 shadow-xl relative z-10 shadow-teal-900/20">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                        <Calculator className="w-5 h-5 text-teal-400" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">2</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Build Treatments</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Construct procedures item by item. Add doctor commissions, consumed materials, and precise chair times.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 border-2 border-slate-700 shadow-xl relative z-10 shadow-indigo-900/20">
                                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">3</div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">Analyze Margins</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    Instantly see your true net profit. Adjust pricing dynamically to meet your financial targets without guesswork.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Proof / Testimonial */}
                <div className="w-full bg-slate-900 py-24 relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900 pointer-events-none" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <Quote className="w-16 h-16 text-indigo-500/20 mx-auto mb-8 transform -scale-x-100" />
                        <h3 className="text-2xl md:text-4xl font-light text-white leading-relaxed mb-10 italic">
                            "Before Snabbb, we were guessing our margins based on gut feeling. Now, we know our exact hourly cost and have optimized our pricing to <span className="text-indigo-400 font-medium">increase net profit by 30%</span> in just two months."
                        </h3>
                        <div className="flex items-center justify-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full p-1 shadow-xl shadow-indigo-900/50">
                                <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-900">
                                    <span className="text-white font-bold text-lg">SC</span>
                                </div>
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-white text-lg">Dr. Sarah Chen</div>
                                <div className="text-indigo-400">Lead Practitioner, Apex Dental</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div id="faq" className="w-full bg-white py-20 lg:py-32 relative z-10 border-t border-slate-200 overflow-hidden">
                    {/* Abstract background shapes */}
                    <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-slate-50 border border-slate-100/50 transform rotate-12 -z-10" />
                    <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-3xl bg-slate-50 border border-slate-100/50 transform -rotate-12 -z-10" />
                    
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-4">Support & Answers</div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to know about Snabbb, simplified.</p>
                        </div>

                        <div className="space-y-4">
                            {/* FAQ Item 1 */}
                            <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === 0 ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-blue-300'}`}>
                                <button
                                    onClick={() => toggleFaq(0)}
                                    className="w-full flex justify-between items-center p-6 lg:p-8 text-left focus:outline-none group"
                                >
                                    <span className={`font-bold text-lg lg:text-xl transition-colors ${openFaqIndex === 0 ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>Do I need an accounting background?</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openFaqIndex === 0 ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === 0 ? 'rotate-90 text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                    </div>
                                </button>
                                <div
                                    className={`px-6 lg:px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                                        openFaqIndex === 0
                                        ? 'max-h-[500px] pb-6 lg:pb-8 opacity-100'
                                        : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-slate-600 text-lg leading-relaxed">Not at all. Our intuitive interface is designed specifically for dentists and clinic managers, automating the complex financial formulas in the background so you can focus on making clinical decisions.</p>
                                </div>
                            </div>

                            {/* FAQ Item 2 */}
                            <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === 1 ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-blue-300'}`}>
                                <button
                                    onClick={() => toggleFaq(1)}
                                    className="w-full flex justify-between items-center p-6 lg:p-8 text-left focus:outline-none group"
                                >
                                    <span className={`font-bold text-lg lg:text-xl transition-colors ${openFaqIndex === 1 ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>Is my financial data secure?</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openFaqIndex === 1 ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === 1 ? 'rotate-90 text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                    </div>
                                </button>
                                <div
                                    className={`px-6 lg:px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                                        openFaqIndex === 1
                                        ? 'max-h-[500px] pb-6 lg:pb-8 opacity-100'
                                        : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-slate-600 text-lg leading-relaxed">Yes. We use Supabase backend infrastructure with row-level security and bank-grade encryption to ensure your competitive financial models and pricing structures remain entirely private to your authorized accounts.</p>
                                </div>
                            </div>

                            {/* FAQ Item 3 */}
                            <div className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${openFaqIndex === 2 ? 'border-blue-500 shadow-md shadow-blue-500/10' : 'border-slate-200 hover:border-blue-300'}`}>
                                <button
                                    onClick={() => toggleFaq(2)}
                                    className="w-full flex justify-between items-center p-6 lg:p-8 text-left focus:outline-none group"
                                >
                                    <span className={`font-bold text-lg lg:text-xl transition-colors ${openFaqIndex === 2 ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-600'}`}>Does this integrate with Odoo?</span>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${openFaqIndex === 2 ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                                        <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${openFaqIndex === 2 ? 'rotate-90 text-blue-600' : 'text-slate-400 group-hover:text-blue-500'}`} />
                                    </div>
                                </button>
                                <div
                                    className={`px-6 lg:px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                                        openFaqIndex === 2
                                        ? 'max-h-[500px] pb-6 lg:pb-8 opacity-100'
                                        : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-slate-600 text-lg leading-relaxed">Snabbb acts as a standalone modeling tool but supports seamless Single Sign-On (SSO) with your existing Odoo infrastructure, meaning your clinic staff don't need to remember new passwords.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing / CTA Section */}
                <div id="pricing" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
                    <div className="pricing-cta-panel bg-gradient-to-br from-blue-50 to-teal-50 rounded-[3rem] p-8 md:p-16 lg:px-24 border border-blue-100/50 shadow-xl flex flex-col lg:flex-row items-center gap-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-50 pointer-events-none" />
                        
                        <div className="flex-1 text-center lg:text-left relative z-10">
                            <h2 className="pricing-cta-heading text-3xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                                Ready to maximize your <br className="hidden lg:block"/> clinic's potential?
                            </h2>
                            <ul className="pricing-cta-list space-y-4 mb-8 text-slate-700 font-medium max-w-md mx-auto lg:mx-0">
                                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-teal-500" /> Unlimited Procedure Models</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-teal-500" /> Real-time Overhead Syncing</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-teal-500" /> Smart Forecasting Tools</li>
                                <li className="flex items-center gap-3"><CheckCircle2 className="w-6 h-6 text-teal-500" /> Secure Cloud Backup</li>
                            </ul>
                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <a
                                    href={SNABBB_SIGNUP_URL}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg py-4 px-8 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    Create Free Account
                                </a>
                            </div>
                        </div>

                        {/* Visual Pricing representation */}
                        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative z-10 transform lg:rotate-2 hover:rotate-0 transition-all duration-500">
                            <div className="absolute -top-4 -right-4 bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">Most Popular</div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">Pro Plan</h3>
                            <p className="text-slate-500 mb-6 text-sm">Everything required to systematically grow your margins.</p>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-5xl font-black text-slate-900">USD 99</span>
                                <span className="text-slate-500 font-medium">/mo</span>
                            </div>
                            <a
                                href={SNABBB_SIGNUP_URL}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors"
                            >
                                Start 14-Day Free Trial
                            </a>
                            <p className="text-center text-xs text-slate-400 mt-4">No credit card required to start.</p>
                        </div>
                    </div>
                </div>

                {/* Features Bar - Now converted to a proper premium footer */}
                <footer className="w-full bg-slate-950 border-t border-slate-900 pt-20 pb-10 z-10 relative">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                            <div className="col-span-1 md:col-span-2">
                                <div className="flex items-center gap-3 mb-6">
                                    <a href="https://app.snabbb.com/">
                                        <img src="/Snabbb (White).png" alt="Snabbb Logo" className="h-10 w-auto hover:opacity-80 transition-opacity" />
                                    </a>
                                </div>
                                <p className="text-slate-400 text-lg max-w-sm leading-relaxed">The ultimate clinical modeling interface. Analyze treatments, optimize overheads, and forecast revenue accurately in real time.</p>
                            </div>
                            
                            <div>
                                <h4 className="text-white font-bold text-lg mb-6">Product</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Features</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Pricing</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Security</a></li>
                                </ul>
                            </div>
                            
                            <div>
                                <h4 className="text-white font-bold text-lg mb-6">Legal</h4>
                                <ul className="space-y-4">
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Privacy Policy</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Terms of Service</a></li>
                                    <li><a href="#" className="text-slate-400 hover:text-white transition-colors font-medium">Contact Sales</a></li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                            <p className="text-slate-500 font-medium">© {new Date().getFullYear()} Snabbb. All rights reserved.</p>
                            <div className="flex items-center gap-8">
                                <a href="#" className="text-slate-500 hover:text-white transition-colors font-medium">Twitter</a>
                                <a href="#" className="text-slate-500 hover:text-white transition-colors font-medium">LinkedIn</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </main>

        </div>
    );
};

export default LandingPage;
