// src/App.js
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapComponent from './MapComponent';
import ResultsDashboard from './ResultsDashboard';
import Header from './Header';
import axios from 'axios';
import './App.css';
import About from './About';
import { AuthProvider } from './AuthContext';
import AuthModal from './AuthModal';

function App() {
  const [data, setData] = useState({
    location: { lat: 0, lon: 0 },
    weather: {
      temperature: 0,
      wind_speed: 0,
      pressure: 0,
      humidity: 0
    },
    fire: {
      fire_count: 0,
      avg_frp: 0,
      max_frp: 0,
      avg_confidence: 0,
      avg_brightness: 0
    },
    co2: 0,
    no2: 0,
    alerts: {
      co2: "⏳ Waiting...",
      no2: "⏳ Waiting..."
    },
    ghg_causes: ["📄 No causes detected yet. Please select a location."],
    ghg_effects: ["💡 Effects will be displayed after prediction."],
    precautions: ["🟢 General advice: Stay informed and check local updates."],
    affected_nearby_places: {},
  });

  const [loading, setLoading] = useState(false);

  const handleMapClick = async ({ lat, lng }) => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/predict/', {
        lat: lat,
        lon: lng
      });
      setData({
        ...response.data,
        location: { lat, lon: lng }
      });
    } catch (err) {
      console.error('API error:', err);
      alert('Failed to fetch prediction data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
          <Header />
          <AuthModal />

        <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <MapComponent onSelect={handleMapClick} loading={loading} />
                  <ResultsDashboard data={data} loading={loading} />
                </>
              }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
