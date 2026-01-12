// src/routes/twilioRoutes.js

import express from 'express';
import twilio from 'twilio';
import { IntentDetector } from '../services/intentDetector.js';  // ← CAMBIO AQUÍ
import { ResponseGenerator } from '../services/responseGenerator.js';  // ← CAMBIO AQUÍ
import { contextManager } from '../utils/contextManager.js';
import { logger } from '../utils/logger.js';


const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

const intentDetector = new IntentDetector();
const responseGenerator = new ResponseGenerator();

/**
 * Webhook inicial - Primera vez que llama
 */
router.post('/incoming', (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  
  logger.info('Llamada entrante', { callSid, from });
  
  const twiml = new VoiceResponse();
  
  // Saludo inicial corto
  twiml.say({
    voice: 'Polly.Lupe',
    language: 'es-MX'
  }, 'Centro Comercial Puente de San Gil. ¿En qué te ayudo?');
  
  // Esperar respuesta
  twiml.gather({
    input: 'speech',
    language: 'es-MX',
    timeout: 5,
    speechTimeout: 'auto',
    action: '/webhooks/twilio/process-speech',
    method: 'POST'
  });
  
  // Si no responde
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
 */
router.post('/process-speech', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult;
  const confidence = req.body.Confidence;
  
  logger.info('Procesando voz', { callSid, speechResult, confidence });
  
  const twiml = new VoiceResponse();
  
  // Obtener contexto
  const context = contextManager.getContext(callSid);
  
  try {
    // 1. Detectar intención
    const detection = intentDetector.detectIntent(speechResult);
    
    logger.debug('Intención detectada', {
      callSid,
      intent: detection.intent,
      confidence: detection.confidence,
      entities: detection.entities
    });
    
    // 2. Verificar si ya se despidió
    if (contextManager.userSaidGoodbye(callSid)) {
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Hasta pronto.');
      
      twiml.hangup();
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
    
    // 4. Actualizar contexto
    contextManager.updateContext(
      callSid,
      detection.intent,
      detection.entities,
      typeof response === 'string' ? response : response.message
    );
    
    // 5. Manejar diferentes tipos de respuesta
    
    // Caso especial: Transferencia
    if (typeof response === 'object' && response.action === 'transfer') {
      // Decir mensaje
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, response.message);
      
      // Transferir
      twiml.dial({
        callerId: req.body.From
      }, response.transferTo);
      
      // Si no contestan, volver
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, `${response.storeName} no está disponible. ¿Te ayudo con algo más?`);
      
      twiml.gather({
        input: 'speech',
        language: 'es-MX',
        timeout: 5,
        speechTimeout: 'auto',
        action: '/webhooks/twilio/process-speech',
        method: 'POST'
      });
      
      twiml.redirect('/webhooks/twilio/incoming');
    }
    
    // Caso especial: Despedida
    else if (detection.intent === 'despedida') {
      contextManager.markGoodbye(callSid);
      
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, response);
      
      twiml.hangup();
    }
    
    // Caso especial: Negar (ya no necesita nada)
    else if (detection.intent === 'negar') {
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Perfecto. Gracias por llamar. ¡Hasta pronto!');
      
      twiml.hangup();
    }
    
    // Caso normal: Respuesta regular
    else {
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
      
      // Si no responde, despedirse
      twiml.say({
        voice: 'Polly.Lupe',
        language: 'es-MX'
      }, 'Gracias por llamar. ¡Hasta pronto!');
      
      twiml.hangup();
    }
    
  } catch (error) {
    logger.error('Error procesando voz', { error, callSid });
    
    twiml.say({
      voice: 'Polly.Lupe',
      language: 'es-MX'
    }, 'Disculpa, tuve un problema. Intenta de nuevo.');
    
    twiml.redirect('/webhooks/twilio/incoming');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Endpoint de prueba
 */
router.get('/test', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Twilio Routes',
    timestamp: new Date().toISOString()
  });
});

/**
 * Estadísticas de contexto (debug)
 */
router.get('/stats', (req, res) => {
  const stats = contextManager.getStats();
  res.json(stats);
});

export default router;