// src/utils/contextManager.js

import { logger } from './logger.js';

/**
 * Gestiona el contexto de la conversación
 * Evita repeticiones y mantiene coherencia
 */
export class ContextManager {
  
  constructor() {
    this.conversations = new Map(); // callSid -> contexto
    this.maxContextAge = 10 * 60 * 1000; // 10 minutos
  }
  
  /**
   * Obtiene o crea un contexto para una llamada
   */
  getContext(callSid) {
    if (!this.conversations.has(callSid)) {
      this.conversations.set(callSid, this.createNewContext());
    }
    
    const context = this.conversations.get(callSid);
    
    // Limpiar si es muy viejo
    if (Date.now() - context.startTime > this.maxContextAge) {
      this.conversations.delete(callSid);
      return this.createNewContext();
    }
    
    return context;
  }
  
  /**
   * Crea un nuevo contexto vacío
   */
  createNewContext() {
    return {
      startTime: Date.now(),
      turnCount: 0,
      intentsHistory: [],
      entitiesHistory: [],
      responsesGiven: [],
      lastIntent: null,
      lastEntity: null,
      lastResponse: null,
      userSaidGoodbye: false,
      storesMentioned: [],
      topicsDiscussed: []
    };
  }
  
  /**
   * Actualiza el contexto con nueva información
   */
  updateContext(callSid, intent, entities, response) {
    const context = this.getContext(callSid);
    
    context.turnCount++;
    context.lastIntent = intent;
    context.lastEntity = entities;
    context.lastResponse = response;
    
    // Historial de intenciones (últimas 5)
    context.intentsHistory.push(intent);
    if (context.intentsHistory.length > 5) {
      context.intentsHistory.shift();
    }
    
    // Historial de respuestas (últimas 3)
    context.responsesGiven.push(response);
    if (context.responsesGiven.length > 3) {
      context.responsesGiven.shift();
    }
    
    // Tiendas mencionadas
    if (entities.storeName && !context.storesMentioned.includes(entities.storeName)) {
      context.storesMentioned.push(entities.storeName);
    }
    
    // Temas discutidos
    const topic = this.intentToTopic(intent);
    if (topic && !context.topicsDiscussed.includes(topic)) {
      context.topicsDiscussed.push(topic);
    }
    
    logger.debug('Contexto actualizado', { 
      callSid, 
      turnCount: context.turnCount,
      storesMentioned: context.storesMentioned,
      topicsDiscussed: context.topicsDiscussed
    });
    
    return context;
  }
  
  /**
   * Verifica si algo ya fue discutido
   */
  wasAlreadyDiscussed(callSid, intent) {
    const context = this.getContext(callSid);
    return context.intentsHistory.includes(intent);
  }
  
  /**
   * Verifica si una tienda ya fue mencionada
   */
  wasStoreMentioned(callSid, storeName) {
    const context = this.getContext(callSid);
    return context.storesMentioned.includes(storeName);
  }
  
  /**
   * Obtiene la última respuesta dada
   */
  getLastResponse(callSid) {
    const context = this.getContext(callSid);
    return context.lastResponse;
  }
  
  /**
   * Verifica si el usuario ya se despidió
   */
  userSaidGoodbye(callSid) {
    const context = this.getContext(callSid);
    return context.userSaidGoodbye;
  }
  
  /**
   * Marca que el usuario se despidió
   */
  markGoodbye(callSid) {
    const context = this.getContext(callSid);
    context.userSaidGoodbye = true;
  }
  
  /**
   * Verifica si es una repetición reciente
   */
  isRepeatingIntent(callSid, intent) {
    const context = this.getContext(callSid);
    
    // Revisar últimos 2 turnos
    const recent = context.intentsHistory.slice(-2);
    return recent.filter(i => i === intent).length >= 2;
  }
  
  /**
   * Obtiene sugerencias basadas en el contexto
   */
  getSuggestions(callSid) {
    const context = this.getContext(callSid);
    const suggestions = [];
    
    // Si preguntó por una tienda pero no horarios
    if (context.storesMentioned.length > 0 && 
        !context.topicsDiscussed.includes('horarios')) {
      const store = context.storesMentioned[0];
      suggestions.push(`¿Quieres saber el horario de ${store}?`);
    }
    
    // Si preguntó horarios pero no ubicación
    if (context.topicsDiscussed.includes('horarios') && 
        !context.topicsDiscussed.includes('ubicacion')) {
      suggestions.push('¿Necesitas saber dónde queda?');
    }
    
    // Si preguntó por restaurante pero no menú
    if (context.storesMentioned.some(s => s.includes('Crepes') || s.includes('Subway')) &&
        !context.topicsDiscussed.includes('menu')) {
      suggestions.push('¿Quieres conocer el menú?');
    }
    
    return suggestions;
  }
  
  /**
   * Convierte intención en tema general
   */
  intentToTopic(intent) {
    const topicMap = {
      'buscar_local': 'busqueda',
      'ubicacion': 'ubicacion',
      'ubicacion_mall': 'ubicacion',
      'horarios': 'horarios',
      'horario_mall': 'horarios',
      'horario_local': 'horarios',
      'transferir': 'contacto',
      'numero_telefono': 'contacto',
      'menu_restaurante': 'menu',
      'precios_comida': 'precios',
      'cine': 'cine',
      'cine_precios': 'cine',
      'cine_cartelera': 'cine',
      'parqueadero': 'servicios',
      'banos': 'servicios',
      'cajero': 'servicios',
      'wifi': 'servicios'
    };
    
    return topicMap[intent] || null;
  }
  
  /**
   * Limpia contextos antiguos (llamar periódicamente)
   */
  cleanOldContexts() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [callSid, context] of this.conversations.entries()) {
      if (now - context.startTime > this.maxContextAge) {
        this.conversations.delete(callSid);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.info(`Limpiados ${cleaned} contextos antiguos`);
    }
  }
  
  /**
   * Obtiene resumen del contexto para debug
   */
  getContextSummary(callSid) {
    const context = this.getContext(callSid);
    
    return {
      turnCount: context.turnCount,
      duration: Math.round((Date.now() - context.startTime) / 1000),
      storesMentioned: context.storesMentioned,
      topicsDiscussed: context.topicsDiscussed,
      lastIntent: context.lastIntent
    };
  }
  
  /**
   * Elimina un contexto específico
   */
  clearContext(callSid) {
    this.conversations.delete(callSid);
    logger.debug('Contexto eliminado', { callSid });
  }
  
  /**
   * Obtiene estadísticas generales
   */
  getStats() {
    return {
      activeConversations: this.conversations.size,
      avgTurnsPerConversation: this.calculateAvgTurns(),
      totalConversations: this.conversations.size
    };
  }
  
  calculateAvgTurns() {
    if (this.conversations.size === 0) return 0;
    
    let total = 0;
    for (const context of this.conversations.values()) {
      total += context.turnCount;
    }
    
    return Math.round(total / this.conversations.size);
  }
}

// Singleton global
export const contextManager = new ContextManager();

// Limpiar contextos antiguos cada 5 minutos
setInterval(() => {
  contextManager.cleanOldContexts();
}, 5 * 60 * 1000);