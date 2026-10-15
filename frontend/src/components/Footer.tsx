import React from 'react';
import { Flame, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 text-slate-950" />
            </div>
            <span className="font-bold text-slate-200 text-sm">HeatSafe AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Intelligent occupational thermal protection, hydration guidance, and verified heat-relief infrastructure for outdoor workforces in Tamil Nadu, India.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
            Key Disclaimers
          </h4>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            <li>Atmospheric heat index calculation</li>
            <li>WBGT validated approximations</li>
            <li>No clinical dehydration diagnostic</li>
            <li>Distinguishes environmental from medical</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
            Data Attributions
          </h4>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            <li>Open-Meteo API (CC BY 4.0 Licence)</li>
            <li>OpenStreetMap contributors (ODbL)</li>
            <li>OSHA / NIOSH Heat Stress Criteria</li>
            <li>NDMA India Heat Action Plans</li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-2">
            Emergency Contacts
          </h4>
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Tamil Nadu Emergency Ambulance: 108</span>
            </div>
            <p className="text-[11px] text-rose-200/70">
              For loss of consciousness, convulsions, lack of sweating, or extreme fever, request immediate medical transport.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>© 2026 HeatSafe AI Platform. Developed for public occupational safety.</div>
        <div className="mt-2 sm:mt-0">Tamil & English Dual-Engine Localization</div>
      </div>
    </footer>
  );
};
