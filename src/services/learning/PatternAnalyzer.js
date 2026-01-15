// src/services/learning/PatternAnalyzer.js

/**
 * PatternAnalyzer - Analiza Patrones de Texto
 * 
 * Identifica estructuras comunes en las consultas de usuarios
 */
export class PatternAnalyzer {
  
  constructor() {
    this.commonPatterns = [
      { name: 'donde_pregunta', regex: /d[oó]nde\s+(est[aá]|queda|se encuentra)/i },
      { name: 'cuanto_pregunta', regex: /cu[aá]nto\s+(cuesta|vale|es)/i },
      { name: 'que_pregunta', regex: /qu[eé]\s+(es|hay|tienen)/i },
      { name: 'como_pregunta', regex: /c[oó]mo\s+(llego|llegar|es)/i },
      { name: 'cuando_pregunta', regex: /cu[aá]ndo\s+(abre|cierra|es)/i },
      { name: 'hay_pregunta', regex: /hay\s+\w+/i },
      { name: 'tienen_pregunta', regex: /tienen\s+\w+/i }
    ];
  }
  
  /**
   * Analiza texto y devuelve patrones encontrados
   */
  analyze(text) {
    const found = [];
    
    this.commonPatterns.forEach(pattern => {
      if (pattern.regex.test(text)) {
        found.push(pattern.name);
      }
    });
    
    return found;
  }
  
  /**
   * Extrae estructura de pregunta
   */
  extractQuestionStructure(text) {
    const normalized = text.toLowerCase();
    
    // Determinar tipo de pregunta
    if (normalized.startsWith('dónde') || normalized.startsWith('donde')) {
      return { type: 'location', confidence: 0.9 };
    }
    if (normalized.startsWith('cuánto') || normalized.startsWith('cuanto')) {
      return { type: 'price', confidence: 0.9 };
    }
    if (normalized.startsWith('qué') || normalized.startsWith('que')) {
      return { type: 'information', confidence: 0.8 };
    }
    if (normalized.startsWith('cómo') || normalized.startsWith('como')) {
      return { type: 'method', confidence: 0.8 };
    }
    if (normalized.startsWith('cuándo') || normalized.startsWith('cuando')) {
      return { type: 'time', confidence: 0.9 };
    }
    
    return { type: 'unknown', confidence: 0.3 };
  }
}