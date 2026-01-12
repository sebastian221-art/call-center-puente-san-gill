// src/services/ResponseGenerator.js

import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { responseTemplates, getRandomResponse, fillTemplate } from '../data/responseTemplates.js';
import { logger } from '../utils/logger.js';

/**
 * Genera respuestas naturales y variadas
 * Usa templates con múltiples variaciones para sonar más humano
 */
export class ResponseGenerator {
  
  constructor() {
    this.lastResponses = []; // Para evitar repetir respuestas recientes
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
        return this.responsePreciosComida();
      
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
  // MÉTODOS DE RESPUESTA
  // ============================================
  
  // Control de flujo
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
  
  // Emergencias
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
    return this.getVariedResponse('complaints'); // Mismo proceso
  }
  
  // Búsqueda y ubicación
  responseBuscarLocal(entities) {
    if (!entities.storeName) {
      return this.getVariedResponse('searchStore_noName');
    }
    
    const store = entities.storeData;
    const template = this.getVariedResponse('searchStore_found');
    
    return fillTemplate(template, {
      name: store.name,
      floor: store.floor,
      zone: store.zone
    }) + ' ' + this.getVariedResponse('confirmation');
  }
  
  responseUbicacion(entities) {
    if (!entities.storeName) {
      return this.responseUbicacionMall();
    }
    
    const store = entities.storeData;
    const template = this.getVariedResponse('searchStore_found');
    
    return fillTemplate(template, {
      name: store.name,
      floor: store.floor,
      zone: store.zone
    }) + ' ' + this.getVariedResponse('confirmation');
  }
  
  responseUbicacionMall() {
    return this.getVariedResponse('location_address') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseComoLlegar() {
    return this.getVariedResponse('location_directions') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  // Horarios
  responseHorarioMall() {
    return this.getVariedResponse('hours_mall') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseHorarioLocal(entities) {
    if (!entities.storeName) {
      return 'Dime el nombre del local y te doy su horario.';
    }
    
    const store = entities.storeData;
    const template = this.getVariedResponse('hours_store');
    
    return fillTemplate(template, {
      name: store.name,
      hours: store.hours
    }) + ' ' + this.getVariedResponse('confirmation');
  }
  
  // Contacto
  responseNumeroTelefono(entities) {
    if (!entities.storeName) {
      return 'Dime el nombre del local y te doy su número.';
    }
    
    const store = entities.storeData;
    const template = this.getVariedResponse('phoneNumber');
    
    return fillTemplate(template, {
      name: store.name,
      phone: store.phone
    }) + ' ' + this.getVariedResponse('confirmation');
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
      return 'De qué restaurante quieres pedir? Tenemos Crepes & Waffles, Subway, La Toscana.';
    }
    
    const store = entities.storeData;
    
    // Verificar si es restaurante
    if (store.category !== 'restaurante') {
      return `${store.name} no es un restaurante. Los restaurantes disponibles son Crepes & Waffles, Subway y La Toscana. ¿De cuál quieres pedir?`;
    }
    
    // Verificar si tiene delivery
    if (!store.delivery) {
      return `${store.name} no tiene servicio a domicilio. Te puedo dar su número para que consultes: ${store.phone}`;
    }
    
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
  
  // Servicios
  responseParqueadero() {
    const location = this.getVariedResponse('parking_location');
    const details = this.getVariedResponse('parking_full');
    return `${location} ${details}`;
  }
  
  responseParqueaderoCosto() {
    return this.getVariedResponse('parking_cost') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseBanos() {
    return this.getVariedResponse('bathrooms') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseCajero() {
    return this.getVariedResponse('atm') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseWifi() {
    return this.getVariedResponse('wifi') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseZonaJuegos() {
    return this.getVariedResponse('playground') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseSalaLactancia() {
    return this.getVariedResponse('nursing_room') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseAccesibilidad() {
    return this.getVariedResponse('accessibility') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseTarjetaRegalo() {
    return this.getVariedResponse('giftCard') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  // Categorías
  responseRestaurantes() {
    return this.getVariedResponse('restaurants_list');
  }
  
  responseTiendasRopa() {
    return this.getVariedResponse('clothing_list');
  }
  
  responseTiendasDeportes() {
    return 'Tiendas deportivas: Nike y Adidas, ambas en segundo piso zona norte. ¿Información de alguna?';
  }
  
  responseBancos() {
    return this.getVariedResponse('banks');
  }
  
  responseFarmacias() {
    return 'Drogas La Rebaja en primer piso, local 108. Medicamentos, cuidado personal y belleza. Horario: lunes a sábado 8 AM a 8 PM. ¿Algo más?';
  }
  
  responseSupermercado() {
    return 'Éxito Express, primer piso local 120. Alimentos, productos del hogar, panadería. Abierto lunes a sábado 8 AM a 9 PM. ¿Te ayudo con algo más?';
  }
  
  // Cine
  responseCine() {
    return this.getVariedResponse('cinema_info') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseCineCartelera() {
    return this.getVariedResponse('cinema_schedule');
  }
  
  responseCineHorarios() {
    return this.getVariedResponse('cinema_schedule');
  }
  
  responseCinePrecios() {
    return this.getVariedResponse('cinema_prices') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  // Comercial
  responsePromociones() {
    return this.getVariedResponse('promotions_general') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responseEventos() {
    return this.getVariedResponse('events') + ' ' + 
           this.getVariedResponse('confirmation');
  }
  
  responsePreciosComida() {
    return this.getVariedResponse('foodPrices_general');
  }
  
  responseMenuRestaurante(entities) {
    if (!entities.storeName) {
      return this.getVariedResponse('menu_noRestaurant');
    }
    
    const store = entities.storeData;
    
    if (store.category !== 'restaurante') {
      return `${store.name} no es un restaurante. ¿Quieres información de Crepes & Waffles, Subway o La Toscana?`;
    }
    
    if (!store.menu) {
      return `${store.name}: información de menú al ${store.phone}. ¿Algo más?`;
    }
    
    // Construir respuesta de menú
    const menuCategories = Object.keys(store.menu);
    const firstCategory = menuCategories[0];
    const items = store.menu[firstCategory].slice(0, 3).join(', ');
    
    return `${store.name} ofrece ${items} y más. Rango de precio: ${store.averagePrice} pesos. Para menú completo llama al ${store.phone}. ¿Algo más?`;
  }
  
  // Unknown
  responseUnknown() {
    return this.getVariedResponse('didNotUnderstand');
  }
  
  // ============================================
  // UTILIDADES
  // ============================================
  
  /**
   * Obtiene una respuesta variada evitando repeticiones recientes
   */
  getVariedResponse(templateKey) {
    const templates = responseTemplates[templateKey];
    
    if (!templates || templates.length === 0) {
      return 'Información no disponible.';
    }
    
    // Si solo hay una opción, usarla
    if (templates.length === 1) {
      return templates[0];
    }
    
    // Filtrar respuestas usadas recientemente
    const availableTemplates = templates.filter(
      t => !this.lastResponses.includes(t)
    );
    
    // Si todas fueron usadas, resetear
    const options = availableTemplates.length > 0 ? 
                    availableTemplates : templates;
    
    // Seleccionar aleatoriamente
    const selected = options[Math.floor(Math.random() * options.length)];
    
    // Recordar últimas 5 respuestas
    this.lastResponses.push(selected);
    if (this.lastResponses.length > 5) {
      this.lastResponses.shift();
    }
    
    return selected;
  }
}