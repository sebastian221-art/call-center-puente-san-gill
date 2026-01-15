import React, { useState, useEffect } from 'react';
import { Phone, Users, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import MetricCard from '../components/dashboard/MetricCard';
import { analyticsAPI } from '../api/client';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
    const interval = setInterval(loadSummary, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  const loadSummary = async () => {
    try {
      const { data } = await analyticsAPI.getSummary();
      setSummary(data.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Vista general del sistema en tiempo real
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Llamadas Activas"
          value={summary?.conversations.active || 0}
          subtitle={`Prom. ${summary?.conversations.averageDuration || '0s'}`}
          icon={Phone}
          color="blue"
        />
        <MetricCard
          title="Tasa de Éxito"
          value={summary?.learning.successRate || '0%'}
          subtitle={`${summary?.learning.totalProcessed || 0} procesadas`}
          icon={TrendingUp}
          color="green"
          trend={5}
        />
        <MetricCard
          title="Satisfacción"
          value={summary?.conversations.satisfactionRate || '0%'}
          subtitle={`${summary?.conversations.averageTurns || 0} turnos prom.`}
          icon={Users}
          color="yellow"
        />
        <MetricCard
          title="Errores"
          value={summary?.errors.total || 0}
          subtitle={`${summary?.errors.timeouts || 0} timeouts`}
          icon={AlertCircle}
          color="red"
        />
      </div>

      {/* Información del sistema */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Estado del Sistema
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Uptime</span>
              <span className="font-medium text-gray-900">
                {Math.floor((summary?.system.uptime || 0) / 3600)}h {Math.floor(((summary?.system.uptime || 0) % 3600) / 60)}m
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Memoria en uso</span>
              <span className="font-medium text-gray-900">
                {summary?.system.memoryUsage?.toFixed(2) || 0} MB
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Sugerencias pendientes</span>
              <span className="font-medium text-gray-900">
                {summary?.learning.pendingSuggestions || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tipos de Errores
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Detección de intención</span>
              <span className="badge badge-error">
                {summary?.errors.intentErrors || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Transferencias</span>
              <span className="badge badge-warning">
                {summary?.errors.transferErrors || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Timeouts</span>
              <span className="badge badge-info">
                {summary?.errors.timeouts || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas actualizaciones */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Información Rápida
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Sistema Optimizado</p>
            <p className="text-xs text-blue-500 mt-1">
              Respuestas ultra-cortas activas
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Aprendizaje Activo</p>
            <p className="text-xs text-green-500 mt-1">
              IA mejorando automáticamente
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">100 Llamadas</p>
            <p className="text-xs text-purple-500 mt-1">
              Capacidad simultánea disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;