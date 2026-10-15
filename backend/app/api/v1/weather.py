from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.services.weather_service import WeatherService
from app.schemas.weather import WeatherCurrentResponse, WeatherForecastResponse

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current", response_model=WeatherCurrentResponse)
async def get_current_weather(
    latitude: float = Query(13.0827, ge=-90, le=90, description="Latitude (default Chennai)"),
    longitude: float = Query(80.2707, ge=-180, le=180, description="Longitude (default Chennai)"),
    city_name: Optional[str] = Query(None, description="Optional city label")
):
    try:
        return await WeatherService.get_current_weather(latitude, longitude, city_name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather observation currently unavailable: {str(e)}"
        )


@router.get("/forecast", response_model=WeatherForecastResponse)
async def get_weather_forecast(
    latitude: float = Query(13.0827, ge=-90, le=90),
    longitude: float = Query(80.2707, ge=-180, le=180)
):
    try:
        return await WeatherService.get_forecast(latitude, longitude)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather forecast service temporarily unavailable: {str(e)}"
        )
