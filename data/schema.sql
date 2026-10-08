-- ============================================================================
-- Esquema de Base de Datos para job-seeker-auto (SQLite)
-- ============================================================================

-- Tabla principal de seguimiento de vacantes
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT,
    location TEXT,
    salary TEXT,
    url TEXT UNIQUE NOT NULL,
    description TEXT,
    score INTEGER,
    match_reason TEXT,
    status TEXT DEFAULT 'DISCOVERED',
    has_questions BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    evaluated_at DATETIME,
    applied_at DATETIME
);

-- Tabla de historial y auditoría de postulaciones
CREATE TABLE IF NOT EXISTS applications_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL,
    questions_and_answers TEXT,
    status TEXT NOT NULL,
    error_message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- Índices para optimizar la búsqueda y deduplicación instantánea
CREATE INDEX IF NOT EXISTS idx_jobs_url ON jobs(url);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_score ON jobs(score);