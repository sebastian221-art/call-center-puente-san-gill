/**
 * ResponseOptimizer.js
 * 
 * Optimiza respuestas para ser:
 * - Ultra cortas (máximo 15 palabras)
 * - Naturales y humanas
 * - Eficientes (ahorra tiempo/dinero)
 */

class ResponseOptimizer {
  constructor() {
    // Palabras a eliminar (no aportan valor)
    this.fillerWords = [
      'con gusto', 'por supuesto', 'claro que sí',
      'permíteme', 'déjame', 'te informo que',
      'quiero decirte que', 'me gustaría informarte',
      'es importante mencionar que'
    ];

    // Frases naturales cortas
    this.naturalPhrases = {
      affirmative: ['Sí', 'Claro', 'Perfecto', 'Dale', 'Listo'],
      negative: ['No', 'No tenemos', 'No hay'],
      transition: ['Mira', 'Ojo', 'Te cuento', 'Bueno'],
      closing: ['¿Algo más?', '¿Listo?', '¿Te ayudo en algo más?']
    };
  }

  /**
   * Optimiza cualquier respuesta al máximo
   */
  optimize(response, context = {}) {
    // 1. Eliminar palabras innecesarias
    let optimized = this.removeFiller(response);

    // 2. Acortar números
    optimized = this.optimizeNumbers(optimized);

    // 3. Hacer más natural
    optimized = this.makeNatural(optimized, context);

    // 4. Validar longitud (máximo 15 palabras)
    optimized = this.enforceLength(optimized);

    return optimized;
  }

  /**
   * Elimina palabras de relleno
   */
  removeFiller(text) {
    let result = text;
    this.fillerWords.forEach(filler => {
      const regex = new RegExp(filler, 'gi');
      result = result.replace(regex, '');
    });
    return result.trim();
  }

  /**
   * Optimiza números para ser más cortos
   */
  optimizeNumbers(text) {
    // "de 10 de la mañana a 8 de la noche" → "de 10AM a 8PM"
    text = text.replace(/de la mañana/gi, 'AM');
    text = text.replace(/de la tarde/gi, 'PM');
    text = text.replace(/de la noche/gi, 'PM');
    
    // "lunes a sábado" → "lun-sáb"
    text = text.replace(/lunes a sábado/gi, 'lun-sáb');
    text = text.replace(/lunes a viernes/gi, 'lun-vie');
    
    return text;
  }

  /**
   * Hace la respuesta más natural y humana
   */
  makeNatural(text, context) {
    // Agregar inicio natural aleatorio
    if (!context.hasGreeted && Math.random() > 0.5) {
      const intro = this.randomElement(this.naturalPhrases.transition);
      text = `${intro}, ${text.toLowerCase()}`;
    }

    return text;
  }

  /**
   * Fuerza máximo de palabras
   */
  enforceLength(text, maxWords = 15) {
    const words = text.split(' ');
    if (words.length <= maxWords) return text;

    // Si es muy largo, cortar y agregar pregunta
    const shortened = words.slice(0, maxWords - 2).join(' ');
    return `${shortened}. ¿Te sirve?`;
  }

  /**
   * Crea respuesta ultra-corta para ubicación
   */
  createLocationResponse(storeData) {
    // ANTES: "Nike está ubicado en el segundo piso, zona norte, local 215"
    // DESPUÉS: "Segundo piso, local 215"
    return `${storeData.floor}, local ${storeData.local}`;
  }

  /**
   * Crea respuesta ultra-corta para horario
   */
  createScheduleResponse(storeData) {
    // ANTES: "El horario de Nike es de lunes a sábado de 10AM a 8PM"
    // DESPUÉS: "Lun-sáb 10AM-8PM"
    const schedule = storeData.hours;
    return this.optimizeNumbers(schedule);
  }

  /**
   * Crea respuesta ultra-corta para teléfono
   */
  createPhoneResponse(phone) {
    // ANTES: "El número telefónico es 607-724-1234"
    // DESPUÉS: "Es el 607-724-1234"
    return `Es el ${phone}`;
  }

  /**
   * Crea respuesta de lista ultra-corta
   */
  createListResponse(items, category) {
    if (items.length === 0) return 'No hay';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} y ${items[1]}`;
    
    // Más de 2: dar número y preguntar cuál
    return `Tenemos ${items.length}: ${items.join(', ')}. ¿Cuál?`;
  }

  /**
   * Elemento aleatorio de array
   */
  randomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Calcula tiempo estimado de lectura en segundos
   */
  estimateSpeechTime(text) {
    // Promedio: 2.5 palabras por segundo en español
    const words = text.split(' ').length;
    return Math.ceil(words / 2.5);
  }

  /**
   * Calcula costo estimado de la respuesta
   */
  estimateCost(text) {
    const seconds = this.estimateSpeechTime(text);
    const minutes = seconds / 60;
    const costPerMinute = 180; // COP
    return Math.ceil(minutes * costPerMinute);
  }
}

module.exports = ResponseOptimizer;