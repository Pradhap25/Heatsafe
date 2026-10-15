import React, { useState } from 'react';
import { User, Bell, Globe, Shield, Clock, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';

export const ProfileSettingsPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [workplace, setWorkplace] = useState(user?.workplace_or_org || '');
  const [alertsEnabled, setAlertsEnabled] = useState(user?.preferences?.high_heat_alerts ?? true);
  const [browserNotifs, setBrowserNotifs] = useState(user?.preferences?.browser_notifications ?? true);
  const [intervalMins, setIntervalMins] = useState(user?.preferences?.reminder_interval_mins ?? 45);
  const [quietHoursStart, setQuietHoursStart] = useState(user?.preferences?.quiet_hours_start || '22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState(user?.preferences?.quiet_hours_end || '06:00');
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({
        full_name: fullName,
        workplace_or_org: workplace,
        preferred_language: language,
        preferences: {
          high_heat_alerts: alertsEnabled,
          browser_notifications: browserNotifs,
          audio_alerts: false,
          reminder_interval_mins: intervalMins,
          quiet_hours_enabled: true,
          quiet_hours_start: quietHoursStart,
          quiet_hours_end: quietHoursEnd
        }
      });
      await refreshUser();
      setSuccess('Profile and notification preferences updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <User className="w-4 h-4" />
          <span>ACCOUNT & PREFERENCES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('nav_profile')} & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage your personal heat alert thresholds, hydration schedule, and preferred language.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Assigned Role</label>
              <input
                type="text"
                disabled
                value={user?.role?.toUpperCase() || ''}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Workplace / Site</label>
              <input
                type="text"
                value={workplace}
                onChange={(e) => setWorkplace(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Language & Interface
          </h3>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                language === 'ta'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                language === 'en'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 border border-slate-800'
              }`}
            >
              English
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
            Notifications & Quiet Hours
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-200">High Heat Stress Notifications</span>
              <input
                type="checkbox"
                checked={alertsEnabled}
                onChange={(e) => setAlertsEnabled(e.target.checked)}
                className="rounded bg-slate-800 text-amber-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-xs text-slate-200">Hydration Break Reminders</span>
              <input
                type="checkbox"
                checked={browserNotifs}
                onChange={(e) => setBrowserNotifs(e.target.checked)}
                className="rounded bg-slate-800 text-cyan-500"
              />
            </label>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quiet Hours Start</label>
                <input
                  type="time"
                  value={quietHoursStart}
                  onChange={(e) => setQuietHoursStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Quiet Hours End</label>
                <input
                  type="time"
                  value={quietHoursEnd}
                  onChange={(e) => setQuietHoursEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
