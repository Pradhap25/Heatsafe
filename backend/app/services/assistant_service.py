import re
import math
from typing import List, Dict, Any, Tuple
from app.schemas.assistant import AssistantMessageResponse, SourceReference

# Deterministic Emergency Indicators (English & Tamil keywords)
EMERGENCY_KEYWORDS_EN = [
    "collapse", "collapsed", "unconscious", "passed out", "fainted", "fainting",
    "seizure", "seizures", "fit", "fits", "convulsion", "confused", "confusion",
    "slurred speech", "delirium", "hallucination", "not sweating", "dry hot skin",
    "vomiting repeatedly", "chest pain", "gasping"
]

EMERGENCY_KEYWORDS_TA = [
    "மயக்கம்", "மயங்கி", "விழுந்துவிட்டார்", "சுயநினைவு இல்லை", "வலிப்பு",
    "குழப்பம்", "பேச்சு குளறல்", "வியர்வை வரவில்லை", "உடல் மிக வெப்பம்",
    "வாந்தி", "நெஞ்சு வலி", "மூச்சு திணறல்"
]

# Curated Bilingual Knowledge Base
CURATED_SAFETY_KNOWLEDGE = [
    {
        "id": "kb_heat_precautions",
        "keywords_en": ["sun", "heat", "hot", "outside", "what to do", "protect", "guidance", "working", "precaution", "summer"],
        "keywords_ta": ["வெயில்", "சூரியன்", "அதிக வெயில்", "என்ன செய்ய வேண்டும்", "பாதுகாப்பு", "வேலை", "கோடை"],
        "reply_en": (
            "During high ambient heat, prioritize three fundamental safeguards: "
            "1) Rest in well-ventilated shaded areas during scheduled breaks. "
            "2) Maintain consistent fluid intake (approx. 250 mL of clean drinking water every 20-30 minutes). "
            "3) Wear loose-fitting, light-coloured, breathable cotton clothing and head protection. "
            "Avoid direct sun exposure during peak solar hours (11:30 AM to 3:30 PM)."
        ),
        "reply_ta": (
            "வெப்ப அபாயம் உள்ள போது மூன்று முக்கிய பாதுகாப்பு நடவடிக்கைகளை பின்பற்றவும்: "
            "1) நிழலான மற்றும் காற்றோட்டமான இடத்தில் இடைவேளை எடுத்து ஓய்வெடுக்கவும். "
            "2) ஒவ்வொரு 20-30 நிமிடங்களுக்கும் சுமார் 250 மி.லி. சுத்தமான குடிநீர் குடிக்கவும். "
            "3) வெளிர் நிற பருத்தி ஆடைகள் மற்றும் தலைக்கவசம்/தொப்பி அணியவும். "
            "நண்பகல் 11:30 முதல் மதியம் 3:30 வரை கடுமையான வெயிலில் தொடர்ந்து நிற்பதைத் தவிர்க்கவும்."
        ),
        "tts_en": "Take shade breaks, drink clean water every twenty minutes, wear light cotton clothes, and avoid noon sun.",
        "tts_ta": "நிழலில் ஓய்வெடுக்கவும், தொடர்ந்து குடிநீர் அருந்தவும், வெளிர் நிற பருத்தி ஆடைகளை அணியவும்.",
        "source": SourceReference(
            title="National Disaster Management Guidelines on Heat Wave Preparedness",
            organization="NDMA India & Tamil Nadu SDMA",
            url_or_document="NDMA Heat Action Plan 2024"
        ),
        "actions": ["Find Shaded Rest Area", "Drink 250ml Water", "View Work-Rest Cycle"]
    },
    {
        "id": "kb_hydration_amount",
        "keywords_en": ["how much water", "drink", "water quantity", "liters", "hourly", "hydration", "dehydration"],
        "keywords_ta": ["எவ்வளவு தண்ணீர்", "குடிக்க வேண்டும்", "தண்ணீர் அளவு", "குடிநீர்"],
        "reply_en": (
            "For moderate to heavy outdoor physical labour in tropical heat, occupational safety guidelines recommend "
            "consuming approximately 750 mL to 1 Litre of clean potable water per hour, distributed in frequent sips (approx. 1 cup every 20 minutes). "
            "Do not wait until feeling thirsty. If sweating heavily, supplement with electrolyte solutions or coconut water. "
            "Note: Individuals with kidney conditions or prescribed fluid restrictions should follow their physician's protocol."
        ),
        "reply_ta": (
            "வெயிலில் கடுமையான வேலை செய்யும் போது, மணிநேரத்திற்கு சுமார் 750 மி.லி. முதல் 1 லிட்டர் வரை தண்ணீர் குடிப்பது பரிந்துரைக்கப்படுகிறது. "
            "அதை ஒரே நேரத்தில் குடிக்காமல், 20 நிமிடத்திற்கு ஒருமுறை சிறிது சிறிதாக குடிக்கவும். "
            "அதிக வியர்வை வெளியேறினால் ஓ.ஆர்.எஸ் (ORS) அல்லது இளநீர் எடுத்துக்கொள்ளலாம். "
            "மருத்துவக் குறிப்பு: சிறுநீரக பாதிப்பு அல்லது மருத்துவர் குறிப்பிட்ட திரவ கட்டுப்பாடு உள்ளவர்கள் மருத்துவர் ஆலோசனையைப் பின்பற்றவும்."
        ),
        "tts_en": "Drink about 750 milliliters to 1 liter of water per hour in frequent sips every twenty minutes.",
        "tts_ta": "ஒரு மணி நேரத்திற்கு சுமார் ஒரு லிட்டர் தண்ணீர் வரை சிறிது சிறிதாக குடிக்கவும்.",
        "source": SourceReference(
            title="Occupational Heat Illness Prevention Guidelines",
            organization="OSHA / NIOSH & Central Labour Institute India",
            url_or_document="OSHA Heat Exposure Standard"
        ),
        "actions": ["Log Water Intake", "Locate Water Refill", "Set Hydration Timer"]
    },
    {
        "id": "kb_symptoms_exhaustion",
        "keywords_en": ["symptom", "symptoms", "heat exhaustion", "dizziness", "headache", "nausea", "heavy sweating", "cramp"],
        "keywords_ta": ["அறிகுறிகள்", "தலைச்சுற்றல்", "தலைவலி", "மயக்கம்", "சோர்வு", "தசைப்பிடிப்பு", "வாந்தி உணர்வு"],
        "reply_en": (
            "Heat exhaustion signs include: heavy profuse sweating, dizziness, rapid pulse, throbbing headache, muscle cramps, and pale clammy skin. "
            "Immediate protocol: Stop work immediately, move to a cool shaded shelter, lie down with legs slightly elevated, "
            "loosen tight clothing, apply cool damp cloths to neck and forehead, and sip cool water. "
            "If symptoms worsen or do not improve within 30 minutes, obtain medical evaluation."
        ),
        "reply_ta": (
            "வெப்ப சோர்வு அறிகுறிகள்: அதிக வியர்வை, தலைச்சுற்றல், தலைவலி, விரைவான இதயத் துடிப்பு, மற்றும் தசைப்பிடிப்பு. "
            "உடனடி முதலுதவி: உடனே வேலையை நிறுத்தி குளிர்ந்த நிழலுக்குச் செல்லவும், கால்களை சற்று உயர்த்தி படுக்கவும், "
            "இறுக்கமான ஆடைகளை தளர்த்தவும், கழுத்து மற்றும் நெற்றியில் ஈரத்துணியை வைக்கவும், நிதானமாக தண்ணீர் குடிக்கவும்."
        ),
        "tts_en": "Stop work, move to cool shade immediately, loosen clothing, apply damp cloth, and sip water.",
        "tts_ta": "வேலையை உடனே நிறுத்தி நிழலுக்குச் செல்லவும். இறுக்கமான ஆடைகளைத் தளர்த்தி தண்ணீர் குடிக்கவும்.",
        "source": SourceReference(
            title="Heat Illness First Aid & Clinical Management",
            organization="World Health Organization (WHO) & Ministry of Health and Family Welfare",
            url_or_document="WHO Public Health Advice on Heat Waves"
        ),
        "actions": ["Seek Shade Immediately", "Call Site Safety Lead", "Report Incident"]
    },
    {
        "id": "kb_workplace_breaks",
        "keywords_en": ["break", "rest", "supervisor", "employer", "worksite", "hours", "shifts", "osha"],
        "keywords_ta": ["இடைவேளை", "ஓய்வு", "பணியிடம்", "முதலாளி", "நேரம்", "வேலை நேரம்"],
        "reply_en": (
            "Workplaces under high thermal load must adopt structured work-rest cycles. When temperatures exceed 37°C or WBGT exceeds 30°C, "
            "a 30-minute work and 30-minute rest schedule per hour should be enforced. Employers must provide easily accessible shaded shelters, "
            "free potable chilled drinking water within 50 metres of the work area, and an active buddy system to spot early distress."
        ),
        "reply_ta": (
            "அதிக வெப்பம் உள்ள நாட்களில் பணியிடங்களில் கட்டாய ஓய்வு முறை நடைமுறைப்படுத்தப்பட வேண்டும். "
            "37 டிகிரிக்கு மேல் வெப்பம் இருக்கும் போது, மணிக்கு 30 நிமிட வேலை மற்றும் 30 நிமிட நிழல் ஓய்வு வழங்கப்பட வேண்டும். "
            "பணியிடத்தில் 50 மீட்டருக்குள் சுத்தமான குடிநீர் மற்றும் நிழற்கூடம் அமைக்கப்பட வேண்டும்."
        ),
        "tts_en": "Enforce thirty minute work and thirty minute shade rest cycles and provide clean water nearby.",
        "tts_ta": "பணியிடத்தில் போதுமான நிழல் ஓய்வு மற்றும் சுத்தமான குடிநீர் வசதி அளிக்கப்பட வேண்டும்.",
        "source": SourceReference(
            title="Model Guidelines for Protection of Workers Exposed to Extreme Heat",
            organization="Government of Tamil Nadu Labour & Employment Department",
            url_or_document="TN Labour Welfare Heat Action Directives"
        ),
        "actions": ["Open Employer Worksite Plan", "View OSHA Break Schedule"]
    }
]


class AssistantService:
    @staticmethod
    def detect_emergency(text: str) -> bool:
        """
        Fast deterministic life-safety screener.
        Returns True immediately if high-threat symptoms are detected.
        Zero latency, zero model hallucinations.
        """
        lower = text.lower()
        for kw in EMERGENCY_KEYWORDS_EN:
            if re.search(r'\b' + re.escape(kw) + r'\b', lower):
                return True
        for kw in EMERGENCY_KEYWORDS_TA:
            if kw in lower:
                return True
        return False

    @staticmethod
    def detect_language(text: str) -> str:
        """Detect if input contains Tamil unicode characters (0B80–0BFF)."""
        tamil_char_count = sum(1 for c in text if '\u0b80' <= c <= '\u0bff')
        return "ta" if tamil_char_count > 2 else "en"

    @classmethod
    def match_curated_guidance(cls, query: str, lang: str) -> Dict[str, Any]:
        """
        Multilingual keyword and token overlap similarity matcher
        against the curated public health safety repository.
        """
        q_tokens = set(re.findall(r'[\w\u0b80-\u0bff]+', query.lower()))
        best_score = -1
        best_item = CURATED_SAFETY_KNOWLEDGE[0]

        for item in CURATED_SAFETY_KNOWLEDGE:
            score = 0
            # Target keywords for current language
            kw_list = item["keywords_ta"] if lang == "ta" else item["keywords_en"]
            for kw in kw_list:
                kw_lower = kw.lower()
                if kw_lower in query.lower():
                    score += 3
                for t in q_tokens:
                    if t in kw_lower or kw_lower in t:
                        score += 1
            if score > best_score:
                best_score = score
                best_item = item

        return best_item

    @classmethod
    async def process_user_query(
        cls,
        message: str,
        preferred_lang: str = "en"
    ) -> AssistantMessageResponse:
        # Detect language from query or fall back to user preference
        lang = cls.detect_language(message) or preferred_lang

        # 1. IMMEDIATE LIFE-SAFETY EMERGENCY CHECK
        if cls.detect_emergency(message):
            if lang == "ta":
                reply = (
                    "🚨 அவசர எச்சரிக்கை: நீங்கள் குறிப்பிட்ட அறிகுறிகள் (மயக்கம்/வலிப்பு/சுயநினைவின்மை) "
                    "கடுமையான வெப்ப பக்கவாதத்தின் (Heat Stroke) அறிகுறியாக இருக்கலாம்! "
                    "உடனடியாக 108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்! "
                    "முதலுதவி: நபரை உடனே குளிர்ந்த நிழலுக்கு மாற்றவும், ஆடைகளைத் தளர்த்தவும், கழுத்து/கக்கத்தில் குளிர்ந்த ஈரத்துணியை வைக்கவும். "
                    "சுயநினைவு இல்லாதவருக்கு தண்ணீரை வலுக்கட்டாயமாக புகட்ட வேண்டாம்!"
                )
                tts = "அவசர எச்சரிக்கை! உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும். நபரை குளிர்ந்த நிழலுக்கு மாற்றவும்."
                steps = [
                    "உடனடியாக 108 ஆம்புலன்ஸ் எண்ணை அழைக்கவும்",
                    "நபரை நேரடி வெயிலில் இருந்து குளிர்ந்த நிழலுக்கு நகர்த்தவும்",
                    "கழுத்து, அக்குள் மற்றும் நெற்றியில் ஈரத்துணியால் ஒத்தடம் கொடுக்கவும்",
                    "சுயநினைவின்றி இருந்தால் தண்ணீர் புகட்ட வேண்டாம்"
                ]
            else:
                reply = (
                    "🚨 CRITICAL HEAT EMERGENCY ALERT: The symptoms described (collapse/unconsciousness/seizure/confusion) "
                    "indicate potential life-threatening Heat Stroke! "
                    "CALL 108 (Emergency Ambulance) IMMEDIATELY! "
                    "Immediate Emergency Steps: "
                    "1) Move person to cold shade immediately. "
                    "2) Loosen tight clothing and fan aggressively. "
                    "3) Apply ice packs or cold wet towels to armpits, groin, and neck. "
                    "4) DO NOT force liquids if the person is semi-conscious or vomiting."
                )
                tts = "Critical heat emergency! Call 108 emergency ambulance immediately. Move person to cold shade now."
                steps = [
                    "Call 108 Ambulance immediately",
                    "Move patient into deep shade or air-conditioned space",
                    "Apply cold damp cloths to neck, armpits, and groin",
                    "Do NOT give oral liquids if the person is drowsy or unconscious"
                ]

            return AssistantMessageResponse(
                reply_text=reply,
                detected_language=lang,
                is_emergency=True,
                emergency_contact="108 (Tamil Nadu State Emergency & Ambulance)",
                emergency_immediate_steps=steps,
                sources=[
                    SourceReference(
                        title="Emergency Management Protocol for Severe Heat Stroke",
                        organization="National Centre for Disease Control (NCDC) & WHO",
                        url_or_document="NCDC Heat Stroke First Aid Guidelines"
                    )
                ],
                suggested_actions=["Call 108 Ambulance", "Alert Worksite First Aider", "Locate Emergency Facility"],
                tts_text=tts
            )

        # 2. CURATED KNOWLEDGE BASE RETRIEVAL
        matched = cls.match_curated_guidance(message, lang)
        reply = matched["reply_ta"] if lang == "ta" else matched["reply_en"]
        tts = matched["tts_ta"] if lang == "ta" else matched["tts_en"]

        return AssistantMessageResponse(
            reply_text=reply,
            detected_language=lang,
            is_emergency=False,
            emergency_contact=None,
            emergency_immediate_steps=None,
            sources=[matched["source"]],
            suggested_actions=matched["actions"],
            tts_text=tts
        )
