import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const MedicalDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs">
        <Info className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Medical Note:</strong> Environmental risk estimates only. Does not replace personal clinical evaluation. Call 108 for medical distress.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-100 shadow-md">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-900/50 text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-amber-300">
            {t('medical_disclaimer_title')}
          </h4>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            {t('medical_disclaimer_body')}
          </p>
        </div>
      </div>
    </div>
  );
};
