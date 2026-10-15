import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Server,
  CheckCircle,
  AlertTriangle,
  Users,
  Database,
  History,
  Activity,
  FileCheck,
  Building
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Facility } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadAdminData = async () => {
    try {
      const [s, facs, logs] = await Promise.all([
        api.getAdminStats(),
        api.getNearbyFacilities(13.0827, 80.2707, 100),
        api.getAuditLogs()
      ]);
      setStats(s);
      setFacilities(facs);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Admin data load error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerify = async (facilityId: number, status: string) => {
    try {
      await api.verifyFacility(facilityId, status, 'Verified by State Health Administrator');
      setActionSuccess(`Updated facility status to ${status}`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
          <ShieldAlert className="w-4 h-4" />
          <span>HEALTH & DISASTER MITIGATION ADMINISTRATION</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('admin_title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          State-wide facility verification, audit telemetry, and heat intervention logging.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>System Status</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400">
            {stats?.system_health_status ?? 'Operational'}
          </div>
          <div className="text-[11px] text-slate-500">
            Uptime: {stats?.uptime_seconds ? `${Math.round(stats.uptime_seconds)}s` : 'Active'}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Facilities</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {stats?.total_facilities ?? facilities.length}
          </div>
          <div className="text-[11px] text-slate-500">
            Verified safe: {stats?.verified_facilities ?? 8}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Organisations & Sites</span>
            <Building className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {stats?.total_worksites ?? 2} Sites
          </div>
          <div className="text-[11px] text-slate-500">
            Enrolled: {stats?.total_organisations ?? 1} orgs
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Weather Cache</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-400">
            {stats?.active_weather_cache_entries ?? 1} feeds
          </div>
          <div className="text-[11px] text-slate-500">10-min memory cache</div>
        </div>
      </div>

      {/* Facilities Verification Queue */}
      <div className="glass-panel-elevated rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            Drinking Water & Relief Facility Verification Queue
          </h3>
          <span className="text-xs text-slate-400">{facilities.length} recorded items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Facility Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">City / Address</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {facilities.map((fac) => (
                <tr key={fac.id} className="hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-white">{fac.name}</td>
                  <td className="p-3 text-slate-400">{fac.category.replace('_', ' ')}</td>
                  <td className="p-3 text-slate-400 truncate max-w-xs">{fac.address || fac.city}</td>
                  <td className="p-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        fac.verification_status === 'verified'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : fac.verification_status === 'temporarily_unavailable'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {fac.verification_status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {fac.verification_status !== 'verified' && (
                      <button
                        onClick={() => handleVerify(fac.id, 'verified')}
                        className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px]"
                      >
                        Verify Safe
                      </button>
                    )}
                    {fac.verification_status !== 'temporarily_unavailable' && (
                      <button
                        onClick={() => handleVerify(fac.id, 'temporarily_unavailable')}
                        className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-[11px]"
                      >
                        Mark Dry/Broken
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-white text-base">System Audit & Security Trail</h3>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <span className="font-mono text-amber-400">{log.action}</span>
                <span className="text-slate-400 ml-2">by {log.actor_email || 'System'}</span>
                <p className="text-[11px] text-slate-300">{log.details}</p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {new Date(log.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
