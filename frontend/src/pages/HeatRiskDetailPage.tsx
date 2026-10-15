import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Thermometer,
  Sun,
  ShieldAlert,
  Info,
  AlertTriangle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { HeatRiskAssessment } from '../types';
import { HeatRiskBadge } from '../components/HeatRiskBadge';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

export const HeatRiskDetailPage: React.FC = () => {
  const { t } = useLanguage();
  const { latitude, longitude, cityName } = useLocation();

  const [heatRisk, setHeatRisk] = useState<HeatRiskAssessment | null>(null);
  const [history, setHistory] = useState<HeatRiskAssessment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [hr, hist] = await Promise.all([
          api.getHeatRisk(latitude, longitude, 'outdoor_worker'),
          api.getHeatRiskHistory(latitude, longitude)
        ]);
        setHeatRisk(hr);
        setHistory(hist);
      } catch (err) {
        console.error('Heat risk detail fetch failed', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [latitude, longitude]);

  // Chart data formatting
  const chartData = history.map((item, i) => {
    const timeLabel = item.timestamp.includes('T')
      ? item.timestamp.split('T')[1].slice(0, 5)
      : `${i * 2}:00`;
    return {
      time: timeLabel,
      Temperature: item.air_temperature_c,
      HeatIndex: item.heat_index_c,
      WBGT: item.wbgt_estimated_c ?? null
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <Layers className="w-4 h-4" />
          <span>SCIENTIFIC HEAT ENGINE METRICS</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Heat Risk & WBGT Methodology Analysis
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Location: {cityName} • Transparent deterministic biometeorological evaluation
        </p>
      </div>

      {/* Hourly Curve Chart */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">
              Diurnal Thermal Curve (Air Temp vs. Felt Heat Index)
            </h3>
            <p className="text-xs text-slate-400">
              Generated via Open-Meteo hourly meteorological timeline for {cityName}.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-mono">24h Projection</div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis unit="°C" stroke="#94a3b8" fontSize={11} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f8fafc'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="Temperature"
                name="Air Temp (°C)"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="HeatIndex"
                name="NOAA Heat Index (°C)"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Deep Dive: NOAA Heat Index vs WBGT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <Sun className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">NOAA Heat Index (Steadman)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Measures how hot it feels to the human body when relative humidity is combined with the air temperature in shaded conditions. It assumes light physical activity in the shade with light wind.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300/90">
            Current: {heatRisk?.heat_index_c}°C (Rothfusz 9-parameter polynomial with humidity bounds)
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Wet Bulb Globe Temp (WBGT)</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The gold-standard occupational heat stress metric (ISO 7243 & OSHA). It accounts for 4 variables: temperature, humidity, wind velocity, and solar radiative load.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
            <div className="text-xs text-slate-200">
              Status:{' '}
              <strong className={heatRisk?.wbgt_is_available ? 'text-purple-300' : 'text-slate-400'}>
                {heatRisk?.wbgt_is_available ? `${heatRisk.wbgt_estimated_c}°C (Active)` : 'Not Calculated'}
              </strong>
            </div>
            <div className="text-[11px] text-slate-400">{heatRisk?.wbgt_method}</div>
          </div>
        </div>
      </div>

      {/* Scientific Limitations and Assumptions Box */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs text-slate-300 leading-relaxed">
        <div className="flex items-center gap-2 text-sm font-bold text-white">
          <Info className="w-4 h-4 text-sky-400" />
          <span>Documentation of Assumptions & Data Limitations</span>
        </div>
        <p>
          <strong>1. Sensor Altitude & Exposure:</strong> Meteorological stations sample air temperature at 2 metres above natural ground. Surfaces with dark asphalt, tar roofs, or unshaded granite can radiate up to 8°C - 12°C higher localized thermal radiation.
        </p>
        <p>
          <strong>2. Acclimatization Factor:</strong> Unacclimatized workers (such as newly arrived seasonal migrants or returning workers) face higher physiological strain even at moderate WBGT readings below 28°C.
        </p>
        <p>
          <strong>3. Microclimate Variances:</strong> Enclosed workspaces lacking active mechanical ventilation significantly trap humidity and radiant heat, rendering outdoor weather readings an underestimate.
        </p>
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
