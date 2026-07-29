import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthShell, { AuthLogo } from './AuthShell';

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 transition focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20';
const labelClass = 'mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400';

export default function LoginPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('snabbb_remembered_email');
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [navigate, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (rememberMe) localStorage.setItem('snabbb_remembered_email', email.trim());
      else localStorage.removeItem('snabbb_remembered_email');
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  if (user) return null;

  return (
    <AuthShell centered>
      <header className="mb-8 text-left"><AuthLogo /><h1 className="text-3xl font-black tracking-tighter text-slate-900">Welcome Back</h1></header>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div><label htmlFor="login-email" className={labelClass}>Email</label><input id="login-email" type="email" className={inputClass} placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></div>
        <div><div className="mb-1 flex items-center justify-between"><label htmlFor="login-password" className={labelClass}>Password</label><button type="button" onClick={() => setError('Password reset is not implemented yet.')} className="text-[10px] font-bold text-teal-600 hover:underline">Forgot Password?</button></div><input id="login-password" type="password" className={inputClass} placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></div>
        <label className="flex items-center"><input type="checkbox" className="h-4 w-4 accent-teal-600" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span className="ml-2 text-[11px] text-slate-500">Remember me</span></label>
        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <button type="submit" disabled={loading} className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-base font-bold text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400">{loading ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500"><Link to="/register" className="font-bold text-teal-600 hover:underline">Don&apos;t have an account? Sign up</Link></p>
    </AuthShell>
  );
}

