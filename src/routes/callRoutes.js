import express from 'express';
import twilio from 'twilio';
import { MESSAGES, VOICES, LANGUAGE, TIMEOUTS } from '../config/constants.js';
import { IntentDetector } from '../services/intentDetector.js';
import { ResponseGenerator } from '../services/responseGenerator.js';
import { logger } from '../utils/logger.js';

const router = express.Router();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Instanciar servicios
const intentDetector = new IntentDetector();
const responseGenerator = new ResponseGenerator();

/**
 * Ruta principal: Recibe la llamada inicial
 */
router.post('/incoming', (req, res) => {
  const callSid = req.body.CallSid;
  const from = req.body.From;
  
  logger.callLog(callSid, 'INCOMING_CALL', { from });
  
  const twiml = new VoiceResponse();
  
  // Mensaje de bienvenida
  twiml.say({
    voice: VOICES.SPANISH_FEMALE,
    language: LANGUAGE
  }, MESSAGES.WELCOME);
  
  // Pausar un segundo
  twiml.pause({ length: TIMEOUTS.PAUSE });
  
  // Recoger respuesta del usuario
  const gather = twiml.gather({
    input: 'speech',
    language: LANGUAGE,
    timeout: TIMEOUTS.SPEECH,
    speechTimeout: 'auto',
    action: '/webhooks/twilio/process-speech',
    method: 'POST'
  });
  
  // Si no responde, repetir
  twiml.say({
    voice: VOICES.SPANISH_FEMALE,
    language: LANGUAGE
  }, MESSAGES.NO_RESPONSE);
  
  // Redirigir al inicio
  twiml.redirect('/webhooks/twilio/incoming');
  
  logger.callLog(callSid, 'WELCOME_SENT');
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Ruta de procesamiento: Analiza lo que dijo el usuario
 */
router.post('/process-speech', (req, res) => {
  const callSid = req.body.CallSid;
  const speechResult = req.body.SpeechResult || '';
  
  logger.callLog(callSid, 'SPEECH_RECEIVED', { speechResult });
  
  const twiml = new VoiceResponse();
  
  try {
    // Detectar intención
    const detection = intentDetector.detectIntent(speechResult);
    logger.callLog(callSid, 'INTENT_DETECTED', detection);
    
    // Generar respuesta
    const response = responseGenerator.generateResponse(detection.intent, detection.entities);
    logger.callLog(callSid, 'RESPONSE_GENERATED', { response });
    
    // Si la respuesta incluye transferencia
    if (typeof response === 'object' && response.transferTo) {
      twiml.say({
        voice: VOICES.SPANISH_FEMALE,
        language: LANGUAGE
      }, response.message);
      
      twiml.pause({ length: 1 });
      
      // Intentar transferir
      twiml.dial({
        timeout: 30,
        action: '/webhooks/twilio/transfer-status',
        method: 'POST'
      }, response.transferTo);
      
      logger.callLog(callSid, 'TRANSFER_INITIATED', { to: response.transferTo });
    } else {
      // Respuesta normal
      twiml.say({
        voice: VOICES.SPANISH_FEMALE,
        language: LANGUAGE
      }, response);
      
      twiml.pause({ length: TIMEOUTS.PAUSE });
      
      // Preguntar si necesita algo más
      const gather = twiml.gather({
        input: 'speech',
        language: LANGUAGE,
        timeout: TIMEOUTS.SPEECH,
        speechTimeout: 'auto',
        action: '/webhooks/twilio/process-speech',
        method: 'POST'
      });
      
      gather.say({
        voice: VOICES.SPANISH_FEMALE,
        language: LANGUAGE
      }, MESSAGES.CONTINUE);
      
      // Si no responde, despedirse
      twiml.say({
        voice: VOICES.SPANISH_FEMALE,
        language: LANGUAGE
      }, MESSAGES.GOODBYE);
      
      twiml.hangup();
    }
    
  } catch (error) {
    logger.error('Error procesando llamada', { callSid, error: error.message });
    
    twiml.say({
      voice: VOICES.SPANISH_FEMALE,
      language: LANGUAGE
    }, MESSAGES.ERROR);
    
    twiml.hangup();
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Ruta de estado de transferencia
 */
router.post('/transfer-status', (req, res) => {
  const callSid = req.body.CallSid;
  const dialCallStatus = req.body.DialCallStatus;
  
  logger.callLog(callSid, 'TRANSFER_STATUS', { status: dialCallStatus });
  
  const twiml = new VoiceResponse();
  
  if (dialCallStatus === 'completed') {
    // Transferencia exitosa
    twiml.say({
      voice: VOICES.SPANISH_FEMALE,
      language: LANGUAGE
    }, MESSAGES.GOODBYE);
  } else {
    // Transferencia fallida
    twiml.say({
      voice: VOICES.SPANISH_FEMALE,
      language: LANGUAGE
    }, MESSAGES.TRANSFER_FAILED);
    
    // Volver al menú principal
    twiml.redirect('/webhooks/twilio/incoming');
  }
  
  res.type('text/xml');
  res.send(twiml.toString());
});

/**
 * Ruta de prueba para verificar que el servidor está funcionando
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Call Center Premium'
  });
});

export default router;