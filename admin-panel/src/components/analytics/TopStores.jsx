import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function TopStores({ data }) {
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Tiendas Más Consultadas
        </h3>
        <p className="text-gray-600 text-center py-8">
          No hay datos disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Distribución de Consultas
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ store, percent }) => `${store} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
              nameKey="store"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Ranking de Consultas
        </h3>
        <div className="space-y-3">
          {data.slice(0, 10).map((store, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-600 rounded-full font-bold text-sm">
                  {index + 1}
                </span>
                <span className="text-gray-900 font-medium">{store.store}</span>
              </div>
              <span className="badge badge-info">{store.count} consultas</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopStores;