import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'jobs.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

console.log('📦 Inicializando base de datos SQLite...');

try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const db = new DatabaseSync(dbPath);

    // Ejecutar el esquema SQL
    db.exec(schemaSql);

    console.log(`✅ Base de datos creada exitosamente en: ${dbPath}`);

    // Verificar las tablas creadas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").all();
    console.log('📋 Tablas detectadas en jobs.sqlite:');
    tables.forEach((t) => console.log(`   - ${t.name}`));

    // Insertar y verificar un registro de prueba
    const testId = 'test-job-001';
    db.prepare(`
        INSERT OR REPLACE INTO jobs (id, title, company, location, url, status)
        VALUES (?, ?, ?, ?, ?, ?)`
    ).run(testId, 'QA Automation Engineer (Test)', 'Empresa Demo', 'Bogotá', 'https://co.computrabajo.com/', 'DISCOVERED');

    const count = db.prepare('SELECT COUNT(*) as total FROM jobs').get();
    console.log(`🔍 Total de registros de prueba en jobs: ${count.total}`);

    // Limpiar registro de prueba
    db.prepare('DELETE FROM jobs WHERE id = ?').run(testId);
    console.log('🧹 Registro de prueba limpiado. Base de datos lista.');

    db.close();
} catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
}