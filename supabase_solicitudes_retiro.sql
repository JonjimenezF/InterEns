-- Crear tabla de solicitudes de retiro
CREATE TABLE solicitudes_retiro (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  producto_id BIGINT NOT NULL REFERENCES enseres(id) ON DELETE CASCADE,
  direccion TEXT NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  horario_preferido VARCHAR(20) NOT NULL CHECK (horario_preferido IN (
    'manana',
    'tarde', 
    'noche',
    'cualquier_hora'
  )),
  comentarios TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN (
    'pendiente',
    'confirmado',
    'en_camino',
    'completado',
    'cancelado'
  )),
  fecha_programada TIMESTAMP WITH TIME ZONE,
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Un usuario solo puede solicitar retiro una vez por producto
  UNIQUE(usuario_id, producto_id)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_solicitudes_retiro_usuario ON solicitudes_retiro(usuario_id);
CREATE INDEX idx_solicitudes_retiro_producto ON solicitudes_retiro(producto_id);
CREATE INDEX idx_solicitudes_retiro_estado ON solicitudes_retiro(estado);
CREATE INDEX idx_solicitudes_retiro_created_at ON solicitudes_retiro(created_at);
CREATE INDEX idx_solicitudes_retiro_fecha_programada ON solicitudes_retiro(fecha_programada);

-- RLS (Row Level Security)
ALTER TABLE solicitudes_retiro ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver sus propias solicitudes
CREATE POLICY "Ver solicitudes propias" ON solicitudes_retiro
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política: Solo usuarios autenticados pueden crear solicitudes
CREATE POLICY "Crear solicitudes propias" ON solicitudes_retiro
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política: Los usuarios pueden actualizar sus propias solicitudes (solo comentarios)
CREATE POLICY "Actualizar solicitudes propias" ON solicitudes_retiro
  FOR UPDATE USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_solicitudes_retiro_updated_at 
    BEFORE UPDATE ON solicitudes_retiro 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();