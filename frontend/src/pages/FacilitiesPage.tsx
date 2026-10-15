import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Droplets,
  Umbrella,
  Search,
  ExternalLink,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Compass,
  X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { api } from '../services/api';
import { Facility, FacilityCategory } from '../types';
import { FacilityMap } from '../components/FacilityMap';

export const FacilitiesPage: React.FC = () => {
  const { t } = useLanguage();
  const { latitude, longitude, cityName } = useLocation();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string>('verified_working');
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reportFeedback, setReportFeedback] = useState<string | null>(null);

  // New facility form
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<FacilityCategory>('drinking_water');
  const [newAddress, setNewAddress] = useState('');

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const data = await api.getNearbyFacilities(latitude, longitude, radiusKm, selectedCategory || undefined);
      setFacilities(data);
      if (data.length > 0) {
        setSelectedFacility(data[0]);
      }
    } catch (err) {
      console.error('Failed to load facilities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFacilities();
  }, [latitude, longitude, radiusKm, selectedCategory]);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    try {
      await api.reportFacilityIssue(selectedFacility.id, reportType, reportDescription);
      setReportFeedback('Report submitted. Thank you for helping keep community water points reliable.');
      setTimeout(() => {
        setReportFeedback(null);
        setReportModalOpen(false);
        setReportDescription('');
      }, 2500);
      loadFacilities();
    } catch (err) {
      console.error('Failed to submit report', err);
    }
  };

  const handleAddFacilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    try {
      await api.submitNewFacility({
        name: newName,
        category: newCategory,
        latitude: latitude,
        longitude: longitude,
        address: newAddress || `${cityName}, Tamil Nadu`,
        city: cityName
      });
      setAddModalOpen(false);
      setNewName('');
      setNewAddress('');
      loadFacilities();
    } catch (err) {
      console.error('Failed to create facility', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Droplets className="w-4 h-4" />
            <span>COMMUNITY RELIEF INFRASTRUCTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {t('facilities_title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Centered near {cityName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 transition-transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('facility_submit_new')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mr-2">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Filter:</span>
        </div>

        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === '' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {t('facility_filter_all')}
        </button>

        <button
          onClick={() => setSelectedCategory('drinking_water')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === 'drinking_water' ? 'bg-blue-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          💧 {t('facility_filter_water')}
        </button>

        <button
          onClick={() => setSelectedCategory('shaded_rest')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === 'shaded_rest' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          ⛱️ {t('facility_filter_shade')}
        </button>

        <button
          onClick={() => setSelectedCategory('heat_relief_centre')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            selectedCategory === 'heat_relief_centre' ? 'bg-orange-500 text-slate-950 font-bold' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
          }`}
        >
          🏥 {t('facility_filter_relief')}
        </button>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span>Search Radius:</span>
          <select
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none"
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
          </select>
        </div>
      </div>

      {/* Main Map & Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map column */}
        <div className="lg:col-span-7">
          <FacilityMap
            facilities={facilities}
            centerLat={latitude}
            centerLon={longitude}
            onSelectFacility={(f) => setSelectedFacility(f)}
            selectedFacilityId={selectedFacility?.id}
          />
        </div>

        {/* Directory List column */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-semibold text-slate-400 flex items-center justify-between px-1">
            <span>Nearby Facilities ({facilities.length})</span>
            <span className="text-[11px] text-slate-500">Sorted by distance</span>
          </div>

          <div className="max-h-[450px] overflow-y-auto space-y-2.5 pr-1">
            {facilities.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
                No matching facilities found within {radiusKm} km radius of {cityName}. You can report and add a new water point using the button above.
              </div>
            )}

            {facilities.map((fac) => {
              const isSelected = selectedFacility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setSelectedFacility(fac)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-md'
                      : 'glass-panel border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-amber-400">
                      {fac.category === 'drinking_water'
                        ? '💧 Drinking Water'
                        : fac.category === 'shaded_rest'
                        ? '⛱️ Shaded Canopy'
                        : '🏥 Heat Relief'}
                    </span>
                    {fac.distance_km && (
                      <span className="text-xs font-mono font-semibold text-slate-300">
                        {fac.distance_km} km
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-white mt-1">{fac.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                    {fac.address || fac.city}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60 text-xs">
                    <span
                      className={`text-[11px] font-medium ${
                        fac.verification_status === 'verified'
                          ? 'text-emerald-400'
                          : fac.verification_status === 'temporarily_unavailable'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      ● {fac.verification_status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFacility(fac);
                          setReportModalOpen(true);
                        }}
                        className="text-[11px] text-slate-400 hover:text-amber-300 underline"
                      >
                        Report Issue
                      </button>

                      <a
                        href={fac.directions_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl p-6 max-w-md w-full border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Report Facility Condition</h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              Facility: <strong className="text-amber-400">{selectedFacility.name}</strong>
            </div>

            {reportFeedback && (
              <div className="p-3 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-200 text-xs">
                {reportFeedback}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Condition Status</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="verified_working">Working smoothly / clean water flowing</option>
                  <option value="broken">Broken faucet or dispensing pump</option>
                  <option value="dry">Dry / No water supply</option>
                  <option value="unavailable">Temporarily unavailable / Closed</option>
                  <option value="inaccurate">Location pin inaccurate on map</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Details / Notes</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describe tap status, water quality, or shelter shade..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Facility Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-2xl p-6 max-w-md w-full border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Add Community Heat-Relief Point</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFacilitySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Corporation Water Kiosk, Temple Shade Chhavni"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as FacilityCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="drinking_water">Drinking Water Refill Station</option>
                  <option value="shaded_rest">Shaded Resting Canopy / Gazebo</option>
                  <option value="heat_relief_centre">Heat Relief Centre</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g., Near Bus Stand, Street name..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="text-[11px] text-slate-400">
                Will be pinned at current regional reference coordinates ({latitude.toFixed(4)}, {longitude.toFixed(4)}).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
