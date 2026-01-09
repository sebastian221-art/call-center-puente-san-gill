import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { stores, mallInfo } from '../data/stores.js';

/**
 * Servicio de OpenAI GPT-4o
 * Procesa lenguaje natural y genera respuestas inteligentes
 */
export class OpenAIService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.isEnabled = !!this.apiKey;
    this.model = 'gpt-4o'; // Modelo más avanzado
    
    if (!this.isEnabled) {
      logger.warn('OpenAI no configurado - usando detección de intención básica');
    }
  }
  
  /**
   * Detecta la intención del usuario usando GPT-4o
   */
  async detectIntent(userMessage) {
    if (!this.isEnabled) {
      throw new Error('OpenAI API key no configurada');
    }
    
    try {
      logger.info('Detectando intención con GPT-4o', { userMessage });
      
      const prompt = this.buildIntentPrompt(userMessage);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: prompt.system
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const result = data.choices[0].message.content;
      
      logger.info('Intención detectada', { result });
      
      // Parsear respuesta JSON
      return JSON.parse(result);
      
    } catch (error) {
      logger.error('Error en OpenAI detectIntent', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Genera una respuesta inteligente
   */
  async generateResponse(userMessage, context = {}) {
    if (!this.isEnabled) {
      throw new Error('OpenAI API key no configurada');
    }
    
    try {
      logger.info('Generando respuesta con GPT-4o', { userMessage, context });
      
      const prompt = this.buildResponsePrompt(context);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: prompt.system
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          temperature: 0.7,
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const responseText = data.choices[0].message.content;
      
      logger.info('Respuesta generada', { responseText });
      
      return responseText.trim();
      
    } catch (error) {
      logger.error('Error en OpenAI generateResponse', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Construye el prompt para detección de intención
   */
  buildIntentPrompt(userMessage) {
    const storeNames = stores.map(s => s.name).join(', ');
    
    return {
      system: `Eres un asistente del Centro Comercial Puente de San Gil.
      
Tu tarea es detectar la intención del usuario y extraer entidades.

Locales disponibles: ${storeNames}

Responde SOLO con un JSON en este formato:
{
  "intent": "buscar_local|horarios|ubicacion|transferir|servicios|despedida|unknown",
  "confidence": 0.0-1.0,
  "storeName": "nombre del local o null",
  "entities": {}
}

Intenciones:
- buscar_local: buscar, encontrar, dónde está
- horarios: horario, abre, cierra
- ubicacion: ubicación, piso, dónde queda
- transferir: llamar, transferir, hablar con
- servicios: servicios, parqueadero, wifi, baños
- despedida: adiós, gracias, chao
- unknown: no entendido

Ejemplo:
Usuario: "Busco Nike"
Respuesta: {"intent":"buscar_local","confidence":0.95,"storeName":"Nike Store","entities":{}}`
    };
  }
  
  /**
   * Construye el prompt para generar respuestas
   */
  buildResponsePrompt(context) {
    return {
      system: `Eres la recepcionista virtual del Centro Comercial Puente de San Gil.

Información del centro comercial:
- Dirección: ${mallInfo.address}
- Horario: ${mallInfo.hours.general}
- Teléfono: ${mallInfo.phone}

Locales: ${stores.map(s => `${s.name} (${s.floor})`).join(', ')}

Instrucciones:
- Responde de forma amable y profesional
- Máximo 2-3 oraciones
- Si no sabes algo, admítelo
- No inventes información
- Usa un tono conversacional en español colombiano

${context.storeName ? `Contexto: El usuario pregunta sobre ${context.storeName}` : ''}`
    };
  }
}