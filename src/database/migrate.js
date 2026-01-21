// src/database/migrate.js
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool, testConnection } from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Ejecuta las migraciones de base de datos
 */
async function runMigrations() {
  console.log('🔄 Iniciando migraciones de base de datos...');
  
  try {
    // Verificar conexión
    console.log('📡 Verificando conexión...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    
    // Leer schema.sql
    const schemaPath = join(__dirname, 'schema.sql');
    console.log('📄 Leyendo schema desde:', schemaPath);
    
    const schemaSql = readFileSync(schemaPath, 'utf8');
    console.log('✓ Schema leído correctamente');
    
    console.log('🔧 Ejecutando schema.sql...');
    
    // Ejecutar schema completo
    await pool.query(schemaSql);
    
    console.log('✅ Migraciones completadas exitosamente');
    
    // Verificar tablas creadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n✅ Todo completado. Cerrando conexión...');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error en migraciones:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Ejecutar
runMigrations();