// src/services/ResponseGenerator.js

import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { responseTemplates, getRandomResponse, fillTemplate } from '../data/responseTemplates.js';
import { logger } from '../utils/logger.js';

/**
 * Genera respuestas naturales y variadas
 * Usa templates con múltiples variaciones para sonar más humano
 * 
 * IMPORTANTE: Cada instancia de ResponseGenerator es INDEPENDIENTE
 * No comparte estado entre diferentes llamadas
 */
export class ResponseGenerator {
  
  constructor() {
    // Estado local SOLO para esta instancia
    // Se resetea con cada nueva llamada
    this.lastResponses = [];
  }
  
  generateResponse(intent, entities = {}, context = {}) {
    logger.debug('Generando respuesta', { intent, entities });
    
    switch (intent) {
      // ============================================
      // CONTROL DE FLUJO
      // ============================================
      case INTENTS.SALUDAR:
        return this.getVariedResponse('greeting');
      
      case INTENTS.DESPEDIDA:
        return this.getVariedResponse('goodbye');
      
      case INTENTS.CONFIRMAR:
        return this.getVariedResponse('confirmation');
      
      case INTENTS.NEGAR:
        return this.responseDespedida();
      
      case INTENTS.REPETIR:
        return this.responseRepetir(context);
      
      case INTENTS.AYUDA:
        return this.responseAyuda();
      
      // ============================================
      // EMERGENCIAS Y AYUDA
      // ============================================
      case INTENTS.EMERGENCIA:
        return this.responseEmergencia();
      
      case INTENTS.PRIMEROS_AUXILIOS:
        return this.responsePrimerosAuxilios();
      
      case INTENTS.OBJETOS_PERDIDOS:
        return this.responseObjetosPerdidos();
      
      case INTENTS.QUEJAS:
        return this.responseQuejas();
      
      case INTENTS.SUGERENCIAS:
        return this.responseSugerencias();
      
      // ============================================
      // BÚSQUEDA Y UBICACIÓN
      // ============================================
      case INTENTS.BUSCAR_LOCAL:
        return this.responseBuscarLocal(entities);
      
      case INTENTS.UBICACION:
        return this.responseUbicacion(entities);
      
      case INTENTS.UBICACION_MALL:
        return this.responseUbicacionMall();
      
      case INTENTS.COMO_LLEGAR:
        return this.responseComoLlegar();
      
      // ============================================
      // HORARIOS
      // ============================================
      case INTENTS.HORARIO_MALL:
        return this.responseHorarioMall();
      
      case INTENTS.HORARIO_LOCAL:
        return this.responseHorarioLocal(entities);
      
      case INTENTS.HORARIOS:
        return entities.storeName ? 
               this.responseHorarioLocal(entities) : 
               this.responseHorarioMall();
      
      // ============================================
      // CONTACTO Y COMUNICACIÓN
      // ============================================
      case INTENTS.NUMERO_TELEFONO:
        return this.responseNumeroTelefono(entities);
      
      case INTENTS.TRANSFERIR:
        return this.responseTransferir(entities);
      
      case INTENTS.PEDIR_DOMICILIO:
        return this.responsePedirDomicilio(entities);
      
      // ============================================
      // SERVICIOS DEL MALL
      // ============================================
      case INTENTS.PARQUEADERO:
        return this.responseParqueadero();
      
      case INTENTS.PARQUEADERO_COSTO:
        return this.responseParqueaderoCosto();
      
      case INTENTS.BANOS:
        return this.responseBanos();
      
      case INTENTS.CAJERO:
        return this.responseCajero();
      
      case INTENTS.WIFI:
        return this.responseWifi();
      
      case INTENTS.ZONA_JUEGOS:
        return this.responseZonaJuegos();
      
      case INTENTS.SALA_LACTANCIA:
        return this.responseSalaLactancia();
      
      case INTENTS.ACCESIBILIDAD:
        return this.responseAccesibilidad();
      
      case INTENTS.TARJETA_REGALO:
        return this.responseTarjetaRegalo();
      
      // ============================================
      // CATEGORÍAS DE TIENDAS
      // ============================================
      case INTENTS.RESTAURANTES:
        return this.responseRestaurantes();
      
      case INTENTS.TIENDAS_ROPA:
        return this.responseTiendasRopa();
      
      case INTENTS.TIENDAS_DEPORTES:
        return this.responseTiendasDeportes();
      
      case INTENTS.BANCOS:
        return this.responseBancos();
      
      case INTENTS.FARMACIAS:
        return this.responseFarmacias();
      
      case INTENTS.SUPERMERCADO:
        return this.responseSupermercado();
      
      // ============================================
      // CINE
      // ============================================
      case INTENTS.CINE:
        return this.responseCine();
      
      case INTENTS.CINE_CARTELERA:
        return this.responseCineCartelera();
      
      case INTENTS.CINE_HORARIOS:
        return this.responseCineHorarios();
      
      case INTENTS.CINE_PRECIOS:
        return this.responseCinePrecios();
      
      // ============================================
      // INFORMACIÓN COMERCIAL
      // ============================================
      case INTENTS.PROMOCIONES:
        return this.responsePromociones();
      
      case INTENTS.EVENTOS:
        return this.responseEventos();
      
      case INTENTS.OFERTAS:
      case INTENTS.DESCUENTOS:
        return this.responsePromociones();
      
      case INTENTS.PRECIOS_COMIDA:
        return this.responsePreciosComida(entities);
      
      case INTENTS.MENU_RESTAURANTE:
        return this.responseMenuRestaurante(entities);
      
      // ============================================
      // DEFAULT
      // ============================================
      case INTENTS.UNKNOWN:
      default:
        return this.responseUnknown();
    }
  }
  
  // ============================================
  // MÉTODOS DE RESPUESTA - CONTROL DE FLUJO
  // ============================================
  
  responseRepetir(context) {
    const intro = this.getVariedResponse('repeat');
    const lastResponse = context.lastResponse || 'No hay información previa.';
    return `${intro} ${lastResponse}`;
  }
  
  responseAyuda() {
    return this.getVariedResponse('help');
  }
  
  responseDespedida() {
    return this.getVariedResponse('goodbye');
  }
  
  // ============================================
  // EMERGENCIAS
  // ============================================
  
  responseEmergencia() {
    return this.getVariedResponse('emergency');
  }
  
  responsePrimerosAuxilios() {
    return this.getVariedResponse('firstAid');
  }
  
  responseObjetosPerdidos() {
    return this.getVariedResponse('lostAndFound');
  }
  
  responseQuejas() {
    return this.getVariedResponse('complaints');
  }
  
  responseSugerencias() {
    return this.getVariedResponse('complaints');
  }
  
  // ============================================
  // BÚSQUEDA Y UBICACIÓN - DETALLADO
  // ============================================
  
  responseBuscarLocal(entities) {
    if (!entities.storeName) {
      return this.getVariedResponse('searchStore_noName');
    }
    
    const store = entities.storeData;
    
    // Respuesta SUPER DETALLADA según tipo
    let response = `${store.name}, ${store.floor}, ${store.zone}, local ${store.local}. `;
    
    // Agregar descripción
    if (store.description) {
      response += `${store.description}. `;
    }
    
    // Si es RESTAURANTE
    if (store.category === 'restaurante') {
      response += `Horario: ${store.hours}. `;
      response += `Precios entre ${store.averagePrice} pesos. `;
      
      if (store.specialties && store.specialties.length > 0) {
        response += `Especialidades: ${store.specialties.slice(0, 3).join(', ')}. `;
      }
      
      if (store.delivery) {
        response += 'Tienen servicio a domicilio. ';
      }
      
      if (store.reservations) {
        response += 'Aceptan reservas. ';
      }
      
      if (store.promotions && store.promotions.length > 0) {
        response += `Promoción actual: ${store.promotions[0]}. `;
      }
    }
    
    // Si es TIENDA DE ROPA
    else if (store.category === 'ropa') {
      response += `Ropa ${store.subcategory}. `;
      response += `Horario: ${store.hours}. `;
      
      if (store.averagePrice) {
        response += `Rango de precios: ${store.averagePrice} pesos. `;
      }
      
      if (store.brands && store.brands.length > 0) {
        response += `Marcas: ${store.brands.join(', ')}. `;
      }
      
      if (store.promotions && store.promotions.length > 0) {
        response += `${store.promotions[0]}. `;
      }
    }
    
    // Si es BANCO
    else if (store.category === 'banco') {
      response += `Horario: ${store.hours}. `;
      
      if (store.atmAvailable) {
        response += `Cajero automático ${store.atmHours}. `;
      }
      
      if (store.services && store.services.length > 0) {
        response += `Servicios: ${store.services.slice(0, 3).join(', ')}. `;
      }
    }
    
    // Si es CINE
    else if (store.category === 'cine') {
      response += `${store.salas} salas. `;
      response += `Tecnologías: ${store.technologies.join(', ')}. `;
      response += `Horario: ${store.hours}. `;
      response += `Boletas desde ${store.prices['2d'].lunes_jueves} pesos. `;
    }
    
    // Si es FARMACIA
    else if (store.category === 'farmacia') {
      response += `Horario: ${store.hours}. `;
      
      if (store.services && store.services.length > 0) {
        response += `Servicios: ${store.services.join(', ')}. `;
      }
      
      if (store.promotions && store.promotions.length > 0) {
        response += `${store.promotions[0]}. `;
      }
    }
    
    // Si es SUPERMERCADO
    else if (store.category === 'supermercado') {
      response += `Horario: ${store.hours}. `;
      
      if (store.services && store.services.length > 0) {
        response += `Secciones: ${store.services.join(', ')}. `;
      }
      
      if (store.promotions && store.promotions.length > 0) {
        response += `Promoción: ${store.promotions[0]}. `;
      }
    }
    
    // Teléfono SIEMPRE
    response += `Teléfono: ${store.phone}. `;
    
    response += this.getVariedResponse('confirmation');
    
    return response;
  }
  
  responseUbicacion(entities) {
    if (!entities.storeName) {
      return this.responseUbicacionMall();
    }
    
    const store = entities.storeData;
    
    let response = `${store.name}: ${store.floor}, ${store.zone}, local ${store.local}. `;
    
    // Agregar referencias contextuales
    if (store.category === 'restaurante') {
      response += 'En la zona de restaurantes, segundo piso. ';
    } else if (store.category === 'banco') {
      response += 'Zona de servicios financieros, primer piso, cerca de los cajeros. ';
    } else if (store.category === 'cine') {
      response += 'Tercer piso completo, zona de entretenimiento. ';
    } else if (store.category === 'ropa' && store.subcategory === 'deportiva') {
      response += 'Segundo piso, zona norte junto a otras tiendas deportivas. ';
    } else if (store.category === 'farmacia') {
      response += 'Primer piso, zona de servicios. ';
    } else if (store.category === 'supermercado') {
      response += 'Primer piso, zona comercial amplia. ';
    }
    
    response += `Teléfono: ${store.phone}. `;
    response += this.getVariedResponse('confirmation');
    
    return response;
  }
  
  responseUbicacionMall() {
    return `Estamos en Carrera 25 número 45-10, San Gil, Santander. A dos cuadras del parque principal, frente al Banco de Bogotá. ¿Necesitas indicaciones de cómo llegar?`;
  }
  
  responseComoLlegar() {
    return `Para llegar: desde el terminal de buses son 5 minutos en taxi, aproximadamente 5 mil pesos. En transporte público: rutas 1, 3, 5 y 7 pasan cada 15 minutos. Desde Bucaramanga: 2 horas por la vía principal. Desde Barichara: 20 minutos. Estamos en la Carrera 25 con Calle 45, muy cerca del parque central. ¿Algo más?`;
  }
  
  // ============================================
  // HORARIOS - DETALLADO
  // ============================================
  
  responseHorarioMall() {
    return `El centro comercial abre de lunes a sábado de 10 de la mañana a 9 de la noche. Domingos de 11 de la mañana a 8 de la noche. En fechas especiales como navidad abrimos hasta las 10 de la noche. Días festivos: 11 AM a 7 PM. ¿Necesitas horario de algún local específico?`;
  }
  
  responseHorarioLocal(entities) {
    if (!entities.storeName) {
      return 'Dime el nombre del local y te doy su horario detallado.';
    }
    
    const store = entities.storeData;
    
    let response = `${store.name}: ${store.hours}. `;
    
    // Agregar ubicación
    response += `Ubicado en ${store.floor}, ${store.zone}, local ${store.local}. `;
    
    // Info adicional según tipo
    if (store.category === 'restaurante') {
      if (store.reservations) {
        response += 'Aceptan reservas. ';
      }
      if (store.delivery) {
        response += 'Servicio a domicilio disponible. ';
      }
      if (store.seatingCapacity) {
        response += `Capacidad para ${store.seatingCapacity} personas. `;
      }
    }
    
    if (store.category === 'banco' && store.atmHours) {
      response += `Los cajeros automáticos están disponibles ${store.atmHours}. `;
    }
    
    response += `Teléfono: ${store.phone}. `;
    response += this.getVariedResponse('confirmation');
    
    return response;
  }
  
  // ============================================
  // CONTACTO - DETALLADO
  // ============================================
  
  responseNumeroTelefono(entities) {
    if (!entities.storeName) {
      return 'Dime el nombre del local y te doy su número de contacto.';
    }
    
    const store = entities.storeData;
    
    let response = `${store.name}: ${store.phone}. `;
    response += `Ubicado en ${store.floor}, ${store.zone}. `;
    
    if (store.category === 'restaurante' && store.delivery) {
      response += 'Tienen servicio a domicilio. ';
    }
    
    response += this.getVariedResponse('confirmation');
    
    return response;
  }
  
  responseTransferir(entities) {
    if (!entities.storeName) {
      return this.getVariedResponse('transfer_noStore');
    }
    
    const store = entities.storeData;
    const template = this.getVariedResponse('transfer_confirm');
    
    return {
      message: fillTemplate(template, {
        name: store.name
      }),
      transferTo: store.phone,
      storeName: store.name,
      action: 'transfer'
    };
  }
  
  responsePedirDomicilio(entities) {
    if (!entities.storeName) {
      return 'De qué restaurante quieres pedir? Tenemos Crepes & Waffles, Subway y La Toscana con servicio a domicilio.';
    }
    
    const store = entities.storeData;
    
    if (store.category !== 'restaurante') {
      return `${store.name} no es un restaurante. Los restaurantes con domicilio son: Crepes & Waffles, Subway y La Toscana. ¿De cuál quieres pedir?`;
    }
    
    if (!store.delivery) {
      return `${store.name} no tiene servicio a domicilio actualmente. Te doy su número para que consultes: ${store.phone}. ¿Algo más?`;
    }
    
    const template = this.getVariedResponse('transfer_confirm');
    
    return {
      message: `${fillTemplate(template, { name: store.name })} para hacer tu pedido.`,
      transferTo: store.phone,
      storeName: store.name,
      action: 'transfer'
    };
  }
  
  // ============================================
  // SERVICIOS DEL MALL - MUY DETALLADO
  // ============================================
  
  responseParqueadero() {
    return `Parqueadero en sótanos 1 y 2. Abierto 24 horas todos los días. Capacidad para 200 vehículos. Primera hora completamente gratis, luego 2 mil pesos cada hora adicional. Vigilado con cámaras de seguridad en tiempo real. Importante: por compras superiores a 100 mil pesos el parqueo es totalmente gratis durante todo el día, solo presenta tu factura en la salida. Espacios preferenciales para personas con discapacidad. ¿Algo más?`;
  }
  
  responseParqueaderoCosto() {
    return `Tarifas de parqueadero: primera hora gratis, luego 2 mil pesos por cada hora adicional. Si compras más de 100 mil pesos en cualquier tienda del centro comercial, el parqueo es gratis todo el día. Solo presenta tu factura al salir. ¿Te ayudo con algo más?`;
  }
  
  responseBanos() {
    return `Baños públicos en tres ubicaciones: primer piso cerca del supermercado Éxito, al lado de la escalera principal. Segundo piso en la zona de restaurantes, junto a Crepes & Waffles. Tercer piso al lado izquierdo del cine Cinemark. Todos tienen cambiadores para bebés, acceso para personas con discapacidad, y se mantienen limpios durante todo el día. ¿Necesitas algo más?`;
  }
  
  responseCajero() {
    return `Cajeros automáticos en primer piso, zona de servicios financieros, junto a los bancos. Disponibles: Bancolombia, Davivienda, BBVA y Banco de Bogotá. Los cajeros funcionan 24 horas todos los días. Además, los puntos de atención de Bancolombia y Davivienda tienen horario de lunes a viernes de 8 de la mañana a 5 de la tarde, sábados de 9 a 12 del mediodía. ¿Te ayudo con algo más?`;
  }
  
  responseWifi() {
    return `WiFi gratis en todo el centro comercial. Nombre de la red: PUENTE_FREE_WIFI. No necesita contraseña, simplemente conéctate y acepta los términos de uso. Alta velocidad disponible en todas las áreas: zona de restaurantes, locales comerciales, pasillos y áreas comunes. ¿Algo más?`;
  }
  
  responseZonaJuegos() {
    return `Zona de juegos infantiles en segundo piso, zona central cerca de la escalera eléctrica. Completamente gratis para niños de 2 a 12 años. Abierta de 11 de la mañana a 8 de la noche todos los días. Con vigilancia permanente, piso acolchado de seguridad, juegos variados para diferentes edades. Los padres pueden dejar a los niños jugando mientras hacen sus compras. ¿Necesitas más información?`;
  }
  
  responseSalaLactancia() {
    return `Sala de lactancia en primer piso, junto al punto de información cerca de la entrada principal. Es un espacio privado y cómodo para madres. Cuenta con sillas cómodas, cambiador de bebé, microondas para calentar alimentos, lavamanos, y total privacidad. Acceso libre durante todo el horario del centro comercial. ¿Algo más en lo que pueda ayudarte?`;
  }
  
  responseAccesibilidad() {
    return `El centro comercial es completamente accesible para personas con discapacidad. Tenemos: rampas en todas las entradas, ascensores amplios en cada zona, baños adaptados en todos los pisos, espacios preferenciales de parqueadero cerca de las entradas, sillas de ruedas disponibles en el punto de información sin costo, y personal de apoyo si lo necesitas. ¿Te ayudo con algo más?`;
  }
  
  responseTarjetaRegalo() {
    return `Tarjetas regalo disponibles en el punto de información del primer piso. Valores desde 20 mil pesos sin límite máximo. No tienen fecha de vencimiento y son válidas en todas las tiendas del centro comercial. Ideales para regalos de cumpleaños, navidad, o cualquier ocasión especial. Se pueden recargar en cualquier momento. ¿Quieres más detalles?`;
  }
  
  // ============================================
  // CATEGORÍAS - DETALLADO
  // ============================================
  
  responseRestaurantes() {
    return `Restaurantes en el centro comercial: Crepes & Waffles en segundo piso con comida casual, precios entre 35 y 50 mil pesos. Subway primer piso, comida rápida saludable, 15 a 25 mil. La Toscana segundo piso, comida italiana, 40 a 60 mil. Todos tienen servicio a domicilio. ¿Información de alguno en específico?`;
  }
  
  responseTiendasRopa() {
    return `Tiendas de ropa: Nike segundo piso zona norte, ropa deportiva. Adidas segundo piso junto a Nike. Zara primer piso zona central, moda contemporánea. H&M primer piso zona sur, moda a precios accesibles. Todas abren a las 10 de la mañana. ¿Detalles de alguna?`;
  }
  
  responseTiendasDeportes() {
    return `Tiendas deportivas: Nike y Adidas, ambas en segundo piso zona norte, una al lado de la otra. Nike especializada en tenis deportivos y ropa running. Adidas con equipos de fútbol y ropa de alto rendimiento. Ambas con promociones actuales. Horario: lunes a sábado 10 AM a 8 PM. ¿Información específica de alguna?`;
  }
  
  responseBancos() {
    return `Servicios bancarios en primer piso, zona de servicios: Bancolombia y Davivienda con puntos de atención. Horario: lunes a viernes 8 AM a 5 PM, sábados 9 AM a 12 PM. Cajeros automáticos 24 horas de Bancolombia, Davivienda, BBVA y Banco de Bogotá. Todos los servicios bancarios disponibles: aperturas de cuenta, créditos, tarjetas. ¿Algo específico?`;
  }
  
  responseFarmacias() {
    return `Drogas La Rebaja en primer piso, local 108, zona de servicios. Medicamentos con y sin fórmula médica, productos de cuidado personal, cosméticos, productos naturales. Servicio de inyectología disponible. Horario: lunes a sábado 8 AM a 8 PM, domingos 9 AM a 6 PM. Descuento especial del 20% para adultos mayores. Servicio a domicilio disponible. Teléfono: 607 724 7777. ¿Necesitas algo más?`;
  }
  
  responseSupermercado() {
    return `Éxito Express, primer piso local 120. Supermercado completo con: frutas y verduras frescas, carnes, lácteos, panadería artesanal, productos del hogar, sección gourmet, licores. Horario: lunes a sábado 8 AM a 9 PM, domingos 9 AM a 8 PM. Promociones especiales: miércoles frutas y verduras con 20% descuento, jueves ofertas en carnes. Aceptan puntos Éxito. Servicio a domicilio disponible. Teléfono: 607 724 5000. ¿Algo más?`;
  }
  
  // ============================================
  // CINE - MUY DETALLADO
  // ============================================
  
  responseCine() {
    return `Cinemark en tercer piso completo. 8 salas con tecnología 2D, 3D y XD. Horario: todos los días de 11 de la mañana a 11 de la noche. Precios: boletas 2D desde 12 mil pesos entre semana, 16 mil fines de semana. 3D desde 18 mil entre semana, 22 mil fines de semana. XD 28 mil. Promoción miércoles de cine: boletas 2D a solo 10 mil pesos. Combos: individual 15 mil con crispetas y gaseosa, pareja 25 mil, familiar 45 mil con crispetas jumbo, 4 gaseosas y nachos. Actualmente 4 películas en cartelera: acción, animación, drama y comedia. Teléfono para información y reservas: 607 724 6666. ¿Quieres saber la cartelera completa?`;
  }
  
  responseCineCartelera() {
    return `Cartelera actual de Cinemark: Película 1 "Acción Extrema", género acción y aventura, clasificación PG-13, duración 2 horas, funciones a las 2 de la tarde, 5 de la tarde y 8 de la noche, disponible en 2D y 3D. Película 2 "Aventuras Mágicas", animación familiar, clasificación G apta para todo público, 95 minutos, funciones al mediodía, 3 de la tarde y 6 de la tarde, formatos 2D y 3D. Película 3 "Destino Final", drama intenso, clasificación R solo mayores de edad, 135 minutos, funciones 4 de la tarde, 7 de la noche y 10 de la noche, solo 2D. Película 4 "Risas Sin Control", comedia, clasificación PG, 105 minutos, funciones 1 de la tarde, 4 de la tarde y 7 de la noche, formato 2D. Para títulos exactos actualizados y compra de boletas llama al 607 724 6666 o visita el tercer piso. ¿Quieres saber los precios?`;
  }
  
  responseCineHorarios() {
    return `Horarios de funciones en Cinemark: primera función a las 11 de la mañana, luego cada 2 horas aproximadamente. Horarios típicos: 12 del mediodía, 1 de la tarde, 2 de la tarde, 3 de la tarde, 4 de la tarde, 5 de la tarde, 6 de la tarde, 7 de la noche, 8 de la noche y última función a las 10 de la noche. Los horarios exactos varían según la película y el día. Para horarios precisos de la película que te interesa, llama al 607 724 6666 o consulta en el tercer piso. ¿Quieres saber la cartelera?`;
  }
  
  responseCinePrecios() {
    return `Precios de Cinemark: Boletas 2D lunes a jueves 12 mil pesos, viernes a domingo 16 mil, estrenos 18 mil. Boletas 3D lunes a jueves 18 mil, viernes a domingo 22 mil, estrenos 25 mil. Sala XD 28 mil todos los días. Promoción especial miércoles de cine: boletas 2D a solo 10 mil pesos todo el día. Combo estudiantil: boleta más combo individual 22 mil presentando carnet vigente. Niños menores de 3 años entran gratis si no ocupan silla. Adultos mayores descuento del 20% todos los días. Combos de comida: individual 15 mil, pareja 25 mil, familiar 45 mil. ¿Quieres saber la cartelera?`;
  }
  
  // ============================================
  // COMERCIAL - MUY DETALLADO
  // ============================================
  
  responsePromociones() {
    return `Promociones vigentes en el centro comercial: Número 1, tarjeta cliente frecuente para acumular puntos en cada compra y canjear por descuentos. Número 2, parqueo gratis todo el día por compras superiores a 100 mil pesos. Número 3, descuentos especiales para estudiantes de lunes a miércoles del 10 al 15% en tiendas participantes, presenta carnet estudiantil vigente. Número 4, adultos mayores 10% de descuento en todas las tiendas todos los días. Número 5, este mes festival gastronómico todos los viernes con degustaciones gratuitas en la zona de restaurantes de 5 a 8 de la noche. Cada tienda tiene promociones adicionales propias. ¿Información de alguna tienda específica?`;
  }
  
  responseEventos() {
    return `Eventos este mes en el centro comercial: Evento número 1, festival gastronómico todos los viernes de 5 a 8 de la noche con degustaciones gratuitas en todos los restaurantes del segundo piso. Evento número 2, tardes de cine familiar los domingos a las 2 de la tarde con 30% de descuento en boletas para toda la familia. Evento número 3, show de música en vivo todos los sábados a las 4 de la tarde en la plaza central del primer piso, entrada libre. Próximamente en junio y diciembre: temporada de grandes descuentos con hasta 70% en todas las tiendas. Síguenos en redes sociales @puentesangil para más información. ¿Te interesa algún evento en particular?`;
  }
  
  // ============================================
  // PRECIOS Y MENÚS - MUY DETALLADO
  // ============================================
  
  responsePreciosComida(entities) {
    if (entities.storeName) {
      const store = entities.storeData;
      
      if (store.category !== 'restaurante') {
        return `${store.name} no es un restaurante. Para precios de comida tenemos: Crepes & Waffles 35 a 50 mil, Subway 15 a 25 mil, La Toscana 40 a 60 mil. ¿De cuál quieres información?`;
      }
      
      let response = `${store.name}: rango de precios entre ${store.averagePrice} pesos. `;
      
      if (store.specialties && store.specialties.length > 0) {
        response += `Especialidades: ${store.specialties.join(', ')}. `;
      }
      
      if (store.menu) {
        const categories = Object.keys(store.menu);
        if (categories.length > 0) {
          const firstCategory = store.menu[categories[0]];
          const dishes = firstCategory.slice(0, 3).join(', ');
          response += `Tienen ${dishes} entre otros. `;
        }
      }
      
      if (store.promotions && store.promotions.length > 0) {
        response += `Promoción actual: ${store.promotions[0]}. `;
      }
      
      if (store.delivery) {
        response += 'Servicio a domicilio disponible. ';
      }
      
      response += `Para menú completo llama al ${store.phone}. ¿Algo más?`;
      
      return response;
    }
    
    return `Rangos de precios en restaurantes: Subway comida rápida de 15 a 25 mil pesos, ideal para algo rápido. Crepes & Waffles comida casual de 35 a 50 mil, perfecto para almorzar o cenar. La Toscana comida italiana de 40 a 60 mil, experiencia más completa. Todos tienen promociones especiales y servicio a domicilio. ¿Información detallada de alguno?`;
  }
  
  responseMenuRestaurante(entities) {
    if (!entities.storeName) {
      return 'De qué restaurante quieres el menú? Tenemos Crepes & Waffles, Subway y La Toscana con menús completos.';
    }
    
    const store = entities.storeData;
    
    if (store.category !== 'restaurante') {
      return `${store.name} no es un restaurante. ¿Quieres información de Crepes & Waffles, Subway o La Toscana?`;
    }
    
    if (!store.menu) {
      return `${store.name}: menú completo disponible llamando al ${store.phone} o visitándolos en ${store.floor}, ${store.zone}. Rango de precios: ${store.averagePrice} pesos. ¿Algo más?`;
    }
    
    // Construir respuesta SUPER detallada del menú
    let response = `Menú de ${store.name}. `;
    
    const menuCategories = Object.keys(store.menu);
    
    for (let i = 0; i < Math.min(menuCategories.length, 4); i++) {
      const category = menuCategories[i];
      const items = store.menu[category];
      
      if (items && items.length > 0) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        const itemsList = items.slice(0, 4).join(', ');
        response += `${categoryName}: ${itemsList}. `;
      }
    }
    
    response += `Rango de precios: ${store.averagePrice} pesos. `;
    
    if (store.specialties && store.specialties.length > 0) {
      response += `Te recomendamos especialmente: ${store.specialties.slice(0, 2).join(' y ')}. `;
    }
    
    if (store.promotions && store.promotions.length > 0) {
      response += `Promociones: ${store.promotions.join('. ')}. `;
    }
    
    if (store.delivery) {
      response += 'Servicio a domicilio disponible. ';
    }
    
    if (store.reservations) {
      response += 'Aceptan reservas. ';
    }
    
    response += `Más información: ${store.phone}. ¿Algo más?`;
    
    return response;
  }
  
  // ============================================
  // UNKNOWN
  // ============================================
  
  responseUnknown() {
    return this.getVariedResponse('didNotUnderstand');
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  getVariedResponse(templateKey) {
    const templates = responseTemplates[templateKey];
    
    if (!templates || templates.length === 0) {
      return 'Información no disponible.';
    }
    
    if (templates.length === 1) {
      return templates[0];
    }
    
    const availableTemplates = templates.filter(
      t => !this.lastResponses.includes(t)
    );
    
    const options = availableTemplates.length > 0 ? 
                    availableTemplates : templates;
    
    const selected = options[Math.floor(Math.random() * options.length)];
    
    this.lastResponses.push(selected);
    if (this.lastResponses.length > 5) {
      this.lastResponses.shift();
    }
    
    return selected;
  }
}