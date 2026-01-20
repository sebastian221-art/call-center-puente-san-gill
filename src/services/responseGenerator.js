// src/services/ResponseGenerator_V2.js

import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { logger } from '../utils/logger.js';

/**
 * ResponseGenerator V2 - PERSONALIDAD HUMANA + PREDICCIÓN
 * 
 * Características:
 * 🎭 Personalidad cálida y profesional
 * 🧠 Predice siguiente necesidad del usuario
 * 💬 Conversaciones fluidas y naturales
 * 🎯 Recomendaciones proactivas
 * ⚡ Respuestas contextuales según hora del día
 * 
 * Principios:
 * - "Habla como humano, no como robot"
 * - "Anticipa, no solo responde"
 * - "Sé útil sin ser invasivo"
 * - "Cortés pero eficiente"
 */
export class ResponseGenerator {
  
  constructor() {
    this.conversationMemory = {
      hasGreeted: false,
      questionsAsked: 0,
      lastIntent: null,
      currentStore: null,
      userGoal: null,
      timeOfDay: this._getTimeOfDay()
    };
  }
  
  /**
   * MÉTODO PRINCIPAL - Genera respuesta inteligente
   */
  generateResponse(intent, entities = {}, userState = {}, context = {}) {
    logger.debug('Generando respuesta inteligente', { intent, entities, userState });
    
    // Actualizar memoria conversacional
    this._updateMemory(intent, entities, userState);
    
    // Generar respuesta base
    let response = this._generateBaseResponse(intent, entities, userState, context);
    
    // Enriquecer con predicción inteligente
    response = this._enrichWithPrediction(response, intent, entities, userState);
    
    // Agregar toque humano según contexto
    response = this._addHumanTouch(response, intent, userState);
    
    return response;
  }
  
  // ============================================
  // ACTUALIZACIÓN DE MEMORIA
  // ============================================
  
  _updateMemory(intent, entities, userState) {
    this.conversationMemory.lastIntent = intent;
    this.conversationMemory.questionsAsked++;
    
    if (entities.storeName) {
      this.conversationMemory.currentStore = entities.storeName;
    }
    
    if (userState.userGoal) {
      this.conversationMemory.userGoal = userState.userGoal;
    }
  }
  
  // ============================================
  // GENERACIÓN DE RESPUESTAS BASE
  // ============================================
  
  _generateBaseResponse(intent, entities, userState, context) {
    const s = entities.storeData;
    const timeOfDay = this.conversationMemory.timeOfDay;
    
    switch (intent) {
      
      // ============================================
      // SALUDOS - Contextuales según hora
      // ============================================
      case INTENTS.SALUDAR:
        if (!this.conversationMemory.hasGreeted) {
          this.conversationMemory.hasGreeted = true;
          
          if (timeOfDay === 'morning') {
            return '¡Buenos días! Hablas con el Centro Comercial Puente de San Gil. ¿En qué te puedo ayudar?';
          } else if (timeOfDay === 'lunch') {
            return '¡Buenas! Hablas con el Puente de San Gil. ¿Qué necesitas?';
          } else if (timeOfDay === 'afternoon') {
            return 'Buenas tardes, soy el asistente del Centro Comercial Puente. ¿Cómo te ayudo?';
          } else if (timeOfDay === 'dinner') {
            return 'Buenas tardes, hablas con el Puente de San Gil. ¿Qué buscas?';
          } else {
            return 'Buenas noches, soy el asistente del Centro Comercial Puente. ¿En qué te ayudo?';
          }
        }
        return '¿Qué más necesitas?';
      
      case INTENTS.DESPEDIDA:
        return this._pickRandom([
          'Perfecto. Que tengas un excelente día, ¡te esperamos en el Puente!',
          'Con gusto. ¡Que estés muy bien!',
          'Listo, cualquier cosa vuelves a llamar. ¡Hasta pronto!',
          'Dale, que te vaya súper. ¡Nos vemos!'
        ]);
      
      case INTENTS.CONFIRMAR:
        return this._pickRandom([
          'Perfecto, entonces procedemos.',
          'Dale, hagámoslo.',
          'Listo, perfecto.',
          'Excelente, sigamos.'
        ]);
      
      case INTENTS.NEGAR:
        return this._pickRandom([
          'Ok, entendido. ¿Algo más en lo que te ayude?',
          'Dale, sin problema. ¿Qué más necesitas?',
          'Perfecto. ¿Te ayudo con otra cosa?'
        ]);
      
      case INTENTS.REPETIR:
        return context.lastResponse ? 
               `Claro, te repito: ${context.lastResponse}` : 
               'Perdón, ¿qué necesitas exactamente? Dime de nuevo para ayudarte bien.';
      
      case INTENTS.AYUDA:
        return 'Con gusto te ayudo. Puedo darte información de tiendas, restaurantes, horarios, servicios del centro, o comunicarte con algún local. ¿Qué necesitas?';
      
      // ============================================
      // NUEVAS INTENCIONES - NECESIDADES INMEDIATAS
      // ============================================
      case 'hambre':
        return this._responseHambre(entities);
      
      case 'cansado':
        return 'Entiendo. Tenemos varias opciones para sentarte y descansar. En segundo piso está la zona de restaurantes con sillas cómodas, o si prefieres algo más tranquilo, en primer piso hay bancas cerca del Éxito. ¿Prefieres comer algo o solo descansar?';
      
      case 'aburrido':
        if (timeOfDay === 'lunch' || timeOfDay === 'afternoon' || timeOfDay === 'dinner') {
          return 'Tenemos varias opciones para entretenerte: el cine Cinemark en tercer piso tiene 4 películas en cartelera, en segundo piso hay una zona de juegos si vienes con niños, o puedes pasear por las tiendas que tenemos ofertas interesantes. ¿Qué te llama más la atención?';
        }
        return 'Si buscas entretenimiento, te recomiendo el cine en tercer piso. También tenemos eventos los viernes y sábados. ¿Te interesa saber qué hay hoy?';
      
      // ============================================
      // EMERGENCIAS - Directas y claras
      // ============================================
      case INTENTS.EMERGENCIA:
        return 'Ok, escúchame bien: ve al punto de seguridad en primer piso, cerca de la entrada principal. Están disponibles 24/7. Si es muy urgente, también puedes pedir ayuda a cualquier tienda. ¿Necesitas que te comunique con seguridad directamente?';
      
      case INTENTS.PRIMEROS_AUXILIOS:
        return 'Perfecto, tenemos servicio de primeros auxilios en primer piso, zona de servicios, al lado del punto de información. La enfermera está de 10 de la mañana a 9 de la noche. ¿Necesitas que te comunique con ellos?';
      
      case INTENTS.OBJETOS_PERDIDOS:
        return 'Entiendo, qué lástima. Ve al punto de información en primer piso, ellos manejan objetos perdidos. Están abiertos de 10 de la mañana a 8 de la noche. Lleva tu cédula por si lo encuentran. ¿Necesitas algo más?';
      
      case INTENTS.QUEJAS:
        return 'Lamento mucho que hayas tenido una mala experiencia. Puedes ir a administración en primer piso, están de lunes a viernes de 9 a 6. O si prefieres, escribe a info@puentedesangil.com y te responden en menos de 24 horas. ¿Quieres que te pase con administración ahora mismo?';
      
      case INTENTS.SUGERENCIAS:
        return 'Qué bien que quieras compartir tus ideas, nos encanta escuchar a nuestros visitantes. Puedes ir a administración en primer piso (lunes a viernes de 9 a 6), o escribir a info@puentedesangil.com. Tu opinión es muy valiosa para nosotros. ¿Te ayudo con algo más?';
      
      // ============================================
      // BÚSQUEDA Y UBICACIÓN - Con contexto
      // ============================================
      case INTENTS.BUSCAR_LOCAL:
        if (!s) {
          return '¿Qué tienda o restaurante estás buscando? Dime el nombre para ubicarte rápido.';
        }
        
        // Respuesta completa con ubicación + info relevante
        if (s.category === 'restaurante') {
          return `Perfecto, ${s.name} está en ${s.floor}, ${s.zone}, local ${s.local}. ${this._getContextualInfo(s)}. ¿Te paso el teléfono, te comunico directamente, o necesitas otra cosa?`;
        }
        
        return `${s.name} está en ${s.floor}, ${s.zone}, local ${s.local}. ${this._getContextualInfo(s)}. ¿Necesitas el teléfono o te comunico con ellos?`;
      
      case INTENTS.UBICACION:
        if (!s) {
          return 'Estamos en Carrera 25 número 45-10, San Gil, a dos cuadras del parque principal. Si vienes en carro, hay parqueadero en sótanos 1 y 2. ¿Necesitas indicaciones de cómo llegar?';
        }
        
        return `${s.name} está en ${s.floor}, ${s.zone}, local ${s.local}. ${this._getContextualInfo(s)}. ¿Te paso el teléfono o prefieres que te comunique?`;
      
      case INTENTS.UBICACION_MALL:
        return 'Estamos en Carrera 25 número 45-10, San Gil, a dos cuadras del parque principal. Bien ubicados y fácil de llegar. ¿Necesitas indicaciones de cómo llegar desde algún punto específico?';
      
      case INTENTS.COMO_LLEGAR:
        return 'Mira, si vienes del terminal son como 5 minutos en taxi, te cuesta unos 5 mil pesos. Si prefieres bus, puedes tomar las rutas 1, 3, 5 o 7 que todas pasan por acá. Estamos en Carrera 25 número 45-10. ¿Algo más que necesites?';
      
      // ============================================
      // HORARIOS - Con contexto temporal
      // ============================================
      case INTENTS.HORARIO_MALL:
        const currentHour = new Date().getHours();
        const isOpen = (currentHour >= 10 && currentHour < 21) || 
                       (new Date().getDay() === 0 && currentHour >= 11 && currentHour < 20);
        
        if (isOpen) {
          return 'Estamos abiertos ahora mismo. El horario general es lunes a sábado de 10 de la mañana a 9 de la noche, y domingos de 11 a 8. ¿Vienes para acá o necesitas info de alguna tienda?';
        }
        
        return 'El centro comercial abre lunes a sábado de 10 de la mañana a 9 de la noche, y domingos de 11 a 8. ¿Necesitas saber el horario de alguna tienda en específico?';
      
      case INTENTS.HORARIO_LOCAL:
        if (!s) {
          return '¿De qué tienda o restaurante necesitas el horario? Dime el nombre.';
        }
        
        return `${s.name} abre ${s.hours}. ${this._getStoreStatusNow(s)}. ¿Necesitas la ubicación o el teléfono?`;
      
      case INTENTS.HORARIOS:
        if (s) {
          return `${s.name} abre ${s.hours}. ${this._getStoreStatusNow(s)}. ¿Te ayudo con algo más del local?`;
        }
        return 'El centro comercial abre lunes a sábado de 10 AM a 9 PM, y domingos de 11 a 8. ¿Necesitas horario de alguna tienda específica?';
      
      // ============================================
      // TELÉFONO - Con oferta de transferencia
      // ============================================
      case INTENTS.NUMERO_TELEFONO:
        if (!s) {
          return '¿El teléfono de qué tienda o restaurante necesitas?';
        }
        
        const phone = this._formatPhone(s.phone);
        
        // Si es restaurante en hora de comida, ofrecer domicilio
        if (s.category === 'restaurante' && (timeOfDay === 'lunch' || timeOfDay === 'dinner')) {
          if (s.delivery) {
            return `El teléfono de ${s.name} es ${phone}. Si quieres, te puedo comunicar directamente para que pidas domicilio, ¿te parece?`;
          }
          return `${s.name}: ${phone}. ¿Quieres que te comunique directamente para hacer tu reserva o pedido?`;
        }
        
        return `El número de ${s.name} es ${phone}. ¿Prefieres que te comunique directamente? Es más rápido.`;
      
      // ============================================
      // TRANSFERIR - Confirmación amable
      // ============================================
      case INTENTS.TRANSFERIR:
        if (!s) {
          return '¿Con qué tienda o restaurante te comunico? Dime el nombre.';
        }
        
        return {
          message: `Perfecto, te comunico con ${s.name} en este momento. Dame un segundito.`,
          transferTo: s.phone,
          storeName: s.name,
          action: 'transfer'
        };
      
      // ============================================
      // DOMICILIO - Inteligente según disponibilidad
      // ============================================
      case INTENTS.PEDIR_DOMICILIO:
        if (!s) {
          if (timeOfDay === 'lunch') {
            return 'Perfecto, ¿de dónde quieres pedir? Tenemos Crepes & Waffles, Subway y La Toscana que hacen domicilios. ¿Cuál prefieres?';
          }
          return '¿De qué restaurante quieres pedir? Los que tienen servicio a domicilio son Crepes & Waffles, Subway y La Toscana.';
        }
        
        if (s.category !== 'restaurante') {
          return `${s.name} no es restaurante. Los que hacen domicilios son Crepes & Waffles, Subway y La Toscana. ¿Te interesa alguno?`;
        }
        
        if (!s.delivery) {
          return `${s.name} no maneja servicio a domicilio directamente, pero puedes llamarlos al ${this._formatPhone(s.phone)} para confirmar. Los que sí tienen domicilio seguro son Crepes, Subway y Toscana. ¿Prefieres que te comunique con alguno de esos?`;
        }
        
        return {
          message: `Excelente elección, te comunico con ${s.name} para que hagas tu pedido. Un momento.`,
          transferTo: s.phone,
          storeName: s.name,
          action: 'transfer'
        };
      
      // ============================================
      // SERVICIOS - Útiles y directos
      // ============================================
      case INTENTS.PARQUEADERO:
        return 'Tenemos parqueadero en sótanos 1 y 2, abierto 24 horas. La primera hora es gratis, después son 2 mil pesos por hora. Si compras más de 100 mil en el mall, no pagas parqueadero. ¿Necesitas indicaciones para entrar?';
      
      case INTENTS.PARQUEADERO_COSTO:
        return 'Mira, la primera hora es gratis. Después de eso son 2 mil pesos por cada hora. Y si haces compras por más de 100 mil pesos en cualquier tienda del centro, el parqueadero te sale completamente gratis. ¿Algo más?';
      
      case INTENTS.BANOS:
        return 'Hay baños en los tres pisos: en primero cerca del Éxito, en segundo piso en la zona de restaurantes, y en tercero junto al cine. Todos están limpios y en buen estado. ¿Necesitas algo más?';
      
      case INTENTS.CAJERO:
        return 'Perfecto, tenemos cajeros en primer piso, zona de servicios. Hay de Bancolombia, Davivienda, BBVA y Banco de Bogotá. Funcionan las 24 horas. ¿Te ayudo con algo más?';
      
      case INTENTS.WIFI:
        return 'Sí, tenemos WiFi gratis en todo el centro comercial. La red se llama PUENTE_FREE_WIFI y no necesita contraseña, solo conectarte y listo. ¿Algo más en lo que te ayude?';
      
      case INTENTS.ZONA_JUEGOS:
        return 'La zona de juegos está en segundo piso, en la zona central. Es gratis y está pensada para niños de 2 a 12 años. Abre de 11 de la mañana a 8 de la noche. Siempre hay supervisión. ¿Necesitas algo más?';
      
      case INTENTS.SALA_LACTANCIA:
        return 'Tenemos sala de lactancia en primer piso, justo al lado del punto de información. Es privada, tiene sillas cómodas, cambiador y hasta microondas. Puedes usarla con toda tranquilidad. ¿Te ayudo con algo más?';
      
      case INTENTS.ACCESIBILIDAD:
        return 'Todo el centro comercial es 100% accesible. Tenemos rampas en todas las entradas, ascensores amplios, baños adaptados y parqueadero preferencial en sótano 1. Si necesitas ayuda especial, el personal de seguridad te puede asistir. ¿Algo más?';
      
      case INTENTS.TARJETA_REGALO:
        return 'Las tarjetas regalo las vendemos en el punto de información del primer piso. Desde 20 mil pesos y sin fecha de vencimiento. Es un regalo perfecto porque pueden comprar en cualquier tienda del centro. ¿Te interesa comprar una?';
      
      case 'administracion':
        return 'La administración está en primer piso, justo en la entrada principal. Horario de lunes a viernes de 9 de la mañana a 6 de la tarde. Si necesitas algo específico, también puedes escribir a info@puentedesangil.com. ¿Te ayudo con algo más?';
      
      // ============================================
      // CATEGORÍAS - Con recomendaciones
      // ============================================
      case INTENTS.RESTAURANTES:
        if (timeOfDay === 'lunch') {
          return 'Perfecto, para almorzar tenemos buenas opciones: Crepes & Waffles si quieres algo elegante y variado, Subway si prefieres algo rápido y saludable, o La Toscana para comida italiana casera. ¿Cuál te llama la atención?';
        } else if (timeOfDay === 'dinner') {
          return 'Para la cena tenemos: Crepes & Waffles que tiene ambiente bonito y carta amplia, Subway para algo rápido, o La Toscana si quieres pizza o pasta italiana. ¿Te interesa alguno en especial?';
        }
        return 'Tenemos tres restaurantes principales: Crepes & Waffles, Subway y La Toscana. ¿Te doy info de alguno específico o los tres te interesan?';
      
      case INTENTS.TIENDAS_ROPA:
        return 'Para ropa tenemos: Nike y Adidas si buscas deportiva, Zara y H&M para moda casual y urbana. Todas están en segundo piso. ¿Buscas algo en específico o quieres saber de todas?';
      
      case INTENTS.TIENDAS_DEPORTES:
        return 'Las tiendas deportivas son Nike y Adidas, ambas en segundo piso zona norte. Nike está en el local 210 y Adidas en el 215, quedan una al lado de la otra. ¿Te doy la ubicación exacta de alguna?';
      
      case INTENTS.BANCOS:
        return 'Tenemos Bancolombia y Davivienda en primer piso. Atienden lunes a viernes de 8 de la mañana a 5 de la tarde, y sábados de 9 a 12. También hay cajeros 24/7 de esos bancos más BBVA y Bogotá. ¿Necesitas algo específico?';
      
      case INTENTS.FARMACIAS:
        return 'La farmacia es Drogas La Rebaja, está en primer piso local 108. Abre lunes a sábado de 8 de la mañana a 8 de la noche, y domingos de 9 a 6. Tienen muy buen surtido. ¿Necesitas el teléfono?';
      
      case INTENTS.SUPERMERCADO:
        return 'Tenemos un Éxito Express en primer piso, local 120. Abre lunes a sábado de 8 de la mañana a 9 de la noche, domingos de 9 a 8. Tienen de todo: víveres, aseo, bebidas. ¿Te ayudo con algo más?';
      
      // ============================================
      // CINE - Contextual y útil
      // ============================================
      case INTENTS.CINE:
        return 'El cine es Cinemark, está en tercer piso. Tiene 8 salas con tecnología 2D, 3D y XD. Abre todos los días de 11 de la mañana a 11 de la noche. ¿Quieres saber qué películas hay o los precios?';
      
      case INTENTS.CINE_CARTELERA:
        return 'En este momento hay 4 películas en cartelera: una de acción, una animada para niños, un drama y una comedia. Para saber títulos exactos y funciones, mejor llamas al 607 724 6666. ¿Te interesa saber los precios?';
      
      case INTENTS.CINE_HORARIOS:
        return 'Las funciones empiezan desde las 11 de la mañana y la última es a las 10 de la noche. Para horarios exactos de cada película es mejor que llames al 607 724 6666, ellos te dicen las funciones disponibles hoy. ¿Necesitas los precios?';
      
      case INTENTS.CINE_PRECIOS:
        return 'Los precios son: 2D cuesta 12 mil entre semana y 16 mil los fines de semana. Las de 3D son 18 mil y 22 mil. Los miércoles hay promoción: todas las películas a 10 mil pesos. Bien barato. ¿Te interesa ir hoy?';
      
      // ============================================
      // COMERCIAL - Atractivo
      // ============================================
      case INTENTS.PROMOCIONES:
        return 'Tenemos varias promociones activas: tarjeta de cliente frecuente con descuentos especiales, parqueadero gratis si compras más de 100 mil, y descuentos de 10 a 15% para estudiantes con carnet. ¿Te interesa alguna en particular?';
      
      case INTENTS.EVENTOS:
        return 'Los viernes tenemos festival gastronómico de 5 a 8 de la tarde con degustaciones gratis, y los sábados hay música en vivo a las 4 de la tarde con entrada libre. Súper chevere para venir en familia. ¿Te interesa venir este fin de semana?';
      
      case INTENTS.OFERTAS:
      case INTENTS.DESCUENTOS:
        return 'Mira, estudiantes con carnet tienen 10 a 15% de descuento de lunes a miércoles. Adultos mayores siempre tienen 10% en todas las tiendas. Y en junio y diciembre hay temporadas de ofertas grandes en todo el centro. ¿Eres estudiante o buscas algo específico?';
      
      // ============================================
      // PRECIOS Y MENÚ
      // ============================================
      case INTENTS.PRECIOS_COMIDA:
        return this._responsePreciosComida(entities, timeOfDay);
      
      case INTENTS.MENU_RESTAURANTE:
        return this._responseMenuRestaurante(entities, timeOfDay);
      
      // ============================================
      // NO ENTENDIÓ - Útil y paciente
      // ============================================
      case INTENTS.UNKNOWN:
      default:
        return this._pickRandom([
          'Perdón, no capté bien. ¿Buscas una tienda, necesitas horarios, o quieres info de algún servicio?',
          'Disculpa, no entendí del todo. ¿Me puedes decir de nuevo qué necesitas? Te ayudo con lo que sea.',
          '¿Podrías repetir? Puedo ayudarte con ubicación de tiendas, horarios, servicios o comunicarte con algún local.'
        ]);
    }
  }
  
  // ============================================
  // RESPUESTAS ESPECIALIZADAS
  // ============================================
  
  _responseHambre(entities) {
    const timeOfDay = this.conversationMemory.timeOfDay;
    
    if (timeOfDay === 'lunch') {
      return 'Perfecto, justo es hora de almorzar. Te recomiendo tres opciones buenas: Crepes & Waffles si quieres algo completo y rico (está entre 35 y 50 mil), Subway si prefieres rápido y saludable (15 a 25 mil), o La Toscana para comida italiana casera (40 a 60 mil). ¿Cuál te llama más la atención?';
    } else if (timeOfDay === 'dinner') {
      return 'Dale, es hora de cenar. Tienes: Crepes & Waffles con ambiente agradable (35-50 mil), Subway para algo rápido (15-25 mil), o La Toscana con pizzas y pastas deliciosas (40-60 mil). Todos hacen domicilio si prefieres. ¿Cuál te gusta?';
    } else if (timeOfDay === 'afternoon') {
      return 'Te entiendo. Para un snack o algo ligero te recomiendo Subway que tiene opciones desde 15 mil. Si quieres sentarte más tranquilo, Crepes & Waffles tiene postres y bebidas buenísimas. ¿Prefieres rápido o con calma?';
    }
    
    return 'Tenemos varios restaurantes: Crepes & Waffles (35-50 mil), Subway (15-25 mil) y La Toscana (40-60 mil). Según tu presupuesto y antojo, ¿cuál te interesa?';
  }
  
  _responsePreciosComida(entities, timeOfDay) {
    const s = entities.storeData;
    
    if (s) {
      if (s.category !== 'restaurante') {
        return 'Ese no es restaurante. Los precios de comida son: Subway entre 15 y 25 mil, Crepes de 35 a 50 mil, y La Toscana de 40 a 60 mil. ¿Te interesa alguno?';
      }
      
      const avgPrice = s.averagePrice || 'consultar directamente';
      return `En ${s.name} los platos están entre ${avgPrice} pesos. ${this._getStoreStatusNow(s)}. ¿Quieres que te comunique para hacer reserva o pedir domicilio?`;
    }
    
    // Sin tienda específica
    if (timeOfDay === 'lunch' || timeOfDay === 'dinner') {
      return 'Los rangos de precio son: Subway lo más económico (15-25 mil), Crepes & Waffles rango medio (35-50 mil), y La Toscana un poquito más (40-60 mil). Todos son buenos según tu presupuesto. ¿Cuál se acomoda mejor a lo que buscas?';
    }
    
    return 'Subway: 15 a 25 mil. Crepes & Waffles: 35 a 50 mil. La Toscana: 40 a 60 mil. ¿Te interesa alguno en específico?';
  }
  
  _responseMenuRestaurante(entities, timeOfDay) {
    const s = entities.storeData;
    
    if (!s) {
      if (timeOfDay === 'lunch') {
        return 'Claro, ¿de cuál quieres el menú? Crepes & Waffles tiene de todo (ensaladas, pastas, crepes), Subway son sándwiches personalizables, y La Toscana es comida italiana. ¿Cuál te interesa?';
      }
      return '¿Menú de cuál restaurante? Tenemos Crepes & Waffles, Subway y La Toscana. ¿Cuál quieres?';
    }
    
    if (s.category !== 'restaurante') {
      return `${s.name} no es restaurante. Los que tienen carta son Crepes & Waffles, Subway y La Toscana. ¿Te interesa alguno?`;
    }
    
    if (!s.menu) {
      return `Para ver el menú completo de ${s.name} con fotos y todo, mejor llámalos al ${this._formatPhone(s.phone)} o pasa por el local que está en ${s.floor}. ¿Te comunico con ellos?`;
    }
    
    // Si tiene menú en BD
    const cat1 = Object.keys(s.menu)[0];
    const cat2 = Object.keys(s.menu)[1];
    const items = [
      ...s.menu[cat1].slice(0, 2),
      ...s.menu[cat2].slice(0, 2)
    ].join(', ');
    
    return `${s.name} tiene en el menú ${items}, entre otras opciones. Muy variado. ¿Quieres que te comunique para que te cuenten el menú completo?`;
  }
  
  // ============================================
  // ENRIQUECIMIENTO CON PREDICCIÓN
  // ============================================
  
  _enrichWithPrediction(response, intent, entities, userState) {
    // Si ya es una acción (transferir), no agregar nada
    if (typeof response === 'object') {
      return response;
    }
    
    const s = entities.storeData;
    const userGoal = userState.userGoal || this.conversationMemory.userGoal;
    
    // Ya tiene pregunta, no agregar más
    if (response.includes('?')) {
      return response;
    }
    
    // PREDICCIÓN: Usuario buscó restaurante → probablemente quiere pedir
    if (s && s.category === 'restaurante' && 
        [INTENTS.BUSCAR_LOCAL, INTENTS.UBICACION].includes(intent)) {
      // Ya incluida en respuesta base
      return response;
    }
    
    // PREDICCIÓN: Usuario preguntó teléfono → probablemente quiere hablar
    if (intent === INTENTS.NUMERO_TELEFONO && s) {
      // Ya incluida en respuesta base
      return response;
    }
    
    return response;
  }
  
  // ============================================
  // TOQUE HUMANO
  // ============================================
  
  _addHumanTouch(response, intent, userState) {
    // Si ya es una acción, no modificar
    if (typeof response === 'object') {
      return response;
    }
    
    const emotionalTone = userState.emotionalTone;
    
    // Usuario urgente → confirmar velocidad
    if (emotionalTone === 'urgent' && !response.includes('rápido')) {
      // Ya manejado en respuestas base
    }
    
    // Usuario feliz/agradecido → reciprocidad
    if (emotionalTone === 'happy') {
      // Ya manejado en respuestas base
    }
    
    return response;
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  _getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 15) return 'lunch';
    if (hour >= 15 && hour < 19) return 'afternoon';
    if (hour >= 19 && hour < 22) return 'dinner';
    return 'night';
  }
  
  _getContextualInfo(store) {
    const timeOfDay = this.conversationMemory.timeOfDay;
    
    if (store.category === 'restaurante') {
      if (timeOfDay === 'lunch') {
        return 'Perfecto para almorzar';
      } else if (timeOfDay === 'dinner') {
        return 'Ideal para la cena';
      }
      return 'Muy buena opción';
    }
    
    return this._getStoreStatusNow(store);
  }
  
  _getStoreStatusNow(store) {
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = domingo, 6 = sábado
    
    // Parsear horario (simplificado - asume formato "Lun-Sab: 10AM-9PM")
    // En producción, esto debería ser más robusto
    
    // Heurística simple
    if (currentHour >= 10 && currentHour < 21 && currentDay !== 0) {
      return 'Está abierto ahora';
    } else if (currentDay === 0 && currentHour >= 11 && currentHour < 20) {
      return 'Abierto (es domingo)';
    } else if (currentHour < 10) {
      return 'Abre a las 10 AM';
    } else if (currentHour >= 21) {
      return 'Ya cerró, abre mañana a las 10';
    }
    
    return 'Consulta horarios';
  }
  
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