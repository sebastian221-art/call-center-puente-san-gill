// src/config/constants.js

export const INTENTS = {
  // Búsqueda y ubicación
  BUSCAR_LOCAL: 'buscar_local',
  UBICACION: 'ubicacion',
  UBICACION_MALL: 'ubicacion_mall',
  COMO_LLEGAR: 'como_llegar',
  
  // Horarios
  HORARIOS: 'horarios',
  HORARIO_MALL: 'horario_mall',
  HORARIO_LOCAL: 'horario_local',
  
  // Contacto y comunicación
  TRANSFERIR: 'transferir',
  NUMERO_TELEFONO: 'numero_telefono',
  PEDIR_DOMICILIO: 'pedir_domicilio',
  
  // Servicios del mall
  PARQUEADERO: 'parqueadero',
  PARQUEADERO_COSTO: 'parqueadero_costo',
  BANOS: 'banos',
  CAJERO: 'cajero',
  WIFI: 'wifi',
  ZONA_JUEGOS: 'zona_juegos',
  
  // Categorías de tiendas
  RESTAURANTES: 'restaurantes',
  TIENDAS_ROPA: 'tiendas_ropa',
  TIENDAS_DEPORTES: 'tiendas_deportes',
  BANCOS: 'bancos',
  FARMACIAS: 'farmacias',
  SUPERMERCADO: 'supermercado',
  
  // Entretenimiento
  CINE: 'cine',
  CINE_CARTELERA: 'cine_cartelera',
  CINE_HORARIOS: 'cine_horarios',
  CINE_PRECIOS: 'cine_precios',
  
  // Información comercial
  PROMOCIONES: 'promociones',
  EVENTOS: 'eventos',
  OFERTAS: 'ofertas',
  DESCUENTOS: 'descuentos',
  
  // Precios y costos
  PRECIOS_COMIDA: 'precios_comida',
  MENU_RESTAURANTE: 'menu_restaurante',
  
  // Servicios especiales
  TARJETA_REGALO: 'tarjeta_regalo',
  SALA_LACTANCIA: 'sala_lactancia',
  ACCESIBILIDAD: 'accesibilidad',
  
  // Seguridad y ayuda
  EMERGENCIA: 'emergencia',
  PRIMEROS_AUXILIOS: 'primeros_auxilios',
  OBJETOS_PERDIDOS: 'objetos_perdidos',
  QUEJAS: 'quejas',
  SUGERENCIAS: 'sugerencias',
  
  // Control de flujo
  AYUDA: 'ayuda',
  REPETIR: 'repetir',
  DESPEDIDA: 'despedida',
  SALUDAR: 'saludar',
  CONFIRMAR: 'confirmar',
  NEGAR: 'negar',
  UNKNOWN: 'unknown'
};

export const CATEGORIES = {
  RESTAURANTE: 'restaurante',
  ROPA: 'ropa',
  DEPORTES: 'deportes',
  TECNOLOGIA: 'tecnologia',
  BANCO: 'banco',
  FARMACIA: 'farmacia',
  SUPERMERCADO: 'supermercado',
  CINE: 'cine',
  ENTRETENIMIENTO: 'entretenimiento',
  SERVICIOS: 'servicios'
};

export const RESPONSE_MODES = {
  SHORT: 'short',      // Respuestas cortas (8-10 seg)
  NORMAL: 'normal',    // Respuestas normales (12-15 seg)
  DETAILED: 'detailed' // Respuestas detalladas (20+ seg)
};