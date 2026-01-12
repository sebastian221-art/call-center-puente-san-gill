// src/data/stores.js

export const stores = [
  // ============================================
  // RESTAURANTES
  // ============================================
  {
    id: 'crepes-waffles',
    name: 'Crepes & Waffles',
    category: 'restaurante',
    subcategory: 'casual dining',
    floor: 'segundo piso',
    zone: 'zona de restaurantes',
    local: '201',
    phone: '607 724 8532',
    hours: 'lunes a jueves 11 AM a 10 PM, viernes a domingo 11 AM a 11 PM',
    description: 'Restaurante de comida casual, especialidad en crepes dulces y salados',
    keywords: ['crepes', 'waffles', 'postres', 'comida', 'almuerzo', 'cena', 'helado'],
    priceRange: '$$',
    averagePrice: '35000-50000',
    specialties: ['Crepes de pollo', 'Waffles con helado', 'Ensaladas', 'Malteadas'],
    delivery: true,
    reservations: true,
    seatingCapacity: 80,
    paymentMethods: ['efectivo', 'tarjeta', 'nequi', 'daviplata'],
    menu: {
      entradas: ['Palitos de mozzarella', 'Nachos', 'Aros de cebolla', 'Dedos de queso'],
      principales: ['Crepe de pollo', 'Crepe de champiñones', 'Lasaña', 'Crepe de carne'],
      postres: ['Waffle con helado', 'Crepe de nutella', 'Brownie', 'Cheesecake'],
      bebidas: ['Limonada natural', 'Jugo natural', 'Malteada', 'Café', 'Té helado']
    },
    promotions: [
      'Combo almuerzo ejecutivo $28,000 (lunes a viernes)',
      '2x1 en malteadas los miércoles',
      'Cumpleañeros: postre gratis con documento'
    ]
  },
  {
    id: 'subway',
    name: 'Subway',
    category: 'restaurante',
    subcategory: 'comida rápida',
    floor: 'primer piso',
    zone: 'zona de comidas',
    local: '105',
    phone: '607 724 7890',
    hours: 'todos los días de 10 AM a 9 PM',
    description: 'Sándwiches personalizados y ensaladas frescas',
    keywords: ['subway', 'sandwich', 'comida rápida', 'ensalada', 'saludable', 'sub'],
    priceRange: '$',
    averagePrice: '15000-25000',
    specialties: ['Sub del día', 'Ensalada personalizada', 'Galletas recién horneadas'],
    delivery: true,
    reservations: false,
    paymentMethods: ['efectivo', 'tarjeta'],
    menu: {
      subs: ['Italiano BMT', 'Pechuga de pavo', 'Atún', 'Pollo teriyaki', 'Vegetariano'],
      ensaladas: ['César con pollo', 'Atún', 'Pollo', 'Vegetariana'],
      extras: ['Galletas', 'Papas chips', 'Bebida']
    },
    promotions: [
      'Sub del día: $12,900',
      'Combo sub + bebida + galleta: $18,900',
      'Martes: 2x1 en subs de 6 pulgadas'
    ]
  },
  {
    id: 'la-toscana',
    name: 'La Toscana',
    category: 'restaurante',
    subcategory: 'italiana',
    floor: 'segundo piso',
    zone: 'zona de restaurantes',
    local: '205',
    phone: '607 724 5555',
    hours: 'lunes a domingo de 12 PM a 10 PM',
    description: 'Restaurante de comida italiana, pizzas artesanales y pastas',
    keywords: ['italiana', 'pizza', 'pasta', 'lasaña', 'italiana', 'italiano'],
    priceRange: '$$',
    averagePrice: '40000-60000',
    specialties: ['Pizza margarita', 'Lasaña bolognesa', 'Ravioles', 'Tiramisú'],
    delivery: true,
    reservations: true,
    seatingCapacity: 60,
    paymentMethods: ['efectivo', 'tarjeta', 'nequi'],
    menu: {
      pizzas: ['Margarita', 'Pepperoni', 'Cuatro quesos', 'Hawaiana', 'Vegetariana'],
      pastas: ['Lasaña', 'Ravioles', 'Fetuccini alfredo', 'Carbonara', 'Boloñesa'],
      postres: ['Tiramisú', 'Panna cotta', 'Helado italiano', 'Cannoli'],
      bebidas: ['Vino tinto', 'Vino blanco', 'Limonada', 'Gaseosa', 'Café expreso']
    },
    promotions: [
      '2x1 en pizzas familiares los martes',
      'Combo pasta + postre + bebida: $45,000',
      'Cumpleañeros: 20% descuento con documento'
    ]
  },
  
  // ============================================
  // TIENDAS DE ROPA
  // ============================================
  {
    id: 'nike',
    name: 'Nike',
    category: 'ropa',
    subcategory: 'deportiva',
    floor: 'segundo piso',
    zone: 'zona norte',
    local: '215',
    phone: '607 724 1234',
    hours: 'lunes a sábado de 10 AM a 8 PM, domingos de 11 AM a 7 PM',
    description: 'Tienda de ropa y calzado deportivo',
    keywords: ['nike', 'tenis', 'deportivos', 'zapatos', 'ropa deportiva', 'running'],
    priceRange: '$$$',
    averagePrice: '150000-400000',
    specialties: ['Tenis deportivos', 'Ropa running', 'Accesorios fitness'],
    delivery: false,
    brands: ['Nike', 'Jordan'],
    sizes: ['Niños', 'Hombre', 'Mujer'],
    paymentMethods: ['efectivo', 'tarjeta', 'crédito'],
    categories: ['Calzado', 'Ropa', 'Accesorios'],
    promotions: [
      'Descuento 20% en colecciones pasadas',
      'Meses sin intereses con tarjetas participantes',
      '3x2 en medias deportivas'
    ]
  },
  {
    id: 'adidas',
    name: 'Adidas',
    category: 'ropa',
    subcategory: 'deportiva',
    floor: 'segundo piso',
    zone: 'zona norte',
    local: '218',
    phone: '607 724 1235',
    hours: 'lunes a sábado de 10 AM a 8 PM, domingos de 11 AM a 7 PM',
    description: 'Ropa y calzado deportivo de alto rendimiento',
    keywords: ['adidas', 'tenis', 'deportivo', 'futbol', 'running', 'soccer'],
    priceRange: '$$$',
    averagePrice: '140000-380000',
    specialties: ['Tenis de fútbol', 'Ropa deportiva', 'Mochilas'],
    delivery: false,
    brands: ['Adidas', 'Adidas Originals'],
    sizes: ['Niños', 'Hombre', 'Mujer'],
    paymentMethods: ['efectivo', 'tarjeta', 'crédito'],
    promotions: [
      'Descuento 15% en segunda compra',
      'Black Friday: hasta 40% de descuento',
      'Estudiantes: 10% descuento con carnet'
    ]
  },
  {
    id: 'zara',
    name: 'Zara',
    category: 'ropa',
    subcategory: 'moda',
    floor: 'primer piso',
    zone: 'zona central',
    local: '110',
    phone: '607 724 3333',
    hours: 'lunes a sábado de 10 AM a 9 PM, domingos de 11 AM a 8 PM',
    description: 'Moda contemporánea para hombre, mujer y niños',
    keywords: ['zara', 'moda', 'ropa', 'vestidos', 'camisas', 'pantalones'],
    priceRange: '$$',
    averagePrice: '80000-250000',
    specialties: ['Colecciones de temporada', 'Línea básica', 'Accesorios'],
    delivery: false,
    sections: ['Mujer', 'Hombre', 'Niños', 'Accesorios'],
    paymentMethods: ['efectivo', 'tarjeta', 'crédito'],
    promotions: [
      'Nueva colección cada mes',
      'Rebajas de fin de temporada hasta 50%',
      'Cambios sin costo dentro de 30 días'
    ]
  },
  {
    id: 'hm',
    name: 'H&M',
    category: 'ropa',
    subcategory: 'moda',
    floor: 'primer piso',
    zone: 'zona sur',
    local: '115',
    phone: '607 724 4444',
    hours: 'lunes a sábado de 10 AM a 9 PM, domingos de 11 AM a 8 PM',
    description: 'Moda actual a precios accesibles',
    keywords: ['h&m', 'hm', 'moda', 'ropa', 'barato', 'tendencia'],
    priceRange: '$',
    averagePrice: '40000-150000',
    delivery: false,
    sections: ['Mujer', 'Hombre', 'Niños', 'H&M Home'],
    paymentMethods: ['efectivo', 'tarjeta'],
    promotions: [
      'Descuentos especiales para estudiantes',
      'Programa de reciclaje: trae ropa usada y recibe cupón 15%',
      'Miembros H&M: 10% descuento permanente'
    ]
  },
  
  // ============================================
  // BANCOS Y SERVICIOS FINANCIEROS
  // ============================================
  {
    id: 'davivienda',
    name: 'Banco Davivienda',
    category: 'banco',
    subcategory: 'servicios financieros',
    floor: 'primer piso',
    zone: 'zona de servicios',
    local: '102',
    phone: '607 724 9999',
    hours: 'lunes a viernes de 8 AM a 5 PM, sábados de 9 AM a 12 PM',
    description: 'Servicios bancarios completos, cajeros automáticos',
    keywords: ['banco', 'davivienda', 'cajero', 'cuenta', 'tarjeta', 'crédito', 'retiro', 'daviplata'],
    services: ['Apertura de cuentas', 'Créditos', 'Tarjetas', 'Retiros', 'Consignaciones'],
    atmAvailable: true,
    atmHours: '24 horas',
    paymentMethods: ['efectivo'],
    specialties: ['Cuenta de ahorros', 'Tarjeta de crédito', 'DaviPlata', 'Créditos personales']
  },
  {
    id: 'bancolombia',
    name: 'Bancolombia',
    category: 'banco',
    subcategory: 'servicios financieros',
    floor: 'primer piso',
    zone: 'zona de servicios',
    local: '103',
    phone: '607 724 8888',
    hours: 'lunes a viernes de 8 AM a 5 PM, sábados de 9 AM a 12 PM',
    description: 'Punto de atención bancaria y cajeros automáticos',
    keywords: ['banco', 'bancolombia', 'cajero', 'nequi', 'transferencia'],
    services: ['Apertura de cuentas', 'Nequi', 'Tarjetas', 'Créditos'],
    atmAvailable: true,
    atmHours: '24 horas',
    paymentMethods: ['efectivo'],
    specialties: ['Cuenta de ahorros', 'Nequi', 'Tarjetas de crédito', 'Créditos']
  },
  
  // ============================================
  // ENTRETENIMIENTO - CINE CON CARTELERA
  // ============================================
  {
    id: 'cinemark',
    name: 'Cinemark',
    category: 'cine',
    subcategory: 'entretenimiento',
    floor: 'tercer piso',
    zone: 'zona de entretenimiento',
    local: '301',
    phone: '607 724 6666',
    hours: 'todos los días de 11 AM a 11 PM',
    description: 'Complejo de cines con múltiples salas',
    keywords: ['cine', 'cinemark', 'película', 'pelicula', 'movie', 'cartelera', 'función', 'funcion'],
    priceRange: '$$',
    salas: 8,
    technologies: ['2D', '3D', 'XD', 'Dolby Atmos'],
    specialties: ['Estrenos', 'Funciones especiales', 'Cine infantil'],
    paymentMethods: ['efectivo', 'tarjeta', 'nequi'],
    prices: {
      '2d': {
        'lunes_jueves': 12000,
        'viernes_domingo': 16000,
        'estreno': 18000
      },
      '3d': {
        'lunes_jueves': 18000,
        'viernes_domingo': 22000,
        'estreno': 25000
      },
      'xd': {
        'todos': 28000
      }
    },
    combos: [
      'Combo individual: crispetas + gaseosa $15,000',
      'Combo pareja: crispetas grande + 2 gaseosas $25,000',
      'Combo familiar: crispetas jumbo + 4 gaseosas + nachos $45,000'
    ],
    // ← CARTELERA ACTUALIZADA CON DETALLES
    cartelera: [
      {
        titulo: 'Acción Extrema',
        genero: 'Acción y Aventura',
        clasificacion: 'PG-13',
        duracion: '120 minutos',
        horarios: ['2:00 PM', '5:00 PM', '8:00 PM'],
        formato: ['2D', '3D'],
        descripcion: 'Aventuras explosivas con efectos especiales'
      },
      {
        titulo: 'Aventuras Mágicas',
        genero: 'Animación Familiar',
        clasificacion: 'G',
        duracion: '95 minutos',
        horarios: ['12:00 PM', '3:00 PM', '6:00 PM'],
        formato: ['2D', '3D'],
        descripcion: 'Diversión para toda la familia'
      },
      {
        titulo: 'Destino Final',
        genero: 'Drama',
        clasificacion: 'R',
        duracion: '135 minutos',
        horarios: ['4:00 PM', '7:00 PM', '10:00 PM'],
        formato: ['2D'],
        descripcion: 'Drama intenso solo para adultos'
      },
      {
        titulo: 'Risas Sin Control',
        genero: 'Comedia',
        clasificacion: 'PG',
        duracion: '105 minutos',
        horarios: ['1:00 PM', '4:00 PM', '7:00 PM'],
        formato: ['2D'],
        descripcion: 'Comedia para toda la familia'
      }
    ],
    promotions: [
      'Miércoles de cine: boletas 2D a $10,000',
      'Combo estudiante: boleta + combo individual $22,000',
      'Adultos mayores: 20% descuento todos los días'
    ]
  },
  
  // ============================================
  // FARMACIAS
  // ============================================
  {
    id: 'cruz-verde',
    name: 'Drogas La Rebaja',
    category: 'farmacia',
    subcategory: 'salud',
    floor: 'primer piso',
    zone: 'zona de servicios',
    local: '108',
    phone: '607 724 7777',
    hours: 'lunes a sábado de 8 AM a 8 PM, domingos de 9 AM a 6 PM',
    description: 'Farmacia con medicamentos, productos de cuidado personal y belleza',
    keywords: ['farmacia', 'drogas', 'rebaja', 'medicina', 'medicamento', 'pastillas', 'salud'],
    services: ['Medicamentos con fórmula', 'Productos de belleza', 'Cuidado personal', 'Inyectología'],
    delivery: true,
    paymentMethods: ['efectivo', 'tarjeta', 'nequi', 'daviplata'],
    specialties: ['Medicamentos genéricos', 'Productos naturales', 'Cosméticos', 'Inyecciones'],
    promotions: [
      'Descuento 20% para adultos mayores',
      '3x2 en productos seleccionados',
      'Domicilio gratis en compras mayores a $50,000'
    ]
  },
  
  // ============================================
  // SUPERMERCADO
  // ============================================
  {
    id: 'exito',
    name: 'Éxito Express',
    category: 'supermercado',
    subcategory: 'alimentos',
    floor: 'primer piso',
    zone: 'zona comercial',
    local: '120',
    phone: '607 724 5000',
    hours: 'lunes a sábado de 8 AM a 9 PM, domingos de 9 AM a 8 PM',
    description: 'Supermercado con variedad de productos alimenticios y del hogar',
    keywords: ['supermercado', 'exito', 'éxito', 'mercado', 'compras', 'alimentos', 'víveres', 'viveres'],
    services: ['Frutas y verduras', 'Carnes', 'Lácteos', 'Panadería', 'Licores', 'Productos del hogar'],
    delivery: true,
    paymentMethods: ['efectivo', 'tarjeta', 'puntos Éxito', 'nequi'],
    specialties: ['Productos frescos', 'Panadería artesanal', 'Sección gourmet', 'Frutas orgánicas'],
    promotions: [
      'Miércoles de frutas y verduras: 20% descuento',
      'Jueves de carnes: ofertas especiales',
      'Puntos Éxito: acumula y redime',
      'Domicilio gratis en compras mayores a $80,000'
    ]
  }
];

// ============================================
// INFORMACIÓN DEL CENTRO COMERCIAL
// ============================================

export const mallInfo = {
  name: 'Centro Comercial Puente de San Gil',
  shortName: 'Puente de San Gil',
  address: 'Carrera 25 # 45-10, San Gil, Santander',
  phone: '607 724 0000',
  email: 'info@puentedesangil.com',
  website: 'www.puentedesangil.com',
  socialMedia: {
    facebook: '@PuenteDeSanGil',
    instagram: '@puentesangil',
    whatsapp: '+57 310 234 5678'
  },
  
  // Horarios
  hours: {
    general: 'lunes a sábado de 10 AM a 9 PM, domingos de 11 AM a 8 PM',
    extended: 'fechas especiales: hasta 10 PM',
    holidays: 'días festivos: 11 AM a 7 PM'
  },
  
  // Ubicación y acceso
  location: {
    neighborhood: 'Centro',
    city: 'San Gil',
    department: 'Santander',
    landmarks: 'A 2 cuadras del parque principal, frente al Banco de Bogotá',
    publicTransport: 'Rutas de bus: 1, 3, 5, 7',
    accessRoads: 'Por la Carrera 25 vía a Barichara'
  },
  
  // Servicios detallados
  services: [
    {
      name: 'Parqueadero',
      description: 'Estacionamiento cubierto',
      location: 'Sótano 1 y 2',
      hours: '24 horas',
      cost: 'Primera hora gratis, $2,000 cada hora adicional',
      capacity: '200 vehículos',
      details: 'Parqueadero vigilado con cámaras de seguridad. Por compras mayores a $100,000 el parqueo es gratis'
    },
    {
      name: 'WiFi Gratis',
      description: 'Internet inalámbrico en todo el mall',
      network: 'PUENTE_FREE_WIFI',
      password: 'No requiere',
      speed: 'Alta velocidad'
    },
    {
      name: 'Cajeros Automáticos',
      description: 'Red bancaria múltiple',
      banks: ['Bancolombia', 'Davivienda', 'BBVA', 'Banco de Bogotá'],
      location: 'Primer piso, zona de servicios',
      hours: '24 horas'
    },
    {
      name: 'Baños',
      description: 'Baños públicos limpios',
      locations: [
        'Primer piso cerca de Éxito',
        'Segundo piso zona de restaurantes',
        'Tercer piso junto al cine'
      ],
      features: ['Cambiadores para bebés', 'Accesibilidad para discapacitados']
    },
    {
      name: 'Zona de Juegos Infantiles',
      description: 'Área recreativa para niños',
      location: 'Segundo piso, zona central',
      ages: '2 a 12 años',
      cost: 'Gratis',
      hours: 'lunes a domingo de 11 AM a 8 PM',
      supervision: 'Vigilancia permanente'
    },
    {
      name: 'Sala de Lactancia',
      description: 'Espacio privado para madres',
      location: 'Primer piso, junto a información',
      features: ['Sillas cómodas', 'Cambiador', 'Microondas', 'Privacidad']
    },
    {
      name: 'Puntos de Información',
      description: 'Asistencia y orientación',
      locations: ['Entrada principal', 'Segundo piso'],
      hours: '10 AM a 8 PM',
      services: ['Información general', 'Objetos perdidos', 'Quejas y sugerencias']
    },
    {
      name: 'Primeros Auxilios',
      description: 'Atención médica básica',
      location: 'Primer piso, zona de servicios',
      hours: '10 AM a 9 PM',
      services: ['Atención de emergencias', 'Botiquín', 'Enfermera disponible']
    },
    {
      name: 'Seguridad 24/7',
      description: 'Vigilancia permanente',
      features: ['Cámaras de seguridad', 'Personal de seguridad', 'Puntos de emergencia'],
      emergency: 'Botones de pánico en cada piso'
    }
  ],
  
  // Eventos actuales
  events: [
    {
      name: 'Festival Gastronómico',
      date: 'Todos los viernes',
      time: '5:00 PM a 8:00 PM',
      description: 'Degustaciones gratuitas en la zona de restaurantes',
      participants: 'Todos los restaurantes del mall',
      location: 'Segundo piso, zona de restaurantes'
    },
    {
      name: 'Tardes de Cine Familiar',
      date: 'Domingos 2:00 PM',
      description: 'Películas para toda la familia con descuento especial',
      discount: '30% en boletas',
      location: 'Cinemark, tercer piso'
    },
    {
      name: 'Show de Música en Vivo',
      date: 'Sábados 4:00 PM',
      description: 'Conciertos gratuitos en la plaza central',
      location: 'Primer piso, plaza central',
      cost: 'Entrada libre'
    },
    {
      name: 'Temporada de Descuentos',
      date: 'Junio y Diciembre',
      description: 'Grandes descuentos en todas las tiendas',
      discount: 'Hasta 70% de descuento'
    }
  ],
  
  // Promociones generales
  promotions: [
    'Tarjeta Cliente Frecuente: Acumula puntos en cada compra',
    'Parqueo gratis por compras superiores a $100,000',
    'Descuentos especiales para estudiantes (lunes a miércoles) 10-15%',
    'Adultos mayores: 10% descuento en todas las tiendas',
    'Festival gastronómico: viernes 5-8 PM degustaciones gratis'
  ],
  
  // Información adicional
  features: {
    totalArea: '15,000 m²',
    floors: 3,
    stores: 80,
    restaurants: 12,
    cinemaScreens: 8,
    parkingSpaces: 200,
    dailyVisitors: 5000,
    accessibility: true,
    petFriendly: false,
    smokingAreas: ['Terraza tercer piso']
  },
  
  // Medidas de seguridad
  safety: {
    covid: [
      'Puntos de desinfección en cada entrada',
      'Aforo controlado',
      'Ventilación constante'
    ],
    general: [
      'Cámaras de seguridad en todo el mall',
      'Personal de seguridad 24/7',
      'Salidas de emergencia señalizadas',
      'Extintores en cada piso',
      'Alarma contra incendios',
      'Botones de pánico'
    ]
  },
  
  // Cómo llegar
  directions: {
    fromBucaramanga: 'Por la vía Bucaramanga-San Gil, 2 horas aproximadamente',
    fromSocorro: 'Vía Socorro-San Gil, 30 minutos',
    fromBarichara: 'Vía Barichara-San Gil, 20 minutos',
    publicTransport: 'Rutas de bus 1, 3, 5, 7 pasan cada 15 minutos',
    taxi: 'Desde el terminal: $5,000 aproximadamente'
  }
};