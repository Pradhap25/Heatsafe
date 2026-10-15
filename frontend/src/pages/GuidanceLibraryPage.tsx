import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Droplets, Clock, ExternalLink, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer';

interface GuidanceItem {
  id: string;
  category: 'emergency' | 'symptoms' | 'hydration' | 'workplace';
  titleEn: string;
  titleTa: string;
  contentEn: string;
  contentTa: string;
  source: string;
}

const GUIDANCE_LIBRARY_DATA: GuidanceItem[] = [
  {
    id: '1',
    category: 'emergency',
    titleEn: 'Heat Stroke vs. Heat Exhaustion Triage',
    titleTa: 'வெப்ப பக்கவாதம் vs வெப்ப சோர்வு ஒப்பீடு',
    contentEn:
      'Heat Stroke is a life-threatening medical emergency where internal core body temperature exceeds 40°C. Key differentiators: altered mental state, confusion, slurred speech, seizures, and an absence of sweating with hot dry skin. Immediate call to 108 is mandatory.',
    contentTa:
      'வெப்ப பக்கவாதம் (Heat Stroke) உயிருக்கு ஆபத்தான நிலை. முக்கிய அறிகுறிகள்: குழப்பம், பேச்சு குளறல், வலிப்பு, வியர்வை வராமல் உடல் மிக சூடாதல். உடனே 108 ஆம்புலன்ஸை அழைக்க வேண்டும்.',
    source: 'National Centre for Disease Control (NCDC) Heat Emergency Manual'
  },
  {
    id: '2',
    category: 'symptoms',
    titleEn: 'Early Warning Signs of Thermal Strain',
    titleTa: 'வெப்ப அழுத்தத்தின் ஆரம்ப எச்சரிக்கை அறிகுறிகள்',
    contentEn:
      'Early symptoms include persistent headache, excessive fatigue, lightheadedness, dark concentrated urine, and muscle cramps in calves or abdominal wall. Never ignore these signs; take immediate shaded rest.',
    contentTa:
      'ஆரம்ப அறிகுறிகள்: கடுமையான தலைவலி, சோர்வு, தலைச்சுற்றல், அடர்ந்த நிற சிறுநீர், தசைப்பிடிப்பு. இதை அலட்சியப்படுத்தாமல் உடனே நிழலில் ஓய்வெடுக்கவும்.',
    source: 'World Health Organization (WHO) Public Health Guidelines'
  },
  {
    id: '3',
    category: 'hydration',
    titleEn: 'Fluid & Electrolyte Balance in Humid Heat',
    titleTa: 'ஈரப்பதமான வெப்பத்தில் நீர் மற்றும் எலக்ட்ரோலைட் சமநிலை',
    contentEn:
      'In tropical high-humidity climates like coastal Tamil Nadu, sweat evaporates less efficiently. Hydrate with 250 mL of clean water every 20-30 minutes. Supplement with ORS or buttermilk if sweating profusely for over 2 hours.',
    contentTa:
      'தமிழ்நாடு போன்ற கடலோர ஈரப்பத வெப்பத்தில், வியர்வை எளிதில் ஆவியாகாது. ஒவ்வொரு 20-30 நிமிடங்களுக்கும் 250 மி.லி. தண்ணீர் குடிக்கவும். இரண்டு மணி நேரத்திற்கு மேல் வேலை செய்தால் ஓ.ஆர்.எஸ் அல்லது மோர் குடிக்கவும்.',
    source: 'OSHA / NIOSH Occupational Safety Standard 1910'
  },
  {
    id: '4',
    category: 'workplace',
    titleEn: 'Worksite Heat Action Plan & Mandated Breaks',
    titleTa: 'பணியிட வெப்ப செயல் திட்டம் & கட்டாய ஓய்வு',
    contentEn:
      'Employers must implement mandatory shaded rest areas, supply free cool potable water within 50 metres, reschedule high-exertion tasks away from noon hours (12:00 PM to 3:30 PM), and deploy a buddy system.',
    contentTa:
      'முதலாளிகள் பணியிடத்தில் 50 மீட்டருக்குள் சுத்தமான குடிநீர் மற்றும் நிழல் வசதி அமைக்க வேண்டும். நண்பகல் 12:00 முதல் 3:30 வரை கடுமையான வெளிப்புற பணிகளை தவிர்க்க வேண்டும்.',
    source: 'Tamil Nadu Labour Welfare & Skill Development Department'
  }
];

export const GuidanceLibraryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = GUIDANCE_LIBRARY_DATA.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.titleTa.includes(searchQuery) ||
      item.contentEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.contentTa.includes(searchQuery);
    return matchesCat && matchesQuery;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
          <BookOpen className="w-4 h-4" />
          <span>CURATED OCCUPATIONAL KNOWLEDGE BASE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          {t('nav_guidance')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Peer-reviewed public health, OSHA, and Tamil Nadu State Disaster Management protocols.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {['all', 'emergency', 'symptoms', 'hydration', 'workplace'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                activeCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guidelines..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">Verified Reference</span>
              </div>

              <h3 className="font-bold text-base text-white">
                {language === 'ta' ? item.titleTa : item.titleEn}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-tamil">
                {language === 'ta' ? item.contentTa : item.contentEn}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
              <span>
                Source: <strong>{item.source}</strong>
              </span>
              <span className="text-emerald-400">Public Domain Guideline</span>
            </div>
          </div>
        ))}
      </div>

      <MedicalDisclaimer />
    </div>
  );
};
