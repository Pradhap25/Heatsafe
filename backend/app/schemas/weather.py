from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class LocationQuery(BaseModel):
    latitude: float
    longitude: float
    city_name: Optional[str] = None


class CurrentWeatherCondition(BaseModel):
    temperature_c: float
    relative_humidity_pct: float
    wind_speed_kmh: float
    wind_direction_deg: Optional[float] = None
    direct_normal_irradiance: Optional[float] = None  # W/m^2 solar radiation
    surface_pressure_hpa: Optional[float] = None
    weather_code: Optional[int] = None
    weather_description: str
    is_day: bool = True
    time: str


class HourlyForecastPoint(BaseModel):
    time: str
    temperature_c: float
    relative_humidity_pct: float
    wind_speed_kmh: float
    solar_radiation_wm2: Optional[float] = None
    heat_index_c: Optional[float] = None
    wbgt_estimated_c: Optional[float] = None
    risk_level: str


class WeatherCurrentResponse(BaseModel):
    latitude: float
    longitude: float
    timezone: str
    city_name: Optional[str] = None
    state: str = "Tamil Nadu"
    country: str = "India"
    current: CurrentWeatherCondition
    is_cached: bool = False
    cached_timestamp: Optional[datetime] = None
    data_source: str = "Open-Meteo Weather API (https://open-meteo.com)"
    source_attribution: str = "Weather data provided under CC BY 4.0 by Open-Meteo"
    retrieved_at: str


class WeatherForecastResponse(BaseModel):
    latitude: float
    longitude: float
    hourly: List[HourlyForecastPoint]
    daily_max_temp_c: float
    daily_min_temp_c: float
    peak_risk_hours: str
    data_source: str = "Open-Meteo Weather API"
    retrieved_at: str
