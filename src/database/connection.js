// src/database/connection.js

import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Configuración de conexión a PostgreSQL
 */
const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'call_center_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Crear pool de conexiones
const pool = new Pool(poolConfig);

// Manejar errores del pool
pool.on('error', (err) => {
  logger.error('Error inesperado en pool de PostgreSQL', { 
    error: err.message,
    stack: err.stack
  });
});

// Manejar conexiones nuevas
pool.on('connect', () => {
  logger.debug('Nueva conexión establecida a PostgreSQL');
});

/**
 * Ejecuta una query
 */
export async function query(text, params) {
  const start = Date.now();
  
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Query ejecutado', { 
      duration: `${duration}ms`,
      rows: res.rowCount
    });
    
    return res;
  } catch (error) {
    logger.error('Error en query', { 
      error: error.message,
      query: text
    });
    throw error;
  }
}

/**
 * Obtiene un cliente del pool para transacciones
 */
export async function getClient() {
  const client = await pool.connect();
  
  const originalQuery = client.query;
  const originalRelease = client.release;
  
  // Timeout de 5 segundos para queries
  const timeout = setTimeout(() => {
    logger.error('Cliente retuvo conexión más de 5 segundos');
  }, 5000);
  
  // Wrapper para logging
  client.query = (...args) => {
    return originalQuery.apply(client, args);
  };
  
  // Wrapper para release
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };
  
  return client;
}

/**
 * Verifica conexión a base de datos
 */
export async function testConnection() {
  try {
    const res = await query('SELECT NOW() as now');
    logger.info('Conexión a PostgreSQL exitosa', { 
      timestamp: res.rows[0].now
    });
    return true;
  } catch (error) {
    logger.error('Error conectando a PostgreSQL', { 
      error: error.message
    });
    return false;
  }
}

/**
 * Cierra todas las conexiones del pool
 */
export async function closePool() {
  try {
    await pool.end();
    logger.info('Pool de PostgreSQL cerrado');
  } catch (error) {
    logger.error('Error cerrando pool', { error: error.message });
  }
}

// Exportar pool por si se necesita acceso directo
export { pool };

// Manejar cierre graceful
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando pool de PostgreSQL');
  await closePool();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT recibido, cerrando pool de PostgreSQL');
  await closePool();
  process.exit(0);
});