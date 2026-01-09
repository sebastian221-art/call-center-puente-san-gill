// Logger simple (por ahora, luego integraremos Datadog)

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

function formatLog(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    level,
    message,
    ...data
  };
  
  return JSON.stringify(logData);
}

export const logger = {
  info: (message, data) => {
    console.log(formatLog(LOG_LEVELS.INFO, message, data));
  },
  
  warn: (message, data) => {
    console.warn(formatLog(LOG_LEVELS.WARN, message, data));
  },
  
  error: (message, data) => {
    console.error(formatLog(LOG_LEVELS.ERROR, message, data));
  },
  
  debug: (message, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
    }
  },
  
  // Logger específico para llamadas
  callLog: (callSid, event, data = {}) => {
    console.log(formatLog(LOG_LEVELS.INFO, `CALL: ${event}`, {
      callSid,
      event,
      ...data
    }));
  }
};