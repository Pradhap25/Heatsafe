import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
          <Flame className="w-6 h-6 text-slate-950 fill-slate-950" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Sign In to HeatSafe AI</h1>
        <p className="text-xs text-slate-400">Access your heat safety dashboard and hydration schedule</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quick Demo Logins for Testing */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
          One-Click Demo Credentials:
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('worker@heatsafe.ai', 'WorkerSafe@2026')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold text-center border border-slate-700 transition-colors"
          >
            Worker
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('supervisor@chennaibuild.com', 'Supervisor@2026')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 text-[11px] font-semibold text-center border border-slate-700 transition-colors"
          >
            Employer
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@heatsafe.ai', 'AdminSafety@2026')}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[11px] font-semibold text-center border border-slate-700 transition-colors"
          >
            Admin
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="worker@heatsafe.ai"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-2"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-center text-xs text-slate-400 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-amber-400 hover:underline font-semibold">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};
