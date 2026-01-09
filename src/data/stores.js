// Base de datos de locales del centro comercial
export const stores = [
  {
    id: 1,
    name: 'Nike Store',
    category: 'ropa_deportiva',
    keywords: ['nike', 'tenis', 'zapatos', 'deportivo', 'ropa deportiva', 'calzado'],
    floor: 'segundo piso',
    zone: 'zona norte',
    phone: '+573001111111',
    hours: 'Lunes a Sábado de 10 AM a 9 PM, Domingos de 11 AM a 8 PM',
    description: 'Tienda de ropa y calzado deportivo Nike'
  },
  {
    id: 2,
    name: 'Subway',
    category: 'restaurante',
    keywords: ['subway', 'comida', 'comer', 'sandwich', 'almuerzo', 'restaurante'],
    floor: 'primer piso',
    zone: 'zona de comidas',
    phone: '+573002222222',
    hours: 'Lunes a Sábado de 10 AM a 9 PM, Domingos de 11 AM a 8 PM',
    description: 'Restaurante de comida rápida, especialidad en sandwiches'
  },
  {
    id: 3,
    name: 'Cinemark',
    category: 'entretenimiento',
    keywords: ['cine', 'película', 'cinemark', 'pelicula', 'cartelera', 'función'],
    floor: 'tercer piso',
    zone: 'zona de entretenimiento',
    phone: '+573003333333',
    hours: 'Todos los días de 11 AM a 11 PM',
    description: 'Cine con múltiples salas y estrenos'
  },
  {
    id: 4,
    name: 'La Toscana',
    category: 'restaurante',
    keywords: ['toscana', 'italiano', 'pasta', 'pizza', 'comida italiana', 'restaurante'],
    floor: 'segundo piso',
    zone: 'zona de comidas',
    phone: '+573004444444',
    hours: 'Lunes a Sábado de 12 PM a 10 PM, Domingos de 12 PM a 9 PM',
    description: 'Restaurante de comida italiana'
  },
  {
    id: 5,
    name: 'Davivienda',
    category: 'servicios',
    keywords: ['banco', 'davivienda', 'cajero', 'plata', 'dinero', 'tarjeta', 'cuenta'],
    floor: 'primer piso',
    zone: 'zona de servicios',
    phone: '+573005555555',
    hours: 'Lunes a Viernes de 8 AM a 5 PM, Sábados de 9 AM a 1 PM',
    description: 'Oficina bancaria y cajeros automáticos'
  }
];

// Información general del centro comercial
export const mallInfo = {
  name: 'Centro Comercial Puente de San Gil',
  address: 'Calle 10 #15-20, San Gil, Santander',
  phone: '+576516773436',
  
  hours: {
    general: 'Lunes a Sábado de 10 AM a 9 PM, Domingos de 11 AM a 8 PM',
    special: {
      'zona de comidas': 'Hasta las 10 PM todos los días',
      'cine': 'Hasta las 11 PM todos los días',
      'supermercado': 'Lunes a Domingo de 8 AM a 10 PM'
    }
  },
  
  services: [
    'Parqueadero gratuito',
    'WiFi gratuito',
    'Baños en cada piso',
    'Cajeros automáticos',
    'Zona de comidas',
    'Cine',
    'Área de juegos infantiles',
    'Ascensores y escaleras eléctricas'
  ],
  
  floors: {
    'primer piso': 'Servicios, bancos, zona de comidas, supermercado',
    'segundo piso': 'Ropa, zapatos, restaurantes, tecnología',
    'tercer piso': 'Entretenimiento, cine, zona de juegos'
  }
};