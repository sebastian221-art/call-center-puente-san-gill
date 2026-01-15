// src/utils/contextManager.js

import { logger } from './logger.js';
import { autoLearningEngine } from '../services/learning/AutoLearningEngine.js';
import { errorLearningSystem } from '../services/learning/ErrorLearningSystem.js';

/**
 * ContextManager - Gestión de Contexto de Llamadas
 * 
 * Mejoras implementadas:
 * - Integración con sistema de aprendizaje
 * - Detección de feedback negativo
 * - Contador de silencios
 * - Métricas de satisfacción
 * - Tracking de errores
 * - 100% independiente por CallSid
 */
class ContextManager {
  
  constructor() {
    // Contextos separados por CallSid
    this.contexts = new Map();
    
    // Configuración
    this.config = {
      maxContextAge: 10 * 60 * 1000, // 10 minutos
      cleanupInterval: 5 * 60 * 1000, // 5 minutos
      maxTurns: 20 // Máximo de turnos por conversación
    };
    
    // Iniciar limpieza automática
    this._startCleanup();
  }
  
  /**
   * Obtiene contexto de una llamada
   */
  getContext(callSid) {
    if (!this.contexts.has(callSid)) {
      this.contexts.set(callSid, this._createNewContext(callSid));
    }
    
    const context = this.contexts.get(callSid);
    context.lastAccess = new Date();
    
    return context;
  }
  
  /**
   * Crea nuevo contexto
   */
  _createNewContext(callSid) {
    return {
      callSid,
      createdAt: new Date(),
      lastAccess: new Date(),
      turnCount: 0,
      silenceCount: 0,
      hasGoodbye: false,
      storesMentioned: [],
      topicsDiscussed: [],
      intentsHistory: [],
      lastResponse: null,
      lastIntent: null,
      lastEntities: {},
      userSatisfaction: 'unknown', // 'positive', 'negative', 'unknown'
      errors: []
    };
  }
  
  /**
   * Actualiza contexto después de cada turno
   */
  updateContext(callSid, intent, entities, response) {
    const context = this.getContext(callSid);
    
    context.turnCount++;
    context.lastIntent = intent;
    context.lastResponse = response;
    context.lastEntities = entities;
    
    // Agregar intent al historial
    context.intentsHistory.push({
      intent,
      entities,
      timestamp: new Date()
    });
    
    // Agregar tienda mencionada
    if (entities.storeName && !context.storesMentioned.includes(entities.storeName)) {
      context.storesMentioned.push(entities.storeName);
    }
    
    // Agregar tema discutido
    const topic = this._getTopicFromIntent(intent);
    if (topic && !context.topicsDiscussed.includes(topic)) {
      context.topicsDiscussed.push(topic);
    }
    
    logger.debug('Contexto actualizado', {
      callSid,
      turnCount: context.turnCount,
      storesMentioned: context.storesMentioned,
      topicsDiscussed: context.topicsDiscussed
    });
  }
  
  /**
   * Obtiene tema desde intención
   */
  _getTopicFromIntent(intent) {
    const topicMapping = {
      'buscar_local': 'busqueda',
      'ubicacion': 'busqueda',
      'horario_mall': 'horarios',
      'horario_local': 'horarios',
      'parqueadero': 'servicios',
      'cajero': 'servicios',
      'wifi': 'servicios',
      'restaurantes': 'categoria',
      'cine': 'entretenimiento',
      'eventos': 'comercial',
      'promociones': 'comercial'
    };
    
    return topicMapping[intent] || null;
  }
  
  /**
   * Incrementa contador de silencios
   */
  incrementSilenceCount(callSid) {
    const context = this.getContext(callSid);
    context.silenceCount++;
    
    logger.debug('Silencio incrementado', {
      callSid,
      silenceCount: context.silenceCount
    });
    
    // Registrar en sistema de errores si excede límite
    if (context.silenceCount >= 3) {
      errorLearningSystem.recordTimeoutError({
        callSid,
        silenceCount: context.silenceCount,
        totalDuration: this._calculateDuration(context),
        lastIntent: context.lastIntent
      });
    }
    
    return context.silenceCount;
  }
  
  /**
   * Resetea contador de silencios
   */
  resetSilenceCount(callSid) {
    const context = this.getContext(callSid);
    context.silenceCount = 0;
  }
  
  /**
   * Marca que usuario se despidió
   */
  markGoodbye(callSid) {
    const context = this.getContext(callSid);
    context.hasGoodbye = true;
    
    // Registrar en sistema de aprendizaje
    this._sendToLearningSystem(callSid, true);
  }
  
  /**
   * Verifica si usuario se despidió
   */
  userSaidGoodbye(callSid) {
    if (!this.contexts.has(callSid)) {
      return false;
    }
    return this.contexts.get(callSid).hasGoodbye;
  }
  
  /**
   * Detecta feedback negativo
   */
  detectNegativeFeedback(callSid, userText) {
    const isNegative = errorLearningSystem.detectNegativeFeedback(userText);
    
    if (isNegative) {
      const context = this.getContext(callSid);
      context.userSatisfaction = 'negative';
      
      // Registrar en sistema de errores
      errorLearningSystem.recordNegativeFeedback({
        callSid,
        userText,
        previousIntent: context.lastIntent,
        previousResponse: context.lastResponse
      });
      
      logger.warn('Feedback negativo detectado', { callSid });
    }
    
    return isNegative;
  }
  
  /**
   * Marca satisfacción positiva
   */
  markPositiveFeedback(callSid) {
    const context = this.getContext(callSid);
    context.userSatisfaction = 'positive';
  }
  
  /**
   * Registra error de detección
   */
  recordDetectionError(callSid, userText, detectedIntent, confidence) {
    const context = this.getContext(callSid);
    
    const error = {
      type: 'detection',
      userText,
      detectedIntent,
      confidence,
      timestamp: new Date()
    };
    
    context.errors.push(error);
    
    // Enviar a sistema de errores
    errorLearningSystem.recordIntentError({
      callSid,
      userText,
      detectedIntent,
      confidence
    });
  }
  
  /**
   * Registra error de transferencia
   */
  recordTransferError(callSid, storeName, phoneNumber, reason) {
    const context = this.getContext(callSid);
    
    const error = {
      type: 'transfer',
      storeName,
      phoneNumber,
      reason,
      timestamp: new Date()
    };
    
    context.errors.push(error);
    
    // Enviar a sistema de errores
    errorLearningSystem.recordTransferError({
      callSid,
      storeName,
      phoneNumber,
      reason
    });
  }
  
  /**
   * Envía datos al sistema de aprendizaje
   */
  _sendToLearningSystem(callSid, wasSuccessful) {
    if (!this.contexts.has(callSid)) return;
    
    const context = this.contexts.get(callSid);
    
    // Solo enviar si hubo interacción real
    if (context.turnCount === 0) return;
    
    // Determinar éxito basado en satisfacción y turnos
    const success = wasSuccessful && 
                   context.userSatisfaction !== 'negative' &&
                   context.errors.length === 0;
    
    // Enviar cada turno al sistema de aprendizaje
    context.intentsHistory.forEach((turn, index) => {
      autoLearningEngine.processCallResult({
        callSid,
        userText: `Turn ${index + 1}`, // Texto real no disponible aquí
        detectedIntent: turn.intent,
        confidence: 0.8, // Asumido
        entities: turn.entities,
        wasSuccessful: success,
        userFeedback: context.userSatisfaction
      });
    });
    
    logger.debug('Datos enviados a sistema de aprendizaje', {
      callSid,
      success,
      turns: context.turnCount
    });
  }
  
  /**
   * Calcula duración de la llamada
   */
  _calculateDuration(context) {
    const now = new Date();
    const duration = now - context.createdAt;
    return Math.floor(duration / 1000); // segundos
  }
  
  /**
   * Limpia contexto de una llamada
   */
  clearContext(callSid) {
    if (!this.contexts.has(callSid)) return;
    
    // Enviar a sistema de aprendizaje antes de limpiar
    this._sendToLearningSystem(callSid, true);
    
    this.contexts.delete(callSid);
    
    logger.debug('Contexto eliminado', { callSid });
  }
  
  /**
   * Obtiene resumen del contexto
   */
  getContextSummary(callSid) {
    if (!this.contexts.has(callSid)) {
      throw new Error('Context not found');
    }
    
    const context = this.contexts.get(callSid);
    
    return {
      callSid: context.callSid,
      duration: this._calculateDuration(context),
      turnCount: context.turnCount,
      silenceCount: context.silenceCount,
      storesMentioned: context.storesMentioned,
      topicsDiscussed: context.topicsDiscussed,
      lastIntent: context.lastIntent,
      userSatisfaction: context.userSatisfaction,
      errorCount: context.errors.length,
      hasGoodbye: context.hasGoodbye
    };
  }
  
  /**
   * Obtiene estadísticas generales
   */
  getStats() {
    const activeContexts = Array.from(this.contexts.values());
    
    const stats = {
      activeConversations: activeContexts.length,
      averageTurns: 0,
      averageDuration: 0,
      satisfactionRate: 0,
      totalErrors: 0
    };
    
    if (activeContexts.length === 0) {
      return stats;
    }
    
    let totalTurns = 0;
    let totalDuration = 0;
    let positiveCount = 0;
    let totalErrors = 0;
    
    activeContexts.forEach(context => {
      totalTurns += context.turnCount;
      totalDuration += this._calculateDuration(context);
      totalErrors += context.errors.length;
      
      if (context.userSatisfaction === 'positive') {
        positiveCount++;
      }
    });
    
    stats.averageTurns = Math.round(totalTurns / activeContexts.length);
    stats.averageDuration = Math.round(totalDuration / activeContexts.length);
    stats.satisfactionRate = Math.round((positiveCount / activeContexts.length) * 100);
    stats.totalErrors = totalErrors;
    
    return stats;
  }
  
  /**
   * Limpieza automática de contextos antiguos
   */
  _startCleanup() {
    setInterval(() => {
      const now = new Date();
      const toDelete = [];
      
      this.contexts.forEach((context, callSid) => {
        const age = now - context.lastAccess;
        
        if (age > this.config.maxContextAge) {
          toDelete.push(callSid);
        }
      });
      
      toDelete.forEach(callSid => {
        this.clearContext(callSid);
      });
      
      if (toDelete.length > 0) {
        logger.info('Limpieza automática ejecutada', {
          cleaned: toDelete.length,
          remaining: this.contexts.size
        });
      }
    }, this.config.cleanupInterval);
  }
}

// Instancia singleton
export const contextManager = new ContextManager();