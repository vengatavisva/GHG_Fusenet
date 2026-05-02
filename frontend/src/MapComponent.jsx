import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import { Navigation } from 'lucide-react';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function SearchControl({ onSearch }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();
    const searchControl = new GeoSearchControl({
      provider,
      showMarker: false,
      showPopup: false,
      autoClose: true,
      retainZoomLevel: false,
      animateZoom: true,
      searchLabel: 'Search for a location',
      keepResult: true,
    });

    map.addControl(searchControl);
    map.on('geosearch/showlocation', (result) => {
      const { x: lng, y: lat } = result.location;
      onSearch({ lat, lng });
      map.setView([lat, lng], 10, { animate: true });
    });

    return () => {
      map.removeControl(searchControl);
    };
  }, [map, onSearch]);

  return null;
}

function LocationMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 10, { animate: true });
    }
  }, [position, map]);

  return position ? (
    <Marker position={position}>
      <Popup>
        📍 Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}
      </Popup>
    </Marker>
  ) : null;
}

export default function MapComponent({ onSelect, loading }) {
  const [position, setPosition] = useState(null);
  const [statusMessage, setStatusMessage] = useState("🖱 Click to fetch prediction");
  const mapRef = useRef(null);
  const wasDragged = useRef(false);
  const prevLoading = useRef(false);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (loading) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
    }
  }, [loading]);

  useEffect(() => {
    if (prevLoading.current && !loading && position) {
      setStatusMessage("✅ Location fetched!");
      const timer = setTimeout(() => {
        setStatusMessage("🖱 Click to fetch prediction");
      }, 3000);
      return () => clearTimeout(timer);
    }
    prevLoading.current = loading;
  }, [loading, position]);

  function ClickHandler() {
    useMapEvents({
      dragstart() {
        wasDragged.current = true;
      },
      click(e) {
        if (wasDragged.current) {
          wasDragged.current = false;
          return;
        }

        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setStatusMessage("🔄 Fetching location...");
        onSelect({ lat, lng });
      },
    });
    return null;
  }

  const handleCurrentLocation = (e) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      setStatusMessage("🔄 Finding your location...");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setStatusMessage("🔄 Fetching location...");
          onSelect({ lat: latitude, lng: longitude });
        },
        (error) => {
          setStatusMessage("❌ Location access denied or unavailable.");
          setTimeout(() => setStatusMessage("🖱 Click to fetch prediction"), 3000);
        }
      );
    } else {
      setStatusMessage("❌ Geolocation not supported by your browser.");
    }
  };

  return (
    <div
      id="map-container"
      className="relative rounded-xl shadow overflow-hidden border border-gray-300 cursor-crosshair"
    >
      {statusMessage && (
        <div
          className={`absolute top-3 right-3 z-[1000] px-4 py-2 text-sm rounded-lg shadow-lg transition-all duration-300
          ${loading ? 'bg-yellow-600 text-white animate-pulse' : 'bg-black/70 text-white'}`}
        >
          {statusMessage}
        </div>
      )}
      
      {/* Current Location Button */}
      <button 
        onClick={handleCurrentLocation}
        title="Use my current location"
        className="absolute bottom-6 right-3 z-[1000] p-3 bg-white text-emerald-600 hover:bg-slate-50 border border-slate-200 rounded-xl shadow-premium transition-all hover:scale-105"
      >
        <Navigation size={20} fill="currentColor" />
      </button>

      <MapContainer
        center={[21.5937, 81.9629]}
        zoom={5}
        style={{ height: '400px', width: '100%' }}
        whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <SearchControl
          onSearch={({ lat, lng }) => {
            setPosition([lat, lng]);
            setStatusMessage("🔄 Fetching location...");
            onSelect({ lat, lng });
          }}
        />
        <ClickHandler />
        <LocationMarker position={position} />
      </MapContainer>
    </div>
  );
}
