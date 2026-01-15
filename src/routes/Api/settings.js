// src/routes/api/settings.js

import express from 'express';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * API REST para Configuración del Sistema
 * 
 * Endpoints:
 * GET    /api/settings               - Obtiene configuración actual
 * PUT    /api/settings               - Actualiza configuración
 * GET    /api/settings/voice         - Configuración de voz
 * PUT    /api/settings/voice         - Actualiza voz
 * GET    /api/settings/optimization  - Configuración de optimización
 * PUT    /api/settings/optimization  - Actualiza optimización
 */

// Configuración en memoria (en producción iría en DB)
let systemSettings = {
  general: {
    maxCallDuration: 300, // 5 minutos
    silenceTimeout: 30, // segundos
    maxSilenceCount: 3,
    autoCleanupInterval: 300000 // 5 minutos
  },
  voice: {
    provider: 'Polly',
    voice: 'Lupe',
    language: 'es-MX',
    speed: 1.0,
    volume: 1.0
  },
  optimization: {
    maxWordsPerResponse: 15,
    useProgressiveResponses: true,
    usePrerecordedAudio: true,
    prerecordedPercentage: 80
  },
  learning: {
    enabled: true,
    autoApproveKeywords: false,
    minKeywordFrequency: 5,
    minIntentFrequency: 3
  },
  notifications: {
    emailAlerts: false,
    errorThreshold: 10,
    alertEmail: null
  }
};

/**
 * GET /api/settings
 * Obtiene toda la configuración
 */
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemSettings
    });
  } catch (error) {
    logger.error('Error obteniendo settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración'
    });
  }
});

/**
 * PUT /api/settings
 * Actualiza configuración general
 */
router.put('/', (req, res) => {
  try {
    const updates = req.body;
    
    // Validar que no se envíen campos inválidos
    const validSections = ['general', 'voice', 'optimization', 'learning', 'notifications'];
    const invalidSections = Object.keys(updates).filter(k => !validSections.includes(k));
    
    if (invalidSections.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Secciones inválidas: ${invalidSections.join(', ')}`
      });
    }
    
    // Actualizar secciones
    Object.keys(updates).forEach(section => {
      if (systemSettings[section]) {
        systemSettings[section] = {
          ...systemSettings[section],
          ...updates[section]
        };
      }
    });
    
    logger.info('Configuración actualizada', { sections: Object.keys(updates) });
    
    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: systemSettings
    });
  } catch (error) {
    logger.error('Error actualizando settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración'
    });
  }
});

/**
 * GET /api/settings/voice
 * Obtiene configuración de voz
 */
router.get('/voice', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemSettings.voice
    });
  } catch (error) {
    logger.error('Error obteniendo voice settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de voz'
    });
  }
});

/**
 * PUT /api/settings/voice
 * Actualiza configuración de voz
 */
router.put('/voice', (req, res) => {
  try {
    const updates = req.body;
    
    // Validar campos permitidos
    const validFields = ['provider', 'voice', 'language', 'speed', 'volume'];
    const invalidFields = Object.keys(updates).filter(k => !validFields.includes(k));
    
    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos inválidos: ${invalidFields.join(', ')}`
      });
    }
    
    // Validar valores
    if (updates.speed && (updates.speed < 0.5 || updates.speed > 2.0)) {
      return res.status(400).json({
        success: false,
        error: 'Speed debe estar entre 0.5 y 2.0'
      });
    }
    
    if (updates.volume && (updates.volume < 0 || updates.volume > 1.0)) {
      return res.status(400).json({
        success: false,
        error: 'Volume debe estar entre 0 y 1.0'
      });
    }
    
    systemSettings.voice = {
      ...systemSettings.voice,
      ...updates
    };
    
    logger.info('Configuración de voz actualizada', { updates });
    
    res.json({
      success: true,
      message: 'Configuración de voz actualizada',
      data: systemSettings.voice
    });
  } catch (error) {
    logger.error('Error actualizando voice settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración de voz'
    });
  }
});

/**
 * GET /api/settings/optimization
 * Obtiene configuración de optimización
 */
router.get('/optimization', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemSettings.optimization
    });
  } catch (error) {
    logger.error('Error obteniendo optimization settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de optimización'
    });
  }
});

/**
 * PUT /api/settings/optimization
 * Actualiza configuración de optimización
 */
router.put('/optimization', (req, res) => {
  try {
    const updates = req.body;
    
    // Validar maxWordsPerResponse
    if (updates.maxWordsPerResponse && updates.maxWordsPerResponse < 5) {
      return res.status(400).json({
        success: false,
        error: 'maxWordsPerResponse debe ser al menos 5'
      });
    }
    
    // Validar prerecordedPercentage
    if (updates.prerecordedPercentage && 
        (updates.prerecordedPercentage < 0 || updates.prerecordedPercentage > 100)) {
      return res.status(400).json({
        success: false,
        error: 'prerecordedPercentage debe estar entre 0 y 100'
      });
    }
    
    systemSettings.optimization = {
      ...systemSettings.optimization,
      ...updates
    };
    
    logger.info('Configuración de optimización actualizada', { updates });
    
    res.json({
      success: true,
      message: 'Configuración de optimización actualizada',
      data: systemSettings.optimization
    });
  } catch (error) {
    logger.error('Error actualizando optimization settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración'
    });
  }
});

/**
 * GET /api/settings/learning
 * Obtiene configuración de aprendizaje
 */
router.get('/learning', (req, res) => {
  try {
    res.json({
      success: true,
      data: systemSettings.learning
    });
  } catch (error) {
    logger.error('Error obteniendo learning settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración'
    });
  }
});

/**
 * PUT /api/settings/learning
 * Actualiza configuración de aprendizaje
 */
router.put('/learning', (req, res) => {
  try {
    const updates = req.body;
    
    systemSettings.learning = {
      ...systemSettings.learning,
      ...updates
    };
    
    logger.info('Configuración de aprendizaje actualizada', { updates });
    
    res.json({
      success: true,
      message: 'Configuración actualizada',
      data: systemSettings.learning
    });
  } catch (error) {
    logger.error('Error actualizando learning settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración'
    });
  }
});

/**
 * POST /api/settings/reset
 * Resetea configuración a valores por defecto
 */
router.post('/reset', (req, res) => {
  try {
    systemSettings = {
      general: {
        maxCallDuration: 300,
        silenceTimeout: 30,
        maxSilenceCount: 3,
        autoCleanupInterval: 300000
      },
      voice: {
        provider: 'Polly',
        voice: 'Lupe',
        language: 'es-MX',
        speed: 1.0,
        volume: 1.0
      },
      optimization: {
        maxWordsPerResponse: 15,
        useProgressiveResponses: true,
        usePrerecordedAudio: true,
        prerecordedPercentage: 80
      },
      learning: {
        enabled: true,
        autoApproveKeywords: false,
        minKeywordFrequency: 5,
        minIntentFrequency: 3
      },
      notifications: {
        emailAlerts: false,
        errorThreshold: 10,
        alertEmail: null
      }
    };
    
    logger.info('Configuración reseteada a valores por defecto');
    
    res.json({
      success: true,
      message: 'Configuración reseteada exitosamente',
      data: systemSettings
    });
  } catch (error) {
    logger.error('Error reseteando settings', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al resetear configuración'
    });
  }
});

export default router;