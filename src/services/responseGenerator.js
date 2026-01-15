// src/services/ResponseGenerator.js

import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { responseTemplates, getRandomResponse, fillTemplate } from '../data/responseTemplates.js';
import { logger } from '../utils/logger.js';

/**
 * ResponseGenerator - ULTRA OPTIMIZADO PARA MÁXIMO AHORRO
 * 
 * Mejoras críticas implementadas:
 * ✅ Respuestas ULTRA CORTAS (máximo 15 palabras)
 * ✅ Progresivas (pregunta qué aspecto específico)
 * ✅ Números hablados correctamente (agrupados)
 * ✅ Sin palabras de relleno
 * ✅ Más natural y humano
 * ✅ 100% independiente (sin estado compartido)
 * ✅ AHORRA TIEMPO = AHORRA DINERO
 * 
 * Cada instancia es INDEPENDIENTE para permitir 100 llamadas simultáneas
 */
export class ResponseGenerator {
  
  constructor() {
    // Sin estado compartido - cada instancia es independiente
    this.lastResponses = [];
    this.maxWordsPerResponse = 15;
    this.costPerSecond = 0.4; // Palabras por segundo
  }
  
  generateResponse(intent, entities = {}, context = {}) {
    logger.debug('Generando respuesta', { intent, entities });
    
    // Generar respuesta base
    let response = this._generateBaseResponse(intent, entities, context);
    
    // Optimizar respuesta (acortar al máximo)
    response = this._optimizeResponse(response, intent);
    
    // Agregar follow-up corto si aplica
    if (!this._isClosingIntent(intent) && typeof response === 'string') {
      response = this._addShortFollowUp(response);
    }
    
    return response;
  }
  
  /**
   * Genera respuesta base según intención
   */
  _generateBaseResponse(intent, entities, context) {
    switch (intent) {
      // ============================================
      // CONTROL DE FLUJO (ULTRA CORTO)
      // ============================================
      case INTENTS.SALUDAR:
        return this._pickRandom([
          'Centro Comercial Puente. ¿Qué necesitas?',
          'Hola. ¿En qué ayudo?',
          'Puente San Gil. ¿Te ayudo?'
        ]);
      
      case INTENTS.DESPEDIDA:
        return this._pickRandom(['¡Hasta pronto!', '¡Chao!', '¡Nos vemos!']);
      
      case INTENTS.CONFIRMAR:
        return this._pickRandom(['Perfecto', 'Listo', 'Ok', 'Dale']);
      
      case INTENTS.NEGAR:
        return 'Ok';
      
      case INTENTS.REPETIR:
        return context.lastResponse || 'No hay info previa';
      
      case INTENTS.AYUDA:
        return 'Pregunta sobre tiendas, horarios, servicios o eventos';
      
      // ============================================
      // EMERGENCIAS (ULTRA CORTO)
      // ============================================
      case INTENTS.EMERGENCIA:
        return 'Emergencia: primer piso, seguridad 24/7';
      
      case INTENTS.PRIMEROS_AUXILIOS:
        return 'Primeros auxilios: primer piso, zona servicios';
      
      case INTENTS.OBJETOS_PERDIDOS:
        return 'Objetos perdidos: punto información, primer piso';
      
      case INTENTS.QUEJAS:
      case INTENTS.SUGERENCIAS:
        return 'Administración: primer piso. Lun-vie 9AM-6PM';
      
      // ============================================
      // BÚSQUEDA Y UBICACIÓN (PROGRESIVO)
      // ============================================
      case INTENTS.BUSCAR_LOCAL:
        return this._responseBuscarLocal(entities);
      
      case INTENTS.UBICACION:
        return this._responseUbicacion(entities);
      
      case INTENTS.UBICACION_MALL:
        return 'Carrera 25 #45-10, San Gil. Dos cuadras del parque';
      
      case INTENTS.COMO_LLEGAR:
        return 'Terminal: 5 min taxi. Rutas 1,3,5,7';
      
      // ============================================
      // HORARIOS (ULTRA CORTO)
      // ============================================
      case INTENTS.HORARIO_MALL:
        return 'Lun-sáb 10AM-9PM. Dom 11AM-8PM';
      
      case INTENTS.HORARIO_LOCAL:
        return this._responseHorarioLocal(entities);
      
      case INTENTS.HORARIOS:
        return entities.storeName ? 
               this._responseHorarioLocal(entities) : 
               'Lun-sáb 10AM-9PM. Dom 11AM-8PM';
      
      // ============================================
      // CONTACTO (PROGRESIVO)
      // ============================================
      case INTENTS.NUMERO_TELEFONO:
        return this._responseNumeroTelefono(entities);
      
      case INTENTS.TRANSFERIR:
        return this._responseTransferir(entities);
      
      case INTENTS.PEDIR_DOMICILIO:
        return this._responsePedirDomicilio(entities);
      
      // ============================================
      // SERVICIOS DEL MALL (ULTRA CORTO)
      // ============================================
      case INTENTS.PARQUEADERO:
        return 'Sótanos 1 y 2. Primera hora gratis';
      
      case INTENTS.PARQUEADERO_COSTO:
        return 'Primera hora gratis. Luego 2 mil/hora';
      
      case INTENTS.BANOS:
        return 'Primer piso cerca Éxito. Segundo piso restaurantes';
      
      case INTENTS.CAJERO:
        return 'Primer piso: Bancolombia, Davivienda, BBVA. 24h';
      
      case INTENTS.WIFI:
        return 'Red: PUENTE_FREE_WIFI. Sin clave';
      
      case INTENTS.ZONA_JUEGOS:
        return 'Segundo piso, zona central. Gratis 11AM-8PM';
      
      case INTENTS.SALA_LACTANCIA:
        return 'Primer piso, punto información. Privado';
      
      case INTENTS.ACCESIBILIDAD:
        return 'Rampas, ascensores, baños adaptados. Todo accesible';
      
      case INTENTS.TARJETA_REGALO:
        return 'Punto información. Desde 20 mil. Sin vencimiento';
      
      case 'administracion':
        return 'Primer piso, entrada principal. Lun-vie 9AM-6PM';
      
      // ============================================
      // CATEGORÍAS (PROGRESIVO - LISTA Y PREGUNTA)
      // ============================================
      case INTENTS.RESTAURANTES:
        return 'Crepes & Waffles, Subway, La Toscana. ¿Cuál?';
      
      case INTENTS.TIENDAS_ROPA:
        return 'Nike, Adidas, Zara, H&M. ¿Cuál buscas?';
      
      case INTENTS.TIENDAS_DEPORTES:
        return 'Nike y Adidas. Segundo piso, zona norte';
      
      case INTENTS.BANCOS:
        return 'Bancolombia y Davivienda. Primer piso';
      
      case INTENTS.FARMACIAS:
        return 'Drogas La Rebaja. Primer piso, local 108';
      
      case INTENTS.SUPERMERCADO:
        return 'Éxito Express. Primer piso, local 120';
      
      // ============================================
      // CINE (ULTRA CORTO)
      // ============================================
      case INTENTS.CINE:
        return 'Cinemark, tercer piso. 8 salas 2D, 3D, XD';
      
      case INTENTS.CINE_CARTELERA:
        return '4 películas: acción, animación, drama, comedia';
      
      case INTENTS.CINE_HORARIOS:
        return '11AM primera. 10PM última. Tel: 607-724-6666';
      
      case INTENTS.CINE_PRECIOS:
        return '2D: 12 mil entre semana. Miércoles: 10 mil';
      
      // ============================================
      // COMERCIAL (ULTRA CORTO)
      // ============================================
      case INTENTS.PROMOCIONES:
        return 'Tarjeta cliente, parqueo gratis >100mil, descuentos estudiantes';
      
      case INTENTS.EVENTOS:
        return 'Viernes: festival gastronómico 5PM. Sábados: música 4PM';
      
      case INTENTS.OFERTAS:
      case INTENTS.DESCUENTOS:
        return 'Estudiantes 10-15%. Adultos mayores 10%';
      
      case INTENTS.PRECIOS_COMIDA:
        return this._responsePreciosComida(entities);
      
      case INTENTS.MENU_RESTAURANTE:
        return this._responseMenuRestaurante(entities);
      
      // ============================================
      // DEFAULT
      // ============================================
      case INTENTS.UNKNOWN:
      default:
        return 'No entendí. ¿Repetís?';
    }
  }
  
  // ============================================
  // RESPUESTAS ESPECÍFICAS (ULTRA CORTAS Y PROGRESIVAS)
  // ============================================
  
  /**
   * Buscar local - PROGRESIVO
   * Solo da ubicación básica y pregunta qué más necesita
   */
  _responseBuscarLocal(entities) {
    if (!entities.storeName) {
      return '¿Qué tienda buscas?';
    }
    
    const s = entities.storeData;
    // Solo ubicación básica
    return `${s.name}: ${s.floor}, local ${s.local}`;
  }
  
  /**
   * Ubicación - PROGRESIVO
   */
  _responseUbicacion(entities) {
    if (!entities.storeName) {
      return 'Carrera 25 #45-10, San Gil';
    }
    
    const s = entities.storeData;
    return `${s.name}: ${s.floor}, local ${s.local}`;
  }
  
  /**
   * Horario local - PROGRESIVO
   */
  _responseHorarioLocal(entities) {
    if (!entities.storeName) {
      return '¿De qué local?';
    }
    
    const s = entities.storeData;
    const shortHours = this._shortenHours(s.hours);
    return `${s.name}: ${shortHours}`;
  }
  
  /**
   * Número teléfono - PROGRESIVO CON FORMATO CORRECTO
   */
  _responseNumeroTelefono(entities) {
    if (!entities.storeName) {
      return '¿De qué local?';
    }
    
    const s = entities.storeData;
    const phone = this._formatPhone(s.phone);
    return `${s.name}: ${phone}`;
  }
  
  /**
   * Transferir - ACCIÓN
   */
  _responseTransferir(entities) {
    if (!entities.storeName) {
      return '¿A qué tienda?';
    }
    
    const s = entities.storeData;
    
    return {
      message: `Te comunico con ${s.name}`,
      transferTo: s.phone,
      storeName: s.name,
      action: 'transfer'
    };
  }
  
  /**
   * Pedir domicilio - PROGRESIVO
   */
  _responsePedirDomicilio(entities) {
    if (!entities.storeName) {
      return 'Domicilio: Crepes, Subway, Toscana. ¿Cuál?';
    }
    
    const s = entities.storeData;
    
    if (s.category !== 'restaurante') {
      return `${s.name} no es restaurante`;
    }
    
    if (!s.delivery) {
      const phone = this._formatPhone(s.phone);
      return `${s.name} sin domicilio. Tel: ${phone}`;
    }
    
    return {
      message: `Te comunico con ${s.name}`,
      transferTo: s.phone,
      storeName: s.name,
      action: 'transfer'
    };
  }
  
  /**
   * Precios comida - PROGRESIVO
   */
  _responsePreciosComida(entities) {
    if (entities.storeName) {
      const s = entities.storeData;
      
      if (s.category !== 'restaurante') {
        return 'Crepes 35-50mil. Subway 15-25mil. Toscana 40-60mil';
      }
      
      return `${s.name}: ${s.averagePrice} pesos`;
    }
    
    return 'Subway 15-25mil. Crepes 35-50mil. Toscana 40-60mil';
  }
  
  /**
   * Menú restaurante - PROGRESIVO
   * Solo da 2 categorías con 2 platos cada una
   */
  _responseMenuRestaurante(entities) {
    if (!entities.storeName) {
      return '¿De qué restaurante?';
    }
    
    const s = entities.storeData;
    
    if (s.category !== 'restaurante') {
      return `${s.name} no es restaurante`;
    }
    
    if (!s.menu) {
      const phone = this._formatPhone(s.phone);
      return `Menú completo: ${phone}`;
    }
    
    // Solo 1-2 categorías con 2 items cada una
    const categories = Object.keys(s.menu).slice(0, 2);
    const items = categories.map(cat => {
      const dishes = s.menu[cat].slice(0, 2).join(', ');
      return dishes;
    }).join('. ');
    
    return `${s.name}: ${items}`;
  }
  
  // ============================================
  // UTILIDADES DE OPTIMIZACIÓN
  // ============================================
  
  /**
   * Optimiza respuesta para máximo ahorro
   */
  _optimizeResponse(response, intent) {
    if (typeof response === 'object') {
      return response;
    }
    
    // Eliminar relleno
    response = response
      .replace(/con gusto/gi, '')
      .replace(/por supuesto/gi, '')
      .replace(/claro que sí/gi, '')
      .replace(/te informo que/gi, '')
      .replace(/quiero decirte/gi, '')
      .replace(/es importante/gi, '')
      .trim();
    
    // Acortar tiempos
    response = response
      .replace(/de la mañana/gi, 'AM')
      .replace(/de la tarde/gi, 'PM')
      .replace(/de la noche/gi, 'PM')
      .replace(/del mediodía/gi, 'PM');
    
    // Acortar días
    response = response
      .replace(/lunes a sábado/gi, 'lun-sáb')
      .replace(/lunes a viernes/gi, 'lun-vie')
      .replace(/domingo/gi, 'dom')
      .replace(/sábado/gi, 'sáb');
    
    // Remover espacios extras
    response = response.replace(/\s+/g, ' ').trim();
    
    // Limitar palabras
    const words = response.split(' ');
    if (words.length > this.maxWordsPerResponse && !response.includes('?')) {
      response = words.slice(0, this.maxWordsPerResponse).join(' ');
    }
    
    return response;
  }
  
  /**
   * Agrega follow-up ultra corto
   */
  _addShortFollowUp(response) {
    if (response.endsWith('?')) {
      return response;
    }
    
    const followUps = ['¿Algo más?', '¿Listo?', '¿Te sirve?'];
    return `${response}. ${this._pickRandom(followUps)}`;
  }
  
  /**
   * Verifica si es intención de cierre
   */
  _isClosingIntent(intent) {
    return [
      INTENTS.DESPEDIDA,
      INTENTS.NEGAR,
      INTENTS.EMERGENCIA,
      INTENTS.PRIMEROS_AUXILIOS
    ].includes(intent);
  }
  
  /**
   * Acorta horarios al máximo
   */
  _shortenHours(hours) {
    return hours
      .replace(/de la mañana/gi, 'AM')
      .replace(/de la tarde/gi, 'PM')
      .replace(/de la noche/gi, 'PM')
      .replace(/lunes a sábado/gi, 'lun-sáb')
      .replace(/lunes a viernes/gi, 'lun-vie')
      .replace(/domingo/gi, 'dom')
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  /**
   * Formatea teléfono para TTS CORRECTAMENTE
   * "607-724-1234" → "seis cero siete, siete dos cuatro, uno dos tres cuatro"
   */
  _formatPhone(phone) {
    const digits = {
      '0': 'cero', '1': 'uno', '2': 'dos', '3': 'tres',
      '4': 'cuatro', '5': 'cinco', '6': 'seis', '7': 'siete',
      '8': 'ocho', '9': 'nueve'
    };
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      // Colombia: 607 724 1234
      const parts = [
        cleaned.slice(0, 3),
        cleaned.slice(3, 6),
        cleaned.slice(6)
      ];
      
      return parts.map(part => 
        part.split('').map(d => digits[d]).join(' ')
      ).join(', ');
    }
    
    // Fallback
    return cleaned.split('').map(d => digits[d]).join(' ');
  }
  
  /**
   * Elige random
   */
  _pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * Respuesta variada de templates
   */
  getVariedResponse(templateKey) {
    const templates = responseTemplates[templateKey];
    
    if (!templates || templates.length === 0) {
      return 'Info no disponible';
    }
    
    if (templates.length === 1) {
      return templates[0];
    }
    
    const available = templates.filter(
      t => !this.lastResponses.includes(t)
    );
    
    const options = available.length > 0 ? available : templates;
    const selected = this._pickRandom(options);
    
    this.lastResponses.push(selected);
    if (this.lastResponses.length > 5) {
      this.lastResponses.shift();
    }
    
    return selected;
  }
  
  /**
   * Calcula tiempo de respuesta en segundos
   */
  estimateSpeechTime(text) {
    if (typeof text === 'object') {
      text = text.message || '';
    }
    const words = text.split(' ').length;
    return Math.ceil(words / this.costPerSecond);
  }
  
  /**
   * Calcula costo en COP
   */
  estimateCost(text) {
    const seconds = this.estimateSpeechTime(text);
    const minutes = seconds / 60;
    const costPerMinute = 180;
    return Math.ceil(minutes * costPerMinute);
  }
}