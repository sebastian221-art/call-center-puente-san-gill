// src/routes/Api/conversations.js

import express from 'express';
import { query } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * GET /api/conversations - Obtener lista de conversaciones
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const result = await query(`
      SELECT 
        id, call_sid, from_number,
        start_time, end_time, duration_seconds,
        turn_count, silence_count,
        stores_mentioned, topics_discussed,
        user_satisfaction, had_errors
      FROM conversations
      ORDER BY start_time DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    // Contar total
    const countResult = await query('SELECT COUNT(*) as total FROM conversations');
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset
    });
  } catch (error) {
    logger.error('Error obteniendo conversaciones', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo conversaciones'
    });
  }
});

/**
 * GET /api/conversations/recent - Conversaciones más recientes
 */
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await query(`
      SELECT 
        call_sid, from_number, start_time, duration_seconds,
        turn_count, stores_mentioned, user_satisfaction
      FROM conversations
      WHERE start_time > NOW() - INTERVAL '24 hours'
      ORDER BY start_time DESC
      LIMIT $1
    `, [limit]);
    
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    logger.error('Error obteniendo conversaciones recientes', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo conversaciones recientes'
    });
  }
});

/**
 * GET /api/conversations/:callSid - Detalle de una conversación
 */
router.get('/:callSid', async (req, res) => {
  try {
    const { callSid } = req.params;
    
    // Conversación
    const conv = await query(`
      SELECT * FROM conversations WHERE call_sid = $1
    `, [callSid]);
    
    if (conv.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversación no encontrada'
      });
    }
    
    // Intenciones
    const intents = await query(`
      SELECT 
        id, user_text, detected_intent, confidence,
        entities, was_successful, timestamp
      FROM intents
      WHERE call_sid = $1
      ORDER BY timestamp ASC
    `, [callSid]);
    
    // Errores (si hubo)
    const errors = await query(`
      SELECT 
        id, error_type, error_data, user_text,
        detected_intent, timestamp
      FROM errors
      WHERE call_sid = $1
      ORDER BY timestamp ASC
    `, [callSid]);
    
    res.json({
      success: true,
      data: {
        conversation: conv.rows[0],
        intents: intents.rows,
        errors: errors.rows,
        stats: {
          totalIntents: intents.rows.length,
          totalErrors: errors.rows.length,
          avgConfidence: intents.rows.length > 0
            ? (intents.rows.reduce((sum, i) => sum + parseFloat(i.confidence || 0), 0) / intents.rows.length).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    logger.error('Error obteniendo detalle de conversación', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo detalle'
    });
  }
});

/**
 * GET /api/conversations/stats/summary - Estadísticas generales
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        COUNT(*) as total_calls,
        COUNT(CASE WHEN end_time IS NULL THEN 1 END) as active_calls,
        AVG(duration_seconds)::int as avg_duration,
        AVG(turn_count)::numeric(10,1) as avg_turns,
        COUNT(CASE WHEN had_errors THEN 1 END) as calls_with_errors,
        COUNT(CASE WHEN user_satisfaction = 'positive' THEN 1 END) as positive_calls
      FROM conversations
      WHERE start_time > NOW() - INTERVAL '30 days'
    `);
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    logger.error('Error obteniendo resumen', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo resumen'
    });
  }
});

/**
 * GET /api/conversations/stats/by-day - Llamadas por día (últimos 7 días)
 */
router.get('/stats/by-day', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    
    const result = await query(`
      SELECT 
        DATE(start_time) as date,
        COUNT(*) as calls,
        AVG(duration_seconds)::int as avg_duration,
        COUNT(CASE WHEN had_errors THEN 1 END) as errors
      FROM conversations
      WHERE start_time > NOW() - INTERVAL '${days} days'
      GROUP BY DATE(start_time)
      ORDER BY date DESC
    `);
    
    res.json({
      success: true,
      data: result.rows,
      period: `last_${days}_days`
    });
  } catch (error) {
    logger.error('Error obteniendo stats por día', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas por día'
    });
  }
});

export default router;