import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio de Speech-to-Text con Deepgram
 * Convierte audio a texto en español
 */
export class DeepgramService {
  constructor() {
    this.apiKey = config.deepgram.apiKey;
    this.isEnabled = !!this.apiKey;
    
    if (!this.isEnabled) {
      logger.warn('Deepgram no configurado - usando Twilio speech recognition');
    }
  }
  
  /**
   * Transcribe audio a texto
   * @param {Buffer} audioBuffer - Audio en formato WAV o MP3
   * @returns {Promise<string>} - Texto transcrito
   */
  async transcribe(audioBuffer) {
    if (!this.isEnabled) {
      throw new Error('Deepgram API key no configurada');
    }
    
    try {
      logger.info('Transcribiendo audio con Deepgram');
      
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'audio/wav'
        },
        body: JSON.stringify({
          model: 'nova-2',
          language: 'es',
          punctuate: true,
          diarize: false,
          smart_format: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Deepgram error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';
      
      logger.info('Transcripción exitosa', { 
        transcript,
        confidence: data.results?.channels[0]?.alternatives[0]?.confidence 
      });
      
      return transcript;
      
    } catch (error) {
      logger.error('Error en Deepgram', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Transcribe desde URL de audio
   * @param {string} audioUrl - URL del audio
   * @returns {Promise<string>}
   */
  async transcribeFromUrl(audioUrl) {
    if (!this.isEnabled) {
      throw new Error('Deepgram API key no configurada');
    }
    
    try {
      logger.info('Transcribiendo desde URL', { audioUrl });
      
      const response = await fetch('https://api.deepgram.com/v1/listen', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: audioUrl,
          model: 'nova-2',
          language: 'es',
          punctuate: true,
          diarize: false,
          smart_format: true
        })
      });
      
      if (!response.ok) {
        throw new Error(`Deepgram error: ${response.statusText}`);
      }
      
      const data = await response.json();
      const transcript = data.results?.channels[0]?.alternatives[0]?.transcript || '';
      
      logger.info('Transcripción exitosa desde URL', { transcript });
      
      return transcript;
      
    } catch (error) {
      logger.error('Error transcribiendo desde URL', { error: error.message });
      throw error;
    }
  }
}