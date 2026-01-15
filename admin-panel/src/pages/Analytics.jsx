import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Phone, Clock } from 'lucide-react';
import { analyticsAPI } from '../api/client';

function Analytics() {
  const [topIntents, setTopIntents] = useState([]);
  const [topStores, setTopStores] = useState([]);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [intentsRes, storesRes, errorsRes] = await Promise.all([
        analyticsAPI.getTopIntents(10),
        analyticsAPI.getTopStores(10),
        analyticsAPI.getErrors()
      ]);

      setTopIntents(intentsRes.data.data);
      setTopStores(storesRes.data.data);
      setErrors(errorsRes.data.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">
          Análisis detallado del comportamiento del sistema
        </p>
      </div>

      {/* Error Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errores de Intención</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors?.summary.totalIntentErrors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Phone className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transferencias Fallidas</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors?.summary.totalTransferErrors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Timeouts</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors?.summary.totalTimeouts || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Feedback Negativo</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors?.summary.totalNegativeFeedback || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Intents Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Top 10 Intenciones Más Usadas
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topIntents}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="intent" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#0ea5e9" name="Cantidad" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Stores Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Tiendas Más Consultadas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topStores}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ store, percent }) => `${store} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                nameKey="store"
              >
                {topStores.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Ranking de Consultas
          </h3>
          <div className="space-y-3">
            {topStores.slice(0, 10).map((store, index) => (
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

      {/* Error Patterns */}
      {errors?.patterns && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Patrones de Errores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Intenciones con Más Errores
              </h4>
              <div className="space-y-2">
                {errors.patterns.mostFailedIntents.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.intent}</span>
                    <span className="badge badge-error">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Transferencias Fallidas
              </h4>
              <div className="space-y-2">
                {errors.patterns.mostFailedTransfers.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.store}</span>
                    <span className="badge badge-warning">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Timeouts por Intención
              </h4>
              <div className="space-y-2">
                {errors.patterns.timeoutPatterns.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.intent}</span>
                    <span className="badge badge-info">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;