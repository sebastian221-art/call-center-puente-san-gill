// src/data/responseTemplates.js

/**
 * Templates de respuestas con múltiples variaciones
 * Para que el sistema no suene repetitivo
 */

export const responseTemplates = {
  
  // ============================================
  // SALUDOS Y BIENVENIDA
  // ============================================
  
  greeting: [
    'Hola, bienvenido a Centro Comercial Puente de San Gil. ¿En qué puedo ayudarte?',
    'Bienvenido al Puente de San Gil. ¿Qué información necesitas?',
    'Hola, ¿en qué te puedo ayudar hoy?',
    'Centro Comercial Puente de San Gil, ¿cómo te ayudo?'
  ],
  
  // ============================================
  // DESPEDIDAS
  // ============================================
  
  goodbye: [
    'Gracias por llamar al Centro Comercial Puente de San Gil. ¡Que tengas excelente día!',
    '¡Hasta pronto! Gracias por contactarnos.',
    'Fue un placer ayudarte. ¡Nos vemos!',
    'Gracias por tu llamada. ¡Buen día!'
  ],
  
  // ============================================
  // CONFIRMACIONES
  // ============================================
  
  confirmation: [
    '¿Algo más en lo que pueda ayudarte?',
    '¿Necesitas información adicional?',
    '¿Te ayudo con algo más?',
    '¿Hay algo más que quieras saber?'
  ],
  
  // ============================================
  // BÚSQUEDA DE LOCAL - Sin nombre específico
  // ============================================
  
  searchStore_noName: [
    '¿Qué tienda o restaurante estás buscando?',
    '¿Cuál local necesitas ubicar?',
    '¿A qué tienda quieres ir?',
    'Dime el nombre del local que buscas.'
  ],
  
  // ============================================
  // BÚSQUEDA DE LOCAL - Con ubicación
  // ============================================
  
  searchStore_found: [
    '{name} está en {floor}, {zone}.',
    'Encuentras {name} en {floor}, {zone}.',
    '{name} lo tienes en {floor}, {zone}.',
    '{name}, {floor}, {zone}.'
  ],
  
  searchStore_foundDetailed: [
    '{name} está ubicado en {floor}, {zone}. {description}',
    'Te ubicas en {name}, {floor}, {zone}. {description}',
    '{name} lo encuentras en {floor}, {zone}. {description}'
  ],
  
  // ============================================
  // LOCAL NO ENCONTRADO
  // ============================================
  
  storeNotFound: [
    'No tengo información de ese local. ¿Buscas algo en particular? Tengo ropa, restaurantes, bancos, cine.',
    'Ese local no está registrado. ¿Qué tipo de tienda necesitas?',
    'No encuentro ese nombre. ¿Buscas ropa, comida, o algún servicio específico?'
  ],
  
  // ============================================
  // HORARIOS - Mall general
  // ============================================
  
  hours_mall: [
    'El centro comercial abre de lunes a sábado de 10 AM a 9 PM. Domingos de 11 AM a 8 PM.',
    'Horario: lunes a sábado 10 AM a 9 PM, domingos 11 AM a 8 PM.',
    'Estamos abiertos lunes a sábado 10 de la mañana a 9 de la noche. Domingos de 11 a 8.'
  ],
  
  // ============================================
  // HORARIOS - Local específico
  // ============================================
  
  hours_store: [
    '{name} abre {hours}.',
    'El horario de {name} es {hours}.',
    '{name} está abierto {hours}.'
  ],
  
  // ============================================
  // TELÉFONO - Dar número sin transferir
  // ============================================
  
  phoneNumber: [
    'El número de {name} es {phone}.',
    '{name}: {phone}.',
    'Puedes llamar a {name} al {phone}.',
    'Comunícate con {name} al {phone}.'
  ],
  
  // ============================================
  // TRANSFERENCIA
  // ============================================
  
  transfer_noStore: [
    '¿A qué local quieres que te comunique?',
    '¿Con qué tienda o restaurante te conecto?',
    'Dime el nombre y te transfiero.'
  ],
  
  transfer_confirm: [
    'Te comunico con {name}. Un momento.',
    'Transfiriendo a {name}.',
    'Te conecto con {name}, espera por favor.',
    'Un momento, te paso con {name}.'
  ],
  
  // ============================================
  // PARQUEADERO
  // ============================================
  
  parking_location: [
    'El parqueadero está en los sótanos 1 y 2.',
    'Tienes estacionamiento en sótano 1 y sótano 2.',
    'Parqueas en los sótanos, niveles 1 y 2.'
  ],
  
  parking_cost: [
    'Primera hora gratis, luego 2 mil pesos cada hora adicional.',
    'Parqueo: primera hora sin costo, después 2 mil pesos por hora.',
    'Gratis la primera hora. 2 mil pesos cada hora extra.'
  ],
  
  parking_full: [
    'Parqueadero en sótanos 1 y 2, abierto 24 horas. Primera hora gratis, luego 2 mil pesos por hora. Capacidad para 200 vehículos.',
    'Estacionamiento cubierto en sótanos. Primera hora sin costo, después 2 mil cada hora. Vigilado con cámaras.'
  ],
  
  // ============================================
  // BAÑOS
  // ============================================
  
  bathrooms: [
    'Baños en primer piso cerca de Éxito, segundo piso zona de restaurantes, y tercer piso junto al cine.',
    'Encuentras baños en cada piso: primero cerca de Éxito, segundo en restaurantes, tercero en el cine.',
    'Hay baños en los tres pisos: primero junto al supermercado, segundo en la zona de comidas, tercero cerca del cine.'
  ],
  
  // ============================================
  // CAJEROS
  // ============================================
  
  atm: [
    'Cajeros automáticos en primer piso, zona de servicios. Bancolombia, Davivienda, BBVA y Banco de Bogotá. Disponibles 24 horas.',
    'Cajeros 24 horas en primer piso: Bancolombia, Davivienda, BBVA, Banco de Bogotá.',
    'Primer piso, zona de bancos: cajeros de Bancolombia, Davivienda, BBVA y Bogotá. Servicio 24/7.'
  ],
  
  // ============================================
  // WIFI
  // ============================================
  
  wifi: [
    'WiFi gratis en todo el mall. Red: PUENTE_FREE_WIFI, sin contraseña.',
    'Conexión WiFi gratuita. Busca PUENTE_FREE_WIFI, no necesita clave.',
    'Internet gratis: conéctate a PUENTE_FREE_WIFI.'
  ],
  
  // ============================================
  // UBICACIÓN DEL MALL
  // ============================================
  
  location_address: [
    'Estamos en Carrera 25 número 45-10, San Gil, Santander. A dos cuadras del parque principal.',
    'Carrera 25 con Calle 45, frente al Banco de Bogotá, centro de San Gil.',
    'Nos ubicamos en la Carrera 25, muy cerca del parque principal de San Gil.'
  ],
  
  location_directions: [
    'Desde el terminal de buses son 5 minutos en taxi, unos 5 mil pesos. También pasan las rutas 1, 3, 5 y 7.',
    'Si vienes en bus, toma las rutas 1, 3, 5 o 7. En taxi desde el terminal cuesta alrededor de 5 mil pesos.',
    'Rutas de bus: 1, 3, 5, 7. Taxi desde el terminal: 5 mil pesos aproximadamente.'
  ],
  
  // ============================================
  // RESTAURANTES - Lista
  // ============================================
  
  restaurants_list: [
    'Tenemos Crepes & Waffles, Subway, La Toscana, entre otros. ¿Cuál te interesa?',
    'Restaurantes: Crepes & Waffles, Subway, La Toscana, y más opciones. ¿Información de alguno?',
    'Zona de comidas con Crepes & Waffles, Subway, La Toscana. ¿De cuál necesitas detalles?'
  ],
  
  // ============================================
  // TIENDAS DE ROPA - Lista
  // ============================================
  
  clothing_list: [
    'Tiendas de ropa: Nike, Adidas, Zara, H&M. ¿Cuál buscas?',
    'Tenemos Nike, Adidas, Zara, H&M y más. ¿Información de alguna?',
    'Ropa: Nike y Adidas deportivas, Zara y H&M moda. ¿Te ayudo con una en específico?'
  ],
  
  // ============================================
  // CINE
  // ============================================
  
  cinema_info: [
    'Cinemark en tercer piso. 8 salas, tecnología 2D, 3D y XD. Abierto de 11 AM a 11 PM.',
    'Cine Cinemark tercer piso, 8 salas, funciones de 11 de la mañana a 11 de la noche.',
    'Cinemark: tercer piso, 8 salas con 2D, 3D y XD. Horario: 11 AM a 11 PM.'
  ],
  
  cinema_prices: [
    'Boletas 2D: 12 mil pesos entre semana, 16 mil fines de semana. 3D: 18 mil entre semana, 22 mil fines de semana.',
    'Precios: 2D desde 12 mil, 3D desde 18 mil. Miércoles descuento: 10 mil la boleta.',
    'Boleta 2D: 12 a 16 mil. 3D: 18 a 22 mil. XD: 28 mil. Miércoles de cine: 10 mil.'
  ],
  
  cinema_schedule: [
    'Funciones cada 2 horas desde las 11 AM. Para cartelera específica mejor llama al 607 724 6666.',
    'Horarios de funciones cada 2 horas. Consulta cartelera al 607 724 6666.',
    'Películas desde las 11 AM cada 2 horas. Cartelera actualizada: 607 724 6666.'
  ],
  
  // ============================================
  // PROMOCIONES
  // ============================================
  
  promotions_general: [
    'Promociones actuales: tarjeta cliente frecuente, parqueo gratis por compras sobre 100 mil, y descuentos para estudiantes.',
    'Ofertas vigentes: acumula puntos con tarjeta cliente, estacionamiento gratis comprando más de 100 mil.',
    'Beneficios: parqueo sin costo con compras mayores a 100 mil, descuentos estudiantes, puntos acumulables.'
  ],
  
  // ============================================
  // EVENTOS
  // ============================================
  
  events: [
    'Eventos del mes: festival gastronómico los viernes, cine familiar los domingos con 30% de descuento.',
    'Este mes: viernes festival de comida con degustaciones gratis, domingos cine en familia con descuento.',
    'Actividades: festival gastronómico cada viernes, tardes de cine familiar domingos a las 2 PM.'
  ],
  
  // ============================================
  // ZONA DE JUEGOS
  // ============================================
  
  playground: [
    'Zona de juegos infantiles en segundo piso, gratis, para niños de 2 a 12 años. Abierta de 11 AM a 8 PM.',
    'Juegos para niños: segundo piso zona central, sin costo, de 11 de la mañana a 8 de la noche.',
    'Área infantil segundo piso, gratis, edades 2 a 12 años, horario 11 AM a 8 PM con vigilancia.'
  ],
  
  // ============================================
  // SALA DE LACTANCIA
  // ============================================
  
  nursing_room: [
    'Sala de lactancia en primer piso junto a información. Privada, con cambiador y microondas.',
    'Espacio para madres: primer piso cerca de informes. Tiene sillas cómodas, cambiador y privacidad.',
    'Sala de lactancia primer piso, entrada por información. Equipada con cambiador y microondas.'
  ],
  
  // ============================================
  // PRIMEROS AUXILIOS / EMERGENCIA
  // ============================================
  
  firstAid: [
    'Primeros auxilios en primer piso, zona de servicios. Enfermera disponible de 10 AM a 9 PM.',
    'Atención médica básica: primer piso, horario 10 de la mañana a 9 de la noche.',
    'Punto de primeros auxilios primer piso con enfermera, abierto 10 AM a 9 PM.'
  ],
  
  emergency: [
    'En caso de emergencia, busca al personal de seguridad o dirígete a primeros auxilios en primer piso.',
    'Emergencia: contacta seguridad o ve a primeros auxilios, primer piso zona de servicios.',
    'Ayuda inmediata: personal de seguridad en cada piso o primeros auxilios primer piso.'
  ],
  
  // ============================================
  // OBJETOS PERDIDOS
  // ============================================
  
  lostAndFound: [
    'Objetos perdidos: punto de información primer piso o segundo piso. Horario 10 AM a 8 PM.',
    'Perdiste algo: dirígete a información, primer o segundo piso, de 10 de la mañana a 8 de la noche.',
    'Reporte de objetos perdidos en puntos de información, ambos pisos, horario 10 AM a 8 PM.'
  ],
  
  // ============================================
  // QUEJAS Y SUGERENCIAS
  // ============================================
  
  complaints: [
    'Quejas y sugerencias: punto de información primer piso, o escribe a info@puentedesangil.com.',
    'Comentarios: acércate a información primer piso o envía correo a info@puentedesangil.com.',
    'Para quejas o sugerencias visita informes primer piso o contacta info@puentedesangil.com.'
  ],
  
  // ============================================
  // AYUDA / NO ENTENDÍ
  // ============================================
  
  help: [
    'Puedo ayudarte con ubicación de tiendas, horarios, servicios del mall, o transferirte a un local. ¿Qué necesitas?',
    'Te ayudo a encontrar locales, darte horarios, información de servicios, o comunicarte con alguna tienda. ¿Qué buscas?',
    'Información disponible: ubicación de tiendas, horarios, parqueadero, restaurantes, cine. ¿Qué te interesa?'
  ],
  
  didNotUnderstand: [
    'Perdón, no entendí. ¿Buscas un local, horarios, o algún servicio?',
    'Disculpa, ¿puedes repetir? Te ayudo con ubicaciones, horarios o servicios.',
    'No capté bien. Dime si necesitas ubicar una tienda, horarios, o información del mall.'
  ],
  
  // ============================================
  // REPETIR
  // ============================================
  
  repeat: [
    'Claro, te repito.',
    'Por supuesto.',
    'Con gusto.'
  ],
  
  // ============================================
  // PRECIOS DE COMIDA
  // ============================================
  
  foodPrices_general: [
    'Los precios varían. Comida rápida desde 15 mil, restaurantes casuales entre 35 y 60 mil pesos. ¿Información de algún restaurante específico?',
    'Rangos de precios: comida rápida 15 a 25 mil, restaurantes 35 a 60 mil. ¿Te doy detalles de uno?',
    'Comidas desde 15 mil en Subway, hasta 60 mil en La Toscana. ¿Cuál te interesa?'
  ],
  
  // ============================================
  // MENÚ RESTAURANTE
  // ============================================
  
  menu_noRestaurant: [
    '¿De qué restaurante quieres el menú? Tenemos Crepes & Waffles, Subway, La Toscana.',
    '¿Menú de cuál: Crepes, Subway, o La Toscana?',
    'Dime el restaurante y te cuento su menú.'
  ],
  
  // ============================================
  // BANCOS
  // ============================================
  
  banks: [
    'Tenemos Bancolombia y Davivienda en primer piso, zona de servicios. Horario: lunes a viernes 8 AM a 5 PM, sábados 9 AM a 12 PM.',
    'Bancos: Bancolombia y Davivienda, primer piso. Abiertos lunes a viernes 8 a 5, sábados 9 a 12.',
    'Puntos bancarios primer piso: Bancolombia y Davivienda. Entre semana 8 AM a 5 PM.'
  ],
  
  // ============================================
  // ACCESIBILIDAD
  // ============================================
  
  accessibility: [
    'El mall es completamente accesible: rampas, ascensores, baños adaptados, y parqueadero con espacios preferenciales.',
    'Accesibilidad total: ascensores en cada zona, rampas, baños para discapacitados, estacionamiento preferencial.',
    'Instalaciones accesibles: elevadores, rampas, baños adaptados, espacios de parqueo preferenciales.'
  ],
  
  // ============================================
  // TARJETA REGALO
  // ============================================
  
  giftCard: [
    'Tarjetas regalo disponibles en punto de información primer piso. Desde 20 mil pesos, sin vencimiento.',
    'Gift cards en informes, primer piso. Valores desde 20 mil, válidas en todas las tiendas.',
    'Tarjetas de regalo: adquiérelas en información, montos desde 20 mil pesos, no caducan.'
  ]
};

/**
 * Obtiene una respuesta aleatoria del template
 */
export function getRandomResponse(templateKey) {
  const templates = responseTemplates[templateKey];
  if (!templates || templates.length === 0) {
    return 'Lo siento, no tengo esa información disponible.';
  }
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Reemplaza variables en el template
 */
export function fillTemplate(template, variables = {}) {
  let filled = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{${key}}`;
    filled = filled.replace(new RegExp(placeholder, 'g'), value);
  }
  return filled;
}