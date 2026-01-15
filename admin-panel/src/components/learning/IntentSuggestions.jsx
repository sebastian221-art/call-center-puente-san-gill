import React from 'react';

function IntentSuggestions({ suggestions, onApprove, onReject }) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nuevas Intenciones Sugeridas
        </h3>
        <p className="text-gray-600 text-center py-8">
          No hay nuevas intenciones detectadas
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Nuevas Intenciones Sugeridas
      </h3>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{suggestion.text}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Detectado {suggestion.frequency} veces
                </p>
                {suggestion.patterns && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Patrones detectados:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {suggestion.patterns.map((pattern, i) => (
                        <span key={i} className="badge badge-info text-xs">
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(suggestion)}
                  className="btn-primary text-sm"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => onReject(suggestion)}
                  className="btn-secondary text-sm"
                >
                  Rechazar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IntentSuggestions;