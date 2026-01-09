// Configuración de voces de Twilio (Por ahora usamos estas, luego cambiaremos a ElevenLabs)
export const VOICES = {
  SPANISH_FEMALE: 'Polly.Lupe',
  SPANISH_MALE: 'Polly.Miguel'
};

export const LANGUAGE = 'es-MX';

// Tiempos de espera
export const TIMEOUTS = {
  SPEECH: 5,      // Segundos para que el usuario hable
  GATHER: 10,     // Segundos máximo de espera total
  PAUSE: 1        // Pausa entre mensajes
};

// Mensajes del sistema
export const MESSAGES = {
  WELCOME: 'Bienvenido al Centro Comercial Puente de San Gil. Esta llamada es atendida por un asistente con inteligencia artificial. ¿En qué puedo ayudarte?',
  
  NO_RESPONSE: 'No escuché tu respuesta. Por favor, intenta de nuevo.',
  
  NOT_UNDERSTOOD: 'Disculpa, no entendí bien tu solicitud. ¿Puedes repetir qué necesitas?',
  
  GOODBYE: 'Gracias por llamar al Centro Comercial Puente de San Gil. ¡Que tengas un excelente día!',
  
  ERROR: 'Disculpa, tuve un problema técnico. Por favor intenta llamar nuevamente.',
  
  CONTINUE: '¿Hay algo más en lo que pueda ayudarte?',
  
  TRANSFERRING: 'Un momento por favor, te voy a transferir.',
  
  TRANSFER_FAILED: 'Lo siento, no pude completar la transferencia. ¿Deseas que intente de nuevo?'
};

// Estados de la llamada
export const CALL_STATES = {
  INIT: 'init',
  WELCOME: 'welcome',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  RESPONDING: 'responding',
  TRANSFERRING: 'transferring',
  END: 'end',
  ERROR: 'error'
};

// Intenciones que puede detectar el sistema
export const INTENTS = {
  BUSCAR_LOCAL: 'buscar_local',
  HORARIOS: 'horarios',
  UBICACION: 'ubicacion',
  TRANSFERIR: 'transferir',
  SERVICIOS: 'servicios',
  EVENTOS: 'eventos',
  AYUDA: 'ayuda',
  DESPEDIDA: 'despedida',
  UNKNOWN: 'unknown'
};