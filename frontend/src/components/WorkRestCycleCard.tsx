import React from 'react';
import { Clock, Droplets, Umbrella, Users } from 'lucide-react';
import { WorkRestRecommendation } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface WorkRestCycleCardProps {
  recommendation: WorkRestRecommendation;
}

export const WorkRestCycleCard: React.FC<WorkRestCycleCardProps> = ({ recommendation }) => {
  const { t } = useLanguage();
  const total = recommendation.work_minutes_per_hour + recommendation.rest_minutes_per_hour;
  const workPercent = Math.round((recommendation.work_minutes_per_hour / (total || 60)) * 100);
  const restPercent = 100 - workPercent;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-slate-100 text-sm md:text-base">
            {t('work_rest_title')}
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">1 Hour Cycle</span>
      </div>

      {/* Progress Bar Visualization */}
      <div className="space-y-1.5">
        <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-700">
          <div
            style={{ width: `${workPercent}%` }}
            className="h-full bg-blue-500 rounded-l-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden"
          >
            {workPercent > 20 && `${recommendation.work_minutes_per_hour}m`}
          </div>
          <div
            style={{ width: `${restPercent}%` }}
            className="h-full bg-emerald-500 rounded-r-full transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-slate-950 overflow-hidden"
          >
            {restPercent > 15 && `${recommendation.rest_minutes_per_hour}m`}
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-300 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            {t('work_label')}: <strong>{recommendation.work_minutes_per_hour} min</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            {t('rest_label')}: <strong>{recommendation.rest_minutes_per_hour} min</strong>
          </span>
        </div>
      </div>

      {/* Recommended Hourly Hydration & Shelter Rule */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-slate-400">{t('water_recommended_label')}</div>
            <div className="text-sm font-bold text-cyan-200">
              {recommendation.water_intake_recommended_ml_per_hour} mL / hr
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Approx. 1 cup every 20 mins</div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <Umbrella className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs text-slate-400">{t('rest_shade_rule')}</div>
            <div className="text-xs font-medium text-slate-200 mt-0.5 leading-snug">
              {recommendation.rest_shade_requirement}
            </div>
          </div>
        </div>
      </div>

      {recommendation.buddy_system_advised && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-950/40 border border-orange-800/50 text-xs text-orange-200">
          <Users className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{t('buddy_system_active')}: Check coworkers for altered speech, confusion, or absence of sweat every 30 minutes.</span>
        </div>
      )}
    </div>
  );
};
