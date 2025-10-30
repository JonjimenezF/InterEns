export interface Transaccion {
  id: number;
  enser_id: number;
  propietario_id: string;
  solicitante_id: string;
  estado: 'pendiente' | 'aceptada' | 'en_logistica' | 'completada' | 'cancelada';
  mensaje?: string;
  agendado_en?: Date;
  creado_en: Date;
  actualizado_en: Date;
  // Datos relacionados del JOIN
  enseres?: {
    id: number;
    titulo: string;
    imagen_url: string;
  };
  propietario?: {
    nombre_completo: string;
  };
}

export interface ConfirmarRecepcion {
  transaccion_id: string;
  usuario_id: string;
  confirmado: boolean;
}