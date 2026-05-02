import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat'; // Optional, if you later want to switch to heatmap

// Custom colored marker icons from GitHub CDN
const BlueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const GreenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const RedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Automatically adjust map to show all markers
function FitBounds({ center, markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lon]));
    bounds.extend([center.lat, center.lon]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // Fix for Leaflet grey-box map rendering issue
    const timeout = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => clearTimeout(timeout);
  }, [markers, center, map]);

  return null;
}

export default function NearbyPlacesMap({ places = {}, center }) {
  if (!center?.lat || !center?.lon) return null;

  const markers = Object.entries(places).flatMap(([type, locations]) =>
    locations.map((loc) => ({ ...loc, type }))
  );

  return (
    <div className="w-full">
      {/* Marker Legend */}
      <div className="flex items-center gap-6 px-2 py-2 mb-2 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
            alt="User"
            className="w-4 h-6"
          />
          <span>📍 Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
            alt="School"
            className="w-4 h-6"
          />
          <span>🏫 School</span>
        </div>
        <div className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
            alt="Hospital"
            className="w-4 h-6"
          />
          <span>🏥 Hospital</span>
        </div>
      </div>

      {/* Map Section */}
      <div className="h-[400px] w-full rounded-lg border shadow">
        <MapContainer
          center={[center.lat, center.lon]}
          zoom={13}
          scrollWheelZoom
          className="h-full w-full rounded"
          whenReady={(e) => {
            setTimeout(() => e.target.invalidateSize(), 100);
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          <Marker position={[center.lat, center.lon]} icon={BlueIcon}>
            <Popup>📍 Your Location</Popup>
          </Marker>

          {/* Nearby Places Markers */}
          {markers.map((place, idx) => {
            const icon = place.type === 'school'
              ? GreenIcon
              : place.type === 'hospital'
              ? RedIcon
              : BlueIcon;

            return (
              <Marker key={idx} position={[place.lat, place.lon]} icon={icon}>
                <Popup>
                  <strong>{place.name}</strong><br />
                  Type: {place.type}<br />
                  📏 {place.distance_km} km away
                </Popup>
              </Marker>
            );
          })}

          <FitBounds center={center} markers={markers} />
        </MapContainer>
      </div>
    </div>
  );
}
