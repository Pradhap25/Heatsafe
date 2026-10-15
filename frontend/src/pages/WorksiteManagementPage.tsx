import React, { useState, useEffect } from 'react';
import { Building, PlusCircle, MapPin, Umbrella, Droplets, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { Worksite } from '../types';

export const WorksiteManagementPage: React.FC = () => {
  const [worksites, setWorksites] = useState<Worksite[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('13.0827');
  const [lon, setLon] = useState('80.2707');
  const [workType, setWorkType] = useState('Civil & Structural Construction');
  const [workerCount, setWorkerCount] = useState(25);
  const [hasShade, setHasShade] = useState(true);
  const [hasWater, setHasWater] = useState(true);
  const [safetyLead, setSafetyLead] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const loadSites = async () => {
    try {
      const data = await api.getWorksites(1);
      setWorksites(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createWorksite(1, {
        name,
        address,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        work_type: workType,
        worker_count: workerCount,
        has_shaded_rest_area: hasShade,
        has_potable_water: hasWater,
        safety_lead_name: safetyLead
      });
      setSuccess('Worksite successfully registered and added to monitoring roster!');
      setTimeout(() => setSuccess(null), 3000);
      setName('');
      setAddress('');
      setSafetyLead('');
      loadSites();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Worksite Safety Registration</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Register outdoor worksites to automatically track regional heat-stress index and shade compliance.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Form */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-base">Register New Outdoor Worksite</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Worksite Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Highway Flyover Segment 4"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Street Address / Site Landmark</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., GST Road, Tambaram, Chennai"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Latitude</label>
            <input
              type="number"
              step="0.0001"
              required
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Longitude</label>
            <input
              type="number"
              step="0.0001"
              required
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Worker Count Exposed</label>
            <input
              type="number"
              required
              value={workerCount}
              onChange={(e) => setWorkerCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Safety Officer In-Charge</label>
            <input
              type="text"
              value={safetyLead}
              onChange={(e) => setSafetyLead(e.target.value)}
              placeholder="Officer Name"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-6 md:col-span-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasShade}
                onChange={(e) => setHasShade(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-500"
              />
              <span>Has Dedicated Shaded Rest Canopy</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasWater}
                onChange={(e) => setHasWater(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-blue-500"
              />
              <span>Has Clean Potable Drinking Water On-Site</span>
            </label>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Add Worksite to Dashboard
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-bold text-white text-base">Active Registered Sites ({worksites.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {worksites.map((site) => (
            <div key={site.id} className="p-4 rounded-2xl glass-panel border border-slate-800 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-white">{site.name}</h4>
                <span className="text-xs text-blue-400 font-semibold">{site.worker_count} workers</span>
              </div>
              <p className="text-xs text-slate-400">{site.address}</p>
              <div className="flex items-center gap-4 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <span>Shade: {site.has_shaded_rest_area ? '✓ Yes' : '✗ No'}</span>
                <span>Water: {site.has_potable_water ? '✓ Yes' : '✗ No'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
