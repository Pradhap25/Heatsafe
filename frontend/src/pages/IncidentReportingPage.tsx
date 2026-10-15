import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, PhoneCall } from 'lucide-react';
import { api } from '../services/api';

export const IncidentReportingPage: React.FC = () => {
  const [incidentType, setIncidentType] = useState('heat_exhaustion');
  const [severity, setSeverity] = useState('moderate');
  const [workerRole, setWorkerRole] = useState('Mason / Field Worker');
  const [symptoms, setSymptoms] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [firstAid, setFirstAid] = useState(true);
  const [medicalReferral, setMedicalReferral] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.reportIncident(1, {
        incident_type: incidentType,
        severity,
        worker_role: workerRole,
        symptoms,
        actions_taken: actionsTaken,
        first_aid_administered: firstAid,
        medical_referral: medicalReferral
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>OCCUPATIONAL SAFETY INCIDENT LOGGING</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Safety Incident & Heat Illness Reporting
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Confidential incident logging designed to identify thermal hazards without punitive measures towards affected workers.
        </p>
      </div>

      {submitted ? (
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Incident Recorded Successfully</h2>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            The safety log has been submitted for review. Site supervisors and health leads will inspect shade canopy availability and water refill stations.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Submit Another Incident
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Incident Type</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
              >
                <option value="heat_exhaustion">Heat Exhaustion (Heavy Sweating, Dizziness)</option>
                <option value="heat_cramps">Severe Heat Cramps</option>
                <option value="heat_syncope">Heat Syncope / Fainting</option>
                <option value="heat_stroke_suspected">Suspected Heat Stroke (Emergency)</option>
                <option value="near_miss">Near-Miss (Extreme Fatigue Before Collapse)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Observed Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
              >
                <option value="minor">Minor (Quick recovery after shade rest)</option>
                <option value="moderate">Moderate (Required prolonged resting, ORS)</option>
                <option value="severe">Severe (Transferred to primary health centre)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Affected Worker Role / Trade</label>
            <input
              type="text"
              required
              value={workerRole}
              onChange={(e) => setWorkerRole(e.target.value)}
              placeholder="e.g. Scaffolder, Mason helper, Delivery driver"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Observed Symptoms</label>
            <textarea
              required
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe symptoms observed: dizziness, clammy skin, cramps, pulse rate, confusion..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Immediate Actions Taken On-Site</label>
            <textarea
              required
              rows={3}
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              placeholder="Moved to deep shade, applied damp towels, administered ORS electrolyte drink..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={firstAid}
                onChange={(e) => setFirstAid(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-rose-500"
              />
              <span>First-Aid Administered on Site</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={medicalReferral}
                onChange={(e) => setMedicalReferral(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-rose-500"
              />
              <span>Referred to Hospital / Medical Ambulance</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Emergency symptoms require dialing <strong>108</strong> without waiting.
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Log Incident Record
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
