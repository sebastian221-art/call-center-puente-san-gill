import React from 'react';
import { Check, X } from 'lucide-react';

function KeywordSuggestions({ suggestions, onApprove, onReject }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Keywords Sugeridos
        </h3>
        <p className="text-gray-600 text-center py-8">
          No hay keywords pendientes de aprobación
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Keywords Sugeridos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Keyword
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Intención
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Frecuencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Confianza
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suggestions.map((suggestion, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium text-gray-900">{suggestion.keyword}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-info">{suggestion.intent}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {suggestion.frequency} veces
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="badge badge-success">
                    {(suggestion.confidence * 100).toFixed(0)}%
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => onApprove(suggestion)}
                    className="text-green-600 hover:text-green-700 mr-3"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onReject(suggestion)}
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

export default KeywordSuggestions;