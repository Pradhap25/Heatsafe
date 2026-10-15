import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

interface HeatRiskBadgeProps {
  levelCode: number;
  category: string;
  size?: 'sm' | 'md' | 'lg';
}

export const HeatRiskBadge: React.FC<HeatRiskBadgeProps> = ({ levelCode, category, size = 'md' }) => {
  let colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
  let Icon = ShieldCheck;
  let pulse = false;

  if (levelCode >= 5) {
    colorClasses = 'bg-rose-950/90 text-rose-300 border-rose-600 heat-warning-pulse';
    Icon = Flame;
    pulse = true;
  } else if (levelCode === 4) {
    colorClasses = 'bg-red-950/80 text-red-300 border-red-600/70';
    Icon = ShieldAlert;
  } else if (levelCode === 3) {
    colorClasses = 'bg-orange-950/80 text-orange-300 border-orange-600/70';
    Icon = AlertTriangle;
  } else if (levelCode === 2) {
    colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-600/70';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
    lg: 'text-base px-5 py-2.5 gap-2.5 font-semibold'
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} shrink-0 ${pulse ? 'animate-bounce' : ''}`} />
      <span>{category}</span>
    </span>
  );
};
