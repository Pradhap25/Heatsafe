import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Droplets,
  MapPin,
  Mic,
  Shield,
  Building,
  ArrowRight,
  Sun,
  Activity,
  HeartPulse,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { HeatRiskAssessment, WeatherResponse } from '../types';
import { HeatRiskBadge } from '../components/HeatRiskBadge';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { latitude, longitude, cityName } = useLocation();

  const [heatRisk, setHeatRisk] = useState<HeatRiskAssessment | null>(null);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadQuickData() {
      try {
        const [w, hr] = await Promise.all([
          api.getCurrentWeather(latitude, longitude),
          api.getHeatRisk(latitude, longitude, 'outdoor_worker')
        ]);
        setWeather(w);
        setHeatRisk(hr);
      } catch (err) {
        console.warn('Landing page data fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuickData();
  }, [latitude, longitude]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/10 via-orange-500/10 to-rose-500/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Tamil Nadu Climate Resilience & Heat Safety Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Protecting Outdoor Workers From Extreme Thermal Stress with{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              Intelligent Safety & Hydration
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Real-time heat-risk guidance, context-aware hydration reminders, verified drinking-water discovery, and Tamil/English voice safety assistance for high-heat environments.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
            >
              <span>Launch Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/facilities"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-colors"
            >
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span>Find Water & Shade Kiosks</span>
            </Link>

            <Link
              to="/assistant"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-semibold text-sm transition-colors"
            >
              <Mic className="w-4 h-4" />
              <span>குரல் உதவியாளர் (Voice Assistant)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Region Heat Snapshot Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                <MapPin className="w-4 h-4" />
                <span>Current Observation Location:</span>
                <strong className="text-slate-200">{cityName}, Tamil Nadu</strong>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Real-Time Atmospheric Heat Stress Snapshot
              </h2>
            </div>
            {heatRisk && (
              <HeatRiskBadge
                levelCode={heatRisk.risk_level_code}
                category={heatRisk.risk_category}
                size="lg"
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium">Air Temperature</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {weather?.current.temperature_c ?? '--'}°C
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Dry Bulb Ambient</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium">Relative Humidity</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 mt-1">
                {weather?.current.relative_humidity_pct ?? '--'}%
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Atmospheric moisture</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium">NOAA Heat Index</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1">
                {heatRisk?.heat_index_c ?? '--'}°C
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Felt thermal strain</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium">Outdoor WBGT</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 mt-1">
                {heatRisk?.wbgt_is_available ? `${heatRisk.wbgt_estimated_c}°C` : 'N/A'}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {heatRisk?.wbgt_is_available ? 'Solar-wind validated' : 'Direct solar missing'}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-300">
              <strong>Work-Rest Cycle (OSHA):</strong>{' '}
              {heatRisk?.work_rest_cycle
                ? `${heatRisk.work_rest_cycle.work_minutes_per_hour}m Work / ${heatRisk.work_rest_cycle.rest_minutes_per_hour}m Shade Rest (${heatRisk.work_rest_cycle.water_intake_recommended_ml_per_hour} mL/hr water)`
                : 'Loading occupational protocol...'}
            </div>
            <Link
              to="/dashboard"
              className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 shrink-0"
            >
              <span>Detailed Breakdown</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Prominent Medical Disclaimer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <MedicalDisclaimer />
      </section>

      {/* Target User Groups */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Tailored For Those Facing Direct Sun & Heat
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Configurable safety thresholds and hydration guidance suited to specific metabolic demands.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🏗️
            </div>
            <h3 className="font-bold text-white text-base">Construction Workers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mandatory work-rest cycles for steel reinforcement, masonry, and scaffolding workers exposed to asphalt and direct sun.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              🌾
            </div>
            <h3 className="font-bold text-white text-base">Farmers & Field Labor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tamil voice safety instructions and warnings for high solar radiation hours in agricultural districts.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              🛵
            </div>
            <h3 className="font-bold text-white text-base">Delivery & Traffic Police</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Map of verified water refill points and shaded rest centers across Chennai, Madurai, Coimbatore, and Salem.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3 hover:border-amber-500/50 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              🏢
            </div>
            <h3 className="font-bold text-white text-base">Employers & Supervisors</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Site-level heat index tracking, shade coverage audits, potable water availability compliance, and incident logging.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
