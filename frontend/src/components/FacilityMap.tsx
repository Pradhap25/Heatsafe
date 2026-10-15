import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Facility } from '../types';

interface FacilityMapProps {
  facilities: Facility[];
  centerLat: number;
  centerLon: number;
  onSelectFacility?: (facility: Facility) => void;
  selectedFacilityId?: number;
}

export const FacilityMap: React.FC<FacilityMapProps> = ({
  facilities,
  centerLat,
  centerLon,
  onSelectFacility,
  selectedFacilityId
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      // User location pin
      const userIcon = L.divIcon({
        className: 'user-loc-marker',
        html: `
          <div style="background-color: #f59e0b; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 10px rgba(245, 158, 11, 0.8);"></div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([centerLat, centerLon], { icon: userIcon, title: 'Your Selected Location' })
        .addTo(map)
        .bindPopup('<b>Your Current Location</b><br/>Weather & Risk Reference Point');

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLon], mapInstanceRef.current.getZoom());
    }
  }, [centerLat, centerLon]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    facilities.forEach((fac) => {
      // Choose icon color based on facility category
      let bgColor = '#3b82f6'; // blue for drinking water
      let iconSymbol = '💧';
      if (fac.category === 'shaded_rest') {
        bgColor = '#10b981'; // emerald
        iconSymbol = '⛱️';
      } else if (fac.category === 'heat_relief_centre') {
        bgColor = '#f97316'; // orange
        iconSymbol = '🏥';
      }

      const isSelected = fac.id === selectedFacilityId;
      const markerHtml = `
        <div style="
          background-color: ${bgColor};
          width: ${isSelected ? '32px' : '26px'};
          height: ${isSelected ? '32px' : '26px'};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? '16px' : '13px'};
          border: 2px solid ${isSelected ? '#ffffff' : '#0f172a'};
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${iconSymbol}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'facility-marker',
        html: markerHtml,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13]
      });

      const marker = L.marker([fac.latitude, fac.longitude], { icon: customIcon });

      const popupContent = `
        <div style="color: #0f172a; font-family: sans-serif; font-size: 12px; max-width: 200px;">
          <b style="font-size: 13px;">${fac.name}</b><br/>
          <span style="color: #64748b;">${fac.category.replace('_', ' ')}</span><br/>
          <span style="color: #047857; font-weight: 600;">Status: ${fac.verification_status}</span><br/>
          ${fac.distance_km ? `<span>Distance: ${fac.distance_km} km</span><br/>` : ''}
          <a href="${fac.directions_url || `https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: bold; margin-top: 4px; display: inline-block;">Open Directions</a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectFacility) {
          onSelectFacility(fac);
        }
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [facilities, selectedFacilityId, onSelectFacility]);

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-800 shadow-xl z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};
