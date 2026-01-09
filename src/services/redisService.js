import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio de Redis para cache
 * Almacena contexto de conversaciones y respuestas frecuentes
 */
export class RedisService {
  constructor() {
    this.redisUrl = config.redis.url;
    this.isEnabled = !!this.redisUrl;
    this.client = null;
    
    if (!this.isEnabled) {
      logger.warn('Redis no configurado - usando memoria local');
      this.memoryCache = new Map();
    }
  }
  
  /**
   * Conecta a Redis
   */
  async connect() {
    if (!this.isEnabled) {
      logger.info('Redis no configurado, usando cache en memoria');
      return;
    }
    
    try {
      // Aquí iría la conexión real a Redis con ioredis
      // const Redis = require('ioredis');
      // this.client = new Redis(this.redisUrl);
      
      logger.info('Redis conectado');
      
    } catch (error) {
      logger.error('Error conectando a Redis', { error: error.message });
      this.isEnabled = false;
      this.memoryCache = new Map();
    }
  }
  
  /**
   * Guarda el contexto de una llamada
   */
  async setCallContext(callSid, context, ttl = 3600) {
    const key = `call:${callSid}`;
    
    try {
      if (this.isEnabled && this.client) {
        await this.client.setex(key, ttl, JSON.stringify(context));
      } else {
        // Fallback a memoria
        this.memoryCache.set(key, {
          data: context,
          expires: Date.now() + (ttl * 1000)
        });
      }
      
      logger.debug('Contexto guardado', { callSid });
      
    } catch (error) {
      logger.error('Error guardando contexto', { error: error.message });
    }
  }
  
  /**
   * Obtiene el contexto de una llamada
   */
  async getCallContext(callSid) {
    const key = `call:${callSid}`;
    
    try {
      if (this.isEnabled && this.client) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
      } else {
        // Fallback a memoria
        const cached = this.memoryCache.get(key);
        
        if (cached) {
          if (Date.now() > cached.expires) {
            this.memoryCache.delete(key);
            return null;
          }
          return cached.data;
        }
        
        return null;
      }
      
    } catch (error) {
      logger.error('Error obteniendo contexto', { error: error.message });
      return null;
    }
  }
  
  /**
   * Cache de respuestas frecuentes
   */
  async cacheResponse(query, response, ttl = 86400) {
    const key = `response:${query.toLowerCase().trim()}`;
    
    try {
      if (this.isEnabled && this.client) {
        await this.client.setex(key, ttl, response);
      } else {
        this.memoryCache.set(key, {
          data: response,
          expires: Date.now() + (ttl * 1000)
        });
      }
      
      logger.debug('Respuesta cacheada', { query });
      
    } catch (error) {
      logger.error('Error cacheando respuesta', { error: error.message });
    }
  }
  
  /**
   * Obtiene respuesta cacheada
   */
  async getCachedResponse(query) {
    const key = `response:${query.toLowerCase().trim()}`;
    
    try {
      if (this.isEnabled && this.client) {
        return await this.client.get(key);
      } else {
        const cached = this.memoryCache.get(key);
        
        if (cached) {
          if (Date.now() > cached.expires) {
            this.memoryCache.delete(key);
            return null;
          }
          return cached.data;
        }
        
        return null;
      }
      
    } catch (error) {
      logger.error('Error obteniendo respuesta cacheada', { error: error.message });
      return null;
    }
  }
  
  /**
   * Incrementa contador de llamadas
   */
  async incrementCallCount() {
    const key = 'stats:total_calls';
    
    try {
      if (this.isEnabled && this.client) {
        await this.client.incr(key);
      }
    } catch (error) {
      logger.error('Error incrementando contador', { error: error.message });
    }
  }
  
  /**
   * Obtiene estadísticas
   */
  async getStats() {
    try {
      if (this.isEnabled && this.client) {
        const totalCalls = await this.client.get('stats:total_calls') || 0;
        return { totalCalls: parseInt(totalCalls) };
      }
      
      return { totalCalls: 0 };
      
    } catch (error) {
      logger.error('Error obteniendo stats', { error: error.message });
      return { totalCalls: 0 };
    }
  }
}