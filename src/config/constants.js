/**
 * constants.js - ACTUALIZADO CON ES MODULES
 * Más keywords, mejor detección, menos errores
 */

// ============================================
// INTENT PATTERNS
// ============================================
export const INTENT_PATTERNS = {
  // SALUDOS
  saludar: {
    keywords: ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 
               'qué tal', 'cómo está', 'hey', 'alo'],
    patterns: [/^hola/i, /^buenos/i, /^buenas/i, /^hey/i],
    confidence: 0.95
  },

  // DESPEDIDAS
  despedida: {
    keywords: ['adiós', 'chao', 'hasta luego', 'gracias', 'bye', 
               'nos vemos', 'cuídate', 'hasta pronto'],
    patterns: [/adi[oó]s/i, /chao/i, /gracias.*todo/i],
    confidence: 0.95
  },

  // CONFIRMACIONES
  confirmar: {
    keywords: ['sí', 'si', 'correcto', 'exacto', 'claro', 
               'ok', 'está bien', 'dale', 'perfecto'],
    patterns: [/^s[ií]/i, /^ok/i, /^dale/i],
    confidence: 0.95
  },

  // NEGACIONES
  negar: {
    keywords: ['no', 'negativo', 'incorrecto', 'nada', 
               'no gracias', 'no necesito'],
    patterns: [/^no\b/i, /no\s+gracias/i, /no\s+necesito/i],
    confidence: 0.95
  },

  // BUSCAR LOCAL - MEJORADO
  buscar_local: {
    keywords: [
      'busco', 'buscar', 'dónde', 'donde', 'queda', 
      'ubicar', 'encontrar', 'hay', 'tienen',
      'tienda', 'local', 'almacén', 'negocio', 'comercio',
      'ropa', 'zapatos', 'tenis', 'deportiva',
      'comida', 'restaurante', 'comer'
    ],
    patterns: [
      /d[oó]nde\s+(est[aá]|queda|encuentro)/i,
      /busco\s+\w+/i,
      /tienen\s+\w+/i,
      /hay\s+\w+/i
    ],
    confidence: 0.7
  },

  // RESTAURANTES - MEJORADO
  restaurantes: {
    keywords: [
      'comida', 'comer', 'almorzar', 'cenar', 'desayunar',
      'hambre', 'almuerzo', 'cena', 'desayuno',
      'donde como', 'para comer',
      'restaurante', 'restaurantes', 'comidas',
      'cafetería', 'café'
    ],
    patterns: [
      /comida/i,
      /d[oó]nde\s+como/i,
      /para\s+comer/i,
      /restaurante/i
    ],
    confidence: 0.85
  },

  // HORARIOS
  horario_mall: {
    keywords: [
      'horario', 'horarios', 'hora', 'abre', 'cierra',
      'abierto', 'cerrado', 'atención', 'atiende',
      'qué hora', 'a qué hora', 'hasta qué hora'
    ],
    patterns: [
      /qu[eé]\s+hora/i,
      /a\s+qu[eé]\s+hora/i,
      /horario/i,
      /(abre|cierra)/i
    ],
    confidence: 0.8
  },

  // PARQUEADERO - MEJORADO
  parqueadero: {
    keywords: [
      'parqueadero', 'parqueo', 'estacionamiento',
      'parquear', 'estacionar', 'carro', 'auto',
      'donde parqueo', 'hay parqueo'
    ],
    patterns: [
      /parque(adero|o)/i,
      /estaciona(miento|r)/i,
      /d[oó]nde\s+parque/i
    ],
    confidence: 0.85
  },

  // BAÑOS - MEJORADO
  banos: {
    keywords: [
      'baño', 'baños', 'sanitario', 'sanitarios',
      'servicio', 'servicios', 'wc', 'tocador'
    ],
    patterns: [/ba[ñn]os?/i, /sanitarios?/i],
    confidence: 0.9
  },

  // ADMINISTRACIÓN - NUEVO
  administracion: {
    keywords: [
      'administración', 'administracion', 'oficinas',
      'gerencia', 'atención al cliente', 'quejas',
      'sugerencias', 'reclamos', 'punto de información'
    ],
    patterns: [
      /administraci[oó]n/i,
      /oficinas?\s+del\s+centro/i,
      /atenci[oó]n\s+al\s+cliente/i
    ],
    confidence: 0.85
  },

  // EVENTOS
  eventos: {
    keywords: [
      'evento', 'eventos', 'actividad', 'actividades',
      'qué hay', 'pasa algo', 'hay algo',
      'show', 'presentación', 'concierto'
    ],
    patterns: [
      /qu[eé]\s+hay/i,
      /eventos?/i,
      /actividades?/i
    ],
    confidence: 0.85
  },

  // TRANSFERIR LLAMADA
  transferir_llamada: {
    keywords: [
      'comunicar', 'hablar', 'transferir', 'pasar',
      'llamar', 'conectar', 'contactar',
      'quiero hablar', 'me comunica', 'pásame'
    ],
    patterns: [
      /comunica(r|me)/i,
      /hablar\s+con/i,
      /p[aá]same/i,
      /transferir/i
    ],
    confidence: 0.85
  },

  // UNKNOWN (fallback)
  unknown: {
    keywords: [],
    patterns: [],
    confidence: 0.3
  }
};

// ============================================
// CATEGORÍAS
// ============================================
export const CATEGORIES = {
  RESTAURANTE: 'restaurante',
  ROPA: 'ropa',
  BANCO: 'banco',
  FARMACIA: 'farmacia',
  SUPERMERCADO: 'supermercado',
  CINE: 'cine',
  SERVICIOS: 'servicios',
  DEPORTIVA: 'deportiva'
};

// ============================================
// INTENTS (LISTA SIMPLE)
// ============================================
export const INTENTS = {
  SALUDAR: 'saludar',
  DESPEDIDA: 'despedida',
  CONFIRMAR: 'confirmar',
  NEGAR: 'negar',
  BUSCAR_LOCAL: 'buscar_local',
  RESTAURANTES: 'restaurantes',
  HORARIO_MALL: 'horario_mall',
  PARQUEADERO: 'parqueadero',
  BANOS: 'banos',
  ADMINISTRACION: 'administracion',
  EVENTOS: 'eventos',
  TRANSFERIR_LLAMADA: 'transferir_llamada',
  UNKNOWN: 'unknown'
};

// ============================================
// TIENDAS - ESTRUCTURA COMPLETA
// ============================================
export const STORES = {
  nike: {
    id: 'nike',
    name: 'Nike',
    category: 'ropa',
    subcategory: 'deportiva',
    floor: 'segundo piso',
    zone: 'zona norte',
    local: '215',
    phone: '607-724-1234',
    hours: 'lun-sáb 10AM-8PM, dom 11AM-7PM',
    keywords: ['nike', 'tenis', 'deportivos', 'zapatos', 'ropa deportiva'],
    priceRange: '$$$'
  }
};

// ============================================
// RESPUESTAS PREGRABADAS (para TTS cache)
// ============================================
export const PRERECORDED_RESPONSES = {
  greeting: 'Centro Comercial Puente. ¿En qué ayudo?',
  closing: '¡Hasta pronto!',
  didntUnderstand: 'No entendí. ¿Repetís?',
  anythingElse: '¿Algo más?',
  transferring: 'Te comunico. Un momento.',
  notAvailable: 'No está disponible ahora.'
};

// ============================================
// EXPORT DEFAULT (COMPATIBILIDAD)
// ============================================
export default {
  INTENT_PATTERNS,
  CATEGORIES,
  INTENTS,
  STORES,
  PRERECORDED_RESPONSES
};