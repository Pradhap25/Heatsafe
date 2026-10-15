export type Language = 'en' | 'ta';

export const translations = {
  en: {
    // Navigation & Common
    app_title: "HeatSafe AI",
    app_subtitle: "Intelligent Heat Protection & Hydration Platform",
    nav_home: "Home",
    nav_dashboard: "Live Dashboard",
    nav_heat_risk: "Heat Risk Details",
    nav_hydration: "Hydration Tracker",
    nav_facilities: "Water & Rest Points",
    nav_assistant: "Voice Safety Assistant",
    nav_guidance: "Safety Library",
    nav_employer: "Employer Portal",
    nav_admin: "Admin Console",
    nav_profile: "My Profile",
    nav_login: "Sign In",
    nav_register: "Register",
    nav_logout: "Sign Out",
    language_toggle: "தமிழ்",
    emergency_call_btn: "Emergency 108",

    // Roles
    role_worker: "Outdoor Worker",
    role_farmer: "Farmer / Agricultural Worker",
    role_delivery: "Delivery Executive",
    role_police: "Traffic Police / Security",
    role_athlete: "Student / Athlete",
    role_public: "General Public",
    role_employer: "Employer / Site Supervisor",
    role_admin: "Health Administrator",

    // Risk Categories
    risk_low: "Low Heat Risk",
    risk_moderate: "Moderate Caution",
    risk_high: "High Extreme Caution",
    risk_very_high: "Very High Danger",
    risk_extreme: "Extreme Severe Danger",

    // Dashboard Cards
    metric_temp: "Air Temperature",
    metric_humidity: "Relative Humidity",
    metric_wind: "Wind Speed",
    metric_solar: "Solar Irradiance",
    metric_heat_index: "NOAA Heat Index",
    metric_wbgt: "Estimated WBGT",
    metric_wbgt_unavailable: "WBGT Sensor Unavailable",
    source_attribution_label: "Data Source: Open-Meteo API (CC BY 4.0)",
    cached_badge: "Cached Data",
    live_badge: "Live Telemetry",

    // Work-Rest Cycle
    work_rest_title: "OSHA & NIOSH Work-Rest Protocol",
    work_label: "Work Interval",
    rest_label: "Rest in Shade",
    water_recommended_label: "Recommended Water / Hour",
    rest_shade_rule: "Shade Requirement",
    buddy_system_active: "Buddy System Advised",

    // Disclaimers
    medical_disclaimer_title: "Important Public Health Notice",
    medical_disclaimer_body:
      "HeatSafe AI estimates atmospheric thermal stress and workplace rest standards. It does NOT diagnose clinical dehydration or predict personal medical emergencies. Individuals with cardiovascular, renal, or fluid-restricted medical conditions must follow physician advice. If a coworker displays confusion, collapse, or absence of sweat, call 108 immediately.",

    // Hydration
    hydration_title: "Context-Aware Hydration Support",
    hydration_intake_today: "Today's Intake Logged",
    hydration_next_due: "Next Sip Break In",
    hydration_log_btn: "Log 250 mL Drink",
    hydration_custom_log: "Log Custom Amount",
    hydration_pause: "Pause Reminders",
    hydration_resume: "Resume Reminders",
    hydration_frequency: "Reminder Frequency (Minutes)",

    // Facilities
    facilities_title: "Nearby Potable Water & Shaded Rest Facilities",
    facility_filter_all: "All Types",
    facility_filter_water: "Drinking Water Kiosks",
    facility_filter_shade: "Shaded Shelters",
    facility_filter_relief: "Heat Relief Centres",
    facility_verified: "Verified Potable / Safe",
    facility_unverified: "Reported (Unverified)",
    facility_unavailable: "Temporarily Unavailable",
    facility_get_directions: "Directions (Maps)",
    facility_report_issue: "Report Issue / Dry Tap",
    facility_submit_new: "Add New Water Point",

    // Assistant
    assistant_title: "Tamil & English Voice Safety Assistant",
    assistant_placeholder: "Ask about sun protection, symptoms, or type in Tamil...",
    assistant_mic_start: "Tap to Speak (Tamil / English)",
    assistant_mic_stop: "Listening... (Tap to Send)",
    assistant_send: "Send Query",
    assistant_speech_toggle: "Auto Voice Readout",
    assistant_quick_1: "வெளியில் அதிக வெயில் இருக்கிறது. நான் என்ன செய்ய வேண்டும்?",
    assistant_quick_2: "How much water should I drink per hour outdoors?",
    assistant_quick_3: "What are early heat stroke symptoms?",
    assistant_quick_4: "பணியாளர் மயக்கம் அடைந்துவிட்டார்!",

    // Employer
    employer_title: "Workforce Heat Safety Dashboard",
    employer_compliance_score: "Safety Compliance Score",
    employer_sites_monitored: "Active Worksites",
    employer_workers_protected: "Monitored Outdoor Workers",
    employer_add_site: "Register New Worksite",
    employer_incidents: "Safety Incidents & Heat Illness Logs",
    employer_report_incident: "Report Heat Illness Incident",

    // Admin
    admin_title: "State Public Health & Facility Administration",
    admin_system_health: "System Telemetry & Health",
    admin_verify_action: "Verify Facility",
    admin_audit_logs: "Security & Audit Trail"
  },
  ta: {
    // Navigation & Common
    app_title: "ஹீட்சேஃப் AI",
    app_subtitle: "புத்திசாலித்தனமான வெப்ப பாதுகாப்பு மற்றும் நீரேற்ற தளம்",
    nav_home: "முகப்பு",
    nav_dashboard: "நேரடி தகவல் பலகை",
    nav_heat_risk: "வெப்ப அபாய விவரங்கள்",
    nav_hydration: "குடிநீர் கண்காணிப்பு",
    nav_facilities: "குடிநீர் & நிழல் மையங்கள்",
    nav_assistant: "குரல் பாதுகாப்பு உதவியாளர்",
    nav_guidance: "பாதுகாப்பு வழிகாட்டி",
    nav_employer: "முதலாளி தளம்",
    nav_admin: "நிர்வாக மையம்",
    nav_profile: "எனது விவரக்குறிப்பு",
    nav_login: "உள்நுழைவு",
    nav_register: "பதிவு செய்க",
    nav_logout: "வெளியேறு",
    language_toggle: "English",
    emergency_call_btn: "அவசர எண் 108",

    // Roles
    role_worker: "வெளிப்புற பணியாளர்",
    role_farmer: "விவசாயி / தோட்டத் தொழிலாளி",
    role_delivery: "டெலிவரி ஊழியர்",
    role_police: "போக்குவரத்து காவலர் / காவலாளி",
    role_athlete: "மாணவர் / விளையாட்டு வீரர்",
    role_public: "பொதுமக்கள்",
    role_employer: "முதலாளி / தள மேற்பார்வையாளர்",
    role_admin: "சுகாதார நிர்வாகி",

    // Risk Categories
    risk_low: "குறைந்த வெப்ப அபாயம்",
    risk_moderate: "மிதமான எச்சரிக்கை",
    risk_high: "அதிக தீவிர எச்சரிக்கை",
    risk_very_high: "மிக அதிக ஆபத்து",
    risk_extreme: "கடுமையான தீவிர அபாயம்",

    // Dashboard Cards
    metric_temp: "காற்று வெப்பநிலை",
    metric_humidity: "ஈரப்பதம்",
    metric_wind: "காற்றின் வேகம்",
    metric_solar: "சூரிய கதிர்வீச்சு",
    metric_heat_index: "NOAA வெப்பக் குறியீடு",
    metric_wbgt: "மதிப்பிடப்பட்ட WBGT",
    metric_wbgt_unavailable: "WBGT சென்சார் கிடைக்கவில்லை",
    source_attribution_label: "வானிலை ஆதாரம்: ஓபன்-மீடியோ (Open-Meteo)",
    cached_badge: "சேமிக்கப்பட்ட தகவல்",
    live_badge: "நேரடித் தகவல்",

    // Work-Rest Cycle
    work_rest_title: "OSHA & NIOSH வேலை-ஓய்வு விதிமுறை",
    work_label: "வேலை நேரம்",
    rest_label: "நிழலில் ஓய்வு",
    water_recommended_label: "பரிந்துரைக்கப்பட்ட தண்ணீர் / மணி",
    rest_shade_rule: "நிழல் தேவை",
    buddy_system_active: "கூட்டு பாதுகாப்பு முறை பரிந்துரைக்கப்படுகிறது",

    // Disclaimers
    medical_disclaimer_title: "முக்கிய பொது சுகாதார அறிவிப்பு",
    medical_disclaimer_body:
      "ஹீட்சேஃப் AI சுற்றுச்சூழல் வெப்ப அழுத்தத்தையும் பணி பாதுகாப்பு பரிந்துரைகளையும் மட்டுமே கணக்கிடுகிறது. இது மருத்துவ நீரிழப்பு நோயறிதல் அல்லது தனிநபர் உடல்நிலையை கணிக்காது. இதய, சிறுநீரக அல்லது மருத்துவரால் திரவக் கட்டுப்பாடு விதிக்கப்பட்டவர்கள் மருத்துவர் ஆலோசனையை பின்பற்றவும். சக தொழிலாளிக்கு மயக்கம், குழப்பம் அல்லது வியர்வை இன்மை ஏற்பட்டால் உடனே 108 அழைக்கவும்.",

    // Hydration
    hydration_title: "சூழலுக்கு ஏற்ற குடிநீர் வழிகாட்டி",
    hydration_intake_today: "இன்று குடித்த தண்ணீர்",
    hydration_next_due: "அடுத்த குடிநீர் இடைவேளை",
    hydration_log_btn: "250 மி.லி. குடிநீர் பதிவு",
    hydration_custom_log: "தனிப்பயன் அளவு பதிவு",
    hydration_pause: "நினைவூட்டலை நிறுத்து",
    hydration_resume: "மீண்டும் தொடங்கு",
    hydration_frequency: "நினைவூட்டல் இடைவெளி (நிமிடங்கள்)",

    // Facilities
    facilities_title: "அருகிலுள்ள குடிநீர் மற்றும் நிழல் ஓய்வு மையங்கள்",
    facility_filter_all: "அனைத்தும்",
    facility_filter_water: "குடிநீர் நிலையங்கள்",
    facility_filter_shade: "நிழல் ஓய்வு குடில்கள்",
    facility_filter_relief: "வெப்ப நிவாரண மையங்கள்",
    facility_verified: "சரிபார்க்கப்பட்ட பாதுகாப்பான குடிநீர்",
    facility_unverified: "சரிபார்க்கப்படாத தகவல்",
    facility_unavailable: "தற்காலிகமாக செயல்படவில்லை",
    facility_get_directions: "வழித்தடம் (மேப்)",
    facility_report_issue: "பழுது / நீர் இல்லாமை புகார்",
    facility_submit_new: "புதிய குடிநீர் மையத்தைச் சேர்க்கவும்",

    // Assistant
    assistant_title: "தமிழ் & ஆங்கில குரல் பாதுகாப்பு உதவியாளர்",
    assistant_placeholder: "வெயில் பாதுகாப்பு பற்றி தமிழில் கேட்கவும் அல்லது தட்டச்சு செய்யவும்...",
    assistant_mic_start: "பேச தொடங்குங்கள் (தமிழ் / English)",
    assistant_mic_stop: "கேட்கிறது... (அனுப்ப தட்டவும்)",
    assistant_send: "கேள்வி அனுப்புக",
    assistant_speech_toggle: "தானியங்கி குரல் வாசிப்பு",
    assistant_quick_1: "வெளியில் அதிக வெயில் இருக்கிறது. நான் என்ன செய்ய வேண்டும்?",
    assistant_quick_2: "ஒரு மணி நேரத்திற்கு எவ்வளவு தண்ணீர் குடிக்க வேண்டும்?",
    assistant_quick_3: "வெப்ப பக்கவாதத்தின் அறிகுறிகள் என்ன?",
    assistant_quick_4: "பணியாளர் மயக்கம் அடைந்துவிட்டார்!",

    // Employer
    employer_title: "பணியிட வெப்ப பாதுகாப்பு தகவல் பலகை",
    employer_compliance_score: "பாதுகாப்பு இணக்க மதிப்பெண்",
    employer_sites_monitored: "கண்காணிக்கப்படும் பணியிடங்கள்",
    employer_workers_protected: "பணியாளர்கள் எண்ணிக்கை",
    employer_add_site: "புதிய பணியிடத்தை பதிவு செய்",
    employer_incidents: "வெப்ப பாதிப்பு மற்றும் முதலுதவி பதிவுகள்",
    employer_report_incident: "பாதிப்பு விபத்தை பதிவு செய்",

    // Admin
    admin_title: "மாநில பொது சுகாதாரம் & வசதிகள் நிர்வாகம்",
    admin_system_health: "கணினி நிலை & நல்வாழ்வு",
    admin_verify_action: "வசதியை சரிபார்",
    admin_audit_logs: "பாதுகாப்பு தணிக்கை பதிவுகள்"
  }
};
