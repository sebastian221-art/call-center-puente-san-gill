import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Volume2, Zap, Brain, Bell } from 'lucide-react';
import { settingsAPI } from '../api/client';

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Zap },
    { id: 'voice', label: 'Voz', icon: Volume2 },
    { id: 'optimization', label: 'Optimización', icon: Zap },
    { id: 'learning', label: 'Aprendizaje', icon: Brain },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await settingsAPI.getAll();
      setSettings(data.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Estás seguro de restaurar la configuración por defecto?')) return;

    try {
      await settingsAPI.reset();
      await loadSettings();
      alert('Configuración restaurada exitosamente');
    } catch (error) {
      console.error('Error resetting settings:', error);
      alert('Error al restaurar configuración');
    }
  };

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
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
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la configuración del sistema
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Restaurar
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors ${
                activeTab === id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'voice' && <VoiceSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'optimization' && <OptimizationSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'learning' && <LearningSettings settings={settings} updateSetting={updateSetting} />}
        {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} />}
      </div>
    </div>
  );
}

// ============================================
// GENERAL SETTINGS
// ============================================
function GeneralSettings({ settings, updateSetting }) {
  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración General
        </h3>
        <p className="text-sm text-gray-600">
          Parámetros básicos del sistema de llamadas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duración máxima de llamada (segundos)
          </label>
          <input
            type="number"
            value={settings.general.maxCallDuration}
            onChange={(e) => updateSetting('general', 'maxCallDuration', parseInt(e.target.value))}
            className="input w-full"
            min="60"
            max="600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tiempo máximo que puede durar una llamada
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout de silencio (segundos)
          </label>
          <input
            type="number"
            value={settings.general.silenceTimeout}
            onChange={(e) => updateSetting('general', 'silenceTimeout', parseInt(e.target.value))}
            className="input w-full"
            min="10"
            max="60"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tiempo de espera antes de detectar silencio
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de silencios permitidos
          </label>
          <input
            type="number"
            value={settings.general.maxSilenceCount}
            onChange={(e) => updateSetting('general', 'maxSilenceCount', parseInt(e.target.value))}
            className="input w-full"
            min="1"
            max="5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número de silencios antes de colgar
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Intervalo de limpieza automática (ms)
          </label>
          <input
            type="number"
            value={settings.general.autoCleanupInterval}
            onChange={(e) => updateSetting('general', 'autoCleanupInterval', parseInt(e.target.value))}
            className="input w-full"
            min="60000"
            max="600000"
            step="60000"
          />
          <p className="text-xs text-gray-500 mt-1">
            Frecuencia de limpieza de contextos antiguos
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// VOICE SETTINGS
// ============================================
function VoiceSettings({ settings, updateSetting }) {
  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuración de Voz
        </h3>
        <p className="text-sm text-gray-600">
          Personaliza la voz del asistente
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Proveedor de voz
          </label>
          <select
            value={settings.voice.provider}
            onChange={(e) => updateSetting('voice', 'provider', e.target.value)}
            className="input w-full"
          >
            <option value="Polly">Amazon Polly</option>
            <option value="ElevenLabs">ElevenLabs</option>
            <option value="Google">Google TTS</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Voz
          </label>
          <select
            value={settings.voice.voice}
            onChange={(e) => updateSetting('voice', 'voice', e.target.value)}
            className="input w-full"
          >
            <option value="Lupe">Lupe (Femenina)</option>
            <option value="Miguel">Miguel (Masculina)</option>
            <option value="Penelope">Penélope (Femenina)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Idioma
          </label>
          <select
            value={settings.voice.language}
            onChange={(e) => updateSetting('voice', 'language', e.target.value)}
            className="input w-full"
          >
            <option value="es-MX">Español (México)</option>
            <option value="es-ES">Español (España)</option>
            <option value="es-CO">Español (Colombia)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Velocidad: {settings.voice.speed}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.voice.speed}
            onChange={(e) => updateSetting('voice', 'speed', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0.5x (Lenta)</span>
            <span>2.0x (Rápida)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volumen: {Math.round(settings.voice.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.voice.volume}
            onChange={(e) => updateSetting('voice', 'volume', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% (Silencio)</span>
            <span>100% (Máximo)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// OPTIMIZATION SETTINGS
// ============================================
function OptimizationSettings({ settings, updateSetting }) {
  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Optimización de Costos
        </h3>
        <p className="text-sm text-gray-600">
          Configura las opciones de ahorro
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de palabras por respuesta
          </label>
          <input
            type="number"
            value={settings.optimization.maxWordsPerResponse}
            onChange={(e) => updateSetting('optimization', 'maxWordsPerResponse', parseInt(e.target.value))}
            className="input w-full"
            min="5"
            max="50"
          />
          <p className="text-xs text-gray-500 mt-1">
            Límite de palabras para respuestas cortas (ahorro de tiempo)
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Respuestas progresivas</p>
            <p className="text-sm text-gray-600">
              Da información por partes, pregunta qué aspecto específico
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.optimization.useProgressiveResponses}
              onChange={(e) => updateSetting('optimization', 'useProgressiveResponses', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Usar audio pregrabado</p>
            <p className="text-sm text-gray-600">
              Usa audios pregrabados para respuestas comunes (80% ahorro)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.optimization.usePrerecordedAudio}
              onChange={(e) => updateSetting('optimization', 'usePrerecordedAudio', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Porcentaje de audio pregrabado: {settings.optimization.prerecordedPercentage}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={settings.optimization.prerecordedPercentage}
            onChange={(e) => updateSetting('optimization', 'prerecordedPercentage', parseInt(e.target.value))}
            className="w-full"
            disabled={!settings.optimization.usePrerecordedAudio}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0% (Todo TTS)</span>
            <span>100% (Todo pregrabado)</span>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Ahorro Estimado</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-blue-600">Tiempo por llamada</p>
              <p className="text-2xl font-bold text-blue-900">-40%</p>
            </div>
            <div>
              <p className="text-blue-600">Costo por llamada</p>
              <p className="text-2xl font-bold text-blue-900">$108 COP</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LEARNING SETTINGS
// ============================================
function LearningSettings({ settings, updateSetting }) {
  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Sistema de Aprendizaje
        </h3>
        <p className="text-sm text-gray-600">
          Configura cómo la IA aprende y mejora
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Aprendizaje automático</p>
            <p className="text-sm text-gray-600">
              Permite que el sistema aprenda de las conversaciones
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.learning.enabled}
              onChange={(e) => updateSetting('learning', 'enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Auto-aprobar keywords</p>
            <p className="text-sm text-gray-600">
              Aprobar automáticamente keywords con alta confianza
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.learning.autoApproveKeywords}
              onChange={(e) => updateSetting('learning', 'autoApproveKeywords', e.target.checked)}
              className="sr-only peer"
              disabled={!settings.learning.enabled}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia mínima de keyword
          </label>
          <input
            type="number"
            value={settings.learning.minKeywordFrequency}
            onChange={(e) => updateSetting('learning', 'minKeywordFrequency', parseInt(e.target.value))}
            className="input w-full"
            min="1"
            max="20"
            disabled={!settings.learning.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Veces que debe aparecer un keyword antes de sugerirlo
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia mínima de intención
          </label>
          <input
            type="number"
            value={settings.learning.minIntentFrequency}
            onChange={(e) => updateSetting('learning', 'minIntentFrequency', parseInt(e.target.value))}
            className="input w-full"
            min="1"
            max="10"
            disabled={!settings.learning.enabled}
          />
          <p className="text-xs text-gray-500 mt-1">
            Veces que debe detectarse un patrón antes de sugerir nueva intención
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// NOTIFICATION SETTINGS
// ============================================
function NotificationSettings({ settings, updateSetting }) {
  return (
    <div className="card space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Notificaciones
        </h3>
        <p className="text-sm text-gray-600">
          Configura alertas y notificaciones del sistema
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium text-gray-900">Alertas por email</p>
            <p className="text-sm text-gray-600">
              Recibe notificaciones de errores críticos
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications.emailAlerts}
              onChange={(e) => updateSetting('notifications', 'emailAlerts', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email de alertas
          </label>
          <input
            type="email"
            value={settings.notifications.alertEmail || ''}
            onChange={(e) => updateSetting('notifications', 'alertEmail', e.target.value)}
            className="input w-full"
            placeholder="admin@ejemplo.com"
            disabled={!settings.notifications.emailAlerts}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Umbral de errores
          </label>
          <input
            type="number"
            value={settings.notifications.errorThreshold}
            onChange={(e) => updateSetting('notifications', 'errorThreshold', parseInt(e.target.value))}
            className="input w-full"
            min="1"
            max="100"
            disabled={!settings.notifications.emailAlerts}
          />
          <p className="text-xs text-gray-500 mt-1">
            Número de errores antes de enviar alerta
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings;