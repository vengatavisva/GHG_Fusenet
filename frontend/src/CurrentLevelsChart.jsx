import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function CurrentLevelsChart({ data }) {
  // Provide default empty forecast data to show chart before API fetch
  const forecast = data?.forecast ?? Array.from({ length: 12 }, (_, i) => ({
    hour: i,
    co2: 0,
    no2: 0,
    temperature: 0,
  }));

  // Prepare formatted forecast data for chart
  const forecastChartData = forecast.map(point => ({
    hour: point.hour ?? new Date(point.timestamp).getHours(),
    co2: point.co2 ?? 0,
    no2: point.no2 ?? 0,
    temperature: point.temperature ?? 0
  }));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-premium border border-slate-100 mt-10 no-print">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-2 tracking-tight">
        Real-Time CO₂, NO₂ & Temperature Forecast
      </h2>
      <p className="text-center text-slate-500 text-sm mb-8 font-medium">
        Next 24 hours predicted greenhouse gas and temperature trends
      </p>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={forecastChartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 12 }}
            label={{ value: 'Hour', position: 'insideBottomRight', offset: -5 }}
          />
          <YAxis />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'co2') return [`${value}`, 'CO₂ (ppm)'];
              if (name === 'no2') return [`${value}`, 'NO₂ (ppb)'];
              if (name === 'temperature') return [`${value}°C`, 'Temperature'];
              return [value, name];
            }}
            contentStyle={{ borderRadius: '10px', backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="co2"
            stroke="#ef4444" // 🔴 Red for CO₂
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="no2"
            stroke="#22c55e" // 🟢 Green for NO₂
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke="#3b82f6" // 🔵 Blue for temperature
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
