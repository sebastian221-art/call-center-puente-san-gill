// src/database/connection.js

import pg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

/**
 * Configuración de conexión a PostgreSQL
 * Soporta DATABASE_URL (Render) o variables separadas (local)
 */
const poolConfig = process.env.DATABASE_URL 
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Requerido para Render
      },
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Aumentado a 10s
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'call_center_db',
      password: process.env.DB_PASSWORD || 'postgres',
      port: parseInt(process.env.DB_PORT || '5432'),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
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
      query: text.substring(0, 100) // Solo primeros 100 chars
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
  
  client.query = (...args) => {
    return originalQuery.apply(client, args);
  };
  
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
    const res = await query('SELECT NOW() as now, version() as version');
    logger.info('✅ Conexión a PostgreSQL exitosa', { 
      timestamp: res.rows[0].now,
      version: res.rows[0].version.split(' ')[0] + ' ' + res.rows[0].version.split(' ')[1]
    });
    return true;
  } catch (error) {
    logger.error('❌ Error conectando a PostgreSQL', { 
      error: error.message,
      config: process.env.DATABASE_URL ? 'DATABASE_URL presente' : 'Variables separadas'
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