-- Crear tabla de denuncias
CREATE TABLE denuncias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_reportador UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo_reporte VARCHAR(20) NOT NULL CHECK (tipo_reporte IN ('usuario', 'producto')),
  objeto_id VARCHAR(255) NOT NULL, -- ID del usuario o producto reportado
  motivo VARCHAR(50) NOT NULL CHECK (motivo IN (
    'contenido_inapropiado',
    'spam', 
    'fraude',
    'producto_falso',
    'comportamiento_abusivo',
    'otro'
  )),
  descripcion TEXT NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisando', 'resuelto', 'rechazado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar denuncias duplicadas del mismo usuario al mismo objeto
  UNIQUE(usuario_reportador, tipo_reporte, objeto_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_denuncias_usuario_reportador ON denuncias(usuario_reportador);
CREATE INDEX idx_denuncias_tipo_objeto ON denuncias(tipo_reporte, objeto_id);
CREATE INDEX idx_denuncias_estado ON denuncias(estado);
CREATE INDEX idx_denuncias_created_at ON denuncias(created_at);

-- RLS (Row Level Security)
ALTER TABLE denuncias ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias denuncias
CREATE POLICY "Ver denuncias propias" ON denuncias
  FOR SELECT USING (auth.uid() = usuario_reportador);

-- Política: Solo usuarios autenticados pueden crear denuncias
CREATE POLICY "Crear denuncias" ON denuncias
  FOR INSERT WITH CHECK (auth.uid() = usuario_reportador);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_denuncias_updated_at 
    BEFORE UPDATE ON denuncias 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();