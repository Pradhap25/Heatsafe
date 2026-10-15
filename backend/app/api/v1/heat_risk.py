from typing import Optional, List
from fastapi import APIRouter, Query, HTTPException, status
from app.services.weather_service import WeatherService
from app.services.heat_risk_engine import HeatRiskEngine
from app.schemas.heat_risk import HeatRiskResponse

router = APIRouter(prefix="/heat-risk", tags=["Heat Risk Assessment"])


@router.get("", response_model=HeatRiskResponse)
async def assess_heat_risk(
    latitude: float = Query(13.0827, ge=-90, le=90, description="Latitude"),
    longitude: float = Query(80.2707, ge=-180, le=180, description="Longitude"),
    activity_category: str = Query("outdoor_worker", description="User activity type"),
    temp_override_c: Optional[float] = Query(None, description="Optional sensor override for ambient temperature"),
    rh_override_pct: Optional[float] = Query(None, description="Optional sensor override for relative humidity")
):
    """
    Evaluates real-time occupational and environmental heat risk.
    If overrides are not supplied, queries live meteorological data from Open-Meteo.
    Calculates NOAA Steadman Heat Index and Stull-Liljegren WBGT if solar data exists.
    """
    try:
        weather = await WeatherService.get_current_weather(latitude, longitude)
        cur = weather.current
        
        air_temp = temp_override_c if temp_override_c is not None else cur.temperature_c
        rh = rh_override_pct if rh_override_pct is not None else cur.relative_humidity_pct
        wind = cur.wind_speed_kmh
        solar = cur.direct_normal_irradiance
        timestamp_str = cur.time

        assessment = HeatRiskEngine.evaluate_heat_risk(
            air_temperature_c=air_temp,
            relative_humidity_pct=rh,
            wind_speed_kmh=wind,
            solar_radiation_wm2=solar,
            activity_category=activity_category,
            location_lat=latitude,
            location_lon=longitude,
            location_name=weather.city_name,
            timestamp_str=timestamp_str
        )
        return assessment

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Heat risk evaluation unavailable: {str(e)}"
        )


@router.get("/history", response_model=List[HeatRiskResponse])
async def get_heat_risk_history(
    latitude: float = Query(13.0827, ge=-90, le=90),
    longitude: float = Query(80.2707, ge=-180, le=180),
    activity_category: str = Query("outdoor_worker")
):
    """Returns today's 24-hour heat risk profile based on hourly forecast."""
    try:
        forecast = await WeatherService.get_forecast(latitude, longitude)
        history = []
        for p in forecast.hourly[:12]:  # Day hours
            res = HeatRiskEngine.evaluate_heat_risk(
                air_temperature_c=p.temperature_c,
                relative_humidity_pct=p.relative_humidity_pct,
                wind_speed_kmh=p.wind_speed_kmh,
                solar_radiation_wm2=p.solar_radiation_wm2,
                activity_category=activity_category,
                location_lat=latitude,
                location_lon=longitude,
                timestamp_str=p.time
            )
            history.append(res)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to retrieve historical risk timeline: {str(e)}"
        )
