-- schema.sql
-- Estructura de base de datos PostgreSQL para Call Center IA

-- ============================================
-- TABLA: stores (Locales/Tiendas)
-- ============================================
CREATE TABLE IF NOT EXISTS stores (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50),
  floor VARCHAR(50) NOT NULL,
  zone VARCHAR(50) NOT NULL,
  local VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  hours TEXT NOT NULL,
  description TEXT,
  keywords TEXT[], -- Array de keywords
  price_range VARCHAR(10),
  average_price VARCHAR(50),
  specialties TEXT[],
  delivery BOOLEAN DEFAULT false,
  reservations BOOLEAN DEFAULT false,
  brands TEXT[],
  promotions TEXT[],
  services TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsqueda rápida
CREATE INDEX idx_stores_category ON stores(category);
CREATE INDEX idx_stores_floor ON stores(floor);
CREATE INDEX idx_stores_name ON stores(name);

-- ============================================
-- TABLA: conversations (Historial de llamadas)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  call_sid VARCHAR(100) UNIQUE NOT NULL,
  from_number VARCHAR(20),
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  turn_count INTEGER DEFAULT 0,
  silence_count INTEGER DEFAULT 0,
  stores_mentioned TEXT[],
  topics_discussed TEXT[],
  user_satisfaction VARCHAR(20), -- 'positive', 'negative', 'unknown'
  had_errors BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_conversations_call_sid ON conversations(call_sid);
CREATE INDEX idx_conversations_start_time ON conversations(start_time);
CREATE INDEX idx_conversations_satisfaction ON conversations(user_satisfaction);

-- ============================================
-- TABLA: intents (Historial de intenciones detectadas)
-- ============================================
CREATE TABLE IF NOT EXISTS intents (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  call_sid VARCHAR(100) NOT NULL,
  user_text TEXT,
  detected_intent VARCHAR(100) NOT NULL,
  confidence DECIMAL(3,2),
  entities JSONB,
  was_successful BOOLEAN DEFAULT true,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intents_call_sid ON intents(call_sid);
CREATE INDEX idx_intents_detected_intent ON intents(detected_intent);
CREATE INDEX idx_intents_timestamp ON intents(timestamp);

-- ============================================
-- TABLA: errors (Registro de errores)
-- ============================================
CREATE TABLE IF NOT EXISTS errors (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id),
  call_sid VARCHAR(100) NOT NULL,
  error_type VARCHAR(50) NOT NULL, -- 'detection', 'response', 'transfer', 'timeout'
  error_data JSONB,
  user_text TEXT,
  detected_intent VARCHAR(100),
  confidence DECIMAL(3,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_errors_call_sid ON errors(call_sid);
CREATE INDEX idx_errors_type ON errors(error_type);
CREATE INDEX idx_errors_timestamp ON errors(timestamp);

-- ============================================
-- TABLA: keyword_suggestions (Keywords sugeridos por IA)
-- ============================================
CREATE TABLE IF NOT EXISTS keyword_suggestions (
  id SERIAL PRIMARY KEY,
  intent VARCHAR(100) NOT NULL,
  keyword VARCHAR(100) NOT NULL,
  frequency INTEGER DEFAULT 1,
  confidence DECIMAL(3,2),
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(intent, keyword)
);

CREATE INDEX idx_keyword_suggestions_intent ON keyword_suggestions(intent);
CREATE INDEX idx_keyword_suggestions_status ON keyword_suggestions(status);

-- ============================================
-- TABLA: intent_suggestions (Nuevas intenciones sugeridas)
-- ============================================
CREATE TABLE IF NOT EXISTS intent_suggestions (
  id SERIAL PRIMARY KEY,
  suggested_name VARCHAR(100) NOT NULL,
  example_phrases TEXT[],
  frequency INTEGER DEFAULT 1,
  patterns TEXT[],
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intent_suggestions_status ON intent_suggestions(status);

-- ============================================
-- TABLA: confidence_adjustments (Ajustes de confianza)
-- ============================================
CREATE TABLE IF NOT EXISTS confidence_adjustments (
  id SERIAL PRIMARY KEY,
  intent VARCHAR(100) UNIQUE NOT NULL,
  current_confidence DECIMAL(3,2),
  suggested_confidence DECIMAL(3,2),
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2),
  total_samples INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_confidence_adjustments_intent ON confidence_adjustments(intent);

-- ============================================
-- TABLA: system_metrics (Métricas del sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS system_metrics (
  id SERIAL PRIMARY KEY,
  metric_date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  avg_duration_seconds INTEGER,
  avg_turns DECIMAL(5,2),
  success_rate DECIMAL(5,2),
  satisfaction_rate DECIMAL(5,2),
  total_errors INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(metric_date)
);

CREATE INDEX idx_system_metrics_date ON system_metrics(metric_date);

-- ============================================
-- TABLA: events (Eventos del centro comercial)
-- ============================================
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location VARCHAR(100),
  category VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_active ON events(is_active);

-- ============================================
-- TABLA: faqs (Preguntas frecuentes)
-- ============================================
CREATE TABLE IF NOT EXISTS faqs (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50),
  frequency INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_active ON faqs(is_active);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keyword_suggestions_updated_at
  BEFORE UPDATE ON keyword_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intent_suggestions_updated_at
  BEFORE UPDATE ON intent_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confidence_adjustments_updated_at
  BEFORE UPDATE ON confidence_adjustments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faqs_updated_at
  BEFORE UPDATE ON faqs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Top intenciones
CREATE OR REPLACE VIEW v_top_intents AS
SELECT 
  detected_intent,
  COUNT(*) as count,
  AVG(confidence) as avg_confidence,
  SUM(CASE WHEN was_successful THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100 as success_rate
FROM intents
WHERE timestamp > CURRENT_DATE - INTERVAL '30 days'
GROUP BY detected_intent
ORDER BY count DESC;

-- Vista: Top tiendas consultadas
CREATE OR REPLACE VIEW v_top_stores AS
SELECT 
  UNNEST(stores_mentioned) as store_name,
  COUNT(*) as mention_count
FROM conversations
WHERE start_time > CURRENT_DATE - INTERVAL '30 days'
GROUP BY store_name
ORDER BY mention_count DESC;

-- Vista: Errores recientes
CREATE OR REPLACE VIEW v_recent_errors AS
SELECT 
  e.*,
  c.from_number,
  c.duration_seconds
FROM errors e
JOIN conversations c ON e.conversation_id = c.id
WHERE e.timestamp > CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY e.timestamp DESC;

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar métricas iniciales
INSERT INTO system_metrics (metric_date, total_calls, avg_duration_seconds, avg_turns, success_rate, satisfaction_rate, total_errors)
VALUES (CURRENT_DATE, 0, 0, 0, 0, 0, 0)
ON CONFLICT (metric_date) DO NOTHING;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE stores IS 'Catálogo de locales/tiendas del centro comercial';
COMMENT ON TABLE conversations IS 'Historial de llamadas con metadata';
COMMENT ON TABLE intents IS 'Registro de intenciones detectadas en cada turno';
COMMENT ON TABLE errors IS 'Registro de errores del sistema para aprendizaje';
COMMENT ON TABLE keyword_suggestions IS 'Keywords sugeridos por el sistema de IA';
COMMENT ON TABLE intent_suggestions IS 'Nuevas intenciones sugeridas por IA';
COMMENT ON TABLE confidence_adjustments IS 'Ajustes de confianza sugeridos';
COMMENT ON TABLE system_metrics IS 'Métricas diarias agregadas del sistema';
COMMENT ON TABLE events IS 'Eventos del centro comercial';
COMMENT ON TABLE faqs IS 'Preguntas frecuentes';