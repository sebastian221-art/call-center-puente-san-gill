// src/services/ResponseGenerator.js

import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { responseTemplates, getRandomResponse, fillTemplate } from '../data/responseTemplates.js';
import { logger } from '../utils/logger.js';

/**
 * ResponseGenerator V4 - INTELIGENCIA CONTEXTUAL
 * 
 * Filosofía:
 * ✅ Responde lo que preguntan + ANTICIPA siguiente necesidad lógica
 * ✅ Ofrece ayuda relevante según contexto
 * ✅ Detecta intención real del usuario
 * 
 * Lógica Inteligente:
 * - Pregunta ubicación → Ofrece teléfono/transferir
 * - Pregunta teléfono → Ofrece transferir directamente
 * - Pregunta horario → Ofrece ubicación si es para ir físicamente
 * - Busca restaurante → Probablemente quiere pedir domicilio
 * - Busca tienda → Probablemente quiere ir o hablar
 */
export class ResponseGenerator {
  
  constructor() {
    this.lastResponses = [];
    this.conversationContext = {
      hasGreeted: false,
      questionsAsked: 0,
      lastIntent: null,
      currentStore: null,
      userGoal: null // 'visit', 'call', 'order', 'info'
    };
  }
  
  generateResponse(intent, entities = {}, context = {}) {
    logger.debug('Generando respuesta', { intent, entities });
    
    // Actualizar contexto y detectar objetivo del usuario
    this.conversationContext.lastIntent = intent;
    this.conversationContext.questionsAsked++;
    if (entities.storeName) {
      this.conversationContext.currentStore = entities.storeName;
    }
    
    // Detectar qué quiere hacer el usuario
    this._detectUserGoal(intent, entities);
    
    // Generar respuesta base
    let response = this._generateBaseResponse(intent, entities, context);
    
    // Agregar oferta inteligente según contexto
    response = this._addSmartOffer(response, intent, entities);
    
    return response;
  }
  
  /**
   * Detecta la intención real del usuario basado en el contexto
   */
  _detectUserGoal(intent, entities) {
    const s = entities.storeData;
    
    // Si pregunta por restaurante → probablemente quiere pedir
    if (s && s.category === 'restaurante') {
      if ([INTENTS.BUSCAR_LOCAL, INTENTS.UBICACION, INTENTS.NUMERO_TELEFONO].includes(intent)) {
        this.conversationContext.userGoal = 'order';
        return;
      }
    }
    
    // Si pregunta teléfono → quiere llamar
    if (intent === INTENTS.NUMERO_TELEFONO) {
      this.conversationContext.userGoal = 'call';
      return;
    }
    
    // Si pregunta ubicación → quiere visitar
    if ([INTENTS.UBICACION, INTENTS.BUSCAR_LOCAL].includes(intent)) {
      this.conversationContext.userGoal = 'visit';
      return;
    }
    
    // Si pregunta horario → quiere verificar antes de ir
    if ([INTENTS.HORARIO_LOCAL, INTENTS.HORARIOS].includes(intent) && entities.storeName) {
      this.conversationContext.userGoal = 'visit';
      return;
    }
    
    this.conversationContext.userGoal = 'info';
  }
  
  /**
   * Agrega oferta inteligente según contexto
   */
  _addSmartOffer(response, intent, entities) {
    if (typeof response === 'object') {
      return response; // Ya es una acción (transferir)
    }
    
    const s = entities.storeData;
    const goal = this.conversationContext.userGoal;
    
    // NO agregar ofertas en:
    if (this._shouldNotOffer(intent, response)) {
      return response;
    }
    
    // ============================================
    // OFERTAS INTELIGENTES SEGÚN CONTEXTO
    // ============================================
    
    // 1. RESTAURANTES - Ofrecer domicilio o transferir
    if (s && s.category === 'restaurante') {
      if (intent === INTENTS.BUSCAR_LOCAL || intent === INTENTS.UBICACION) {
        if (s.delivery) {
          return response + ' ¿Quieres que te comunique para pedir domicilio?';
        } else {
          return response + ' ¿Te paso con ellos para que consultes?';
        }
      }
      
      if (intent === INTENTS.HORARIO_LOCAL) {
        return response + ' ¿Necesitas que te comunique con ellos?';
      }
      
      if (intent === INTENTS.NUMERO_TELEFONO) {
        return response + ' ¿Te comunico directamente?';
      }
    }
    
    // 2. TIENDAS (no restaurantes) - Ofrecer transferir o ubicación
    if (s && s.category !== 'restaurante' && s.category !== 'banco') {
      if (intent === INTENTS.BUSCAR_LOCAL) {
        return response + ' ¿Quieres el teléfono o que te comunique?';
      }
      
      if (intent === INTENTS.UBICACION) {
        return response + ' ¿Necesitas el horario o te comunico con ellos?';
      }
      
      if (intent === INTENTS.HORARIO_LOCAL) {
        return response + ' ¿Te ayudo con algo más del local?';
      }
      
      if (intent === INTENTS.NUMERO_TELEFONO) {
        return response + ' ¿Te transfiero directamente?';
      }
    }
    
    // 3. BANCOS - Solo info, no transferir
    if (s && s.category === 'banco') {
      if (intent === INTENTS.BUSCAR_LOCAL || intent === INTENTS.UBICACION) {
        return response + ' ¿Necesitas el horario de atención?';
      }
    }
    
    // 4. CATEGORÍAS (lista de tiendas) - Ofrecer detalles
    if ([INTENTS.RESTAURANTES, INTENTS.TIENDAS_ROPA, INTENTS.TIENDAS_DEPORTES].includes(intent)) {
      // Ya tienen pregunta incorporada, no agregar más
      return response;
    }
    
    // 5. SERVICIOS DEL MALL - Ocasionalmente ofrecer más ayuda
    if ([INTENTS.PARQUEADERO, INTENTS.WIFI, INTENTS.BANOS, INTENTS.CAJERO].includes(intent)) {
      if (Math.random() < 0.3) { // Solo 30% del tiempo
        return response + ' ¿Algo más en lo que te ayude?';
      }
      return response;
    }
    
    // 6. INFORMACIÓN GENERAL - No agregar nada
    if ([INTENTS.HORARIO_MALL, INTENTS.UBICACION_MALL, INTENTS.COMO_LLEGAR].includes(intent)) {
      return response;
    }
    
    // Default: ocasionalmente ofrecer ayuda general
    if (Math.random() < 0.25 && !response.includes('?')) {
      return response + ' ¿Algo más?';
    }
    
    return response;
  }
  
  /**
   * Determina si NO debe ofrecer ayuda adicional
   */
  _shouldNotOffer(intent, response) {
    // Ya tiene pregunta
    if (response.includes('?')) {
      return true;
    }
    
    // Es despedida o emergencia
    if ([INTENTS.DESPEDIDA, INTENTS.EMERGENCIA, INTENTS.PRIMEROS_AUXILIOS].includes(intent)) {
      return true;
    }
    
    // Es confirmación o negación
    if ([INTENTS.CONFIRMAR, INTENTS.NEGAR].includes(intent)) {
      return true;
    }
    
    // Respuesta muy corta (< 8 palabras)
    if (response.split(' ').length < 8) {
      return true;
    }
    
    return false;
  }
  
  _generateBaseResponse(intent, entities, context) {
    switch (intent) {
      
      // ============================================
      // SALUDOS - Cálido pero directo
      // ============================================
      case INTENTS.SALUDAR:
        if (!this.conversationContext.hasGreeted) {
          this.conversationContext.hasGreeted = true;
          return this._pickRandom([
            'Hola, bienvenido al Centro Comercial Puente. ¿En qué te puedo ayudar?',
            'Buen día, hablas con el Puente de San Gil. ¿Qué necesitas?',
            'Hola, soy el asistente del Centro Comercial Puente. ¿Qué buscas?'
          ]);
        }
        return '¿Qué más necesitas?';
      
      case INTENTS.DESPEDIDA:
        return this._pickRandom([
          'Perfecto. Que tengas un excelente día.',
          'Gracias por llamar. ¡Hasta pronto!',
          'Que tengas buen día. Te esperamos en el Puente.'
        ]);
      
      case INTENTS.CONFIRMAR:
        return this._pickRandom([
          'Perfecto. ¿Algo más?',
          'Listo. ¿Qué más necesitas?',
          'Excelente. ¿Te ayudo con otra cosa?'
        ]);
      
      case INTENTS.NEGAR:
        return this._pickRandom([
          'Ok, perfecto.',
          'Entendido. Cualquier cosa me avisas.',
          'Dale, estoy aquí si necesitas algo más.'
        ]);
      
      case INTENTS.REPETIR:
        return context.lastResponse ? 
               `Claro: ${context.lastResponse}` : 
               'Perdón, ¿qué necesitas? No tengo la info anterior.';
      
      case INTENTS.AYUDA:
        return 'Te ayudo con ubicación de tiendas, horarios, servicios del centro comercial, o te comunico con algún local. ¿Qué necesitas?';
      
      // ============================================
      // EMERGENCIAS - Directo y útil
      // ============================================
      case INTENTS.EMERGENCIA:
        return 'Ve al punto de seguridad en primer piso. Disponible 24/7.';
      
      case INTENTS.PRIMEROS_AUXILIOS:
        return 'Primeros auxilios en primer piso, zona de servicios. Enfermera de 10 AM a 9 PM.';
      
      case INTENTS.OBJETOS_PERDIDOS:
        return 'Punto de información, primer piso. Abierto de 10 AM a 8 PM.';
      
      case INTENTS.QUEJAS:
      case INTENTS.SUGERENCIAS:
        return 'Administración, primer piso. Lunes a viernes de 9 AM a 6 PM. O escribe a info@puentedesangil.com';
      
      // ============================================
      // UBICACIÓN - Solo ubicación base
      // ============================================
      case INTENTS.BUSCAR_LOCAL:
        if (!entities.storeName) {
          return '¿Qué tienda o restaurante buscas?';
        }
        const s1 = entities.storeData;
        return `${s1.name} está en ${s1.floor}, ${s1.zone}, local ${s1.local}.`;
      
      case INTENTS.UBICACION:
        if (!entities.storeName) {
          return 'Carrera 25 número 45-10, San Gil. Dos cuadras del parque principal.';
        }
        const s2 = entities.storeData;
        return `${s2.name} está en ${s2.floor}, ${s2.zone}, local ${s2.local}.`;
      
      case INTENTS.UBICACION_MALL:
        return 'Carrera 25 número 45-10, San Gil. A dos cuadras del parque principal.';
      
      case INTENTS.COMO_LLEGAR:
        return 'Desde el terminal: 5 minutos en taxi, unos 5 mil pesos. O toma rutas de bus 1, 3, 5 o 7.';
      
      // ============================================
      // HORARIOS - Solo horarios
      // ============================================
      case INTENTS.HORARIO_MALL:
        return 'Lunes a sábado de 10 AM a 9 PM. Domingos de 11 AM a 8 PM.';
      
      case INTENTS.HORARIO_LOCAL:
        if (!entities.storeName) {
          return '¿De qué local necesitas el horario?';
        }
        const s3 = entities.storeData;
        return `${s3.name} abre ${s3.hours}.`;
      
      case INTENTS.HORARIOS:
        if (entities.storeName) {
          const s = entities.storeData;
          return `${s.name} abre ${s.hours}.`;
        }
        return 'El mall abre lunes a sábado de 10 AM a 9 PM, domingos de 11 a 8.';
      
      // ============================================
      // TELÉFONO - Solo teléfono
      // ============================================
      case INTENTS.NUMERO_TELEFONO:
        if (!entities.storeName) {
          return '¿El teléfono de qué tienda necesitas?';
        }
        const s4 = entities.storeData;
        const phone = this._formatPhone(s4.phone);
        return `${s4.name}: ${phone}`;
      
      // ============================================
      // TRANSFERIR - Acción directa
      // ============================================
      case INTENTS.TRANSFERIR:
        if (!entities.storeName) {
          return '¿Con qué tienda te comunico?';
        }
        const s5 = entities.storeData;
        return {
          message: `Te comunico con ${s5.name}. Un momento.`,
          transferTo: s5.phone,
          storeName: s5.name,
          action: 'transfer'
        };
      
      // ============================================
      // DOMICILIO - Progresivo
      // ============================================
      case INTENTS.PEDIR_DOMICILIO:
        if (!entities.storeName) {
          return '¿De qué restaurante? Tenemos Crepes & Waffles, Subway y La Toscana.';
        }
        const s6 = entities.storeData;
        
        if (s6.category !== 'restaurante') {
          return `${s6.name} no es restaurante. Los que tienen domicilio son Crepes, Subway y Toscana.`;
        }
        
        if (!s6.delivery) {
          return `${s6.name} no hace domicilios. Llámales al ${this._formatPhone(s6.phone)} para confirmar.`;
        }
        
        return {
          message: `Te comunico con ${s6.name} para tu pedido. Un momento.`,
          transferTo: s6.phone,
          storeName: s6.name,
          action: 'transfer'
        };
      
      // ============================================
      // SERVICIOS - Concisos
      // ============================================
      case INTENTS.PARQUEADERO:
        return 'Sótanos 1 y 2, abierto 24 horas. Primera hora gratis, luego 2 mil por hora.';
      
      case INTENTS.PARQUEADERO_COSTO:
        return 'Primera hora gratis. Luego 2 mil pesos por hora. Si compras más de 100 mil, gratis.';
      
      case INTENTS.BANOS:
        return 'Primer piso cerca de Éxito, segundo piso en restaurantes, tercer piso junto al cine.';
      
      case INTENTS.CAJERO:
        return 'Primer piso, zona de servicios. Bancolombia, Davivienda, BBVA y Bogotá. 24 horas.';
      
      case INTENTS.WIFI:
        return 'Sí. Red: PUENTE_FREE_WIFI. Sin contraseña.';
      
      case INTENTS.ZONA_JUEGOS:
        return 'Segundo piso, zona central. Para niños de 2 a 12 años. Gratis, abierta de 11 AM a 8 PM.';
      
      case INTENTS.SALA_LACTANCIA:
        return 'Primer piso junto a información. Tiene sillas, cambiador y microondas. Privada.';
      
      case INTENTS.ACCESIBILIDAD:
        return 'Todo accesible: rampas, ascensores, baños adaptados y parqueo preferencial.';
      
      case INTENTS.TARJETA_REGALO:
        return 'Punto de información, primer piso. Desde 20 mil pesos. Sin vencimiento.';
      
      case 'administracion':
        return 'Primer piso, entrada principal. Lunes a viernes de 9 AM a 6 PM.';
      
      // ============================================
      // CATEGORÍAS - Lista simple + pregunta
      // ============================================
      case INTENTS.RESTAURANTES:
        return 'Tenemos Crepes & Waffles, Subway y La Toscana. ¿Cuál te interesa?';
      
      case INTENTS.TIENDAS_ROPA:
        return 'Nike, Adidas, Zara y H&M. ¿Cuál buscas?';
      
      case INTENTS.TIENDAS_DEPORTES:
        return 'Nike y Adidas. Segundo piso, zona norte. ¿Ubicación exacta de cuál?';
      
      case INTENTS.BANCOS:
        return 'Bancolombia y Davivienda. Primer piso. Lunes a viernes de 8 a 5, sábados de 9 a 12.';
      
      case INTENTS.FARMACIAS:
        return 'Drogas La Rebaja, primer piso local 108. Lunes a sábado 8 AM a 8 PM, domingos 9 a 6.';
      
      case INTENTS.SUPERMERCADO:
        return 'Éxito Express, primer piso local 120. Lunes a sábado 8 AM a 9 PM, domingos 9 a 8.';
      
      // ============================================
      // CINE - Específico según pregunta
      // ============================================
      case INTENTS.CINE:
        return 'Cinemark, tercer piso. 8 salas con 2D, 3D y XD. Abierto de 11 AM a 11 PM.';
      
      case INTENTS.CINE_CARTELERA:
        return '4 películas: acción, animación infantil, drama y comedia. Detalles al 607 724 6666.';
      
      case INTENTS.CINE_HORARIOS:
        return 'Funciones desde 11 AM, última a las 10 PM. Horarios exactos: 607 724 6666.';
      
      case INTENTS.CINE_PRECIOS:
        return '2D: 12 mil entre semana, 16 mil fines de semana. 3D: 18 y 22 mil. Miércoles: 10 mil.';
      
      // ============================================
      // COMERCIAL - Atractivo pero breve
      // ============================================
      case INTENTS.PROMOCIONES:
        return 'Tarjeta cliente frecuente, parqueo gratis en compras sobre 100 mil, descuentos para estudiantes 10-15%.';
      
      case INTENTS.EVENTOS:
        return 'Viernes: festival gastronómico 5-8 PM, degustaciones gratis. Sábados: música en vivo 4 PM, entrada libre.';
      
      case INTENTS.OFERTAS:
      case INTENTS.DESCUENTOS:
        return 'Estudiantes: 10-15% con carnet lunes a miércoles. Adultos mayores: 10% siempre. Temporadas: junio y diciembre.';
      
      // ============================================
      // PRECIOS Y MENÚ - Progresivo inteligente
      // ============================================
      case INTENTS.PRECIOS_COMIDA:
        return this._responsePreciosComida(entities);
      
      case INTENTS.MENU_RESTAURANTE:
        return this._responseMenuRestaurante(entities);
      
      // ============================================
      // NO ENTENDIÓ - Útil
      // ============================================
      case INTENTS.UNKNOWN:
      default:
        return this._pickRandom([
          'Perdón, no entendí. ¿Buscas una tienda, horarios, o algún servicio?',
          'No capté bien. ¿Información de qué necesitas?',
          '¿Podrías repetir? Te ayudo con ubicaciones, horarios o servicios.'
        ]);
    }
  }
  
  // ============================================
  // RESPUESTAS ESPECÍFICAS
  // ============================================
  
  _responsePreciosComida(entities) {
    if (entities.storeName) {
      const s = entities.storeData;
      
      if (s.category !== 'restaurante') {
        return 'Subway: 15-25 mil. Crepes: 35-50 mil. Toscana: 40-60 mil.';
      }
      
      return `${s.name}: entre ${s.averagePrice} pesos.`;
    }
    
    return 'Subway: 15-25 mil. Crepes: 35-50 mil. Toscana: 40-60 mil. ¿Cuál te interesa?';
  }
  
  _responseMenuRestaurante(entities) {
    if (!entities.storeName) {
      return '¿Menú de cuál? Crepes, Subway o Toscana?';
    }
    
    const s = entities.storeData;
    
    if (s.category !== 'restaurante') {
      return `${s.name} no es restaurante. Tenemos Crepes, Subway y Toscana.`;
    }
    
    if (!s.menu) {
      return `Para el menú completo de ${s.name} mejor llámalos al ${this._formatPhone(s.phone)}.`;
    }
    
    const cat1 = Object.keys(s.menu)[0];
    const cat2 = Object.keys(s.menu)[1];
    const items = [
      ...s.menu[cat1].slice(0, 2),
      ...s.menu[cat2].slice(0, 2)
    ].join(', ');
    
    return `${s.name} tiene ${items}, y más. ¿Te interesa el menú completo?`;
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  _formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  }
  
  _pickRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  getVariedResponse(templateKey) {
    const templates = responseTemplates[templateKey];
    if (!templates || templates.length === 0) {
      return 'No tengo esa información disponible.';
    }
    if (templates.length === 1) {
      return templates[0];
    }
    
    const available = templates.filter(t => !this.lastResponses.includes(t));
    const options = available.length > 0 ? available : templates;
    const selected = this._pickRandom(options);
    
    this.lastResponses.push(selected);
    if (this.lastResponses.length > 5) {
      this.lastResponses.shift();
    }
    
    return selected;
  }
  
  estimateSpeechTime(text) {
    if (typeof text === 'object') {
      text = text.message || '';
    }
    const words = text.split(' ').length;
    return Math.ceil(words / 2.5);
  }
  
  estimateCost(text) {
    const seconds = this.estimateSpeechTime(text);
    const minutes = seconds / 60;
    const costPerMinute = 180;
    return Math.ceil(minutes * costPerMinute);
  }
}