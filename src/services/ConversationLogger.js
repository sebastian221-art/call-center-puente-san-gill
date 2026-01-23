i// src/services/ConversationLogger.js

import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';

/**
 * SERVICIO DE LOGGING DE CONVERSACIONES
 * 
 * Guarda TODAS las llamadas en PostgreSQL sin afectar el rendimiento
 * Operaciones asíncronas que NO bloquean el flujo de llamadas
 * 
 * Características:
 * ✅ No bloquea llamadas (async sin await en endpoints críticos)
 * ✅ Logging silencioso (errores no afectan la llamada)
 * ✅ Independiente por CallSid
 * ✅ Compatible con 100+ llamadas simultáneas
 */
export class ConversationLogger {
  
  /**
   * Inicia una nueva conversación
   * Se ejecuta al recibir la llamada
   */
  static async startConversation(callSid, fromNumber) {
    try {
      const result = await query(`
        INSERT INTO conversations (call_sid, from_number, start_time)
        VALUES ($1, $2, NOW())
        RETURNING id
      `, [callSid, fromNumber]);
      
      logger.info('📞 Conversación iniciada en BD', { 
        conversationId: result.rows[0].id,
        callSid,
        fromNumber
      });
      
      return result.rows[0].id;
    } catch (error) {
      // Error silencioso - no afecta la llamada
      logger.error('❌ Error iniciando conversación en BD', { 
        error: error.message,
        callSid 
      });
      return null;
    }
  }
  
  /**
   * Registra una intención detectada
   */
  static async logIntent(callSid, userText, detectedIntent, confidence, entities, wasSuccessful = true) {
    try {
      await query(`
        INSERT INTO intents (
          call_sid, user_text, detected_intent, 
          confidence, entities, was_successful
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        callSid,
        userText,
        detectedIntent,
        confidence || 0,
        JSON.stringify(entities || {}),
        wasSuccessful
      ]);
      
      logger.debug('💡 Intención registrada en BD', { callSid, detectedIntent });
    } catch (error) {
      logger.error('❌ Error registrando intención', { 
        error: error.message,
        callSid 
      });
    }
  }
  
  /**
   * Registra error en la llamada
   */
  static async logError(callSid, errorType, errorData, userText = null, detectedIntent = null) {
    try {
      await query(`
        INSERT INTO errors (call_sid, error_type, error_data, user_text, detected_intent)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        callSid,
        errorType,
        JSON.stringify(errorData || {}),
        userText,
        detectedIntent
      ]);
      
      // Marcar que hubo errores
      await query(`
        UPDATE conversations SET had_errors = true WHERE call_sid = $1
      `, [callSid]);
      
      logger.error('🚨 Error registrado en BD', { callSid, errorType });
    } catch (error) {
      logger.error('❌ Error guardando error en BD', { 
        error: error.message,
        callSid 
      });
    }
  }
  
  /**
   * Actualiza tiendas mencionadas
   */
  static async updateStoresMentioned(callSid, storeName) {
    try {
      await query(`
        UPDATE conversations
        SET stores_mentioned = array_append(
          COALESCE(stores_mentioned, ARRAY[]::text[]), $2
        )
        WHERE call_sid = $1
      `, [callSid, storeName]);
      
      logger.debug('🏬 Tienda mencionada registrada', { callSid, storeName });
    } catch (error) {
      logger.error('❌ Error actualizando tiendas', { error: error.message });
    }
  }
  
  /**
   * Actualiza topics discutidos
   */
  static async updateTopicsDiscussed(callSid, topic) {
    try {
      await query(`
        UPDATE conversations
        SET topics_discussed = array_append(
          COALESCE(topics_discussed, ARRAY[]::text[]), $2
        )
        WHERE call_sid = $1
      `, [callSid, topic]);
      
      logger.debug('📝 Topic registrado', { callSid, topic });
    } catch (error) {
      logger.error('❌ Error actualizando topics', { error: error.message });
    }
  }
  
  /**
   * Incrementa contador de turnos
   */
  static async incrementTurnCount(callSid) {
    try {
      await query(`
        UPDATE conversations
        SET turn_count = turn_count + 1
        WHERE call_sid = $1
      `, [callSid]);
    } catch (error) {
      logger.error('❌ Error incrementando turnos', { error: error.message });
    }
  }
  
  /**
   * Incrementa contador de silencios
   */
  static async incrementSilenceCount(callSid) {
    try {
      await query(`
        UPDATE conversations
        SET silence_count = silence_count + 1
        WHERE call_sid = $1
      `, [callSid]);
    } catch (error) {
      logger.error('❌ Error incrementando silencios', { error: error.message });
    }
  }
  
  /**
   * Finaliza conversación
   * Se ejecuta cuando la llamada termina
   */
  static async endConversation(callSid, durationSeconds, userSatisfaction = 'unknown') {
    try {
      await query(`
        UPDATE conversations
        SET 
          end_time = NOW(),
          duration_seconds = $2,
          user_satisfaction = $3
        WHERE call_sid = $1
      `, [callSid, durationSeconds || 0, userSatisfaction]);
      
      logger.info('✅ Conversación finalizada en BD', { 
        callSid, 
        durationSeconds,
        userSatisfaction 
      });
    } catch (error) {
      logger.error('❌ Error finalizando conversación', { 
        error: error.message,
        callSid 
      });
    }
  }
  
  /**
   * Obtiene estadísticas rápidas
   */
  static async getQuickStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_calls,
          COUNT(CASE WHEN end_time IS NULL THEN 1 END) as active_calls,
          AVG(duration_seconds)::int as avg_duration,
          AVG(turn_count)::numeric(10,1) as avg_turns
        FROM conversations
        WHERE start_time > NOW() - INTERVAL '24 hours'
      `);
      
      return result.rows[0];
    } catch (error) {
      logger.error('❌ Error obteniendo stats', { error: error.message });
      return null;
    }
  }
}