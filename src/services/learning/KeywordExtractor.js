// src/services/learning/KeywordExtractor.js

/**
 * KeywordExtractor - Extrae Keywords de Texto
 * 
 * Identifica palabras clave relevantes en las consultas
 */
export class KeywordExtractor {
  
  constructor() {
    // Palabras a ignorar (stopwords)
    this.stopwords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'a', 'al', 'en', 'con', 'por', 'para',
      'es', 'son', 'está', 'están', 'hay', 'tiene', 'tienen',
      'qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'dónde', 'donde',
      'cuándo', 'cuando', 'cuánto', 'cuanto', 'por qué', 'porque',
      'me', 'te', 'se', 'nos', 'les', 'mi', 'tu', 'su',
      'yo', 'tú', 'él', 'ella', 'nosotros', 'ustedes', 'ellos',
      'puedo', 'puede', 'pueden', 'quiero', 'quiere', 'quieren',
      'necesito', 'necesita', 'necesitan', 'busco', 'busca', 'buscan',
      'dame', 'dime', 'ayúdame', 'ayuda', 'favor'
    ]);
  }
  
  /**
   * Extrae keywords del texto
   */
  extract(text) {
    // Normalizar
    const normalized = text.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Quitar acentos
    
    // Dividir en palabras
    const words = normalized
      .split(/\s+/)
      .filter(word => word.length > 2) // Mínimo 3 caracteres
      .filter(word => !this.stopwords.has(word)) // No stopwords
      .filter(word => /^[a-z]+$/.test(word)); // Solo letras
    
    // Eliminar duplicados
    return [...new Set(words)];
  }
  
  /**
   * Extrae frases de 2-3 palabras
   */
  extractPhrases(text) {
    const words = text.toLowerCase().split(/\s+/);
    const phrases = [];
    
    // Bigrams (2 palabras)
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (!this._containsStopword(phrase)) {
        phrases.push(phrase);
      }
    }
    
    // Trigrams (3 palabras)
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (!this._containsStopword(phrase)) {
        phrases.push(phrase);
      }
    }
    
    return phrases;
  }
  
  /**
   * Verifica si una frase contiene stopwords
   */
  _containsStopword(phrase) {
    const words = phrase.split(' ');
    return words.every(word => this.stopwords.has(word));
  }
}