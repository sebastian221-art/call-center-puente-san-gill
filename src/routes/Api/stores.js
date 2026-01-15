// src/routes/api/stores.js

import express from 'express';
import { stores } from '../../data/stores.js';
import { logger } from '../../utils/logger.js';

const router = express.Router();

/**
 * API REST para gestión de locales/tiendas
 * 
 * Endpoints:
 * GET    /api/stores          - Lista todos los locales
 * GET    /api/stores/:id      - Obtiene un local específico
 * POST   /api/stores          - Crea un nuevo local
 * PUT    /api/stores/:id      - Actualiza un local
 * DELETE /api/stores/:id      - Elimina un local
 * GET    /api/stores/category/:category - Filtra por categoría
 */

/**
 * GET /api/stores
 * Lista todos los locales
 */
router.get('/', (req, res) => {
  try {
    const { category, floor, search } = req.query;
    
    let filtered = [...stores];
    
    // Filtrar por categoría
    if (category) {
      filtered = filtered.filter(s => s.category === category);
    }
    
    // Filtrar por piso
    if (floor) {
      filtered = filtered.filter(s => s.floor.toLowerCase().includes(floor.toLowerCase()));
    }
    
    // Búsqueda por nombre o keywords
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        (s.keywords && s.keywords.some(k => k.toLowerCase().includes(searchLower)))
      );
    }
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    logger.error('Error listando locales', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al listar locales'
    });
  }
});

/**
 * GET /api/stores/:id
 * Obtiene un local específico
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const store = stores.find(s => s.id === id);
    
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Local no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: store
    });
  } catch (error) {
    logger.error('Error obteniendo local', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al obtener local'
    });
  }
});

/**
 * GET /api/stores/category/:category
 * Filtra por categoría
 */
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const filtered = stores.filter(s => s.category === category);
    
    res.json({
      success: true,
      count: filtered.length,
      data: filtered
    });
  } catch (error) {
    logger.error('Error filtrando por categoría', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al filtrar'
    });
  }
});

/**
 * POST /api/stores
 * Crea un nuevo local (para futuro con DB)
 */
router.post('/', (req, res) => {
  try {
    const newStore = req.body;
    
    // Validaciones básicas
    if (!newStore.id || !newStore.name || !newStore.category) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: id, name, category'
      });
    }
    
    // Verificar que no exista
    const exists = stores.find(s => s.id === newStore.id);
    if (exists) {
      return res.status(409).json({
        success: false,
        error: 'Local ya existe'
      });
    }
    
    // En producción, aquí se guardaría en DB
    stores.push(newStore);
    
    logger.info('Local creado', { id: newStore.id, name: newStore.name });
    
    res.status(201).json({
      success: true,
      message: 'Local creado exitosamente',
      data: newStore
    });
  } catch (error) {
    logger.error('Error creando local', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al crear local'
    });
  }
});

/**
 * PUT /api/stores/:id
 * Actualiza un local
 */
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const index = stores.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Local no encontrado'
      });
    }
    
    // Actualizar
    stores[index] = { ...stores[index], ...updates };
    
    logger.info('Local actualizado', { id });
    
    res.json({
      success: true,
      message: 'Local actualizado exitosamente',
      data: stores[index]
    });
  } catch (error) {
    logger.error('Error actualizando local', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al actualizar local'
    });
  }
});

/**
 * DELETE /api/stores/:id
 * Elimina un local
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = stores.findIndex(s => s.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Local no encontrado'
      });
    }
    
    const deleted = stores.splice(index, 1)[0];
    
    logger.info('Local eliminado', { id });
    
    res.json({
      success: true,
      message: 'Local eliminado exitosamente',
      data: deleted
    });
  } catch (error) {
    logger.error('Error eliminando local', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error al eliminar local'
    });
  }
});

export default router;