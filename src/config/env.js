import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Servidor
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Twilio
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },
  
  // APIs Premium (Por ahora vacías)
  deepgram: {
    apiKey: process.env.DEEPGRAM_API_KEY || ''
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || '',
    voiceId: process.env.ELEVENLABS_VOICE_ID || ''
  },
  
  // Redis (Por ahora vacío)
  redis: {
    url: process.env.REDIS_URL || ''
  },
  
  // Monitoreo (Por ahora vacíos)
  datadog: {
    apiKey: process.env.DATADOG_API_KEY || ''
  },
  mixpanel: {
    token: process.env.MIXPANEL_TOKEN || ''
  }
};