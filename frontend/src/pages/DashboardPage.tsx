import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  ShieldAlert,
  Clock,
  Compass,
  AlertTriangle,
  RotateCw,
  MapPin,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { HeatRiskAssessment, WeatherResponse, Facility } from '../types';
import { HeatRiskBadge } from '../components/HeatRiskBadge';
import { WorkRestCycleCard } from '../components/WorkRestCycleCard';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const DashboardPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { latitude, longitude, cityName, requestGeolocation, isGeolocationActive } = useLocation();

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [heatRisk, setHeatRisk] = useState<HeatRiskAssessment | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<string>('outdoor_worker');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, hr, facs] = await Promise.all([
        api.getCurrentWeather(latitude, longitude),
        api.getHeatRisk(latitude, longitude, activity),
        api.getNearbyFacilities(latitude, longitude, 15)
      ]);
      setWeather(w);
      setHeatRisk(hr);
      setFacilities(facs.slice(0, 4));
    } catch (err: any) {
      setError(err.message || 'Unable to load real-time meteorological observations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [latitude, longitude, activity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header with Location & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>LIVE REGIONAL MONITORING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('nav_dashboard')} — {cityName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamil Nadu, India • Lat: {latitude.toFixed(4)}, Lon: {longitude.toFixed(4)}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Activity Category Filter */}
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="outdoor_worker">Heavy Construction / Masonry</option>
            <option value="farmer">Agricultural / Field Labor</option>
            <option value="delivery">Delivery / Courier Driver</option>
            <option value="traffic_police">Traffic Police / Guard</option>
            <option value="athlete">Student / Sports Athlete</option>
            <option value="general_public">General Public Exposure</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error state if any */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchData}
            className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-700 text-white font-medium text-xs ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* Primary Risk Status Bar */}
      {heatRisk && (
        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Current Threat Level
                </span>
                {weather?.is_cached && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Cached Observation
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <HeatRiskBadge
                  levelCode={heatRisk.risk_level_code}
                  category={heatRisk.risk_category}
                  size="lg"
                />
                <span className="text-xs text-slate-400">
                  Activity Context: <strong>{activity.replace('_', ' ')}</strong>
                </span>
              </div>
            </div>

            <div className="text-right space-y-1">
              <div className="text-xs text-slate-400">Telemetry Retrieved:</div>
              <div className="text-sm font-mono text-slate-200">
                {weather?.retrieved_at ? new Date(weather.retrieved_at).toLocaleTimeString() : 'Live'}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Source: {weather?.data_source}
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="py-4 text-sm text-slate-200 leading-relaxed">
            {heatRisk.explanation}
          </div>

          {/* Environmental Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Air Temp</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {heatRisk.air_temperature_c}°C
              </div>
              <div className="text-[10px] text-slate-500">2m Above Ground</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Humidity</span>
              </div>
              <div className="text-xl font-bold text-cyan-200 mt-1">
                {heatRisk.relative_humidity_pct}%
              </div>
              <div className="text-[10px] text-slate-500">Dew Point: {heatRisk.dew_point_c}°C</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind Speed</span>
              </div>
              <div className="text-xl font-bold text-teal-200 mt-1">
                {heatRisk.wind_speed_kmh} km/h
              </div>
              <div className="text-[10px] text-slate-500">Convective flow</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Solar Flux</span>
              </div>
              <div className="text-xl font-bold text-amber-300 mt-1">
                {heatRisk.solar_radiation_wm2 !== null && heatRisk.solar_radiation_wm2 !== undefined
                  ? `${heatRisk.solar_radiation_wm2} W/m²`
                  : 'N/A'}
              </div>
              <div className="text-[10px] text-slate-500">Direct Normal Irradiance</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                <span>Heat Index</span>
              </div>
              <div className="text-xl font-bold text-orange-300 mt-1">
                {heatRisk.heat_index_c}°C
              </div>
              <div className="text-[10px] text-slate-500">NOAA Rothfusz Model</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Thermometer className="w-3.5 h-3.5 text-purple-400" />
                <span>WBGT Metric</span>
              </div>
              <div className="text-xl font-bold text-purple-300 mt-1">
                {heatRisk.wbgt_is_available ? `${heatRisk.wbgt_estimated_c}°C` : 'Unavailable'}
              </div>
              <div className="text-[10px] text-slate-500 truncate" title={heatRisk.wbgt_method}>
                {heatRisk.wbgt_is_available ? 'Liljegren Stull' : 'Solar data required'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work-Rest Cycle & Precautions Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {heatRisk && <WorkRestCycleCard recommendation={heatRisk.work_rest_cycle} />}

        {/* Recommended Precautions (Bilingual) */}
        {heatRisk && (
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">
                Safety Recommendations / பாதுகாப்பு வழிமுறைகள்
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {language === 'ta' ? 'தமிழ்' : 'English'}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              {(language === 'ta' ? heatRisk.precautions_ta : heatRisk.precautions_en).map((p, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{p}</span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Need immediate voice guidance?</span>
              <Link
                to="/assistant"
                className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1"
              >
                <span>Ask Voice Assistant</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Facilities Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Verified Drinking Water & Shaded Rest Near You
            </h3>
            <p className="text-xs text-slate-400">
              Community and municipal heat-relief infrastructure within walking/driving distance.
            </p>
          </div>
          <Link
            to="/facilities"
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <span>View All & Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {facilities.map((fac) => (
            <div
              key={fac.id}
              className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-amber-300">
                    {fac.category === 'drinking_water'
                      ? '💧 Water Kiosk'
                      : fac.category === 'shaded_rest'
                      ? '⛱️ Shaded Canopy'
                      : '🏥 Relief Centre'}
                  </span>
                  {fac.distance_km && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {fac.distance_km} km
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-sm text-white mt-1 line-clamp-1">{fac.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{fac.address || fac.city}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-400 font-medium">
                  {fac.verification_status === 'verified' ? '✓ Verified Safe' : 'Community Point'}
                </span>
                <a
                  href={fac.directions_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 text-xs"
                >
                  <span>Directions</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <MedicalDisclaimer />
    </div>
  );
};
