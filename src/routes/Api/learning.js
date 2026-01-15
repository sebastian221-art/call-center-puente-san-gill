// src/routes/api/learning.js

import express from 'express';
import { autoLearningEngine } from '../../services/learning/AutoLearningEngine.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * API REST para Sistema de Aprendizaje
 * 
 * Endpoints:
 * GET  /api/learning/suggestions/keywords   - Keywords sugeridos
 * GET  /api/learning/suggestions/intents    - Intenciones sugeridas
 * GET  /api/learning/suggestions/confidence - Ajustes de confianza
 * POST /api/learning/approve/keyword        - Aprobar keyword
 * POST /api/learning/approve/intent         - Aprobar intención
 * POST /api/learning/reset                  - Reiniciar aprendizaje
 */

/**
 * GET /api/learning/suggestions/keywords
 * Obtiene keywords sugeridos para aprobar
 */
router.get('/suggestions/keywords', (req, res) => {
  try {
    const { minFrequency = 5 } = req.query;
    
    const suggestions = autoLearningEngine.getSuggestedKeywords(
      parseInt(minFrequency)
    );
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    logger.error('Error obteniendo keywords', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener suggestions'
    });
  }
});

/**
 * GET /api/learning/suggestions/intents
 * Obtiene intenciones sugeridas
 */
router.get('/suggestions/intents', (req, res) => {
  try {
    const { minFrequency = 3 } = req.query;
    
    const suggestions = autoLearningEngine.getSuggestedIntents(
      parseInt(minFrequency)
    );
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    logger.error('Error obteniendo intents', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener suggestions'
    });
  }
});

/**
 * GET /api/learning/suggestions/confidence
 * Obtiene ajustes de confianza sugeridos
 */
router.get('/suggestions/confidence', (req, res) => {
  try {
    const suggestions = autoLearningEngine.getConfidenceAdjustments();
    
    res.json({
      success: true,
      count: suggestions.length,
      data: suggestions
    });
  } catch (error) {
    logger.error('Error obteniendo confidence', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener suggestions'
    });
  }
});

/**
 * POST /api/learning/approve/keyword
 * Aprueba un keyword sugerido
 */
router.post('/approve/keyword', (req, res) => {
  try {
    const { intent, keyword } = req.body;
    
    if (!intent || !keyword) {
      return res.status(400).json({
        success: false,
        error: 'Faltan parámetros: intent, keyword'
      });
    }
    
    // Aquí en producción se agregaría al sistema
    logger.info('Keyword aprobado', { intent, keyword });
    
    res.json({
      success: true,
      message: 'Keyword aprobado exitosamente',
      data: { intent, keyword }
    });
  } catch (error) {
    logger.error('Error aprobando keyword', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al aprobar keyword'
    });
  }
});

/**
 * POST /api/learning/approve/intent
 * Aprueba una intención sugerida
 */
router.post('/approve/intent', (req, res) => {
  try {
    const { intentName, patterns } = req.body;
    
    if (!intentName) {
      return res.status(400).json({
        success: false,
        error: 'Falta parámetro: intentName'
      });
    }
    
    // Aquí en producción se crearía la intención
    logger.info('Intención aprobada', { intentName });
    
    res.json({
      success: true,
      message: 'Intención aprobada exitosamente',
      data: { intentName, patterns }
    });
  } catch (error) {
    logger.error('Error aprobando intent', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al aprobar intención'
    });
  }
});

/**
 * POST /api/learning/reset
 * Reinicia el sistema de aprendizaje
 */
router.post('/reset', (req, res) => {
  try {
    autoLearningEngine.reset();
    
    logger.info('Sistema de aprendizaje reiniciado');
    
    res.json({
      success: true,
      message: 'Sistema reiniciado exitosamente'
    });
  } catch (error) {
    logger.error('Error reiniciando sistema', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al reiniciar sistema'
    });
  }
});

export default router;