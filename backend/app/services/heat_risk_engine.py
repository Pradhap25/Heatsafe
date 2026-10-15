import math
from typing import Optional, List, Tuple
from app.schemas.heat_risk import HeatRiskResponse, WorkRestRecommendation


class HeatRiskEngine:
    @staticmethod
    def calculate_dew_point(temp_c: float, rh_pct: float) -> float:
        """Magnus-Tetens formula for dew point temperature in Celsius."""
        a = 17.27
        b = 237.7
        alpha = ((a * temp_c) / (b + temp_c)) + math.log(max(rh_pct, 1.0) / 100.0)
        return (b * alpha) / (a - alpha)

    @classmethod
    def calculate_noaa_heat_index(cls, temp_c: float, rh_pct: float) -> float:
        """
        NOAA / Steadman Heat Index equation with Rothfusz adjustments.
        Valid for ambient temperatures above 20°C (68°F).
        """
        temp_f = temp_c * 1.8 + 32.0
        rh = max(0.0, min(100.0, rh_pct))

        if temp_f < 80.0:
            # Steadman simplified formula
            hi_f = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (rh * 0.094))
            return round((hi_f - 32.0) / 1.8, 1)

        # Full Rothfusz polynomial regression
        hi_f = (
            -42.379
            + 2.04901523 * temp_f
            + 10.14333127 * rh
            - 0.22475541 * temp_f * rh
            - 0.00683783 * (temp_f ** 2)
            - 0.05481717 * (rh ** 2)
            + 0.00122874 * (temp_f ** 2) * rh
            + 0.00085282 * temp_f * (rh ** 2)
            - 0.00000199 * (temp_f ** 2) * (rh ** 2)
        )

        # Low humidity adjustment: RH < 13% and 80 <= temp_f <= 112
        if rh < 13.0 and 80.0 <= temp_f <= 112.0:
            adjustment = ((13.0 - rh) / 4.0) * math.sqrt((17.0 - abs(temp_f - 95.0)) / 17.0)
            hi_f -= adjustment

        # High humidity adjustment: RH > 85% and 80 <= temp_f <= 87
        elif rh > 85.0 and 80.0 <= temp_f <= 87.0:
            adjustment = ((rh - 85.0) / 10.0) * ((87.0 - temp_f) / 5.0)
            hi_f += adjustment

        hi_c = (hi_f - 32.0) / 1.8
        return round(hi_c, 1)

    @classmethod
    def estimate_wbgt(
        cls,
        temp_c: float,
        rh_pct: float,
        wind_speed_kmh: float,
        solar_radiation_wm2: Optional[float]
    ) -> Tuple[Optional[float], bool, str]:
        """
        Wet Bulb Globe Temperature estimation using Stull psychrometric natural wet bulb
        and solar radiation / wind dissipation model.
        Returns: (wbgt_val, is_available, method_description)
        """
        # Natural Wet Bulb Temperature (Twb) using Stull (2011) validated empirical formula
        rh = max(1.0, min(100.0, rh_pct))
        t = temp_c
        try:
            twb = (
                t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
                + math.atan(t + rh)
                - math.atan(rh - 1.676331)
                + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
                - 4.686035
            )
        except Exception:
            return None, False, "WBGT computation error (psychrometric bounds exceeded)"

        if solar_radiation_wm2 is not None and solar_radiation_wm2 > 0:
            # Outdoor WBGT with solar radiation and convective wind cooling
            v_ms = max(wind_speed_kmh / 3.6, 0.5)  # min 0.5 m/s convective floor
            # Globe temperature approximation
            tg = t + 0.0125 * solar_radiation_wm2 * (v_ms ** -0.42)
            # Standard Outdoor WBGT formula: 0.7 * Twb + 0.2 * Tg + 0.1 * T
            wbgt = 0.7 * twb + 0.2 * tg + 0.1 * t
            return (
                round(wbgt, 1),
                True,
                "Outdoor WBGT estimated via Stull-Liljegren model utilizing live direct solar irradiance and 10m wind speed."
            )
        elif solar_radiation_wm2 == 0:
            # Night-time or fully shaded outdoor WBGT: 0.7 * Twb + 0.3 * T
            wbgt = 0.7 * twb + 0.3 * t
            return (
                round(wbgt, 1),
                True,
                "Shaded / Night-time WBGT estimate (0.7 Twb + 0.3 Ta) with zero solar radiative load."
            )
        else:
            # Solar radiation is unavailable from observation feed
            # In accordance with product principles, do not fabricate an outdoor WBGT
            return (
                None,
                False,
                "Outdoor WBGT unavailable: Missing solar irradiance sensor data. Air temperature cannot be substituted for WBGT."
            )

    @classmethod
    def evaluate_heat_risk(
        cls,
        air_temperature_c: float,
        relative_humidity_pct: float,
        wind_speed_kmh: float,
        solar_radiation_wm2: Optional[float] = None,
        activity_category: str = "outdoor_worker",
        location_lat: float = 13.0827,
        location_lon: float = 80.2707,
        location_name: Optional[str] = "Chennai",
        timestamp_str: str = ""
    ) -> HeatRiskResponse:
        heat_index = cls.calculate_noaa_heat_index(air_temperature_c, relative_humidity_pct)
        dew_point = round(cls.calculate_dew_point(air_temperature_c, relative_humidity_pct), 1)
        wbgt_val, wbgt_available, wbgt_method = cls.estimate_wbgt(
            air_temperature_c, relative_humidity_pct, wind_speed_kmh, solar_radiation_wm2
        )

        # Baseline risk scoring based on Heat Index and WBGT
        # Categories: Low (1), Moderate/Caution (2), High/Extreme Caution (3), Very High/Danger (4), Extreme (5)
        risk_code = 1
        category = "Low"
        explanation = "Environmental heat stress is currently within mild seasonal ranges. Standard hydration applies."

        effective_metric = wbgt_val if (wbgt_available and wbgt_val is not None) else heat_index

        if effective_metric >= 42.0 or (wbgt_available and wbgt_val is not None and wbgt_val >= 32.5):
            risk_code = 5
            category = "Extreme / Severe Danger"
            explanation = (
                f"Severe environmental heat stress detected (Effective metric: {effective_metric}°C). "
                "Risk of heat stroke is extraordinarily high with prolonged physical exertion."
            )
        elif effective_metric >= 37.0 or (wbgt_available and wbgt_val is not None and wbgt_val >= 30.5):
            risk_code = 4
            category = "Very High / Danger"
            explanation = (
                f"Dangerous heat stress level (Effective metric: {effective_metric}°C). "
                "Heat cramps and heat exhaustion are highly likely without mandatory shade breaks and electrolyte hydration."
            )
        elif effective_metric >= 32.0 or (wbgt_available and wbgt_val is not None and wbgt_val >= 28.0):
            risk_code = 3
            category = "High / Extreme Caution"
            explanation = (
                f"Elevated thermal stress (Effective metric: {effective_metric}°C). "
                "Fatigue is possible with prolonged exposure. Outdoor manual workers require scheduled rest intervals."
            )
        elif effective_metric >= 27.0 or (wbgt_available and wbgt_val is not None and wbgt_val >= 25.0):
            risk_code = 2
            category = "Moderate / Caution"
            explanation = (
                f"Moderate heat condition (Effective metric: {effective_metric}°C). "
                "Stay mindful of adequate fluid replenishment, particularly under direct sunlight."
            )
        else:
            risk_code = 1
            category = "Low"
            explanation = "Comfortable to mild environmental conditions. Routine safety measures recommended."

        # Activity category impact:
        # High metabolic workloads (construction, farming, asphalt paving) elevate vulnerability
        if activity_category in ["outdoor_worker", "farmer", "construction", "athlete"] and risk_code in [2, 3, 4]:
            explanation += f" Note: High metabolic workload for '{activity_category}' increases physiological strain."

        # OSHA / NIOSH recommended work-rest cycle
        if risk_code == 5:
            work_rest = WorkRestRecommendation(
                work_minutes_per_hour=15,
                rest_minutes_per_hour=45,
                water_intake_recommended_ml_per_hour=1000,
                rest_shade_requirement="Mandatory ventilated shade or chilled cooling shelter",
                buddy_system_advised=True
            )
        elif risk_code == 4:
            work_rest = WorkRestRecommendation(
                work_minutes_per_hour=30,
                rest_minutes_per_hour=30,
                water_intake_recommended_ml_per_hour=1000,
                rest_shade_requirement="Mandatory shaded area with active air movement",
                buddy_system_advised=True
            )
        elif risk_code == 3:
            work_rest = WorkRestRecommendation(
                work_minutes_per_hour=45,
                rest_minutes_per_hour=15,
                water_intake_recommended_ml_per_hour=750,
                rest_shade_requirement="Dedicated shaded canopy with cool water access",
                buddy_system_advised=True
            )
        elif risk_code == 2:
            work_rest = WorkRestRecommendation(
                work_minutes_per_hour=50,
                rest_minutes_per_hour=10,
                water_intake_recommended_ml_per_hour=500,
                rest_shade_requirement="Periodic shade breaks when feeling fatigue",
                buddy_system_advised=False
            )
        else:
            work_rest = WorkRestRecommendation(
                work_minutes_per_hour=60,
                rest_minutes_per_hour=0,
                water_intake_recommended_ml_per_hour=250,
                rest_shade_requirement="Standard rest breaks as per normal schedule",
                buddy_system_advised=False
            )

        # Bilingual Precautions
        precautions_en = [
            f"Hydrate steadily: Drink approx. {work_rest.water_intake_recommended_ml_per_hour} mL of clean drinking water per hour.",
            f"Work-rest schedule: Observe {work_rest.work_minutes_per_hour} min work followed by {work_rest.rest_minutes_per_hour} min rest in shade.",
            "Wear loose, light-coloured, breathable cotton clothing and wide-brimmed head protection.",
            "Avoid peak direct sunlight exposure between 12:00 PM and 3:30 PM if feasible.",
            "Never ignore dizziness, rapid heartbeat, nausea, or absence of sweat. Report to a supervisor immediately."
        ]

        precautions_ta = [
            f"தொடர்ந்து தண்ணீர் குடிக்கவும்: ஒரு மணி நேரத்திற்கு சுமார் {work_rest.water_intake_recommended_ml_per_hour} மி.லி. குடிநீர் குடிக்கவும்.",
            f"வேலை-ஓய்வு சுழற்சி: {work_rest.work_minutes_per_hour} நிமிட வேலைக்கு பிறகு {work_rest.rest_minutes_per_hour} நிமிடங்கள் நிழலில் ஓய்வெடுக்கவும்.",
            "வெளிர் நிற பருத்தி ஆடைகள் மற்றும் தலைக்கு தொப்பி அல்லது துண்டு அணியவும்.",
            "நண்பகல் 12:00 முதல் மாலை 3:30 வரை நேரடி வெயிலில் கடுமையான வேலையைத் தவிர்க்கவும்.",
            "தலைச்சுற்றல், தீவிர சோர்வு அல்லது அதிக தாகம் ஏற்பட்டால் உடனடியாக நிழலுக்குச் சென்று ஓய்வெடுக்கவும்."
        ]

        confidence_level = "High - Validated solar and temperature measurements" if wbgt_available else "Moderate - NOAA Heat Index ambient estimate"

        limitations = (
            "Environmental heat assessment is calculated from regional meteorological data. "
            "Local microclimates (e.g., direct heat from asphalt, enclosed tin roofs, lack of airflow) "
            "can produce significantly higher localized heat stress."
        )

        medical_disclaimer = (
            "IMPORTANT: HeatSafe AI estimates environmental atmospheric heat stress and occupational thresholds. "
            "It does NOT diagnose medical conditions, assess individual internal body hydration, or replace professional medical care. "
            "If someone experiences confusion, fainting, vomiting, or seizures, call 108 immediately."
        )

        return HeatRiskResponse(
            air_temperature_c=air_temperature_c,
            relative_humidity_pct=relative_humidity_pct,
            wind_speed_kmh=wind_speed_kmh,
            solar_radiation_wm2=solar_radiation_wm2,
            dew_point_c=dew_point,
            heat_index_c=heat_index,
            wbgt_estimated_c=wbgt_val,
            wbgt_is_available=wbgt_available,
            wbgt_method=wbgt_method,
            risk_category=category,
            risk_level_code=risk_code,
            activity_category=activity_category,
            explanation=explanation,
            limitations=limitations,
            confidence_level=confidence_level,
            medical_disclaimer=medical_disclaimer,
            precautions_en=precautions_en,
            precautions_ta=precautions_ta,
            work_rest_cycle=work_rest,
            location_lat=location_lat,
            location_lon=location_lon,
            location_name=location_name,
            timestamp=timestamp_str or "Live",
            data_source="Open-Meteo Meteorological Data + OSHA/NOAA/Stull Assessment Model"
        )
