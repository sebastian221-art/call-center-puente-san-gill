/**
 * PhoneFormatter.js
 * 
 * Formatea números de teléfono para TTS
 * "607-724-1234" → "seis cero siete, siete dos cuatro, uno dos tres cuatro"
 */

class PhoneFormatter {
  constructor() {
    this.digitNames = {
      '0': 'cero', '1': 'uno', '2': 'dos', '3': 'tres',
      '4': 'cuatro', '5': 'cinco', '6': 'seis', '7': 'siete',
      '8': 'ocho', '9': 'nueve'
    };
  }

  /**
   * Formatea teléfono para TTS
   */
  formatForSpeech(phone) {
    // Limpiar: "607-724-1234" → "6077241234"
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
      // Formato Colombia: 607 724 1234
      return this.formatColombian(cleaned);
    } else if (cleaned.length === 7) {
      // Formato local: 724 1234
      return this.formatLocal(cleaned);
    }
    
    // Fallback: dígito por dígito
    return this.digitByDigit(cleaned);
  }

  /**
   * Formato colombiano (10 dígitos)
   */
  formatColombian(phone) {
    // 607-724-1234
    const part1 = phone.slice(0, 3);  // 607
    const part2 = phone.slice(3, 6);  // 724
    const part3 = phone.slice(6);     // 1234
    
    return [
      this.groupDigits(part1),
      this.groupDigits(part2),
      this.groupDigits(part3)
    ].join(', ');
  }

  /**
   * Formato local (7 dígitos)
   */
  formatLocal(phone) {
    // 724-1234
    const part1 = phone.slice(0, 3);  // 724
    const part2 = phone.slice(3);     // 1234
    
    return [
      this.groupDigits(part1),
      this.groupDigits(part2)
    ].join(', ');
  }

  /**
   * Agrupa dígitos con espacios
   */
  groupDigits(group) {
    return group.split('').map(d => this.digitNames[d]).join(' ');
  }

  /**
   * Dígito por dígito (fallback)
   */
  digitByDigit(phone) {
    return phone.split('').map(d => this.digitNames[d]).join(', ');
  }

  /**
   * Optimiza para audio
   * Acorta pausas entre grupos
   */
  optimizeForAudio(formattedPhone) {
    // Reemplaza ", " con pausa más corta en SSML
    return formattedPhone.replace(/, /g, '<break time="200ms"/>');
  }
}

module.exports = PhoneFormatter;