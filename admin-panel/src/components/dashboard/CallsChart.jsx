import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function CallsChart({ data }) {
  // Datos de ejemplo si no hay data
  const defaultData = [
    { time: '00:00', calls: 12 },
    { time: '04:00', calls: 8 },
    { time: '08:00', calls: 25 },
    { time: '12:00', calls: 45 },
    { time: '16:00', calls: 38 },
    { time: '20:00', calls: 28 },
  ];

  const chartData = data || defaultData;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Llamadas por Hora
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="calls" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            name="Llamadas"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CallsChart;