import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  ShieldCheck,
  AlertTriangle,
  Umbrella,
  Droplets,
  PlusCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { EmployerDashboardSummary, Worksite } from '../types';

export const EmployerDashboardPage: React.FC = () => {
  const { t } = useLanguage();

  const [summary, setSummary] = useState<EmployerDashboardSummary | null>(null);
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sum, sites] = await Promise.all([
          api.getEmployerDashboard(1),
          api.getWorksites(1)
        ]);
        setSummary(sum);
        setWorksites(sites);
      } catch (err) {
        console.error('Employer dashboard error', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Building className="w-4 h-4" />
            <span>ORGANISATION SAFETY MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('employer_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organisation: <strong>{summary?.organisation.name || 'Chennai Metro Rail Construction Infra'}</strong> • Code: {summary?.organisation.registration_code}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/incidents"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('employer_report_incident')}</span>
          </Link>

          <Link
            to="/worksites"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Worksites</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Safety Compliance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {summary?.safety_compliance_score ?? 100}%
          </div>
          <div className="text-[11px] text-slate-500">Based on shade & water access</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Monitored Workers</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {summary?.total_workers_monitored ?? 45}
          </div>
          <div className="text-[11px] text-slate-500">Across {worksites.length} registered sites</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Shade Coverage</span>
            <Umbrella className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">
            {summary?.worksites_with_shade_coverage_pct ?? 100}%
          </div>
          <div className="text-[11px] text-slate-500">Sites equipped with resting sheds</div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Open Incident Logs</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400">
            {summary?.open_incidents_count ?? 0}
          </div>
          <div className="text-[11px] text-slate-500">Heat exhaustion / near-miss reports</div>
        </div>
      </div>

      {/* Registered Worksites List */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Active Registered Worksites</h3>
          <Link to="/worksites" className="text-xs text-blue-400 hover:underline">
            Manage All Worksites
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worksites.map((site) => (
            <div
              key={site.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-white">{site.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{site.address}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300">
                  {site.worker_count} Workers
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Umbrella className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Shade Canopy: {site.has_shaded_rest_area ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Potable Water: {site.has_potable_water ? 'Yes' : 'No'}</span>
                </div>
              </div>

              {site.safety_lead_name && (
                <div className="text-[11px] text-slate-400">
                  Site Safety Officer: <strong>{site.safety_lead_name}</strong> ({site.safety_lead_phone})
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Incidents Log */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Heat Safety Incident & Near-Miss Log</h3>
          <Link to="/incidents" className="text-xs text-rose-400 hover:underline">
            File Incident Report
          </Link>
        </div>

        {summary?.recent_incidents.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No heat exhaustion incidents or near-misses recorded. Safety protocols are operating smoothly.
          </div>
        ) : (
          <div className="space-y-3">
            {summary?.recent_incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-rose-400 uppercase">{inc.incident_type}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      Severity: {inc.severity}
                    </span>
                  </div>
                  <p className="text-slate-300">{inc.symptoms}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-slate-500">
                    {new Date(inc.created_at).toLocaleDateString()}
                  </div>
                  <span className="text-[11px] text-emerald-400">Status: {inc.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
