import React from 'react';
import CurrentLevelsChart from './CurrentLevelsChart';
import NearbyPlacesMap from './NearbyPlacesMap';
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  Flame,
  Zap,
  Target,
  Sun,
  Brain,
  Leaf,
  AlertCircle,
  Activity,
  ShieldCheck,
  Info,
} from 'lucide-react';

export default function ResultsDashboard({ data, loading }) {
  if (!data) return <div className="p-6 text-gray-700">No data available.</div>;

  const {
    weather = {},
    fire = {},
    co2 = 0,
    no2 = 0,
    alerts = {},
    ghg_causes = [],
    ghg_effects = [],
    precautions = [],
    disaster_risks = {},
    affected_nearby_places = {},
    location = {},
  } = data;

  return (
    <div className="relative space-y-10 text-slate-800 pb-10">
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-50/70 backdrop-blur-md rounded-3xl">
          <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-premium border border-slate-100">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-semibold text-slate-700 tracking-tight">Analyzing environment data...</p>
          </div>
        </div>
      )}

      {/* Selected Location Title */}
      {data.location_name && (
        <div className="text-center mt-2 mb-8 animate-fade-in">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            📍 {data.location_name}
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Coordinates: {data.location?.lat?.toFixed(4)}, {data.location?.lon?.toFixed(4)}
          </p>
        </div>
      )}

      {/* Weather Section */}
      <SectionHeader icon={<Thermometer size={24} />} title="Weather Data" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard title="Temperature" value={`${weather.temperature ?? 'N/A'} °C`} icon={<Thermometer size={20} />} />
        <InfoCard title="Humidity" value={`${weather.humidity ?? 'N/A'} %`} icon={<Droplets size={20} />} />
        <InfoCard title="Wind Speed" value={`${weather.wind_speed ?? 'N/A'} km/h`} icon={<Wind size={20} />} />
        <InfoCard title="Pressure" value={`${weather.pressure ?? 'N/A'} hPa`} icon={<Gauge size={20} />} />
      </div>

      {/* Fire Data Section */}
      <SectionHeader icon={<Flame size={24} />} title="NASA FIRMS Fire Data" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <InfoCard title="Fire Count" value={fire.fire_count ?? 'N/A'} icon={<Flame size={20} />} />
        <InfoCard title="Average FRP" value={`${(fire.avg_frp ?? 0).toFixed(1)} MW`} icon={<Zap size={20} />} />
        <InfoCard title="Max FRP" value={`${fire.max_frp ?? 'N/A'} MW`} icon={<Target size={20} />} />
        <InfoCard title="Confidence" value={`${fire.avg_confidence ?? 'N/A'} %`} icon={<Target size={20} />} />
        <InfoCard title="Brightness" value={`${(fire.avg_brightness ?? 0).toFixed(1)} K`} icon={<Sun size={20} />} />
      </div>

      {/* AI Model Predictions */}
      <SectionHeader icon={<Brain size={24} />} title="AI Model Predictions" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <PredictionCard
          title="CO₂ Concentration"
          value={`${co2 ?? 0} ppm`}
          icon={<Leaf size={24} />}
          badge={alerts?.co2?.includes('High') ? 'Warning' : 'Safe'}
        />
        <PredictionCard
          title="NO₂ Concentration"
          value={`${no2 ?? 0} ppb`}
          icon={<Wind size={24} />}
          badge={alerts?.no2?.includes('Hazardous') ? 'Warning' : 'Safe'}
        />
        <PredictionCard
          title="Air Quality Index"
          value={data.aqi !== undefined && data.aqi !== null ? data.aqi : calculateAQI(co2, no2)}
          icon={<Gauge size={24} />}
          badge={(data.aqi || calculateAQI(co2, no2)) > 100 ? 'Warning' : 'Safe'}
        />
      </div>

      {/* GHG Insights Section */}
      <GHGInsights
        causes={ghg_causes}
        effects={ghg_effects}
        precautions={precautions}
      />
      {/* Realtime Alerting System Title */}
      <div className="text-center mt-8 mb-4">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Realtime Alerting System
        </h2>
        <p className="mt-2 text-gray-600 text-lg">
          Monitoring Key Threats to Health and Safety in Your Area
        </p>
      </div>
      {/* Disaster Intelligence Section */}
      <SectionHeader icon={<AlertCircle size={24} />} title="Disaster Intelligence" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RiskCard
          title="🔥 Fire Risk"
          description={disaster_risks.fire_risk?.reason || "No data available."}
          status={disaster_risks.fire_risk?.status || "Unknown"}
        />
        <RiskCard
          title="🌡️ Heatwave"
          description={disaster_risks.heatwave?.reason || "No data available."}
          status={disaster_risks.heatwave?.status || "Unknown"}
        />
        <RiskCard
          title="🌪️ Storm Warning"
          description={disaster_risks.storm_warning?.reason || "No data available."}
          status={disaster_risks.storm_warning?.status || "Unknown"}
        />
        <RiskCard
          title="🌵 Drought Alert"
          description={disaster_risks.drought_alert?.reason || "No data available."}
          status={disaster_risks.drought_alert?.status || "Unknown"}
        />
        <RiskCard
          title="🌫️ Smog Alert"
          description={disaster_risks.smog_alert?.reason || "No data available."}
          status={disaster_risks.smog_alert?.status || "Unknown"}
        />
      </div>

      {/* Affected Nearby Places Section */}
      <SectionHeader icon={<ShieldCheck size={24} />} title="Alerting Nearby Places" />

      {!location?.lat ? (
        // No location selected yet
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
          <span className="text-xl">📍</span>
          <span>Click a location on the map above to see nearby hospitals and schools.</span>
        </div>
      ) : Object.keys(affected_nearby_places).length > 0 ? (
        // Places found — render list
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(affected_nearby_places).map(([type, places]) => (
            <div key={type}>
              <h3 className="text-md font-semibold text-gray-700 capitalize mb-2">
                {type === 'school' ? '🏫 Schools' : type === 'hospital' ? '🏥 Hospitals' : type}
              </h3>
              <ul className="space-y-2 text-sm text-gray-800">
                {places.map((place, idx) => (
                  <li
                    key={idx}
                    className="bg-white border border-gray-200 rounded-md px-4 py-2 shadow-sm hover:shadow-md transition"
                  >
                    <div className="font-medium">{place.name}</div>
                    <div className="text-gray-500 text-xs">
                      ({place.lat.toFixed(4)}, {place.lon.toFixed(4)}) | {place.distance_km} km away
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // Location selected but Overpass found nothing within 10 km
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
          <span className="text-xl">🔍</span>
          <span>
            No hospitals or schools found within 10 km of ({location.lat?.toFixed(4)}, {location.lon?.toFixed(4)}).
            Try clicking a location near a city.
          </span>
        </div>
      )}

      {/* Map of Affected Nearby Places */}
      {Object.keys(affected_nearby_places).length > 0 && location?.lat && (
        <NearbyPlacesMap
          places={affected_nearby_places}
          center={location}
        />
      )}

      {/* Chart Section */}
      <CurrentLevelsChart data={data} />
    </div>
  );
}

// Reusable Components...
// (SectionHeader, InfoCard, PredictionCard, GHGInsights, InsightCard, RiskCard, calculateAQI remain unchanged from your code)

// Section Header
function SectionHeader({ icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-emerald-600">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">
        {title}
      </h2>
    </div>
  );
}

// Info Card
function InfoCard({ title, value, icon }) {
  const [val, unit] = String(value).includes(' ')
    ? String(value).split(' ')
    : [value, ''];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 border border-slate-100 group">
      <div className="text-sm font-medium text-slate-500 flex justify-between items-center mb-3">
        <span>{title}</span>
        <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-slate-800 tracking-tight">
        {val}
        {unit && (
          <span className="text-base font-semibold text-slate-500 ml-1.5 align-baseline">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

// Prediction Card with Visual Severity Bar
function PredictionCard({ title, value, icon, badge }) {
  const [val, unit] = String(value).includes(' ')
    ? String(value).split(' ')
    : [value, ''];

  const badgeStyle =
    badge === 'Warning'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : badge === 'Safe'
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  // Calculate percentage for the visual bar (mock logic based on typical safe maximums)
  // CO2 safe ~400, Warning >450. NO2 safe <25, Warning >30. AQI safe <50.
  let percentage = 0;
  let barColor = 'bg-emerald-400';
  const numericVal = parseFloat(val) || 0;

  if (title.includes('CO₂')) {
    percentage = Math.min((numericVal / 600) * 100, 100);
    if (numericVal > 450) barColor = 'bg-amber-500';
    if (numericVal > 500) barColor = 'bg-red-500';
  } else if (title.includes('NO₂')) {
    percentage = Math.min((numericVal / 50) * 100, 100);
    if (numericVal > 25) barColor = 'bg-amber-500';
    if (numericVal > 35) barColor = 'bg-red-500';
  } else {
    // AQI
    percentage = Math.min((numericVal / 200) * 100, 100);
    if (numericVal > 50) barColor = 'bg-amber-500';
    if (numericVal > 100) barColor = 'bg-red-500';
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 border border-slate-100 relative overflow-hidden group">
      <div className="text-sm font-medium text-slate-500 flex justify-between items-center mb-3 relative z-10">
        <span className="flex items-center gap-1.5">
          {title}
          <div className="relative group/tooltip cursor-help">
            <Info size={14} className="text-slate-400 hover:text-slate-600" />
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-[11px] rounded shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-20">
              AI predicted level for the next hour based on satellite data.
            </div>
          </div>
        </span>
        <span className="text-slate-400 group-hover:text-emerald-500 transition-colors">{icon}</span>
      </div>
      <div className="flex justify-between items-end mb-4 relative z-10">
        <div className="text-4xl font-bold text-slate-800 tracking-tight">
          {val}
          {unit && (
            <span className="text-lg font-semibold text-slate-500 ml-1.5 align-baseline">
              {unit}
            </span>
          )}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${badgeStyle}`}>
          {badge}
        </span>
      </div>
      
      {/* Visual Severity Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative z-10">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// GHG Insights
function GHGInsights({ causes = [], effects = [], precautions = [] }) {
  if (causes.length === 0 && effects.length === 0 && precautions.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InsightCard
        title="Causes"
        icon={<AlertCircle size={20} />}
        items={causes}
        color="border-orange-400 bg-orange-50"
      />
      <InsightCard
        title="Effects"
        icon={<Activity size={20} />}
        items={effects}
        color="border-yellow-400 bg-yellow-50"
      />
      <InsightCard
        title="Precautions"
        icon={<ShieldCheck size={20} />}
        items={precautions}
        color="border-green-400 bg-green-50"
      />
    </div>
  );
}

function InsightCard({ title, icon, items, color }) {
  return (
    <div className={`rounded-2xl p-5 shadow-sm hover:shadow-premium transition-all duration-300 border ${color}`}>
      <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold text-lg">
        <span className="p-1.5 bg-white/50 rounded-lg">{icon}</span>
        {title}
      </div>
      <ul className="list-disc pl-5 text-slate-700 text-sm space-y-2 leading-relaxed">
        {items.length > 0 ? (
          items.map((item, idx) => <li key={idx}>{item}</li>)
        ) : (
          <li className="text-slate-500 italic">No data available.</li>
        )}
      </ul>
    </div>
  );
}

// Risk Card
function RiskCard({ title, description, status }) {
  const badgeStyles = {
    Alert: 'bg-red-50 text-red-700 border-red-200',
    Caution: 'bg-amber-50 text-amber-700 border-amber-200',
    Safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Unknown: 'bg-slate-50 text-slate-600 border-slate-200'
  };

  const isSafe = status === 'Safe';

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 border ${isSafe ? 'border-slate-100' : 'border-amber-100'} group relative overflow-hidden`}>
      {/* Subtle indicator line on the left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSafe ? 'bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity' : status === 'Alert' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
      
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-bold text-slate-800 text-base">{title}</h4>
        <span className={`text-xs px-2.5 py-1 rounded-md border font-semibold ${badgeStyles[status] || badgeStyles.Unknown}`}>
          {status}
        </span>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

// AQI Calculator
function calculateAQI(co2 = 0, no2 = 0) {
  return Math.round((co2 / 10 + no2 * 2) / 2);
}
