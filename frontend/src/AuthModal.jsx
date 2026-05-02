import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { X, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';

// Fix default marker icons if needed here too
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
      searchLabel: 'Search for a city...',
      keepResult: true,
    });
    map.addControl(searchControl);
    map.on('geosearch/showlocation', (result) => {
      onSearch([result.location.y, result.location.x]);
      map.setView([result.location.y, result.location.x], 10, { animate: true });
    });
    return () => map.removeControl(searchControl);
  }, [map, onSearch]);
  return null;
}

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState(null); // For registration location
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isAuthModalOpen) {
      setEmail('');
      setPassword('');
      setError('');
      setPosition(null);
      setLoading(false);
    }
  }, [isAuthModalOpen, isLogin]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!position) {
          setError('Please select your alert location on the map.');
          setLoading(false);
          return;
        }
        await register(email, password, position[0], position[1]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = (e) => {
    e.preventDefault();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          setError("Location access denied or unavailable.");
        }
      );
    } else {
      setError("Geolocation not supported by your browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative animate-slide-up">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isLogin 
              ? 'Sign in to access your custom environmental alerts.' 
              : 'Sign up to receive automated threat alerts for your area.'}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Select Alert Location <span className="text-red-500">*</span>
                </label>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-slate-500">Search, click on the map, or use GPS.</p>
                  <button 
                    onClick={handleCurrentLocation}
                    type="button"
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                  >
                    <Navigation size={12} fill="currentColor" /> Use My Location
                  </button>
                </div>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                  <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchControl onSearch={setPosition} />
                    <LocationPicker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                {position && (
                  <p className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                    <MapPin size={12} /> Selected: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                  </p>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-premium hover:shadow-premium-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
