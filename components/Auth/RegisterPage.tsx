import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Briefcase, ChevronDown, Globe2, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES, DENTAL_POSITIONS } from '../../constants/signupOptions';
import AuthShell, { AuthLogo } from './AuthShell';
import DOBPicker from './DOBPicker';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';
const labelClass = 'mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400';
const iconClass = 'pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300';

export default function RegisterPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState<'individual' | 'company'>('individual');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [position, setPosition] = useState('');
  const [customPosition, setCustomPosition] = useState('');
  const [country, setCountry] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const company = accountType === 'company';

  useEffect(() => {
    if (user && !loading) navigate('/', { replace: true });
  }, [loading, navigate, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const effectivePosition = position === 'OTHER' ? customPosition.trim() : position;
    if (password !== confirmPassword) return setMessage({ type: 'error', text: 'Passwords do not match.' });
    if (!name.trim() || !email.trim() || !phone.trim() || !dob || !effectivePosition || !country) return setMessage({ type: 'error', text: 'Please complete all required fields.' });
    if (company && !companyName.trim()) return setMessage({ type: 'error', text: 'Please enter your company name.' });
    if (!agreedToTerms) return setMessage({ type: 'error', text: 'You must agree to the Terms of Service, Privacy Policy and Disclaimer.' });

    setLoading(true);
    setMessage(null);
    try {
      const result = await signUp({ email, password, fullName: name, accountType, companyName, phone, position: effectivePosition, dob, country, agreedToTerms });
      if (result.session) {
        setMessage({ type: 'success', text: 'Your account has been created.' });
        navigate('/', { replace: true });
      } else {
        setMessage({ type: 'success', text: 'Sign up successful. Please check your email to confirm your account.' });
      }
    } catch (caught) {
      setMessage({ type: 'error', text: caught instanceof Error ? caught.message : 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  }

  if (user && !loading) return null;

  return (
    <AuthShell>
      <header className="mb-8 text-left"><AuthLogo /><h1 className="text-3xl font-black tracking-tighter text-slate-900">Create Account</h1><p className="mt-2 text-sm font-semibold leading-relaxed text-slate-500">Understand your clinic costs and build a more profitable dental practice.</p></header>
      <p className={labelClass}>Account Type</p>
      <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200">
        <button type="button" onClick={() => setAccountType('individual')} className={`flex items-center justify-center gap-2 py-3 text-sm font-bold ${!company ? 'bg-teal-600 text-white' : 'bg-white text-slate-500'}`}><User size={16} />Individual</button>
        <button type="button" onClick={() => setAccountType('company')} className={`flex items-center justify-center gap-2 border-l border-slate-200 py-3 text-sm font-bold ${company ? 'bg-teal-600 text-white' : 'bg-white text-slate-500'}`}><Building2 size={16} />Company</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {company && <AuthField label="Company Name" icon={<Building2 className={iconClass} />}><input className={inputClass} value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="e.g. DENTA TECH" required /></AuthField>}
        {company && <AuthField label="Company Email" icon={<Mail className={iconClass} />}><input type="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="e.g. hello@denta.tech" required /></AuthField>}
        <AuthField label={company ? 'Name' : 'Your Name'} icon={<User className={iconClass} />}><input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder={company ? 'Contact Name' : 'e.g. Nour AYACHE'} required autoComplete="name" /></AuthField>
        {!company && <AuthField label="Your Email" icon={<Mail className={iconClass} />} help="This will be your login email."><input type="email" className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="e.g. nur@email.com" required autoComplete="email" /></AuthField>}
        <AuthField label={company ? 'Phone' : 'Phone (WhatsApp)'} icon={<Phone className={iconClass} />}><input type="tel" className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +60123456789" required autoComplete="tel" /></AuthField>
        <div><label className={labelClass}>Date of Birth</label><DOBPicker value={dob} onChange={setDob} />{company && <p className="mt-1 text-[10px] text-slate-400">Date of birth of the company representative.</p>}</div>
        <AuthField label="Job Position" icon={<Briefcase className={iconClass} />}><span className="relative block"><select className={`${inputClass} appearance-none pr-10`} value={position} onChange={(event) => setPosition(event.target.value)} required><option value="">-- Select Position --</option>{DENTAL_POSITIONS.map((item) => <option key={item} value={item}>{item}</option>)}<option value="OTHER">Other</option></select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" /></span></AuthField>
        {position === 'OTHER' && <AuthField label="Specify Position" icon={<Briefcase className={iconClass} />}><input className={inputClass} value={customPosition} onChange={(event) => setCustomPosition(event.target.value)} placeholder="e.g. Clinic Manager" required /></AuthField>}
        <AuthField label="Country" icon={<Globe2 className={iconClass} />}><span className="relative block"><select className={`${inputClass} appearance-none pr-10`} value={country} onChange={(event) => setCountry(event.target.value)} required><option value="">-- Select Country --</option>{COUNTRIES.map(([id, countryName]) => <option key={id} value={id}>{countryName}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" /></span></AuthField>
        <AuthField label="Password" icon={<ShieldCheck className={iconClass} />}><input type="password" className={inputClass} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required minLength={6} autoComplete="new-password" /></AuthField>
        <AuthField label="Confirm Password" icon={<ShieldCheck className={iconClass} />}><input type="password" className={inputClass} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" required minLength={6} autoComplete="new-password" /></AuthField>
        <label className="flex items-start gap-2 text-[11px] text-slate-500"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-teal-600" checked={agreedToTerms} onChange={(event) => setAgreedToTerms(event.target.checked)} required /><span>I agree to the <a className="font-semibold text-teal-600 hover:underline" href="https://app.snabbb.com/terms" target="_blank" rel="noreferrer">Terms of Service</a>, <a className="font-semibold text-teal-600 hover:underline" href="https://app.snabbb.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a className="font-semibold text-teal-600 hover:underline" href="https://app.snabbb.com/disclaimer" target="_blank" rel="noreferrer">Disclaimer</a>.</span></label>
        {message && <p role="alert" className={`rounded-xl border px-4 py-3 text-sm font-medium ${message.type === 'error' ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}>{message.text}</p>}
        <button type="submit" disabled={loading} className="mt-2 rounded-xl bg-slate-900 py-3 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">{loading ? 'Signing up…' : 'Sign up'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-teal-600 hover:underline">Log in</Link></p>
    </AuthShell>
  );
}

function AuthField({ label, icon, help, children }: { label: string; icon: React.ReactNode; help?: string; children: React.ReactNode }) {
  return <div><label className={labelClass}>{label}</label><div className="relative">{icon}{children}</div>{help && <p className="mt-0.5 text-[10px] text-slate-400">{help}</p>}</div>;
}
