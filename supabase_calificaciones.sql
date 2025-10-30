-- Crear tabla de calificaciones
CREATE TABLE calificaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_calificador UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usuario_calificado UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES enseres(id) ON DELETE SET NULL,
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE SET NULL,
  puntuacion INTEGER NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Evitar calificaciones duplicadas
  UNIQUE(usuario_calificador, usuario_calificado, conversacion_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_calificaciones_usuario_calificado ON calificaciones(usuario_calificado);
CREATE INDEX idx_calificaciones_usuario_calificador ON calificaciones(usuario_calificador);
CREATE INDEX idx_calificaciones_conversacion ON calificaciones(conversacion_id);

-- RLS (Row Level Security)
ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver calificaciones donde están involucrados
CREATE POLICY "Ver calificaciones propias" ON calificaciones
  FOR SELECT USING (
    auth.uid() = usuario_calificador OR 
    auth.uid() = usuario_calificado
  );

-- Política: Solo el calificador puede insertar su calificación
CREATE POLICY "Insertar calificaciones propias" ON calificaciones
  FOR INSERT WITH CHECK (auth.uid() = usuario_calificador);

-- Política: Ver calificaciones públicas (para mostrar reputación)
CREATE POLICY "Ver calificaciones públicas" ON calificaciones
  FOR SELECT USING (true);