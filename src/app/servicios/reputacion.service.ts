import { Injectable } from '@angular/core';
import { supabase } from '../services/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class ReputacionService {

  constructor() { }

  async obtenerReputacion(usuarioId: string) {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select('puntuacion')
        .eq('usuario_calificado', usuarioId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          promedio: 0,
          totalReviews: 0
        };
      }

      const totalPuntos = data.reduce((sum, cal) => sum + cal.puntuacion, 0);
      const promedio = totalPuntos / data.length;

      return {
        promedio: Math.round(promedio * 10) / 10, // Redondear a 1 decimal
        totalReviews: data.length
      };

    } catch (error) {
      console.error('Error obteniendo reputación:', error);
      return {
        promedio: 0,
        totalReviews: 0
      };
    }
  }

  async obtenerCalificacionesDetalladas(usuarioId: string) {
    try {
      const { data, error } = await supabase
        .from('calificaciones')
        .select(`
          puntuacion,
          comentario,
          created_at,
          usuario_calificador
        `)
        .eq('usuario_calificado', usuarioId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error obteniendo calificaciones detalladas:', error);
      return [];
    }
  }
}