import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function TopIntents({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Top Intenciones
        </h3>
        <p className="text-gray-600 text-center py-8">
          No hay datos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Top 10 Intenciones Más Usadas
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="intent" 
            angle={-45} 
            textAnchor="end" 
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#0ea5e9" name="Cantidad" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TopIntents;