// src/services/IntentDetector.js

import { INTENTS, CATEGORIES } from '../config/constants.js';
import { stores, mallInfo } from '../data/stores.js';
import { logger } from '../utils/logger.js';
/**
 * Detecta la intención del usuario con 25+ intenciones
 * Sistema mejorado con detección más precisa
 */
export class IntentDetector {
  
  detectIntent(userText) {
    logger.debug('Detectando intención', { userText });
    
    if (!userText || userText.trim().length === 0) {
      return {
        intent: INTENTS.UNKNOWN,
        confidence: 0,
        entities: {}
      };
    }
    
    const normalizedText = userText.toLowerCase().trim();
    
    // ============================================
    // ORDEN DE DETECCIÓN (de más específico a más general)
    // ============================================
    
    // 1. Control de flujo básico
    if (this.isSaludar(normalizedText)) {
      return { intent: INTENTS.SALUDAR, confidence: 0.95, entities: {} };
    }
    
    if (this.isDespedida(normalizedText)) {
      return { intent: INTENTS.DESPEDIDA, confidence: 0.95, entities: {} };
    }
    
    if (this.isConfirmar(normalizedText)) {
      return { intent: INTENTS.CONFIRMAR, confidence: 0.9, entities: {} };
    }
    
    if (this.isNegar(normalizedText)) {
      return { intent: INTENTS.NEGAR, confidence: 0.9, entities: {} };
    }
    
    if (this.isRepetir(normalizedText)) {
      return { intent: INTENTS.REPETIR, confidence: 0.9, entities: {} };
    }
    
    if (this.isAyuda(normalizedText)) {
      return { intent: INTENTS.AYUDA, confidence: 0.9, entities: {} };
    }
    
    // 2. Emergencias y situaciones críticas
    if (this.isEmergencia(normalizedText)) {
      return { intent: INTENTS.EMERGENCIA, confidence: 0.95, entities: {} };
    }
    
    if (this.isPrimerosAuxilios(normalizedText)) {
      return { intent: INTENTS.PRIMEROS_AUXILIOS, confidence: 0.9, entities: {} };
    }
    
    if (this.isObjetosPerdidos(normalizedText)) {
      return { intent: INTENTS.OBJETOS_PERDIDOS, confidence: 0.85, entities: {} };
    }
    
    // 3. Quejas y sugerencias
    if (this.isQuejas(normalizedText)) {
      return { intent: INTENTS.QUEJAS, confidence: 0.85, entities: {} };
    }
    
    if (this.isSugerencias(normalizedText)) {
      return { intent: INTENTS.SUGERENCIAS, confidence: 0.85, entities: {} };
    }
    
    // 4. Domicilios y transferencias (muy específico)
    if (this.isPedirDomicilio(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.PEDIR_DOMICILIO,
        confidence: 0.9,
        entities: store
      };
    }
    
    if (this.isTransferir(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.TRANSFERIR,
        confidence: 0.85,
        entities: store
      };
    }
    
    // 5. Número de teléfono (sin transferir)
    if (this.isNumeroTelefono(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.NUMERO_TELEFONO,
        confidence: 0.85,
        entities: store
      };
    }
    
    // 6. Servicios específicos del mall
    if (this.isParqueaderoCosto(normalizedText)) {
      return { intent: INTENTS.PARQUEADERO_COSTO, confidence: 0.9, entities: {} };
    }
    
    if (this.isParqueadero(normalizedText)) {
      return { intent: INTENTS.PARQUEADERO, confidence: 0.85, entities: {} };
    }
    
    if (this.isBanos(normalizedText)) {
      return { intent: INTENTS.BANOS, confidence: 0.9, entities: {} };
    }
    
    if (this.isCajero(normalizedText)) {
      return { intent: INTENTS.CAJERO, confidence: 0.9, entities: {} };
    }
    
    if (this.isWifi(normalizedText)) {
      return { intent: INTENTS.WIFI, confidence: 0.9, entities: {} };
    }
    
    if (this.isZonaJuegos(normalizedText)) {
      return { intent: INTENTS.ZONA_JUEGOS, confidence: 0.85, entities: {} };
    }
    
    if (this.isSalaLactancia(normalizedText)) {
      return { intent: INTENTS.SALA_LACTANCIA, confidence: 0.85, entities: {} };
    }
    
    if (this.isAccesibilidad(normalizedText)) {
      return { intent: INTENTS.ACCESIBILIDAD, confidence: 0.85, entities: {} };
    }
    
    if (this.isTarjetaRegalo(normalizedText)) {
      return { intent: INTENTS.TARJETA_REGALO, confidence: 0.85, entities: {} };
    }
    
    // 7. Cine (muy específico primero)
    if (this.isCinePrecios(normalizedText)) {
      return { intent: INTENTS.CINE_PRECIOS, confidence: 0.9, entities: {} };
    }
    
    if (this.isCineCartelera(normalizedText)) {
      return { intent: INTENTS.CINE_CARTELERA, confidence: 0.9, entities: {} };
    }
    
    if (this.isCineHorarios(normalizedText)) {
      return { intent: INTENTS.CINE_HORARIOS, confidence: 0.85, entities: {} };
    }
    
    if (this.isCine(normalizedText)) {
      return { intent: INTENTS.CINE, confidence: 0.8, entities: {} };
    }
    
    // 8. Información comercial
    if (this.isPromociones(normalizedText)) {
      return { intent: INTENTS.PROMOCIONES, confidence: 0.85, entities: {} };
    }
    
    if (this.isEventos(normalizedText)) {
      return { intent: INTENTS.EVENTOS, confidence: 0.85, entities: {} };
    }
    
    if (this.isOfertas(normalizedText)) {
      return { intent: INTENTS.OFERTAS, confidence: 0.85, entities: {} };
    }
    
    if (this.isDescuentos(normalizedText)) {
      return { intent: INTENTS.DESCUENTOS, confidence: 0.85, entities: {} };
    }
    
    // 9. Precios y menús
    if (this.isMenuRestaurante(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.MENU_RESTAURANTE,
        confidence: 0.85,
        entities: store
      };
    }
    
    if (this.isPreciosComida(normalizedText)) {
      return { intent: INTENTS.PRECIOS_COMIDA, confidence: 0.8, entities: {} };
    }
    
    // 10. Categorías de tiendas
    if (this.isRestaurantes(normalizedText)) {
      return { intent: INTENTS.RESTAURANTES, confidence: 0.85, entities: {} };
    }
    
    if (this.isTiendasRopa(normalizedText)) {
      return { intent: INTENTS.TIENDAS_ROPA, confidence: 0.85, entities: {} };
    }
    
    if (this.isTiendasDeportes(normalizedText)) {
      return { intent: INTENTS.TIENDAS_DEPORTES, confidence: 0.85, entities: {} };
    }
    
    if (this.isBancos(normalizedText)) {
      return { intent: INTENTS.BANCOS, confidence: 0.85, entities: {} };
    }
    
    if (this.isFarmacias(normalizedText)) {
      return { intent: INTENTS.FARMACIAS, confidence: 0.85, entities: {} };
    }
    
    if (this.isSupermercado(normalizedText)) {
      return { intent: INTENTS.SUPERMERCADO, confidence: 0.85, entities: {} };
    }
    
    // 11. Horarios (específico antes que general)
    if (this.isHorarioLocal(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.HORARIO_LOCAL,
        confidence: store.storeName ? 0.9 : 0.6,
        entities: store
      };
    }
    
    if (this.isHorarioMall(normalizedText)) {
      return { intent: INTENTS.HORARIO_MALL, confidence: 0.85, entities: {} };
    }
    
    if (this.isHorarios(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: store.storeName ? INTENTS.HORARIO_LOCAL : INTENTS.HORARIO_MALL,
        confidence: 0.8,
        entities: store
      };
    }
    
    // 12. Ubicación y direcciones
    if (this.isComoLlegar(normalizedText)) {
      return { intent: INTENTS.COMO_LLEGAR, confidence: 0.85, entities: {} };
    }
    
    if (this.isUbicacionMall(normalizedText)) {
      return { intent: INTENTS.UBICACION_MALL, confidence: 0.85, entities: {} };
    }
    
    if (this.isUbicacion(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: store.storeName ? INTENTS.UBICACION : INTENTS.UBICACION_MALL,
        confidence: 0.8,
        entities: store
      };
    }
    
    // 13. Búsqueda de local (más general)
    if (this.isBuscarLocal(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: store.storeName ? 0.9 : 0.6,
        entities: store
      };
    }
    
    // 14. Intento de búsqueda por nombre de tienda
    const store = this.extractStore(normalizedText);
    if (store.storeName) {
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: 0.7,
        entities: store
      };
    }
    
    // 15. No entendió
    return {
      intent: INTENTS.UNKNOWN,
      confidence: 0.3,
      entities: {}
    };
  }
  
  // ============================================
  // MÉTODOS DE DETECCIÓN
  // ============================================
  
  isSaludar(text) {
    const keywords = [
      'hola', 'buenos días', 'buenas tardes', 'buenas noches',
      'buen día', 'buena tarde', 'buena noche', 'hey', 'alo', 'aló'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isDespedida(text) {
    const keywords = [
      'adios', 'adiós', 'chao', 'hasta luego', 'gracias', 'bye',
      'nos vemos', 'hasta pronto', 'me voy', 'ya', 'listo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isConfirmar(text) {
    const keywords = [
      'sí', 'si', 'claro', 'por supuesto', 'ok', 'okay',
      'vale', 'bueno', 'dale', 'listo', 'correcto', 'exacto'
    ];
    // Debe ser respuesta corta
    return text.split(' ').length <= 3 && keywords.some(kw => text.includes(kw));
  }
  
  isNegar(text) {
    const keywords = [
      'no', 'nada', 'nop', 'negativo', 'para nada',
      'no gracias', 'eso es todo', 'ya no', 'suficiente'
    ];
    return text.split(' ').length <= 4 && keywords.some(kw => text.includes(kw));
  }
  
  isRepetir(text) {
    const keywords = [
      'repite', 'repita', 'otra vez', 'de nuevo', 'cómo', 'como',
      'qué dijiste', 'que dijiste', 'no escuché', 'no escuche'
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
      'llamar policía', 'llamar policia', 'me robaron', 'accidente'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPrimerosAuxilios(text) {
    const keywords = [
      'primeros auxilios', 'enfermera', 'doctor', 'me siento mal',
      'me duele', 'médico', 'medico', 'atención médica', 'atencion medica'
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
      'inconveniente', 'mal servicio', 'molesto', 'insatisfecho'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSugerencias(text) {
    const keywords = [
      'sugerencia', 'sugerir', 'recomendación', 'recomendacion',
      'propuesta', 'idea', 'deberían', 'deberian', 'podrían', 'podrian'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPedirDomicilio(text) {
    const keywords = [
      'pedir domicilio', 'hacer pedido', 'ordenar comida', 'quiero pedir',
      'delivery', 'envío a domicilio', 'envio a domicilio', 'domicilio de'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTransferir(text) {
    const keywords = [
      'transferir', 'comunicar', 'hablar con', 'contactar', 'llamar a',
      'conectar con', 'pasar con', 'me comunicas', 'quiero hablar'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isNumeroTelefono(text) {
    const keywords = [
      'número', 'numero', 'teléfono', 'telefono', 'celular', 'contacto',
      'cuál es el número', 'cual es el numero', 'dame el número', 'dame el numero'
    ];
    // Debe tener "número" o "teléfono" pero NO "transferir" o "llamar"
    return keywords.some(kw => text.includes(kw)) &&
           !text.includes('transferir') && !text.includes('comunicar') &&
           !text.includes('hablar con');
  }
  
  isParqueaderoCosto(text) {
    const keywords = [
      'cuánto cuesta parquear', 'cuanto cuesta parquear', 'precio parqueadero',
      'valor parqueadero', 'tarifa parqueadero', 'costo estacionamiento',
      'cobran por parquear', 'parqueo cuánto', 'parqueo cuanto'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isParqueadero(text) {
    const keywords = [
      'parqueadero', 'estacionamiento', 'parquear', 'parqueo',
      'donde parqueo', 'dónde parqueo', 'estacionar'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBanos(text) {
    const keywords = [
      'baño', 'baños', 'sanitario', 'sanitarios', 'servicio',
      'dónde están los baños', 'donde estan los baños'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCajero(text) {
    const keywords = [
      'cajero', 'cajero automático', 'cajero automatico', 'atm',
      'retirar plata', 'sacar plata', 'retirar dinero'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isWifi(text) {
    const keywords = [
      'wifi', 'wi-fi', 'internet', 'conexión', 'conexion',
      'red wifi', 'contraseña wifi', 'contraseña wifi', 'clave wifi'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isZonaJuegos(text) {
    const keywords = [
      'zona de juegos', 'juegos para niños', 'juegos niños',
      'área infantil', 'area infantil', 'parque infantil', 'juegos'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSalaLactancia(text) {
    const keywords = [
      'sala de lactancia', 'lactancia', 'amamantar', 'dar pecho',
      'sala para madres', 'espacio madres'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isAccesibilidad(text) {
    const keywords = [
      'accesibilidad', 'discapacitados', 'silla de ruedas',
      'rampa', 'ascensor', 'elevador', 'acceso discapacitados'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTarjetaRegalo(text) {
    const keywords = [
      'tarjeta regalo', 'gift card', 'tarjeta de regalo',
      'bono regalo', 'cupón regalo', 'cupon regalo'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCinePrecios(text) {
    const keywords = [
      'precio cine', 'cuánto cuesta cine', 'cuanto cuesta cine',
      'valor boleta', 'precio boleta', 'tarifa cine', 'boletas cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineCartelera(text) {
    const keywords = [
      'cartelera', 'qué películas', 'que peliculas', 'películas',
      'peliculas', 'qué dan', 'que dan', 'qué hay en cine', 'que hay en cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCineHorarios(text) {
    const keywords = [
      'horario cine', 'horarios cine', 'funciones cine',
      'a qué hora cine', 'a que hora cine'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isCine(text) {
    const keywords = ['cine', 'cinemark', 'película', 'pelicula', 'movie'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPromociones(text) {
    const keywords = [
      'promociones', 'promoción', 'promocion', 'promos',
      'qué promociones', 'que promociones'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isEventos(text) {
    const keywords = [
      'eventos', 'evento', 'actividades', 'qué eventos',
      'que eventos', 'hay eventos'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isOfertas(text) {
    const keywords = ['ofertas', 'oferta', 'en oferta', 'qué ofertas', 'que ofertas'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isDescuentos(text) {
    const keywords = [
      'descuentos', 'descuento', 'rebaja', 'rebajas',
      'hay descuento', 'tienen descuento'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isMenuRestaurante(text) {
    const keywords = [
      'menú', 'menu', 'carta', 'qué venden', 'que venden',
      'qué tienen', 'que tienen', 'platos', 'comidas'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isPreciosComida(text) {
    const keywords = [
      'precio comida', 'cuánto cuesta comer', 'cuanto cuesta comer',
      'precios restaurante', 'cuánto vale', 'cuanto vale'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           (text.includes('comida') || text.includes('comer') || text.includes('restaurante'));
  }
  
  isRestaurantes(text) {
    const keywords = [
      'restaurantes', 'restaurante', 'dónde comer', 'donde comer',
      'comer', 'comida', 'food', 'almorzar', 'cenar'
    ];
    return keywords.some(kw => text.includes(kw)) && 
           (text.includes('hay') || text.includes('tienen') || text.includes('lista') || 
            text.includes('cuáles') || text.includes('cuales') || text.includes('qué') || 
            text.includes('que'));
  }
  
  isTiendasRopa(text) {
    const keywords = [
      'tiendas de ropa', 'ropa', 'vestir', 'vestidos', 'camisas',
      'pantalones', 'moda', 'fashion', 'clothing'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('tienen') || text.includes('lista') ||
            text.includes('cuáles') || text.includes('cuales'));
  }
  
  isTiendasDeportes(text) {
    const keywords = [
      'deportiva', 'deportivas', 'deportes', 'tenis', 'zapatos deportivos',
      'ropa deportiva', 'gym', 'fitness', 'running'
    ];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('tienda') || text.includes('hay') || text.includes('dónde') || 
            text.includes('donde'));
  }
  
  isBancos(text) {
    const keywords = ['banco', 'bancos', 'bancolombia', 'davivienda'];
    return keywords.some(kw => text.includes(kw)) &&
           (text.includes('hay') || text.includes('dónde') || text.includes('donde') ||
            text.includes('tienen'));
  }
  
  isFarmacias(text) {
    const keywords = [
      'farmacia', 'farmacias', 'droguería', 'drogueria', 'drogas',
      'medicamentos', 'rebaja'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isSupermercado(text) {
    const keywords = [
      'supermercado', 'mercado', 'éxito', 'exito', 'carulla',
      'comprar víveres', 'comprar viveres'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isHorarioLocal(text) {
    const keywords = ['horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado'];
    // Debe tener keyword de horario Y nombre de tienda
    const hasHorarioKeyword = keywords.some(kw => text.includes(kw));
    const store = this.extractStore(text);
    return hasHorarioKeyword && store.storeName;
  }
  
  isHorarioMall(text) {
    const keywords = [
      'horario centro comercial', 'horario mall', 'horario puente',
      'a qué hora abren', 'a que hora abren', 'a qué hora cierran',
      'a que hora cierran', 'están abiertos', 'estan abiertos'
    ];
    return keywords.some(kw => text.includes(kw)) ||
           (text.includes('horario') && !this.extractStore(text).storeName);
  }
  
  isHorarios(text) {
    const keywords = ['horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado', 'cuando abre'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isComoLlegar(text) {
    const keywords = [
      'cómo llego', 'como llego', 'cómo llegar', 'como llegar',
      'direcciones', 'indicaciones', 'transporte', 'bus', 'taxi',
      'desde el terminal', 'venir desde'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacionMall(text) {
    const keywords = [
      'dónde queda el centro', 'donde queda el centro',
      'dirección centro comercial', 'direccion centro comercial',
      'ubicación centro', 'ubicacion centro', 'dónde está el mall',
      'donde esta el mall'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacion(text) {
    const keywords = [
      'dónde está', 'donde esta', 'dónde queda', 'donde queda',
      'ubicación', 'ubicacion', 'piso', 'local'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBuscarLocal(text) {
    const keywords = [
      'busco', 'buscando', 'encontrar', 'hay', 'tienen',
      'existe', 'me gustaría ir', 'me gustaria ir'
    ];
    return keywords.some(kw => text.includes(kw));
  }
  
  // ============================================
  // EXTRACCIÓN DE ENTIDADES
  // ============================================
  
  extractStore(text) {
    const normalizedText = text.toLowerCase();
    
    // Buscar coincidencias con nombres y keywords de locales
    for (const store of stores) {
      // Buscar nombre exacto (incluyendo variaciones)
      const nameVariations = [
        store.name.toLowerCase(),
        store.name.toLowerCase().replace(/&/g, 'y'),
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
      
      // Buscar keywords
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
}