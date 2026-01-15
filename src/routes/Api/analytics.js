// src/routes/api/analytics.js

import express from 'express';
import { contextManager } from '../../utils/contextManager.js';
import { autoLearningEngine } from '../../services/learning/AutoLearningEngine.js';
import { errorLearningSystem } from '../../services/learning/ErrorLearningSystem.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * API REST para Analytics y Reportes
 * 
 * Endpoints:
 * GET /api/analytics/summary       - Resumen general
 * GET /api/analytics/conversations - Estadísticas de conversaciones
 * GET /api/analytics/errors        - Reporte de errores
 * GET /api/analytics/learning      - Estado del aprendizaje
 * GET /api/analytics/top-intents   - Intenciones más usadas
 * GET /api/analytics/top-stores    - Tiendas más consultadas
 */

/**
 * GET /api/analytics/summary
 * Resumen general del sistema
 */
router.get('/summary', (req, res) => {
  try {
    const contextStats = contextManager.getStats();
    const learningReport = autoLearningEngine.getReport();
    const errorReport = errorLearningSystem.getReport();
    
    const summary = {
      timestamp: new Date(),
      conversations: {
        active: contextStats.activeConversations,
        averageTurns: contextStats.averageTurns,
        averageDuration: `${contextStats.averageDuration}s`,
        satisfactionRate: `${contextStats.satisfactionRate}%`
      },
      learning: {
        totalProcessed: learningReport.stats.totalProcessed,
        successRate: learningReport.stats.successRate,
        pendingSuggestions: learningReport.suggestedKeywords.length
      },
      errors: {
        total: errorReport.summary.totalIntentErrors + 
               errorReport.summary.totalResponseErrors +
               errorReport.summary.totalTransferErrors,
        intentErrors: errorReport.summary.totalIntentErrors,
        transferErrors: errorReport.summary.totalTransferErrors,
        timeouts: errorReport.summary.totalTimeouts
      },
      system: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024
      }
    };
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error en summary', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al generar resumen'
    });
  }
});

/**
 * GET /api/analytics/conversations
 * Estadísticas detalladas de conversaciones
 */
router.get('/conversations', (req, res) => {
  try {
    const stats = contextManager.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error en conversations stats', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * GET /api/analytics/errors
 * Reporte de errores
 */
router.get('/errors', (req, res) => {
  try {
    const report = errorLearningSystem.getReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error en error report', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al generar reporte'
    });
  }
});

/**
 * GET /api/analytics/learning
 * Estado del sistema de aprendizaje
 */
router.get('/learning', (req, res) => {
  try {
    const report = autoLearningEngine.getReport();
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('Error en learning report', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al generar reporte'
    });
  }
});

/**
 * GET /api/analytics/top-intents
 * Intenciones más usadas
 */
router.get('/top-intents', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Obtener datos del sistema de aprendizaje
    const learningData = autoLearningEngine.learningData.successfulDetections;
    
    const intents = Array.from(learningData.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([intent, count]) => ({ intent, count }));
    
    res.json({
      success: true,
      count: intents.length,
      data: intents
    });
  } catch (error) {
    logger.error('Error en top intents', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener top intents'
    });
  }
});

/**
 * GET /api/analytics/top-stores
 * Tiendas más consultadas
 */
router.get('/top-stores', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Contar menciones de tiendas
    const storeCounts = new Map();
    
    // Recorrer contextos activos
    contextManager.contexts.forEach(context => {
      context.storesMentioned.forEach(store => {
        const count = storeCounts.get(store) || 0;
        storeCounts.set(store, count + 1);
      });
    });
    
    const topStores = Array.from(storeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, parseInt(limit))
      .map(([store, count]) => ({ store, count }));
    
    res.json({
      success: true,
      count: topStores.length,
      data: topStores
    });
  } catch (error) {
    logger.error('Error en top stores', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener top stores'
    });
  }
});

/**
 * POST /api/analytics/cleanup
 * Limpia datos antiguos
 */
router.post('/cleanup', (req, res) => {
  try {
    errorLearningSystem.cleanup();
    
    logger.info('Limpieza manual ejecutada');
    
    res.json({
      success: true,
      message: 'Limpieza ejecutada exitosamente'
    });
  } catch (error) {
    logger.error('Error en cleanup', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al ejecutar limpieza'
    });
  }
});

export default router;