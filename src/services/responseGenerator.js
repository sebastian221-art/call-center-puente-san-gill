import { INTENTS } from '../config/constants.js';
import { mallInfo } from '../data/stores.js';
import { logger } from '../utils/logger.js';

/**
 * Genera respuestas basadas en la intención detectada
 * Por ahora usa templates, luego integraremos OpenAI
 */
export class ResponseGenerator {
  
  generateResponse(intent, entities = {}) {
    logger.debug('Generando respuesta', { intent, entities });
    
    switch (intent) {
      case INTENTS.BUSCAR_LOCAL:
        return this.responseBuscarLocal(entities);
      
      case INTENTS.HORARIOS:
        return this.responseHorarios(entities);
      
      case INTENTS.UBICACION:
        return this.responseUbicacion(entities);
      
      case INTENTS.TRANSFERIR:
        return this.responseTransferir(entities);
      
      case INTENTS.SERVICIOS:
        return this.responseServicios();
      
      case INTENTS.DESPEDIDA:
        return this.responseDespedida();
      
      case INTENTS.UNKNOWN:
      default:
        return this.responseUnknown();
    }
  }
  
  responseBuscarLocal(entities) {
    if (!entities.storeName) {
      return '¿Qué local estás buscando? Puedo ayudarte con Nike, Subway, Cinemark, La Toscana, o Davivienda.';
    }
    
    const store = entities.storeData;
    return `${store.name} está ubicado en el ${store.floor}, ${store.zone}. ${store.description}. ¿Necesitas algo más?`;
  }
  
  responseHorarios(entities) {
    if (!entities.storeName) {
      return `Nuestro horario general es ${mallInfo.hours.general}. ¿De qué local específico necesitas el horario?`;
    }
    
    const store = entities.storeData;
    return `${store.name} está abierto ${store.hours}. ¿Te puedo ayudar con algo más?`;
  }
  
  responseUbicacion(entities) {
    if (!entities.storeName) {
      return `Estamos ubicados en ${mallInfo.address}. ¿Buscas algún local en específico?`;
    }
    
    const store = entities.storeData;
    return `${store.name} lo encuentras en el ${store.floor}, ${store.zone}. ¿Algo más en lo que pueda ayudarte?`;
  }
  
  responseTransferir(entities) {
    if (!entities.storeName) {
      return '¿A qué local te gustaría que te transfiera? Tenemos Nike, Subway, Cinemark, La Toscana, y Davivienda.';
    }
    
    const store = entities.storeData;
    return {
      message: `Te voy a transferir con ${store.name}. Un momento por favor.`,
      transferTo: store.phone,
      storeName: store.name
    };
  }
  
  responseServicios() {
    const servicios = mallInfo.services.slice(0, 4).join(', ');
    return `Contamos con los siguientes servicios: ${servicios}, y más. ¿Necesitas información sobre algún servicio en específico?`;
  }
  
  responseDespedida() {
    return 'Gracias por llamar al Centro Comercial Puente de San Gil. ¡Que tengas un excelente día!';
  }
  
  responseUnknown() {
    return 'Disculpa, no entendí bien. Puedo ayudarte a encontrar locales, darte horarios, o transferirte. ¿Qué necesitas?';
  }
}