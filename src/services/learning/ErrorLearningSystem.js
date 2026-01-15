// src/services/learning/ErrorLearningSystem.js

import { logger } from '../../utils/logger.js';

/**
 * ErrorLearningSystem - Aprende de Errores
 * 
 * Registra y analiza:
 * - Respuestas que no fueron exitosas
 * - Casos donde usuario dice "no es eso"
 * - Transferencias fallidas
 * - Timeouts
 * - Silencios repetidos
 */
export class ErrorLearningSystem {
  
  constructor() {
    this.errors = {
      intentDetection: [], // Errores de detección
      responseGeneration: [], // Respuestas incorrectas
      transfers: [], // Transferencias fallidas
      timeouts: [], // Timeouts/silencios
      userNegative: [] // Usuario insatisfecho
    };
    
    this.patterns = {
      negativeKeywords: [
        'no', 'incorrecto', 'mal', 'error', 'equivocado',
        'eso no', 'no es', 'no sirve', 'no entendiste'
      ]
    };
  }
  
  /**
   * Registra error de detección de intención
   */
  recordIntentError(data) {
    this.errors.intentDetection.push({
      callSid: data.callSid,
      userText: data.userText,
      detectedIntent: data.detectedIntent,
      confidence: data.confidence,
      correctIntent: data.correctIntent || null,
      timestamp: new Date()
    });
    
    // Limitar a últimos 200
    if (this.errors.intentDetection.length > 200) {
      this.errors.intentDetection.shift();
    }
    
    logger.warn('Error de detección registrado', {
      callSid: data.callSid,
      intent: data.detectedIntent
    });
  }
  
  /**
   * Registra respuesta incorrecta
   */
  recordResponseError(data) {
    this.errors.responseGeneration.push({
      callSid: data.callSid,
      intent: data.intent,
      response: data.response,
      userFeedback: data.userFeedback,
      timestamp: new Date()
    });
    
    if (this.errors.responseGeneration.length > 200) {
      this.errors.responseGeneration.shift();
    }
    
    logger.warn('Respuesta incorrecta registrada', {
      callSid: data.callSid
    });
  }
  
  /**
   * Registra transferencia fallida
   */
  recordTransferError(data) {
    this.errors.transfers.push({
      callSid: data.callSid,
      storeName: data.storeName,
      phoneNumber: data.phoneNumber,
      reason: data.reason, // 'no_answer', 'busy', 'error'
      timestamp: new Date()
    });
    
    if (this.errors.transfers.length > 100) {
      this.errors.transfers.shift();
    }
    
    logger.warn('Transferencia fallida', {
      callSid: data.callSid,
      store: data.storeName
    });
  }
  
  /**
   * Registra timeout o silencio
   */
  recordTimeoutError(data) {
    this.errors.timeouts.push({
      callSid: data.callSid,
      silenceCount: data.silenceCount,
      totalDuration: data.totalDuration,
      lastIntent: data.lastIntent,
      timestamp: new Date()
    });
    
    if (this.errors.timeouts.length > 100) {
      this.errors.timeouts.shift();
    }
  }
  
  /**
   * Detecta feedback negativo del usuario
   */
  detectNegativeFeedback(userText) {
    const normalized = userText.toLowerCase();
    
    return this.patterns.negativeKeywords.some(keyword => 
      normalized.includes(keyword)
    );
  }
  
  /**
   * Registra feedback negativo
   */
  recordNegativeFeedback(data) {
    this.errors.userNegative.push({
      callSid: data.callSid,
      userText: data.userText,
      previousIntent: data.previousIntent,
      previousResponse: data.previousResponse,
      timestamp: new Date()
    });
    
    if (this.errors.userNegative.length > 200) {
      this.errors.userNegative.shift();
    }
    
    logger.warn('Feedback negativo detectado', {
      callSid: data.callSid
    });
  }
  
  /**
   * Analiza patrones de errores
   */
  analyzeErrorPatterns() {
    const analysis = {
      mostFailedIntents: this._getMostFailedIntents(),
      mostFailedTransfers: this._getMostFailedTransfers(),
      timeoutPatterns: this._getTimeoutPatterns(),
      negativeResponsePatterns: this._getNegativePatterns()
    };
    
    return analysis;
  }
  
  /**
   * Intenciones con más errores
   */
  _getMostFailedIntents() {
    const intentCounts = new Map();
    
    this.errors.intentDetection.forEach(error => {
      const count = intentCounts.get(error.detectedIntent) || 0;
      intentCounts.set(error.detectedIntent, count + 1);
    });
    
    return Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }));
  }
  
  /**
   * Transferencias que más fallan
   */
  _getMostFailedTransfers() {
    const storeCounts = new Map();
    
    this.errors.transfers.forEach(error => {
      const count = storeCounts.get(error.storeName) || 0;
      storeCounts.set(error.storeName, count + 1);
    });
    
    return Array.from(storeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([store, count]) => ({ store, count }));
  }
  
  /**
   * Patrones de timeouts
   */
  _getTimeoutPatterns() {
    const intentCounts = new Map();
    
    this.errors.timeouts.forEach(error => {
      const intent = error.lastIntent || 'unknown';
      const count = intentCounts.get(intent) || 0;
      intentCounts.set(intent, count + 1);
    });
    
    return Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }));
  }
  
  /**
   * Patrones de respuestas negativas
   */
  _getNegativePatterns() {
    const intentCounts = new Map();
    
    this.errors.userNegative.forEach(error => {
      const intent = error.previousIntent || 'unknown';
      const count = intentCounts.get(intent) || 0;
      intentCounts.set(intent, count + 1);
    });
    
    return Array.from(intentCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([intent, count]) => ({ intent, count }));
  }
  
  /**
   * Obtiene reporte de errores
   */
  getReport() {
    return {
      summary: {
        totalIntentErrors: this.errors.intentDetection.length,
        totalResponseErrors: this.errors.responseGeneration.length,
        totalTransferErrors: this.errors.transfers.length,
        totalTimeouts: this.errors.timeouts.length,
        totalNegativeFeedback: this.errors.userNegative.length
      },
      patterns: this.analyzeErrorPatterns(),
      recentErrors: {
        intent: this.errors.intentDetection.slice(-5),
        response: this.errors.responseGeneration.slice(-5),
        transfer: this.errors.transfers.slice(-5),
        timeout: this.errors.timeouts.slice(-5),
        negative: this.errors.userNegative.slice(-5)
      }
    };
  }
  
  /**
   * Limpia errores antiguos (más de 7 días)
   */
  cleanup() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    Object.keys(this.errors).forEach(key => {
      this.errors[key] = this.errors[key].filter(
        error => error.timestamp > sevenDaysAgo
      );
    });
    
    logger.info('Limpieza de errores completada');
  }
}

// Instancia singleton
export const errorLearningSystem = new ErrorLearningSystem();