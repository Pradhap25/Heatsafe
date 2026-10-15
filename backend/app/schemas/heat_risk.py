from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class HeatRiskCategoryEnum:
    LOW = "Low"
    MODERATE = "Moderate / Caution"
    HIGH = "High / Extreme Caution"
    VERY_HIGH = "Very High / Danger"
    EXTREME = "Extreme / Severe Danger"


class WorkRestRecommendation(BaseModel):
    work_minutes_per_hour: int
    rest_minutes_per_hour: int
    water_intake_recommended_ml_per_hour: int
    rest_shade_requirement: str
    buddy_system_advised: bool


class HeatRiskResponse(BaseModel):
    # Environmental measurements
    air_temperature_c: float
    relative_humidity_pct: float
    wind_speed_kmh: float
    solar_radiation_wm2: Optional[float] = None
    dew_point_c: Optional[float] = None
    
    # Calculated metrics
    heat_index_c: float
    wbgt_estimated_c: Optional[float] = None
    wbgt_is_available: bool = False
    wbgt_method: str
    
    # Risk Assessment
    risk_category: str
    risk_level_code: int  # 1 to 5
    activity_category: str
    
    # Explanations and Disclaimers
    explanation: str
    limitations: str
    confidence_level: str  # "High - Live In-situ Solar & Temp", "Moderate - Estimated Radiation", "Limited - Basic Ambient"
    medical_disclaimer: str
    
    # Guidance
    precautions_en: List[str]
    precautions_ta: List[str]
    work_rest_cycle: WorkRestRecommendation
    
    # Metadata
    location_lat: float
    location_lon: float
    location_name: Optional[str] = None
    timestamp: str
    data_source: str
