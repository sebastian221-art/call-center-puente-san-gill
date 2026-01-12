// src/routes/twilioRoutes.js

import express from 'express';
import twilio from 'twilio';
import { IntentDetector } from '../services/intentDetector.js';
import { ResponseGenerator } from '../services/responseGenerator.js';
import { contextManager } from '../utils/contextManager.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

/**
 * IMPORTANTE: INDEPENDENCIA DE LLAMADAS
 * 
 * Cada llamada crea NUEVAS INSTANCIAS de:
 * - IntentDetector: para detectar intenciones
 * - ResponseGenerator: para generar respuestas
 * 
 * Esto garantiza que:
 * 1. Llamada A no afecta a Llamada B
 * 2. Cada llamada tiene su propio estado limpio
 * 3. No hay contaminación de datos entre llamadas
 * 4. Sistema completamente stateless
 * 
 * El contextManager SÍ es compartido pero maneja contextos
 * SEPARADOS por CallSid (ID único de cada llamada)
 */

/**
 * Webhook inicial - Primera vez que llama
 * Se ejecuta cuando Twilio recibe una llamada entrante
 */
router.post('/incoming', (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  
  logger.info('🔵 NUEVA LLAMADA ENTRANTE', { callSid, from });
  
  const twiml = new VoiceResponse();
  
  // Saludo inicial CORTO (optimizado para costos)
  twiml.say({
    voice: 'Polly.Lupe',
    language: 'es-MX'
  }, 'Centro Comercial Puente de San Gil. ¿En qué te ayudo?');
  
  // Esperar respuesta del usuario
  twiml.gather({
    input: 'speech',
    language: 'es-MX',
    timeout: 5,
    speechTimeout: 'auto',
    action: '/webhooks/twilio/process-speech',
    method: 'POST'
  });
  
  // Si no responde en 5 segundos
  twiml.say({
    voice: 'Polly.Lupe',
    language: 'es-MX'
  }, 'No escuché tu respuesta. Intenta de nuevo.');
  
  twiml.redirect('/webhooks/twilio/incoming');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Procesa lo que dijo el usuario
 * 
 * IMPORTANTE: Aquí se crean NUEVAS INSTANCIAS para cada procesamiento
 * Esto garantiza independencia total entre llamadas
 */
router.post('/process-speech', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult;
  const confidence = req.body.Confidence;
  
  logger.info('🎤 Procesando voz', { callSid, speechResult, confidence });
  
  const twiml = new VoiceResponse();
  
  // Obtener contexto de ESTA llamada específica
  // contextManager mantiene contextos separados por CallSid
  const context = contextManager.getContext(callSid);
  
  try {
    // ============================================
    // CREAR INSTANCIAS INDEPENDIENTES
    // ============================================
    
    // Nueva instancia de IntentDetector (sin estado compartido)
    const intentDetector = new IntentDetector();
    
    // Nueva instancia de ResponseGenerator (sin estado compartido)
    const responseGenerator = new ResponseGenerator();
    
    logger.debug('✅ Instancias creadas para CallSid:', { callSid });
    
    // ============================================
    // PROCESAMIENTO
    // ============================================
    
    // 1. Detectar intención
    const detection = intentDetector.detectIntent(speechResult);
    
    logger.debug('🎯 Intención detectada', {
      callSid,
      intent: detection.intent,
      confidence: detection.confidence,
      storeName: detection.entities.storeName || 'N/A'
    });
    
    // 2. Verificar si ya se despidió
    if (contextManager.userSaidGoodbye(callSid)) {
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Hasta pronto.');
      
      twiml.hangup();
      
      // Limpiar contexto al finalizar
      contextManager.clearContext(callSid);
      
      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }
    
    // 3. Generar respuesta
    const response = responseGenerator.generateResponse(
      detection.intent,
      detection.entities,
      context
    );
    
    logger.debug('💬 Respuesta generada', { 
      callSid,
      responseType: typeof response,
      hasAction: response?.action || 'no'
    });
    
    // 4. Actualizar contexto de ESTA llamada
    contextManager.updateContext(
      callSid,
      detection.intent,
      detection.entities,
      typeof response === 'string' ? response : response.message
    );
    
    // ============================================
    // MANEJO DE DIFERENTES TIPOS DE RESPUESTA
    // ============================================
    
    // CASO ESPECIAL: Transferencia
    if (typeof response === 'object' && response.action === 'transfer') {
      logger.info('📞 Transfiriendo llamada', { 
        callSid, 
        to: response.transferTo,
        storeName: response.storeName 
      });
      
      // Decir mensaje de transferencia
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, response.message);
      
      // Ejecutar transferencia
      twiml.dial({
        callerId: req.body.From,
        timeout: 30  // 30 segundos de espera
      }, response.transferTo);
      
      // Si no contestan o falla, volver al menú
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, `${response.storeName} no está disponible en este momento. ¿Te ayudo con algo más?`);
      
      // Preguntar si necesita algo más
      twiml.gather({
        input: 'speech',
        language: 'es-MX',
        timeout: 5,
        speechTimeout: 'auto',
        action: '/webhooks/twilio/process-speech',
        method: 'POST'
      });
      
      // Si no responde, redirigir
      twiml.redirect('/webhooks/twilio/incoming');
    }
    
    // CASO ESPECIAL: Despedida
    else if (detection.intent === 'despedida') {
      logger.info('👋 Usuario se despide', { callSid });
      
      // Marcar que se despidió
      contextManager.markGoodbye(callSid);
      
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, response);
      
      // Colgar llamada
      twiml.hangup();
      
      // Limpiar contexto después de 5 minutos
      setTimeout(() => {
        contextManager.clearContext(callSid);
        logger.debug('🧹 Contexto limpiado', { callSid });
      }, 5 * 60 * 1000);
    }
    
    // CASO ESPECIAL: Negación (no necesita nada más)
    else if (detection.intent === 'negar') {
      logger.info('❌ Usuario no necesita más', { callSid });
      
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Perfecto. Gracias por llamar. ¡Hasta pronto!');
      
      // Colgar
      twiml.hangup();
      
      // Limpiar contexto
      setTimeout(() => {
        contextManager.clearContext(callSid);
      }, 5 * 60 * 1000);
    }
    
    // CASO NORMAL: Respuesta regular
    else {
      logger.debug('💬 Respuesta normal', { callSid });
      
      // Reproducir respuesta
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, response);
      
      // Preguntar si necesita algo más
      twiml.gather({
        input: 'speech',
        language: 'es-MX',
        timeout: 5,
        speechTimeout: 'auto',
        action: '/webhooks/twilio/process-speech',
        method: 'POST'
      });
      
      // Si no responde en 5 segundos, despedirse
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Gracias por llamar. ¡Hasta pronto!');
      
      // Colgar después del timeout
      twiml.hangup();
      
      // Limpiar contexto
      setTimeout(() => {
        contextManager.clearContext(callSid);
      }, 5 * 60 * 1000);
    }
    
  } catch (error) {
    logger.error('❌ ERROR procesando voz', { 
      error: error.message,
      stack: error.stack,
      callSid 
    });
    
    // Respuesta de error amigable
    twiml.say({
      voice: 'Polly.Lupe',
      language: 'es-MX'
    }, 'Disculpa, tuve un problema técnico. Intenta de nuevo.');
    
    // Redirigir al inicio
    twiml.redirect('/webhooks/twilio/incoming');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Endpoint de prueba
 * Verifica que el servicio esté funcionando
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Twilio Routes - Call Center Premium',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    features: [
      'Intent Detection (35+ intents)',
      'Entity Extraction',
      'Context Management',
      'Call Transfer',
      'Detailed Responses',
      'Independent Calls'
    ]
  });
});

/**
 * Estadísticas de contexto (debug)
 * Muestra cuántas conversaciones activas hay
 */
router.get('/stats', (req, res) => {
  const stats = contextManager.getStats();
  
  res.json({
    ...stats,
    timestamp: new Date().toISOString(),
    note: 'Each call is independent with isolated state'
  });
});

/**
 * Información de una llamada específica
 * Para debugging
 */
router.get('/context/:callSid', (req, res) => {
  const { callSid } = req.params;
  
  try {
    const summary = contextManager.getContextSummary(callSid);
    
    res.json({
      callSid,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(404).json({
      error: 'Context not found',
      callSid,
      message: 'This call may have ended or context was cleared'
    });
  }
});

/**
 * Limpiar contexto de una llamada específica
 * Para testing o mantenimiento
 */
router.delete('/context/:callSid', (req, res) => {
  const { callSid } = req.params;
  
  contextManager.clearContext(callSid);
  
  logger.info('🧹 Contexto limpiado manualmente', { callSid });
  
  res.json({
    success: true,
    message: 'Context cleared',
    callSid,
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint de salud (health check)
 * Para monitoreo externo
 */
router.get('/health', (req, res) => {
  const stats = contextManager.getStats();
  
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    activeConversations: stats.activeConversations,
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

export default router;