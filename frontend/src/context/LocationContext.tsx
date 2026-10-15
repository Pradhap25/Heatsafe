import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CityPreset {
  name: string;
  nameTa: string;
  lat: number;
  lon: number;
}

export const TAMIL_NADU_CITIES: CityPreset[] = [
  { name: 'Chennai', nameTa: 'சென்னை', lat: 13.0827, lon: 80.2707 },
  { name: 'Madurai', nameTa: 'மதுரை', lat: 9.9252, lon: 78.1198 },
  { name: 'Coimbatore', nameTa: 'கோயம்புத்தூர்', lat: 11.0168, lon: 76.9558 },
  { name: 'Tiruchirappalli', nameTa: 'திருச்சிராப்பள்ளி', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', nameTa: 'சேலம்', lat: 11.6643, lon: 78.1460 },
  { name: 'Tirunelveli', nameTa: 'திருநெல்வேலி', lat: 8.7139, lon: 77.7567 },
  { name: 'Vellore', nameTa: 'வேலூர்', lat: 12.9165, lon: 79.1325 },
  { name: 'Thanjavur', nameTa: 'தஞ்சாவூர்', lat: 10.7870, lon: 79.1378 }
];

interface LocationContextType {
  latitude: number;
  longitude: number;
  cityName: string;
  isGeolocationActive: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  requestGeolocation: () => void;
  selectCityPreset: (city: CityPreset) => void;
  setCustomCoordinates: (lat: number, lon: number, name?: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latitude, setLatitude] = useState<number>(13.0827); // Default Chennai
  const [longitude, setLongitude] = useState<number>(80.2707);
  const [cityName, setCityName] = useState<string>('Chennai');
  const [isGeolocationActive, setIsGeolocationActive] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      setPermissionStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setCityName('Current Location (GPS)');
        setIsGeolocationActive(true);
        setPermissionStatus('granted');
      },
      (err) => {
        console.warn('Geolocation denied or error:', err.message);
        setPermissionStatus('denied');
        setIsGeolocationActive(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const selectCityPreset = (city: CityPreset) => {
    setLatitude(city.lat);
    setLongitude(city.lon);
    setCityName(city.name);
    setIsGeolocationActive(false);
  };

  const setCustomCoordinates = (lat: number, lon: number, name?: string) => {
    setLatitude(lat);
    setLongitude(lon);
    setCityName(name || `${lat.toFixed(3)}, ${lon.toFixed(3)}`);
    setIsGeolocationActive(false);
  };

  return (
    <LocationContext.Provider
      value={{
        latitude,
        longitude,
        cityName,
        isGeolocationActive,
        permissionStatus,
        requestGeolocation,
        selectCityPreset,
        setCustomCoordinates
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
};
