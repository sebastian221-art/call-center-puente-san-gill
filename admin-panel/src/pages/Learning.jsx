import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, Brain, TrendingUp } from 'lucide-react';
import { learningAPI } from '../api/client';

function Learning() {
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [intentSuggestions, setIntentSuggestions] = useState([]);
  const [confidenceAdjustments, setConfidenceAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const [keywordsRes, intentsRes, confidenceRes] = await Promise.all([
        learningAPI.getKeywordSuggestions(5),
        learningAPI.getIntentSuggestions(3),
        learningAPI.getConfidenceAdjustments()
      ]);

      setKeywordSuggestions(keywordsRes.data.data);
      setIntentSuggestions(intentsRes.data.data);
      setConfidenceAdjustments(confidenceRes.data.data);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveKeyword = async (suggestion) => {
    try {
      await learningAPI.approveKeyword({
        intent: suggestion.intent,
        keyword: suggestion.keyword
      });
      await loadSuggestions();
      alert('Keyword aprobado exitosamente');
    } catch (error) {
      console.error('Error approving keyword:', error);
      alert('Error al aprobar keyword');
    }
  };

  const handleResetLearning = async () => {
    if (!window.confirm('¿Estás seguro de reiniciar el sistema de aprendizaje?')) return;

    try {
      await learningAPI.reset();
      await loadSuggestions();
      alert('Sistema reiniciado exitosamente');
    } catch (error) {
      console.error('Error resetting learning:', error);
      alert('Error al reiniciar sistema');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprendizaje Automático</h1>
          <p className="text-gray-600 mt-1">
            Revisa y aprueba las sugerencias del sistema de IA
          </p>
        </div>
        <button onClick={handleResetLearning} className="btn-danger flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Reiniciar Sistema
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Brain className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Keywords Sugeridos</p>
              <p className="text-2xl font-bold text-gray-900">{keywordSuggestions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Nuevas Intenciones</p>
              <p className="text-2xl font-bold text-gray-900">{intentSuggestions.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ajustes de Confianza</p>
              <p className="text-2xl font-bold text-gray-900">{confidenceAdjustments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keyword Suggestions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Keywords Sugeridos
        </h3>
        {keywordSuggestions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No hay keywords pendientes de aprobación
          </p>
        ) : (
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
                {keywordSuggestions.map((suggestion, index) => (
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
                        onClick={() => handleApproveKeyword(suggestion)}
                        className="text-green-600 hover:text-green-700 mr-3"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confidence Adjustments */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ajustes de Confianza Sugeridos
        </h3>
        {confidenceAdjustments.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No hay ajustes pendientes
          </p>
        ) : (
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
                {confidenceAdjustments.map((adjustment, index) => (
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
                      <button className="text-green-600 hover:text-green-700 mr-3">
                        <Check className="w-5 h-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Intent Suggestions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Nuevas Intenciones Sugeridas
        </h3>
        {intentSuggestions.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No hay nuevas intenciones detectadas
          </p>
        ) : (
          <div className="space-y-4">
            {intentSuggestions.map((suggestion, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{suggestion.text}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Detectado {suggestion.frequency} veces
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-primary text-sm">
                      Aprobar
                    </button>
                    <button className="btn-secondary text-sm">
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Learning;