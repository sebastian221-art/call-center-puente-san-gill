// src/index.js

import express from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import twilioRoutes from './routes/twilioRoutes.js';
import apiRoutes from './routes/Api/index.js';
import { testConnection } from './database/connection.js';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// CORS
app.use(cors());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requests
app.use((req, res, next) => {
  logger.info('REQUEST', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// ============================================
// RUTAS
// ============================================

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    service: 'Call Center Premium con IA',
    version: '4.0.0',
    status: 'online',
    features: [
      'Ultra-short responses (<15 words)',
      'Independent calls (100 simultaneous)',
      'Auto-learning system',
      'Error tracking',
      'Advanced analytics',
      'REST API',
      'PostgreSQL integration'
    ],
    endpoints: {
      twilio: '/webhooks/twilio',
      api: '/api',
      health: '/health'
    },
    timestamp: new Date()
  });
});

// Webhooks de Twilio
app.use('/webhooks/twilio', twilioRoutes);

// API REST
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    },
    timestamp: new Date()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Error handler global
app.use((err, req, res, next) => {
  logger.error('Error no manejado', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });
  
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// ============================================
// INICIO DEL SERVIDOR
// ============================================

async function startServer() {
  try {
    // Verificar conexión a base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.warn('No se pudo conectar a PostgreSQL, continuando sin DB');
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info('🚀 SERVIDOR INICIADO', {
        port: PORT,
        env: process.env.NODE_ENV || 'development'
      });
      
      console.log('\n=================================');
      console.log('  CALL CENTER PREMIUM - ACTIVO  ');
      console.log('=================================');
      console.log(`Puerto: ${PORT}`);
      console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`URL local: http://localhost:${PORT}`);
      console.log(`API: http://localhost:${PORT}/api`);
      console.log(`Database: ${dbConnected ? 'Conectada ✅' : 'Desconectada ❌'}`);
      console.log('=================================\n');
    });
  } catch (error) {
    logger.error('Error iniciando servidor', { error: error.message });
    process.exit(1);
  }
}

// Iniciar
startServer();

export default app;