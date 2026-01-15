// src/services/learning/AutoLearningEngine.js

import { logger } from '../../utils/logger.js';
import { PatternAnalyzer } from './PatternAnalyzer.js';
import { KeywordExtractor } from './KeywordExtractor.js';

/**
 * AutoLearningEngine - Motor de Aprendizaje Automático
 * 
 * Sistema que aprende de las conversaciones para:
 * - Detectar nuevos patrones de consultas
 * - Sugerir nuevos keywords
 * - Identificar intenciones faltantes
 * - Optimizar niveles de confianza
 * - Mejorar detección de errores
 */
export class AutoLearningEngine {
  
  constructor() {
    this.patternAnalyzer = new PatternAnalyzer();
    this.keywordExtractor = new KeywordExtractor();
    
    // Memoria de aprendizaje (temporal en RAM)
    this.learningData = {
      successfulDetections: new Map(), // intent -> count
      failedDetections: [],
      userPhrases: new Map(), // intent -> [phrases]
      suggestedKeywords: new Map(), // intent -> [keywords]
      suggestedIntents: [],
      confidenceAdjustments: new Map() // intent -> suggested confidence
    };
    
    // Contadores
    this.stats = {
      totalProcessed: 0,
      successRate: 0,
      lastUpdate: new Date()
    };
  }
  
  /**
   * Procesa resultado de una llamada para aprender
   */
  processCallResult(callData) {
    logger.debug('Procesando para aprendizaje', { callSid: callData.callSid });
    
    this.stats.totalProcessed++;
    
    const {
      callSid,
      userText,
      detectedIntent,
      confidence,
      entities,
      wasSuccessful,
      userFeedback
    } = callData;
    
    // 1. Registrar éxito o fallo
    if (wasSuccessful) {
      this._recordSuccess(detectedIntent, userText, confidence);
    } else {
      this._recordFailure(userText, detectedIntent, confidence);
    }
    
    // 2. Extraer keywords potenciales
    this._extractPotentialKeywords(userText, detectedIntent);
    
    // 3. Analizar patrones
    this._analyzePattern(userText, detectedIntent);
    
    // 4. Actualizar estadísticas
    this._updateStats();
    
    logger.debug('Aprendizaje procesado', { 
      callSid,
      totalProcessed: this.stats.totalProcessed,
      successRate: this.stats.successRate
    });
  }
  
  /**
   * Registra detección exitosa
   */
  _recordSuccess(intent, userText, confidence) {
    // Incrementar contador de éxitos
    const currentCount = this.learningData.successfulDetections.get(intent) || 0;
    this.learningData.successfulDetections.set(intent, currentCount + 1);
    
    // Guardar frase exitosa
    if (!this.learningData.userPhrases.has(intent)) {
      this.learningData.userPhrases.set(intent, []);
    }
    this.learningData.userPhrases.get(intent).push({
      text: userText,
      confidence,
      timestamp: new Date()
    });
    
    // Limitar a últimas 100 frases por intent
    if (this.learningData.userPhrases.get(intent).length > 100) {
      this.learningData.userPhrases.get(intent).shift();
    }
    
    // Analizar si se puede aumentar confianza
    this._analyzeConfidenceAdjustment(intent, confidence, true);
  }
  
  /**
   * Registra detección fallida
   */
  _recordFailure(userText, detectedIntent, confidence) {
    this.learningData.failedDetections.push({
      text: userText,
      detectedIntent,
      confidence,
      timestamp: new Date()
    });
    
    // Limitar a últimas 100 fallas
    if (this.learningData.failedDetections.length > 100) {
      this.learningData.failedDetections.shift();
    }
    
    // Analizar si es una intención faltante
    this._detectMissingIntent(userText);
    
    // Analizar si se debe bajar confianza
    this._analyzeConfidenceAdjustment(detectedIntent, confidence, false);
  }
  
  /**
   * Extrae keywords potenciales del texto
   */
  _extractPotentialKeywords(text, intent) {
    const keywords = this.keywordExtractor.extract(text);
    
    if (keywords.length === 0) return;
    
    if (!this.learningData.suggestedKeywords.has(intent)) {
      this.learningData.suggestedKeywords.set(intent, new Map());
    }
    
    const intentKeywords = this.learningData.suggestedKeywords.get(intent);
    
    keywords.forEach(keyword => {
      const currentCount = intentKeywords.get(keyword) || 0;
      intentKeywords.set(keyword, currentCount + 1);
    });
  }
  
  /**
   * Analiza patrones en el texto
   */
  _analyzePattern(text, intent) {
    const patterns = this.patternAnalyzer.analyze(text);
    // Aquí podrías guardar patterns para análisis posterior
  }
  
  /**
   * Detecta si falta una intención
   */
  _detectMissingIntent(text) {
    // Si la frase tiene estructura clara pero no matcheó
    const commonStructures = [
      /d[oó]nde\s+(\w+)/i,
      /cu[aá]nto\s+(\w+)/i,
      /tiene[n]?\s+(\w+)/i,
      /hay\s+(\w+)/i
    ];
    
    for (const pattern of commonStructures) {
      if (pattern.test(text)) {
        // Posible intención faltante
        const suggestion = {
          text,
          pattern: pattern.source,
          frequency: 1,
          timestamp: new Date()
        };
        
        // Verificar si ya existe
        const exists = this.learningData.suggestedIntents.find(
          s => s.text === text
        );
        
        if (!exists) {
          this.learningData.suggestedIntents.push(suggestion);
        } else {
          exists.frequency++;
        }
        
        break;
      }
    }
  }
  
  /**
   * Analiza ajustes de confianza
   */
  _analyzeConfidenceAdjustment(intent, confidence, wasSuccessful) {
    if (!this.learningData.confidenceAdjustments.has(intent)) {
      this.learningData.confidenceAdjustments.set(intent, {
        successes: 0,
        failures: 0,
        avgConfidence: confidence,
        suggestedConfidence: null
      });
    }
    
    const adjustment = this.learningData.confidenceAdjustments.get(intent);
    
    if (wasSuccessful) {
      adjustment.successes++;
    } else {
      adjustment.failures++;
    }
    
    // Calcular tasa de éxito
    const total = adjustment.successes + adjustment.failures;
    const successRate = adjustment.successes / total;
    
    // Sugerir ajuste si hay suficiente data
    if (total >= 10) {
      if (successRate > 0.9 && confidence < 0.9) {
        adjustment.suggestedConfidence = Math.min(0.95, confidence + 0.1);
      } else if (successRate < 0.6 && confidence > 0.6) {
        adjustment.suggestedConfidence = Math.max(0.5, confidence - 0.1);
      }
    }
  }
  
  /**
   * Actualiza estadísticas generales
   */
  _updateStats() {
    let totalSuccesses = 0;
    this.learningData.successfulDetections.forEach(count => {
      totalSuccesses += count;
    });
    
    const totalFailures = this.learningData.failedDetections.length;
    const total = totalSuccesses + totalFailures;
    
    this.stats.successRate = total > 0 ? (totalSuccesses / total) * 100 : 0;
    this.stats.lastUpdate = new Date();
  }
  
  /**
   * Obtiene sugerencias de keywords para aprobar
   */
  getSuggestedKeywords(minFrequency = 5) {
    const suggestions = [];
    
    this.learningData.suggestedKeywords.forEach((keywords, intent) => {
      keywords.forEach((count, keyword) => {
        if (count >= minFrequency) {
          suggestions.push({
            intent,
            keyword,
            frequency: count,
            confidence: Math.min(0.95, 0.5 + (count / 100))
          });
        }
      });
    });
    
    // Ordenar por frecuencia
    return suggestions.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Obtiene sugerencias de nuevas intenciones
   */
  getSuggestedIntents(minFrequency = 3) {
    return this.learningData.suggestedIntents
      .filter(s => s.frequency >= minFrequency)
      .sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Obtiene ajustes de confianza sugeridos
   */
  getConfidenceAdjustments() {
    const adjustments = [];
    
    this.learningData.confidenceAdjustments.forEach((data, intent) => {
      if (data.suggestedConfidence !== null) {
        const total = data.successes + data.failures;
        const successRate = (data.successes / total) * 100;
        
        adjustments.push({
          intent,
          currentConfidence: data.avgConfidence,
          suggestedConfidence: data.suggestedConfidence,
          successRate: successRate.toFixed(1),
          totalSamples: total
        });
      }
    });
    
    return adjustments;
  }
  
  /**
   * Obtiene reporte completo de aprendizaje
   */
  getReport() {
    return {
      stats: {
        totalProcessed: this.stats.totalProcessed,
        successRate: this.stats.successRate.toFixed(1) + '%',
        lastUpdate: this.stats.lastUpdate
      },
      suggestedKeywords: this.getSuggestedKeywords(5),
      suggestedIntents: this.getSuggestedIntents(3),
      confidenceAdjustments: this.getConfidenceAdjustments(),
      recentFailures: this.learningData.failedDetections.slice(-10)
    };
  }
  
  /**
   * Reinicia datos de aprendizaje
   */
  reset() {
    this.learningData = {
      successfulDetections: new Map(),
      failedDetections: [],
      userPhrases: new Map(),
      suggestedKeywords: new Map(),
      suggestedIntents: [],
      confidenceAdjustments: new Map()
    };
    
    this.stats = {
      totalProcessed: 0,
      successRate: 0,
      lastUpdate: new Date()
    };
    
    logger.info('Sistema de aprendizaje reiniciado');
  }
}

// Instancia singleton
export const autoLearningEngine = new AutoLearningEngine();