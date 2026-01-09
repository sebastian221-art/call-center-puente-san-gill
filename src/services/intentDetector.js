import { INTENTS } from '../config/constants.js';
import { stores } from '../data/stores.js';
import { logger } from '../utils/logger.js';

/**
 * Detecta la intención del usuario basándose en su mensaje
 * Por ahora usa reglas simples, luego integraremos OpenAI
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
    
    // Detectar despedida
    if (this.isDespedida(normalizedText)) {
      return {
        intent: INTENTS.DESPEDIDA,
        confidence: 0.9,
        entities: {}
      };
    }
    
    // Detectar horarios
    if (this.isHorarios(normalizedText)) {
      return {
        intent: INTENTS.HORARIOS,
        confidence: 0.85,
        entities: this.extractStore(normalizedText)
      };
    }
    
    // Detectar búsqueda de local
    if (this.isBuscarLocal(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: store.storeName ? 0.9 : 0.6,
        entities: store
      };
    }
    
    // Detectar transferencia
    if (this.isTransferir(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.TRANSFERIR,
        confidence: 0.85,
        entities: store
      };
    }
    
    // Detectar ubicación
    if (this.isUbicacion(normalizedText)) {
      const store = this.extractStore(normalizedText);
      return {
        intent: INTENTS.UBICACION,
        confidence: 0.8,
        entities: store
      };
    }
    
    // Detectar servicios
    if (this.isServicios(normalizedText)) {
      return {
        intent: INTENTS.SERVICIOS,
        confidence: 0.8,
        entities: {}
      };
    }
    
    // Default: intento de búsqueda de local
    const store = this.extractStore(normalizedText);
    if (store.storeName) {
      return {
        intent: INTENTS.BUSCAR_LOCAL,
        confidence: 0.7,
        entities: store
      };
    }
    
    return {
      intent: INTENTS.UNKNOWN,
      confidence: 0.3,
      entities: {}
    };
  }
  
  isDespedida(text) {
    const keywords = ['adios', 'adiós', 'chao', 'hasta luego', 'gracias', 'bye', 'nos vemos'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isHorarios(text) {
    const keywords = ['horario', 'hora', 'abre', 'cierra', 'abierto', 'cerrado', 'cuando abre'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isBuscarLocal(text) {
    const keywords = ['busco', 'dónde', 'donde', 'encontrar', 'hay', 'queda', 'ubicación', 'ubicacion'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isTransferir(text) {
    const keywords = ['llamar', 'transferir', 'comunicar', 'hablar con', 'contactar', 'teléfono', 'telefono'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isUbicacion(text) {
    const keywords = ['dónde está', 'donde esta', 'piso', 'ubicación', 'ubicacion', 'queda'];
    return keywords.some(kw => text.includes(kw));
  }
  
  isServicios(text) {
    const keywords = ['servicios', 'parqueadero', 'baño', 'wifi', 'cajero', 'ascensor'];
    return keywords.some(kw => text.includes(kw));
  }
  
  extractStore(text) {
    // Buscar coincidencias con nombres y keywords de locales
    for (const store of stores) {
      // Buscar nombre exacto
      if (text.includes(store.name.toLowerCase())) {
        return {
          storeName: store.name,
          storeId: store.id,
          storeData: store
        };
      }
      
      // Buscar keywords
      for (const keyword of store.keywords) {
        if (text.includes(keyword.toLowerCase())) {
          return {
            storeName: store.name,
            storeId: store.id,
            storeData: store
          };
        }
      }
    }
    
    return {};
  }
}