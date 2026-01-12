import express from 'express';
import { config } from './config/env.js';
import callRoutes from './routes/twilioRoutes.js';
import { logger } from './utils/logger.js';

// Crear aplicación Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  logger.info('REQUEST', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  next();
});

// Rutas
app.use('/webhooks/twilio', callRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: 'Call Center Premium - Centro Comercial Puente de San Gil',
    version: '3.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error('ERROR', {
    message: err.message,
    stack: err.stack
  });
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Iniciar servidor
const PORT = config.port;

app.listen(PORT, () => {
  logger.info('🚀 SERVIDOR INICIADO', {
    port: PORT,
    env: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
  
  console.log('');
  console.log('=================================');
  console.log('  CALL CENTER PREMIUM - ACTIVO  ');
  console.log('=================================');
  console.log(`Puerto: ${PORT}`);
  console.log(`Entorno: ${config.nodeEnv}`);
  console.log(`URL local: http://localhost:${PORT}`);
  console.log('=================================');
  console.log('');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});