import React, { useEffect, useState } from 'react';
import {
  Droplets,
  PlusCircle,
  Clock,
  CheckCircle,
  Pause,
  Play,
  RotateCcw,
  AlertCircle,
  Check,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { HydrationReminder, HydrationSummary } from '../types';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const HydrationPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [reminders, setReminders] = useState<HydrationReminder[]>([]);
  const [summary, setSummary] = useState<HydrationSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [intakeSuccessMsg, setIntakeSuccessMsg] = useState<string | null>(null);
  const [customMl, setCustomMl] = useState<number>(250);

  const loadHydrationData = async () => {
    try {
      const [rems, sum] = await Promise.all([
        api.getHydrationReminders(),
        api.getHydrationSummary()
      ]);
      setReminders(rems);
      setSummary(sum);
    } catch (err) {
      console.warn('Hydration data fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHydrationData();
  }, []);

  const handleLogIntake = async (amount: number) => {
    if (reminders.length === 0) return;
    try {
      await api.acknowledgeReminder(reminders[0].id, amount);
      setIntakeSuccessMsg(`Logged ${amount} mL drink! Great job maintaining hydration.`);
      setTimeout(() => setIntakeSuccessMsg(null), 3500);
      loadHydrationData();
    } catch (err) {
      console.error('Failed to acknowledge reminder', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
          <Droplets className="w-4 h-4" />
          <span>PHYSIOLOGICAL FLUID SUPPORT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('hydration_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Context-aware drinking water guidance tailored to work duration and ambient heat stress.
        </p>
      </div>

      {/* Success Banner */}
      {intakeSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{intakeSuccessMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">{t('hydration_intake_today')}</span>
          <div className="text-3xl font-black text-cyan-400">
            {summary?.total_intake_today_ml ?? 0} mL
          </div>
          <div className="text-[11px] text-slate-500">
            {summary?.acknowledgements_count ?? 0} confirmed intake intervals
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Reminder Cadence</span>
          <div className="text-3xl font-black text-amber-400">
            {reminders[0]?.interval_minutes ?? 45} mins
          </div>
          <div className="text-[11px] text-slate-500">
            Target per break: {reminders[0]?.target_sip_ml ?? 250} mL
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <span className="text-xs text-slate-400">Status & Schedule</span>
          <div className="text-2xl font-bold text-emerald-400">
            {reminders[0]?.is_active ? 'Active & Running' : 'Paused'}
          </div>
          <div className="text-[11px] text-slate-500">
            Quiet hours active: 10:00 PM – 06:00 AM
          </div>
        </div>
      </div>

      {/* Quick Intake Logging Action Bar */}
      <div className="glass-panel-elevated rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Quick Log Potable Water Consumption</span>
        </h3>
        <p className="text-xs text-slate-300">
          Drinking water steadily in moderate volumes (200mL–300mL) every 20–30 minutes avoids gastric distension and maintains optimal plasma volume.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => handleLogIntake(250)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-950 transition-transform active:scale-95"
          >
            <Droplets className="w-4 h-4" />
            <span>+ 250 mL (1 Cup)</span>
          </button>

          <button
            onClick={() => handleLogIntake(350)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-700/60 text-cyan-200 font-semibold text-xs transition-colors"
          >
            <Droplets className="w-4 h-4" />
            <span>+ 350 mL</span>
          </button>

          <button
            onClick={() => handleLogIntake(500)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-700/60 text-cyan-200 font-semibold text-xs transition-colors"
          >
            <Droplets className="w-4 h-4" />
            <span>+ 500 mL (Half Litre)</span>
          </button>
        </div>
      </div>

      {/* Curated Guidance Banner */}
      {summary && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Occupational Hydration Guidance
          </h4>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-tamil">
            {language === 'ta' ? summary.hydration_guidance_ta : summary.hydration_guidance_en}
          </p>
        </div>
      )}

      <MedicalDisclaimer />
    </div>
  );
};
