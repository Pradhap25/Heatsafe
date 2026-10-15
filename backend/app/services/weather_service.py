import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.schemas.weather import (
    WeatherCurrentResponse,
    CurrentWeatherCondition,
    WeatherForecastResponse,
    HourlyForecastPoint
)

# Weather code descriptions from WMO standard
WMO_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm"
}

# In-memory TTL cache: key -> {"data": data, "timestamp": time.time()}
WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 600  # 10 minutes cache to prevent rate-limiting


class WeatherService:
    @staticmethod
    def _cache_key(lat: float, lon: float, kind: str) -> str:
        return f"{kind}_{round(lat, 3)}_{round(lon, 3)}"

    @classmethod
    async def get_current_weather(
        cls,
        latitude: float,
        longitude: float,
        city_name: Optional[str] = None
    ) -> WeatherCurrentResponse:
        cache_key = cls._cache_key(latitude, longitude, "current")
        now = time.time()

        # Check cache
        if cache_key in WEATHER_CACHE:
            cached_entry = WEATHER_CACHE[cache_key]
            if now - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
                cached_data: WeatherCurrentResponse = cached_entry["data"]
                # Return cached with is_cached true
                return cached_data.model_copy(update={
                    "is_cached": True,
                    "cached_timestamp": datetime.fromtimestamp(cached_entry["timestamp"], tz=timezone.utc)
                })

        # Fetch from Open-Meteo
        url = (
            f"{settings.OPEN_METEO_BASE_URL}/forecast?"
            f"latitude={latitude}&longitude={longitude}&"
            f"current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,weather_code,is_day,direct_normal_irradiance&"
            f"timezone=auto"
        )

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()

            current_data = data.get("current", {})
            weather_code = current_data.get("weather_code", 0)
            description = WMO_CODE_MAP.get(weather_code, "Fair / Moderate")

            cur_condition = CurrentWeatherCondition(
                temperature_c=float(current_data.get("temperature_2m", 32.0)),
                relative_humidity_pct=float(current_data.get("relative_humidity_2m", 65.0)),
                wind_speed_kmh=float(current_data.get("wind_speed_10m", 12.0)),
                wind_direction_deg=current_data.get("wind_direction_10m"),
                direct_normal_irradiance=current_data.get("direct_normal_irradiance"),
                surface_pressure_hpa=current_data.get("surface_pressure"),
                weather_code=weather_code,
                weather_description=description,
                is_day=bool(current_data.get("is_day", 1)),
                time=current_data.get("time", datetime.now(timezone.utc).isoformat())
            )

            result = WeatherCurrentResponse(
                latitude=latitude,
                longitude=longitude,
                timezone=data.get("timezone", "Asia/Kolkata"),
                city_name=city_name or "Tamil Nadu Location",
                state="Tamil Nadu",
                country="India",
                current=cur_condition,
                is_cached=False,
                cached_timestamp=None,
                data_source="Open-Meteo Weather API (https://open-meteo.com)",
                source_attribution="Weather data provided under CC BY 4.0 by Open-Meteo",
                retrieved_at=datetime.now(timezone.utc).isoformat()
            )

            # Store in cache
            WEATHER_CACHE[cache_key] = {"data": result, "timestamp": now}
            return result

        except Exception as e:
            # If API fails but we have stale cache, return it with warning
            if cache_key in WEATHER_CACHE:
                stale_entry = WEATHER_CACHE[cache_key]
                stale_data: WeatherCurrentResponse = stale_entry["data"]
                return stale_data.model_copy(update={
                    "is_cached": True,
                    "cached_timestamp": datetime.fromtimestamp(stale_entry["timestamp"], tz=timezone.utc),
                    "source_attribution": f"Stale cached observation (Open-Meteo service unreachable: {str(e)})"
                })
            # Re-raise explicit error
            raise RuntimeError(f"Unable to reach Open-Meteo weather service: {str(e)}")

    @classmethod
    async def get_forecast(
        cls,
        latitude: float,
        longitude: float
    ) -> WeatherForecastResponse:
        cache_key = cls._cache_key(latitude, longitude, "forecast")
        now = time.time()

        if cache_key in WEATHER_CACHE:
            cached_entry = WEATHER_CACHE[cache_key]
            if now - cached_entry["timestamp"] < CACHE_TTL_SECONDS:
                return cached_entry["data"]

        url = (
            f"{settings.OPEN_METEO_BASE_URL}/forecast?"
            f"latitude={latitude}&longitude={longitude}&"
            f"hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,direct_normal_irradiance&"
            f"forecast_days=1&timezone=auto"
        )

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.get(url)
                resp.raise_for_status()
                data = resp.json()

            hourly_data = data.get("hourly", {})
            times = hourly_data.get("time", [])
            temps = hourly_data.get("temperature_2m", [])
            humids = hourly_data.get("relative_humidity_2m", [])
            winds = hourly_data.get("wind_speed_10m", [])
            solars = hourly_data.get("direct_normal_irradiance", [None] * len(times))

            points: list[HourlyForecastPoint] = []
            for i in range(min(24, len(times))):
                t = temps[i] if i < len(temps) else 30.0
                rh = humids[i] if i < len(humids) else 60.0
                ws = winds[i] if i < len(winds) else 10.0
                sol = solars[i] if (solars and i < len(solars)) else None

                # Simplified Heat Index for forecast points
                # Rothfusz simple regression
                hi = t
                if t >= 26.0 and rh >= 40.0:
                    hi = -8.784695 + 1.61139411 * t + 2.338549 * (rh / 100 * t)

                risk = "Low"
                if hi >= 41:
                    risk = "Extreme"
                elif hi >= 37:
                    risk = "Very High"
                elif hi >= 32:
                    risk = "High"
                elif hi >= 27:
                    risk = "Moderate"

                points.append(
                    HourlyForecastPoint(
                        time=times[i],
                        temperature_c=round(t, 1),
                        relative_humidity_pct=round(rh, 1),
                        wind_speed_kmh=round(ws, 1),
                        solar_radiation_wm2=round(sol, 1) if sol is not None else None,
                        heat_index_c=round(hi, 1),
                        wbgt_estimated_c=None,
                        risk_level=risk
                    )
                )

            max_t = max(temps) if temps else 35.0
            min_t = min(temps) if temps else 25.0

            result = WeatherForecastResponse(
                latitude=latitude,
                longitude=longitude,
                hourly=points,
                daily_max_temp_c=round(max_t, 1),
                daily_min_temp_c=round(min_t, 1),
                peak_risk_hours="11:00 AM - 04:00 PM IST",
                data_source="Open-Meteo Weather API",
                retrieved_at=datetime.now(timezone.utc).isoformat()
            )

            WEATHER_CACHE[cache_key] = {"data": result, "timestamp": now}
            return result

        except Exception as e:
            if cache_key in WEATHER_CACHE:
                return WEATHER_CACHE[cache_key]["data"]
            raise RuntimeError(f"Failed to fetch forecast from Open-Meteo: {str(e)}")
