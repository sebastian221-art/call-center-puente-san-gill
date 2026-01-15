/**
 * InterruptionDetector.js
 * 
 * Detecta cuando el usuario quiere interrumpir
 * para ahorrar tiempo y dinero
 */

class InterruptionDetector {
  constructor() {
    // Palabras de interrupción INMEDIATA
    this.immediateStopWords = [
      'ya', 'ok', 'listo', 'entendí', 'perfecto',
      'suficiente', 'basta', 'para', 'stop'
    ];

    // Palabras negativas (usuario insatisfecho)
    this.negativeWords = [
      'no', 'incorrecto', 'mal', 'error', 'equivocado',
      'eso no', 'no es', 'no sirve'
    ];

    // Palabras de cierre
    this.closingWords = [
      'gracias', 'chao', 'adiós', 'hasta luego',
      'nos vemos', 'cuídate'
    ];
  }

  /**
   * Detecta si usuario quiere interrumpir
   */
  detectInterruption(userText) {
    const normalized = userText.toLowerCase().trim();
    
    return {
      shouldStop: this.shouldStopSpeaking(normalized),
      isNegative: this.isNegativeFeedback(normalized),
      isClosing: this.isClosingConversation(normalized),
      type: this.getInterruptionType(normalized)
    };
  }

  /**
   * Debe dejar de hablar inmediatamente
   */
  shouldStopSpeaking(text) {
    return this.immediateStopWords.some(word => 
      text === word || text.startsWith(word + ' ')
    );
  }

  /**
   * Es feedback negativo
   */
  isNegativeFeedback(text) {
    return this.negativeWords.some(word => text.includes(word));
  }

  /**
   * Usuario quiere cerrar conversación
   */
  isClosingConversation(text) {
    return this.closingWords.some(word => text.includes(word));
  }

  /**
   * Tipo de interrupción
   */
  getInterruptionType(text) {
    if (this.shouldStopSpeaking(text)) return 'STOP';
    if (this.isNegativeFeedback(text)) return 'NEGATIVE';
    if (this.isClosingConversation(text)) return 'CLOSING';
    return 'NONE';
  }

  /**
   * Respuesta apropiada según tipo de interrupción
   */
  getInterruptionResponse(type) {
    const responses = {
      'STOP': '¿Algo más?',
      'NEGATIVE': 'Disculpa. ¿Qué necesitas?',
      'CLOSING': 'Perfecto. ¡Hasta pronto!',
      'NONE': ''
    };
    return responses[type] || '';
  }
}

module.exports = InterruptionDetector;