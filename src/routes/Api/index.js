// src/routes/Api/index.js

import express from 'express';
import storesRouter from './stores.js';
import analyticsRouter from './analytics.js';
import learningRouter from './learning.js';
import settingsRouter from './settings.js';
import conversationsRouter from './conversations.js'; // ← NUEVO

const router = express.Router();

/**
 * Router principal de la API
 * Agrupa todas las rutas de API bajo /api
 */

// Montar routers
router.use('/stores', storesRouter);
router.use('/analytics', analyticsRouter);
router.use('/learning', learningRouter);
router.use('/settings', settingsRouter);
router.use('/conversations', conversationsRouter); // ← NUEVO

// Endpoint raíz de API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Call Center API - v2.0.0',
    endpoints: {
      stores: '/api/stores',
      analytics: '/api/analytics',
      learning: '/api/learning',
      settings: '/api/settings',
      conversations: '/api/conversations' // ← NUEVO
    },
    documentation: '/api/docs'
  });
});

// Endpoint de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
    memory: {
      used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
    }
  });
});

export default router;