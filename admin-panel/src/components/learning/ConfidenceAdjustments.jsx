import React from 'react';
import { Check, X } from 'lucide-react';

function ConfidenceAdjustments({ adjustments, onApprove, onReject }) {
  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ajustes de Confianza Sugeridos
        </h3>
        <p className="text-gray-600 text-center py-8">
          No hay ajustes pendientes
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Ajustes de Confianza Sugeridos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intención
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Confianza Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Confianza Sugerida
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tasa de Éxito
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Muestras
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adjustments.map((adjustment, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{adjustment.intent}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(adjustment.currentConfidence * 100).toFixed(0)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-blue-600">
                    {(adjustment.suggestedConfidence * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-success">
                    {adjustment.successRate}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {adjustment.totalSamples}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onApprove(adjustment)}
                    className="text-green-600 hover:text-green-700 mr-3"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onReject(adjustment)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConfidenceAdjustments;