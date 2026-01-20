// src/services/IntentDetector_V2.js

import { INTENTS, CATEGORIES } from '../config/constants.js';
import { stores, mallInfo } from '../data/stores.js';
import { logger } from '../utils/logger.js';

/**
 * IntentDetector V2 - CON INTELIGENCIA PREDICTIVA
 * 
 * Nuevas capacidades:
 * - 🧠 Predice necesidades futuras del usuario
 * - 💡 Detecta intenciones ocultas (no explícitas)
 * - 🎯 Analiza contexto emocional (urgencia, indecisión)
 * - 🔮 Sugiere próximos pasos lógicos
 * - 🤝 Personalidad empática y proactiva
 * 
 * Filosofía:
 * "No solo entender QUÉ pregunta, sino POR QUÉ lo pregunta"
 */
export class IntentDetector {
  
  constructor() {
    this.confidence_threshold = 0.6;
    
    // Nuevo: Análisis contextual profundo
    this.context = {
      emotionalTone: null,        // 'urgent', 'indecisive', 'frustrated', 'happy', 'neutral'
      userGoal: null,              // 'visit', 'call', 'order', 'browse', 'emergency'
      conversationStage: 'start',  // 'start', 'gathering_info', 'deciding', 'ready_to_act'
      previousIntents: [],
      timeOfDay: this._getTimeOfDay(),
      likelyNextNeeds: []
    };
  }
  
  /**
   * MÉTODO PRINCIPAL - Detecta intención + contexto + predicción
   */
  detectIntent(userText, conversationHistory = []) {
    logger.debug('Detectando intención con contexto', { userText });
    
    if (!userText || userText.trim().length === 0) {
      return {
        intent: INTENTS.UNKNOWN,
        confidence: 0,
        entities: {},
        needsGPT: false,
        context: this.context
      };
    }
    
    const normalizedText = userText.toLowerCase().trim();
    
    // ============================================
    // 1. ANÁLISIS CONTEXTUAL
    // ============================================
    this.context.emotionalTone = this._analyzeEmotionalTone(normalizedText);
    
    // ============================================
    // 2. DETECCIÓN DE INTENCIÓN ESTÁNDAR
    // ============================================
    const baseIntent = this._detectBaseIntent(normalizedText);
    
    // ============================================
    // 3. PREDICCIÓN DE OBJETIVO REAL
    // ============================================
    this.context.userGoal = this._predictUserGoal(
      normalizedText, 
      baseIntent.intent, 
      baseIntent.entities
    );
    
    // ============================================
    // 4. PREDICCIÓN DE PRÓXIMA NECESIDAD
    // ============================================
    const nextNeed = this._predictNextNeed(
      baseIntent.intent,
      baseIntent.entities,
      this.context.userGoal
    );
    
    // ============================================
    // 5. ACTUALIZAR HISTORIAL
    // ============================================
    this.context.previousIntents.push(baseIntent.intent);
    if (this.context.previousIntents.length > 5) {
      this.context.previousIntents.shift();
    }
    
    // ============================================
    // 6. RETORNAR RESULTADO ENRIQUECIDO
    // ============================================
    return {
      ...baseIntent,
      context: {
        emotionalTone: this.context.emotionalTone,
        userGoal: this.context.userGoal,
        nextNeed: nextNeed,
        timeOfDay: this.context.timeOfDay,
        urgency: this.context.emotionalTone === 'urgent' ? 'high' : 'normal'
      }
    };
  }
  
  // ============================================
  // ANÁLISIS CONTEXTUAL
  // ============================================
  
  /**
   * Analiza el tono emocional del mensaje
   */
  _analyzeEmotionalTone(text) {
    // Urgente
    const urgentKeywords = ['urgente', 'rápido', 'rapido', 'ya', 'ahora', 'emergencia', 'apurado'];
    if (urgentKeywords.some(kw => text.includes(kw))) {
      return 'urgent';
    }
    
    // Frustrado
    const frustratedKeywords = ['otra vez', 'de nuevo', 'no entiendes', 'expliqué', 'ya te dije', 'no sirve'];
    if (frustratedKeywords.some(kw => text.includes(kw))) {
      return 'frustrated';
    }
    
    // Indeciso
    const indecisiveKeywords = ['no sé', 'no se', 'tal vez', 'quizás', 'quizas', 'será que', 'sera que', 'opciones', 'cuál', 'cual'];
    if (indecisiveKeywords.some(kw => text.includes(kw))) {
      return 'indecisive';
    }
    
    // Feliz/Agradecido
    const happyKeywords = ['gracias', 'excelente', 'perfecto', 'genial', 'súper', 'super', 'bacano', 'chevere'];
    if (happyKeywords.some(kw => text.includes(kw))) {
      return 'happy';
    }
    
    return 'neutral';
  }
  
  /**
   * Predice el objetivo REAL del usuario
   */
  _predictUserGoal(text, detectedIntent, entities) {
    const s = entities.storeData;
    
    // 1. EMERGENCIA - prioridad máxima
    if (detectedIntent === INTENTS.EMERGENCIA || detectedIntent === INTENTS.PRIMEROS_AUXILIOS) {
      return 'emergency';
    }
    
    // 2. QUIERE ORDENAR COMIDA
    if (s && s.category === 'restaurante') {
      const hungerPatterns = [
        'tengo hambre', 'quiero comer', 'me da hambre', 'hambre',
        'pedir', 'ordenar', 'domicilio', 'delivery'
      ];
      
      if (hungerPatterns.some(p => text.includes(p))) {
        return 'order';
      }
      
      // Si pregunta ubicación/horario de restaurante → probablemente quiere ir a comer
      if ([INTENTS.UBICACION, INTENTS.HORARIO_LOCAL, INTENTS.BUSCAR_LOCAL].includes(detectedIntent)) {
        return 'visit_restaurant';
      }
    }
    
    // 3. QUIERE COMPRAR ALGO ESPECÍFICO
    const shoppingPatterns = ['necesito', 'busco', 'quiero comprar', 'dónde consigo', 'donde consigo', 'venden'];
    if (shoppingPatterns.some(p => text.includes(p)) && !s) {
      return 'shopping_search';
    }
    
    // 4. QUIERE IR FÍSICAMENTE
    if ([INTENTS.UBICACION, INTENTS.COMO_LLEGAR, INTENTS.PARQUEADERO].includes(detectedIntent)) {
      return 'visit';
    }
    
    // 5. QUIERE LLAMAR/CONTACTAR
    if ([INTENTS.NUMERO_TELEFONO, INTENTS.TRANSFERIR].includes(detectedIntent)) {
      return 'call';
    }
    
    // 6. SOLO ESTÁ EXPLORANDO/NAVEGANDO
    if ([INTENTS.HORARIO_MALL, INTENTS.PROMOCIONES, INTENTS.EVENTOS].includes(detectedIntent)) {
      return 'browse';
    }
    
    return 'info';
  }
  
  /**
   * Predice la SIGUIENTE necesidad del usuario
   */
  _predictNextNeed(intent, entities, userGoal) {
    const s = entities.storeData;
    
    // Si preguntó ubicación → probablemente necesita horario o cómo llegar
    if (intent === INTENTS.UBICACION && s) {
      if (userGoal === 'visit' || userGoal === 'visit_restaurant') {
        return {
          likely: ['horario', 'como_llegar', 'parqueadero'],
          suggestion: 'offer_hours_or_directions'
        };
      }
    }
    
    // Si preguntó horario → probablemente quiere ubicación o teléfono
    if (intent === INTENTS.HORARIO_LOCAL && s) {
      if (s.category === 'restaurante') {
        return {
          likely: ['pedir_domicilio', 'transferir', 'ubicacion'],
          suggestion: 'offer_order_or_visit'
        };
      }
      return {
        likely: ['ubicacion', 'numero_telefono'],
        suggestion: 'offer_location_or_contact'
      };
    }
    
    // Si preguntó teléfono → probablemente quiere que lo transfieran
    if (intent === INTENTS.NUMERO_TELEFONO && s) {
      return {
        likely: ['transferir'],
        suggestion: 'offer_direct_transfer'
      };
    }
    
    // Si buscó restaurante → probablemente quiere menú/precios o pedir
    if ((intent === INTENTS.BUSCAR_LOCAL || intent === INTENTS.RESTAURANTES) && 
        (userGoal === 'order' || userGoal === 'visit_restaurant')) {
      return {
        likely: ['menu', 'precios', 'pedir_domicilio', 'horario'],
        suggestion: 'offer_menu_or_order'
      };
    }
    
    // Si está indeciso → probablemente necesita recomendación
    if (this.context.emotionalTone === 'indecisive') {
      return {
        likely: ['recomendacion', 'opciones'],
        suggestion: 'offer_recommendation'
      };
    }
    
    return {
      likely: [],
      suggestion: null
    };
  }
  
  _getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 14) return 'lunch';
    if (hour >= 14 && hour < 19) return 'afternoon';
    if (hour >= 19 && hour < 22) return 'dinner';
    return 'night';
  }
  
  // ============================================
  // DETECCIÓN BASE (CÓDIGO ORIGINAL MEJORADO)
  // ============================================
  
  _detectBaseIntent(normalizedText) {
    // Control de flujo
    if (this.isSaludar(normalizedText)) {
      return { intent: INTENTS.SALUDAR, confidence: 0.95, entities: {}, needsGPT: false };
    }
    
    if (this.isDespedida(normalizedText)) {
      return { intent: INTENTS.DESPEDIDA, confidence: 0.95, entities: {}, needsGPT: false };
    }
    
    if (this.isConfirmar(normalizedText)) {
      return { intent: INTENTS.CONFIRMAR, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isNegar(normalizedText)) {
      return { intent: INTENTS.NEGAR, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isRepetir(normalizedText)) {
      return { intent: INTENTS.REPETIR, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isAyuda(normalizedText)) {
      return { intent: INTENTS.AYUDA, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    // Emergencias
    if (this.isEmergencia(normalizedText)) {
      return { intent: INTENTS.EMERGENCIA, confidence: 0.95, entities: {}, needsGPT: false };
    }
    
    if (this.isPrimerosAuxilios(normalizedText)) {
      return { intent: INTENTS.PRIMEROS_AUXILIOS, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isObjetosPerdidos(normalizedText)) {
      return { intent: INTENTS.OBJETOS_PERDIDOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    // Quejas y sugerencias
    if (this.isQuejas(normalizedText)) {
      return { intent: INTENTS.QUEJAS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isSugerencias(normalizedText)) {
      return { intent: INTENTS.SUGERENCIAS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    // Transferencias y contacto
    if (this.isTransferir(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.TRANSFERIR,
        confidence: 0.85,
        entities: store,
        needsGPT: !store.storeName
      };
    }
    
    if (this.isNumeroTelefono(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.NUMERO_TELEFONO,
        confidence: 0.85,
        entities: store,
        needsGPT: !store.storeName
      };
    }
    
    if (this.isPedirDomicilio(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.PEDIR_DOMICILIO,
        confidence: 0.9,
        entities: store,
        needsGPT: false
      };
    }
    
    // Servicios específicos
    if (this.isParqueaderoCosto(normalizedText)) {
      return { intent: INTENTS.PARQUEADERO_COSTO, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isParqueadero(normalizedText)) {
      return { intent: INTENTS.PARQUEADERO, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isBanos(normalizedText)) {
      return { intent: INTENTS.BANOS, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isCajero(normalizedText)) {
      return { intent: INTENTS.CAJERO, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isWifi(normalizedText)) {
      return { intent: INTENTS.WIFI, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isZonaJuegos(normalizedText)) {
      return { intent: INTENTS.ZONA_JUEGOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isSalaLactancia(normalizedText)) {
      return { intent: INTENTS.SALA_LACTANCIA, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isAccesibilidad(normalizedText)) {
      return { intent: INTENTS.ACCESIBILIDAD, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isTarjetaRegalo(normalizedText)) {
      return { intent: INTENTS.TARJETA_REGALO, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isAdministracion(normalizedText)) {
      return { intent: 'administracion', confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    // Cine
    if (this.isCinePrecios(normalizedText)) {
      return { intent: INTENTS.CINE_PRECIOS, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isCineCartelera(normalizedText)) {
      return { intent: INTENTS.CINE_CARTELERA, confidence: 0.9, entities: {}, needsGPT: false };
    }
    
    if (this.isCineHorarios(normalizedText)) {
      return { intent: INTENTS.CINE_HORARIOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isCine(normalizedText)) {
      return { intent: INTENTS.CINE, confidence: 0.8, entities: {}, needsGPT: false };
    }
    
    // Comercial
    if (this.isPromociones(normalizedText)) {
      return { intent: INTENTS.PROMOCIONES, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isEventos(normalizedText)) {
      return { intent: INTENTS.EVENTOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isOfertas(normalizedText)) {
      return { intent: INTENTS.OFERTAS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isDescuentos(normalizedText)) {
      return { intent: INTENTS.DESCUENTOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    // Precios y menú
    if (this.isPreciosComida(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.PRECIOS_COMIDA,
        confidence: 0.88,
        entities: store,
        needsGPT: false
      };
    }
    
    if (this.isMenuRestaurante(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.MENU_RESTAURANTE,
        confidence: 0.85,
        entities: store,
        needsGPT: false
      };
    }
    
    // Categorías
    if (this.isRestaurantes(normalizedText)) {
      return { intent: INTENTS.RESTAURANTES, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isTiendasRopa(normalizedText)) {
      return { intent: INTENTS.TIENDAS_ROPA, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isTiendasDeportes(normalizedText)) {
      return { intent: INTENTS.TIENDAS_DEPORTES, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isBancos(normalizedText)) {
      return { intent: INTENTS.BANCOS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isFarmacias(normalizedText)) {
      return { intent: INTENTS.FARMACIAS, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isSupermercado(normalizedText)) {
      return { intent: INTENTS.SUPERMERCADO, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    // Horarios
    if (this.isHorarioLocal(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.HORARIO_LOCAL,
        confidence: store.storeName ? 0.9 : 0.6,
        entities: store,
        needsGPT: !store.storeName
      };
    }
    
    if (this.isHorarioMall(normalizedText)) {
      return { intent: INTENTS.HORARIO_MALL, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isHorarios(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: store.storeName ? INTENTS.HORARIO_LOCAL : INTENTS.HORARIO_MALL,
        confidence: 0.8,
        entities: store,
        needsGPT: false
      };
    }
    
    // Ubicación
    if (this.isComoLlegar(normalizedText)) {
      return { intent: INTENTS.COMO_LLEGAR, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isUbicacionMall(normalizedText)) {
      return { intent: INTENTS.UBICACION_MALL, confidence: 0.85, entities: {}, needsGPT: false };
    }
    
    if (this.isUbicacion(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: store.storeName ? INTENTS.UBICACION : INTENTS.UBICACION_MALL,
        confidence: 0.8,
        entities: store,
        needsGPT: !store.storeName
      };
    }
    
    // Búsqueda de local
    if (this.isBuscarLocal(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: store.storeName ? 0.9 : 0.6,
        entities: store,
        needsGPT: !store.storeName
      };
    }
    
    // Intento por nombre de tienda
    const store = this.extractStore(normalizedText);
    if (store.storeName) {
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: 0.7,
        entities: store,
        needsGPT: false
      };
    }
    
    // No entendió
    return {
      intent: INTENTS.UNKNOWN,
      confidence: 0.3,
      entities: {},
      needsGPT: true
    };
  }
  
  // ============================================
  // MÉTODOS DE DETECCIÓN (CÓDIGO ORIGINAL)
  // ============================================
  
  isSaludar(text) {
    const keywords = [
      'hola', 'buenos días', 'buenas tardes', 'buenas noches',
      'buen día', 'buena tarde', 'buena noche', 'hey', 'alo', 'aló',
      'buenas', 'holi'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isDespedida(text) {
    const keywords = [
      'adios', 'adiós', 'chao', 'hasta luego', 'gracias', 'bye',
      'nos vemos', 'hasta pronto', 'me voy', 'cuídate', 'cuidate'
    ];
    return text.split(' ').length <= 5 && keywords.some(kw => text.includes(kw));
  }
  
  isConfirmar(text) {
    const keywords = [
      'sí', 'si', 'claro', 'por supuesto', 'ok', 'okay',
      'vale', 'bueno', 'dale', 'listo', 'correcto', 'exacto', 'afirmativo'
    ];
    return text.split(' ').length <= 3 && keywords.some(kw => text.includes(kw));
  }
  
  isNegar(text) {
    const keywords = [
      'no', 'nada', 'nop', 'negativo', 'para nada',
      'no gracias', 'eso es todo', 'ya no', 'suficiente', 'no necesito'
    ];
    return text.split(' ').length <= 5 && keywords.some(kw => text.includes(kw));
  }
  
  isRepetir(text) {
    const keywords = [
      'repite', 'repita', 'otra vez', 'de nuevo', 'cómo', 'como',
      'qué dijiste', 'que dijiste', 'no escuché', 'no escuche', 'no entendí'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAyuda(text) {
    const keywords = [
      'ayuda', 'ayúdame', 'ayudame', 'necesito ayuda', 'qué puedes hacer',
      'que puedes hacer', 'opciones', 'menú', 'menu', 'información', 'informacion'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isEmergencia(text) {
    const keywords = [
      'emergencia', 'urgente', 'ayuda urgente', 'auxilio', 'socorro',
      'llamar policía', 'llamar policia', 'me robaron', 'accidente', 'peligro'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPrimerosAuxilios(text) {
    const keywords = [
      'primeros auxilios', 'enfermera', 'doctor', 'me siento mal',
      'me duele', 'médico', 'medico', 'atención médica', 'atencion medica',
      'ambulancia', 'enfermo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isObjetosPerdidos(text) {
    const keywords = [
      'perdí', 'perdi', 'perdido', 'olvide', 'olvidé', 'dejé',
      'deje', 'extravié', 'extravie', 'no encuentro', 'busco mi'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           !text.includes('local') && !text.includes('tienda');
  }
  
  isQuejas(text) {
    const keywords = [
      'queja', 'quejarme', 'reclamo', 'reclamar', 'problema',
      'inconveniente', 'mal servicio', 'molesto', 'insatisfecho', 'disgusto'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSugerencias(text) {
    const keywords = [
      'sugerencia', 'sugerir', 'recomendación', 'recomendacion',
      'propuesta', 'idea', 'deberían', 'deberian', 'podrían', 'podrian',
      'sería bueno', 'seria bueno'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPedirDomicilio(text) {
    const keywords = [
      'pedir domicilio', 'hacer pedido', 'ordenar comida', 'quiero pedir',
      'delivery', 'envío a domicilio', 'envio a domicilio', 'domicilio de',
      'domicilio a'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTransferir(text) {
    const keywords = [
      'transferir', 'comunicar', 'hablar con', 'contactar', 'llamar a',
      'conectar con', 'pasar con', 'me comunicas', 'quiero hablar',
      'comunícame', 'comunicame', 'pásame', 'pasame'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isNumeroTelefono(text) {
    const keywords = [
      'número', 'numero', 'teléfono', 'telefono', 'celular', 'contacto',
      'cuál es el número', 'cual es el numero', 'dame el número', 'dame el numero',
      'phone', 'tel'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           !text.includes('transferir') && !text.includes('comunicar') &&
           !text.includes('hablar con');
  }
  
  isParqueaderoCosto(text) {
    const keywords = [
      'cuánto cuesta parquear', 'cuanto cuesta parquear', 'precio parqueadero',
      'valor parqueadero', 'tarifa parqueadero', 'costo estacionamiento',
      'cobran por parquear', 'parqueo cuánto', 'parqueo cuanto',
      'cuánto vale parquear', 'cuanto vale parquear'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isParqueadero(text) {
    const keywords = [
      'parqueadero', 'estacionamiento', 'parquear', 'parqueo',
      'donde parqueo', 'dónde parqueo', 'estacionar', 'parking'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBanos(text) {
    const keywords = [
      'baño', 'baños', 'sanitario', 'sanitarios', 'servicio', 'servicios',
      'dónde están los baños', 'donde estan los baños', 'wc', 'tocador',
      'retrete'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCajero(text) {
    const keywords = [
      'cajero', 'cajero automático', 'cajero automatico', 'atm',
      'retirar plata', 'sacar plata', 'retirar dinero', 'sacar dinero',
      'retirar efectivo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isWifi(text) {
    const keywords = [
      'wifi', 'wi-fi', 'internet', 'conexión', 'conexion',
      'red wifi', 'contraseña wifi', 'clave wifi', 'password wifi'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isZonaJuegos(text) {
    const keywords = [
      'zona de juegos', 'juegos para niños', 'juegos niños',
      'área infantil', 'area infantil', 'parque infantil', 'juegos'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           (text.includes('niños') || text.includes('niño') || text.includes('zona'));
  }
  
  isSalaLactancia(text) {
    const keywords = [
      'sala de lactancia', 'lactancia', 'amamantar', 'dar pecho',
      'sala para madres', 'espacio madres', 'lactario', 'lactante'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAccesibilidad(text) {
    const keywords = [
      'accesibilidad', 'discapacitados', 'silla de ruedas',
      'rampa', 'ascensor', 'elevador', 'acceso discapacitados',
      'personas con discapacidad', 'movilidad reducida'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTarjetaRegalo(text) {
    const keywords = [
      'tarjeta regalo', 'gift card', 'tarjeta de regalo',
      'bono regalo', 'cupón regalo', 'cupon regalo', 'vale regalo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAdministracion(text) {
    const keywords = [
      'administración', 'administracion', 'oficinas', 'oficina',
      'gerencia', 'atención al cliente', 'atencion al cliente',
      'punto de información', 'punto de informacion', 'información general',
      'administrador'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCinePrecios(text) {
    const keywords = [
      'precio cine', 'cuánto cuesta cine', 'cuanto cuesta cine',
      'valor boleta', 'precio boleta', 'tarifa cine', 'boletas cine',
      'cuánto vale cine', 'cuanto vale cine', 'cuánto sale cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineCartelera(text) {
    const keywords = [
      'cartelera', 'qué películas', 'que peliculas', 'películas',
      'peliculas', 'qué dan', 'que dan', 'qué hay en cine', 'que hay en cine',
      'qué pasan', 'que pasan', 'cuáles películas', 'cuales peliculas',
      'qué están dando', 'que estan dando'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineHorarios(text) {
    const keywords = [
      'horario cine', 'horarios cine', 'funciones cine',
      'a qué hora cine', 'a que hora cine', 'cuando cine',
      'funciones de cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCine(text) {
    const keywords = ['cine', 'cinemark', 'película', 'pelicula', 'movie', 'películas'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPromociones(text) {
    const keywords = [
      'promociones', 'promoción', 'promocion', 'promos',
      'qué promociones', 'que promociones', 'cuáles promociones',
      'hay promociones'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isEventos(text) {
    const keywords = [
      'eventos', 'evento', 'actividades', 'qué eventos',
      'que eventos', 'hay eventos', 'cuáles eventos', 'show', 'concierto'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isOfertas(text) {
    const keywords = [
      'ofertas', 'oferta', 'en oferta', 'qué ofertas', 'que ofertas',
      'hay ofertas'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isDescuentos(text) {
    const keywords = [
      'descuentos', 'descuento', 'rebaja', 'rebajas',
      'hay descuento', 'tienen descuento', 'qué descuentos'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isMenuRestaurante(text) {
    const keywords = [
      'menú', 'menu', 'carta', 'qué venden', 'que venden',
      'qué tienen', 'que tienen', 'platos', 'comidas', 'qué comen',
      'que comen', 'qué sirven', 'que sirven', 'opciones de comida'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPreciosComida(text) {
    const priceKeywords = [
      'precio', 'precios', 'cuánto cuesta', 'cuanto cuesta',
      'valor', 'valores', 'cuánto vale', 'cuanto vale',
      'rango de precio', 'costo', 'costos', 'cuánto sale', 'cuanto sale'
    ];
    
    const hasPriceKeyword = priceKeywords.some(kw => text.includes(kw));
    if (!hasPriceKeyword) return false;
    
    const store = this.extractStore(text);
    const isRestaurant = store.storeData?.category === 'restaurante';
    
    const foodKeywords = [
      'comida', 'comer', 'restaurante', 'almuerzo',
      'cena', 'comidas', 'almorzar', 'cenar', 'plato', 'menú'
    ];
    const mentionsFood = foodKeywords.some(kw => text.includes(kw));
    
    return isRestaurant || mentionsFood;
  }
  
  isRestaurantes(text) {
    const keywords = [
      'restaurantes', 'restaurante', 'dónde comer', 'donde comer',
      'comer', 'comida', 'food', 'almorzar', 'cenar', 'desayunar',
      'para comer', 'sitio para comer', 'lugar para comer',
      'hambre', 'tengo hambre', 'quiero comer', 'me da hambre'
    ];
    
    const hasKeyword = keywords.some(kw => text.includes(kw));
    
    const listIndicators = [
      'hay', 'tienen', 'lista', 'cuáles', 'cuales',
      'qué', 'que', 'opciones', 'sitios'
    ];
    const hasListIndicator = listIndicators.some(ind => text.includes(ind));
    
    return hasKeyword && (hasListIndicator || text.split(' ').length <= 3);
  }
  
  isTiendasRopa(text) {
    const keywords = [
      'tiendas de ropa', 'ropa', 'vestir', 'vestidos', 'camisas',
      'pantalones', 'moda', 'fashion', 'clothing', 'zapatos',
      'calzado', 'prendas'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('tienen') || text.includes('lista') ||
            text.includes('cuáles') || text.includes('cuales') || text.includes('tienda'));
  }
  
  isTiendasDeportes(text) {
    const keywords = [
      'deportiva', 'deportivas', 'deportes', 'tenis', 'zapatos deportivos',
      'ropa deportiva', 'gym', 'fitness', 'running', 'sport'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('tienda') || text.includes('hay') || text.includes('dónde') || 
            text.includes('donde') || text.includes('busco'));
  }
  
  isBancos(text) {
    const keywords = [
      'banco', 'bancos', 'bancolombia', 'davivienda', 'bbva',
      'servicio bancario', 'servicios bancarios'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('dónde') || text.includes('donde') ||
            text.includes('tienen') || text.includes('busco'));
  }
  
  isFarmacias(text) {
    const keywords = [
      'farmacia', 'farmacias', 'droguería', 'drogueria', 'drogas',
      'medicamentos', 'rebaja', 'medicinas', 'remedios'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSupermercado(text) {
    const keywords = [
      'supermercado', 'mercado', 'éxito', 'exito', 'carulla',
      'comprar víveres', 'comprar viveres', 'super', 'compras',
      'víveres', 'viveres'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isHorarioLocal(text) {
    const keywords = [
      'horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado',
      'qué hora', 'que hora', 'hasta qué hora', 'hasta que hora'
    ];
    const hasHorarioKeyword = keywords.some(kw => text.includes(kw));
    const store = this.extractStore(text);
    return hasHorarioKeyword && store.storeName;
  }
  
  isHorarioMall(text) {
    const keywords = [
      'horario centro comercial', 'horario mall', 'horario puente',
      'a qué hora abren', 'a que hora abren', 'a qué hora cierran',
      'a que hora cierran', 'están abiertos', 'estan abiertos',
      'horario del centro'
    ];
    return keywords.some(kw => text.includes(kw)) ||
           (text.includes('horario') && !this.extractStore(text).storeName);
  }
  
  isHorarios(text) {
    const keywords = [
      'horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado',
      'cuando abre', 'cuando cierra'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isComoLlegar(text) {
    const keywords = [
      'cómo llego', 'como llego', 'cómo llegar', 'como llegar',
      'direcciones', 'indicaciones', 'transporte', 'bus', 'taxi',
      'desde el terminal', 'venir desde', 'cómo ir', 'como ir'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacionMall(text) {
    const keywords = [
      'dónde queda el centro', 'donde queda el centro',
      'dirección centro comercial', 'direccion centro comercial',
      'ubicación centro', 'ubicacion centro', 'dónde está el mall',
      'donde esta el mall', 'dónde está el centro', 'donde esta el centro'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacion(text) {
    const keywords = [
      'dónde está', 'donde esta', 'dónde queda', 'donde queda',
      'ubicación', 'ubicacion', 'piso', 'local', 'dónde se encuentra',
      'donde se encuentra'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBuscarLocal(text) {
    const keywords = [
      'busco', 'buscando', 'encontrar', 'hay', 'tienen',
      'existe', 'me gustaría ir', 'me gustaria ir', 'necesito',
      'quiero ir'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  extractStore(text) {
    const normalizedText = text.toLowerCase();
    
    for (const store of stores) {
      const nameVariations = [
        store.name.toLowerCase(),
        store.name.toLowerCase().replace(/&/g, 'y'),
        store.name.toLowerCase().replace(/&/g, 'and'),
        store.name.toLowerCase().replace(/\s+/g, '')
      ];
      
      for (const variation of nameVariations) {
        if (normalizedText.includes(variation)) {
          return {
            storeName: store.name,
            storeId: store.id,
            storeData: store
          };
        }
      }
      
      if (store.keywords) {
        for (const keyword of store.keywords) {
          if (normalizedText.includes(keyword.toLowerCase())) {
            return {
              storeName: store.name,
              storeId: store.id,
              storeData: store
            };
          }
        }
      }
    }
    
    return {};
  }
  // ============================================
  // MÉTODOS DE DETECCIÓN (RESTO)
  // ============================================
  
  isRepetir(text) {
    const keywords = [
      'repite', 'repita', 'otra vez', 'de nuevo', 'cómo', 'como',
      'qué dijiste', 'que dijiste', 'no escuché', 'no escuche', 'no entendí'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAyuda(text) {
    const keywords = [
      'ayuda', 'ayúdame', 'ayudame', 'necesito ayuda', 'qué puedes hacer',
      'que puedes hacer', 'opciones', 'menú', 'menu', 'información', 'informacion'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isEmergencia(text) {
    const keywords = [
      'emergencia', 'urgente', 'ayuda urgente', 'auxilio', 'socorro',
      'llamar policía', 'llamar policia', 'me robaron', 'accidente', 'peligro'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPrimerosAuxilios(text) {
    const keywords = [
      'primeros auxilios', 'enfermera', 'doctor', 'me siento mal',
      'me duele', 'médico', 'medico', 'atención médica', 'atencion medica',
      'ambulancia', 'enfermo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isObjetosPerdidos(text) {
    const keywords = [
      'perdí', 'perdi', 'perdido', 'olvide', 'olvidé', 'dejé',
      'deje', 'extravié', 'extravie', 'no encuentro', 'busco mi'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           !text.includes('local') && !text.includes('tienda');
  }
  
  isQuejas(text) {
    const keywords = [
      'queja', 'quejarme', 'reclamo', 'reclamar', 'problema',
      'inconveniente', 'mal servicio', 'molesto', 'insatisfecho', 'disgusto'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSugerencias(text) {
    const keywords = [
      'sugerencia', 'sugerir', 'recomendación', 'recomendacion',
      'propuesta', 'idea', 'deberían', 'deberian', 'podrían', 'podrian',
      'sería bueno', 'seria bueno'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPedirDomicilio(text) {
    const keywords = [
      'pedir domicilio', 'hacer pedido', 'ordenar comida', 'quiero pedir',
      'delivery', 'envío a domicilio', 'envio a domicilio', 'domicilio de',
      'domicilio a'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTransferir(text) {
    const keywords = [
      'transferir', 'comunicar', 'hablar con', 'contactar', 'llamar a',
      'conectar con', 'pasar con', 'me comunicas', 'quiero hablar',
      'comunícame', 'comunicame', 'pásame', 'pasame'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isNumeroTelefono(text) {
    const keywords = [
      'número', 'numero', 'teléfono', 'telefono', 'celular', 'contacto',
      'cuál es el número', 'cual es el numero', 'dame el número', 'dame el numero',
      'phone', 'tel'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           !text.includes('transferir') && !text.includes('comunicar') &&
           !text.includes('hablar con');
  }
  
  isParqueaderoCosto(text) {
    const keywords = [
      'cuánto cuesta parquear', 'cuanto cuesta parquear', 'precio parqueadero',
      'valor parqueadero', 'tarifa parqueadero', 'costo estacionamiento',
      'cobran por parquear', 'parqueo cuánto', 'parqueo cuanto',
      'cuánto vale parquear', 'cuanto vale parquear'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isParqueadero(text) {
    const keywords = [
      'parqueadero', 'estacionamiento', 'parquear', 'parqueo',
      'donde parqueo', 'dónde parqueo', 'estacionar', 'parking'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBanos(text) {
    const keywords = [
      'baño', 'baños', 'sanitario', 'sanitarios', 'servicio', 'servicios',
      'dónde están los baños', 'donde estan los baños', 'wc', 'tocador',
      'retrete'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCajero(text) {
    const keywords = [
      'cajero', 'cajero automático', 'cajero automatico', 'atm',
      'retirar plata', 'sacar plata', 'retirar dinero', 'sacar dinero',
      'retirar efectivo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isWifi(text) {
    const keywords = [
      'wifi', 'wi-fi', 'internet', 'conexión', 'conexion',
      'red wifi', 'contraseña wifi', 'clave wifi', 'password wifi'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isZonaJuegos(text) {
    const keywords = [
      'zona de juegos', 'juegos para niños', 'juegos niños',
      'área infantil', 'area infantil', 'parque infantil', 'juegos'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           (text.includes('niños') || text.includes('niño') || text.includes('zona'));
  }
  
  isSalaLactancia(text) {
    const keywords = [
      'sala de lactancia', 'lactancia', 'amamantar', 'dar pecho',
      'sala para madres', 'espacio madres', 'lactario', 'lactante'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAccesibilidad(text) {
    const keywords = [
      'accesibilidad', 'discapacitados', 'silla de ruedas',
      'rampa', 'ascensor', 'elevador', 'acceso discapacitados',
      'personas con discapacidad', 'movilidad reducida'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTarjetaRegalo(text) {
    const keywords = [
      'tarjeta regalo', 'gift card', 'tarjeta de regalo',
      'bono regalo', 'cupón regalo', 'cupon regalo', 'vale regalo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAdministracion(text) {
    const keywords = [
      'administración', 'administracion', 'oficinas', 'oficina',
      'gerencia', 'atención al cliente', 'atencion al cliente',
      'punto de información', 'punto de informacion', 'información general',
      'administrador'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCinePrecios(text) {
    const keywords = [
      'precio cine', 'cuánto cuesta cine', 'cuanto cuesta cine',
      'valor boleta', 'precio boleta', 'tarifa cine', 'boletas cine',
      'cuánto vale cine', 'cuanto vale cine', 'cuánto sale cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineCartelera(text) {
    const keywords = [
      'cartelera', 'qué películas', 'que peliculas', 'películas',
      'peliculas', 'qué dan', 'que dan', 'qué hay en cine', 'que hay en cine',
      'qué pasan', 'que pasan', 'cuáles películas', 'cuales peliculas',
      'qué están dando', 'que estan dando'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineHorarios(text) {
    const keywords = [
      'horario cine', 'horarios cine', 'funciones cine',
      'a qué hora cine', 'a que hora cine', 'cuando cine',
      'funciones de cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCine(text) {
    const keywords = ['cine', 'cinemark', 'película', 'pelicula', 'movie', 'películas'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPromociones(text) {
    const keywords = [
      'promociones', 'promoción', 'promocion', 'promos',
      'qué promociones', 'que promociones', 'cuáles promociones',
      'hay promociones'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isEventos(text) {
    const keywords = [
      'eventos', 'evento', 'actividades', 'qué eventos',
      'que eventos', 'hay eventos', 'cuáles eventos', 'show', 'concierto'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isOfertas(text) {
    const keywords = [
      'ofertas', 'oferta', 'en oferta', 'qué ofertas', 'que ofertas',
      'hay ofertas'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isDescuentos(text) {
    const keywords = [
      'descuentos', 'descuento', 'rebaja', 'rebajas',
      'hay descuento', 'tienen descuento', 'qué descuentos'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isMenuRestaurante(text) {
    const keywords = [
      'menú', 'menu', 'carta', 'qué venden', 'que venden',
      'qué tienen', 'que tienen', 'platos', 'comidas', 'qué comen',
      'que comen', 'qué sirven', 'que sirven', 'opciones de comida'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPreciosComida(text) {
    const priceKeywords = [
      'precio', 'precios', 'cuánto cuesta', 'cuanto cuesta',
      'valor', 'valores', 'cuánto vale', 'cuanto vale',
      'rango de precio', 'costo', 'costos', 'cuánto sale', 'cuanto sale'
    ];
    
    const hasPriceKeyword = priceKeywords.some(kw => text.includes(kw));
    if (!hasPriceKeyword) return false;
    
    const store = this.extractStore(text);
    const isRestaurant = store.storeData?.category === 'restaurante';
    
    const foodKeywords = [
      'comida', 'comer', 'restaurante', 'almuerzo',
      'cena', 'comidas', 'almorzar', 'cenar', 'plato', 'menú'
    ];
    const mentionsFood = foodKeywords.some(kw => text.includes(kw));
    
    return isRestaurant || mentionsFood;
  }
  
  isRestaurantes(text) {
    const keywords = [
      'restaurantes', 'restaurante', 'dónde comer', 'donde comer',
      'comer', 'comida', 'food', 'almorzar', 'cenar', 'desayunar',
      'para comer', 'sitio para comer', 'lugar para comer',
      'hambre', 'tengo hambre', 'quiero comer', 'me da hambre'
    ];
    
    const hasKeyword = keywords.some(kw => text.includes(kw));
    
    const listIndicators = [
      'hay', 'tienen', 'lista', 'cuáles', 'cuales',
      'qué', 'que', 'opciones', 'sitios'
    ];
    const hasListIndicator = listIndicators.some(ind => text.includes(ind));
    
    return hasKeyword && (hasListIndicator || text.split(' ').length <= 3);
  }
  
  isTiendasRopa(text) {
    const keywords = [
      'tiendas de ropa', 'ropa', 'vestir', 'vestidos', 'camisas',
      'pantalones', 'moda', 'fashion', 'clothing', 'zapatos',
      'calzado', 'prendas'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('tienen') || text.includes('lista') ||
            text.includes('cuáles') || text.includes('cuales') || text.includes('tienda'));
  }
  
  isTiendasDeportes(text) {
    const keywords = [
      'deportiva', 'deportivas', 'deportes', 'tenis', 'zapatos deportivos',
      'ropa deportiva', 'gym', 'fitness', 'running', 'sport'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('tienda') || text.includes('hay') || text.includes('dónde') || 
            text.includes('donde') || text.includes('busco'));
  }
  
  isBancos(text) {
    const keywords = [
      'banco', 'bancos', 'bancolombia', 'davivienda', 'bbva',
      'servicio bancario', 'servicios bancarios'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('dónde') || text.includes('donde') ||
            text.includes('tienen') || text.includes('busco'));
  }
  
  isFarmacias(text) {
    const keywords = [
      'farmacia', 'farmacias', 'droguería', 'drogueria', 'drogas',
      'medicamentos', 'rebaja', 'medicinas', 'remedios'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSupermercado(text) {
    const keywords = [
      'supermercado', 'mercado', 'éxito', 'exito', 'carulla',
      'comprar víveres', 'comprar viveres', 'super', 'compras',
      'víveres', 'viveres'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isHorarioLocal(text) {
    const keywords = [
      'horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado',
      'qué hora', 'que hora', 'hasta qué hora', 'hasta que hora'
    ];
    const hasHorarioKeyword = keywords.some(kw => text.includes(kw));
    const store = this.extractStore(text);
    return hasHorarioKeyword && store.storeName;
  }
  
  isHorarioMall(text) {
    const keywords = [
      'horario centro comercial', 'horario mall', 'horario puente',
      'a qué hora abren', 'a que hora abren', 'a qué hora cierran',
      'a que hora cierran', 'están abiertos', 'estan abiertos',
      'horario del centro'
    ];
    return keywords.some(kw => text.includes(kw)) ||
           (text.includes('horario') && !this.extractStore(text).storeName);
  }
  
  isHorarios(text) {
    const keywords = [
      'horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado',
      'cuando abre', 'cuando cierra'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isComoLlegar(text) {
    const keywords = [
      'cómo llego', 'como llego', 'cómo llegar', 'como llegar',
      'direcciones', 'indicaciones', 'transporte', 'bus', 'taxi',
      'desde el terminal', 'venir desde', 'cómo ir', 'como ir'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacionMall(text) {
    const keywords = [
      'dónde queda el centro', 'donde queda el centro',
      'dirección centro comercial', 'direccion centro comercial',
      'ubicación centro', 'ubicacion centro', 'dónde está el mall',
      'donde esta el mall', 'dónde está el centro', 'donde esta el centro'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacion(text) {
    const keywords = [
      'dónde está', 'donde esta', 'dónde queda', 'donde queda',
      'ubicación', 'ubicacion', 'piso', 'local', 'dónde se encuentra',
      'donde se encuentra'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBuscarLocal(text) {
    const keywords = [
      'busco', 'buscando', 'encontrar', 'hay', 'tienen',
      'existe', 'me gustaría ir', 'me gustaria ir', 'necesito',
      'quiero ir'
    ];
    return keywords.some(kw => text.includes(kw));
  }
}