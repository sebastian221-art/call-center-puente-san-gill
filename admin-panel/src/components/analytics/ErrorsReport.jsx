import React from 'react';
import { AlertTriangle, XCircle, Clock } from 'lucide-react';

function ErrorsReport({ errors }) {
  if (!errors) {
    return (
      <div className="card">
        <p className="text-gray-600 text-center py-8">Cargando errores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Errores de Intención</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors.summary?.totalIntentErrors || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Transferencias Fallidas</p>
              <p className="text-2xl font-bold text-gray-900">
                {errors.summary?.totalTransferErrors || 0}
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
                {errors.summary?.totalTimeouts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Patterns */}
      {errors.patterns && (
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
                {errors.patterns.mostFailedIntents?.slice(0, 5).map((item, index) => (
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
                {errors.patterns.mostFailedTransfers?.slice(0, 5).map((item, index) => (
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
                {errors.patterns.timeoutPatterns?.slice(0, 5).map((item, index) => (
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

export default ErrorsReport;