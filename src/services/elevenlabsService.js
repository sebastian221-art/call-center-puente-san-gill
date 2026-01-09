import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Servicio de ElevenLabs
 * Convierte texto a voz con calidad premium
 */
export class ElevenLabsService {
  constructor() {
    this.apiKey = config.elevenlabs.apiKey;
    this.voiceId = config.elevenlabs.voiceId;
    this.isEnabled = !!(this.apiKey && this.voiceId);
    
    if (!this.isEnabled) {
      logger.warn('ElevenLabs no configurado - usando voces de Twilio');
    }
  }
  
  /**
   * Convierte texto a audio
   * @param {string} text - Texto a convertir
   * @returns {Promise<Buffer>} - Audio en formato MP3
   */
  async textToSpeech(text) {
    if (!this.isEnabled) {
      throw new Error('ElevenLabs no configurado');
    }
    
    try {
      logger.info('Generando audio con ElevenLabs', { 
        text: text.substring(0, 50) + '...',
        characters: text.length 
      });
      
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0.0,
              use_speaker_boost: true
            }
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`ElevenLabs error: ${response.statusText} - ${error}`);
      }
      
      const audioBuffer = await response.arrayBuffer();
      
      logger.info('Audio generado exitosamente', { 
        size: audioBuffer.byteLength 
      });
      
      return Buffer.from(audioBuffer);
      
    } catch (error) {
      logger.error('Error en ElevenLabs', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Obtiene la URL de audio generado (para usar con Twilio)
   */
  async getAudioUrl(text) {
    const audio = await this.textToSpeech(text);
    
    // TODO: Subir a S3 o servicio de storage y retornar URL
    // Por ahora solo retornamos el buffer
    return audio;
  }
  
  /**
   * Lista las voces disponibles
   */
  async listVoices() {
    if (!this.isEnabled) {
      throw new Error('ElevenLabs no configurado');
    }
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.voices;
      
    } catch (error) {
      logger.error('Error listando voces', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Obtiene información de una voz específica
   */
  async getVoiceInfo(voiceId = null) {
    const id = voiceId || this.voiceId;
    
    if (!this.isEnabled) {
      throw new Error('ElevenLabs no configurado');
    }
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/voices/${id}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': this.apiKey
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      logger.error('Error obteniendo info de voz', { error: error.message });
      throw error;
    }
  }
}