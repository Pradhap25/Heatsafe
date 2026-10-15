export type UserRole =
  | 'worker'
  | 'farmer'
  | 'delivery'
  | 'traffic_police'
  | 'athlete'
  | 'general_public'
  | 'employer'
  | 'admin';

export interface UserPreference {
  high_heat_alerts: boolean;
  browser_notifications: boolean;
  audio_alerts: boolean;
  reminder_interval_mins: number;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  manual_location_lat?: string;
  manual_location_lon?: string;
  manual_location_name?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  workplace_or_org?: string;
  preferred_language: 'en' | 'ta';
  is_active: boolean;
  is_verified: boolean;
  preferences?: UserPreference;
}

export interface WeatherCurrent {
  temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg?: number;
  direct_normal_irradiance?: number;
  surface_pressure_hpa?: number;
  weather_code?: number;
  weather_description: string;
  is_day: boolean;
  time: string;
}

export interface WeatherResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  city_name?: string;
  state: string;
  country: string;
  current: WeatherCurrent;
  is_cached: boolean;
  cached_timestamp?: string;
  data_source: string;
  source_attribution: string;
  retrieved_at: string;
}

export interface WorkRestRecommendation {
  work_minutes_per_hour: number;
  rest_minutes_per_hour: number;
  water_intake_recommended_ml_per_hour: number;
  rest_shade_requirement: string;
  buddy_system_advised: boolean;
}

export interface HeatRiskAssessment {
  air_temperature_c: number;
  relative_humidity_pct: number;
  wind_speed_kmh: number;
  solar_radiation_wm2?: number;
  dew_point_c?: number;
  heat_index_c: number;
  wbgt_estimated_c?: number;
  wbgt_is_available: boolean;
  wbgt_method: string;
  risk_category: string;
  risk_level_code: number;
  activity_category: string;
  explanation: string;
  limitations: string;
  confidence_level: string;
  medical_disclaimer: string;
  precautions_en: string[];
  precautions_ta: string[];
  work_rest_cycle: WorkRestRecommendation;
  location_lat: number;
  location_lon: number;
  location_name?: string;
  timestamp: string;
  data_source: string;
}

export type FacilityCategory =
  | 'drinking_water'
  | 'shaded_rest'
  | 'public_rest_facility'
  | 'heat_relief_centre';

export type VerificationStatus =
  | 'verified'
  | 'reported_unverified'
  | 'temporarily_unavailable'
  | 'closed'
  | 'unknown';

export interface Facility {
  id: number;
  name: string;
  category: FacilityCategory;
  latitude: number;
  longitude: number;
  address?: string;
  city: string;
  state: string;
  postal_code?: string;
  source: string;
  verification_status: VerificationStatus;
  last_verified_at?: string;
  opening_hours: string;
  is_free: boolean;
  has_chilled_water: boolean;
  has_seating: boolean;
  accessibility_notes?: string;
  notes?: string;
  distance_km?: number;
  directions_url?: string;
}

export interface HydrationReminder {
  id: number;
  user_id: number;
  title: string;
  interval_minutes: number;
  activity_context: string;
  target_sip_ml: number;
  is_active: boolean;
  created_at: string;
}

export interface HydrationSummary {
  total_intake_today_ml: number;
  acknowledgements_count: number;
  last_intake_time?: string;
  reminders_active: boolean;
  next_reminder_due_in_mins?: number;
  hydration_guidance_en: string;
  hydration_guidance_ta: string;
  medical_fluid_disclaimer: string;
}

export interface AssistantSource {
  title: string;
  organization: string;
  url_or_document?: string;
}

export interface AssistantResponse {
  reply_text: string;
  detected_language: string;
  is_emergency: boolean;
  emergency_contact?: string;
  emergency_immediate_steps?: string[];
  sources: AssistantSource[];
  suggested_actions: string[];
  tts_text: string;
}

export interface Worksite {
  id: number;
  organisation_id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  work_type: string;
  worker_count: number;
  has_shaded_rest_area: boolean;
  has_potable_water: boolean;
  has_electrolytes: boolean;
  has_first_aid_kit: boolean;
  safety_lead_name?: string;
  safety_lead_phone?: string;
  created_at: string;
}

export interface Incident {
  id: number;
  organisation_id: number;
  worksite_id?: number;
  reported_by_id?: number;
  incident_type: string;
  severity: string;
  worker_role?: string;
  symptoms: string;
  actions_taken: string;
  first_aid_administered: boolean;
  medical_referral: boolean;
  occurred_at: string;
  status: string;
  created_at: string;
}

export interface EmployerDashboardSummary {
  organisation: {
    id: number;
    name: string;
    registration_code: string;
    sector: string;
    contact_email: string;
  };
  total_worksites: number;
  total_workers_monitored: number;
  active_heat_alerts_count: number;
  open_incidents_count: number;
  worksites_with_shade_coverage_pct: number;
  worksites_with_water_access_pct: number;
  safety_compliance_score: number;
  recent_incidents: Incident[];
}
