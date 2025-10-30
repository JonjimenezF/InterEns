import { Injectable } from '@angular/core';
import { supabase } from '../services/supabase.client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  // Obtener o crear conversación entre dos usuarios
  async obtenerConversacion(usuario1Id: string, usuario2Id: string, productoId?: number) {
    const { data, error } = await supabase
      .from('conversaciones')
      .select('*')
      .or(`and(usuario1_id.eq.${usuario1Id},usuario2_id.eq.${usuario2Id}),and(usuario1_id.eq.${usuario2Id},usuario2_id.eq.${usuario1Id})`)
      .eq('producto_id', productoId || null)
      .single();

    if (error && error.code === 'PGRST116') {
      // No existe, crear nueva conversación
      return this.crearConversacion(usuario1Id, usuario2Id, productoId);
    }

    return { data, error };
  }

  // Crear nueva conversación
  async crearConversacion(usuario1Id: string, usuario2Id: string, productoId?: number) {
    const { data, error } = await supabase
      .from('conversaciones')
      .insert({
        usuario1_id: usuario1Id,
        usuario2_id: usuario2Id,
        producto_id: productoId || null
      })
      .select()
      .single();

    return { data, error };
  }

  // Enviar mensaje
  async enviarMensaje(conversacionId: number, remitenteId: string, mensaje: string) {
    const { data, error } = await supabase
      .from('mensajes')
      .insert({
        conversacion_id: conversacionId,
        remitente_id: remitenteId,
        mensaje: mensaje
      })
      .select()
      .single();

    if (!error) {
      // Actualizar último mensaje en conversación
      await supabase
        .from('conversaciones')
        .update({ 
          ultimo_mensaje: mensaje,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversacionId);
    }

    return { data, error };
  }

  // Obtener mensajes de una conversación
  async obtenerMensajes(conversacionId: number) {
    const { data, error } = await supabase
      .from('mensajes')
      .select('*')
      .eq('conversacion_id', conversacionId)
      .order('created_at', { ascending: true });

    return { data, error };
  }

  // Obtener conversaciones del usuario con información del enser
  async obtenerConversacionesUsuario(usuarioId: string) {
    const { data, error } = await supabase
      .from('conversaciones')
      .select(`
        *,
        enseres!producto_id(titulo, imagen_url)
      `)
      .or(`usuario1_id.eq.${usuarioId},usuario2_id.eq.${usuarioId}`)
      .order('updated_at', { ascending: false });

    return { data, error };
  }

  // Marcar mensajes como leídos
  async marcarComoLeido(conversacionId: number, usuarioId: string) {
    const { error } = await supabase
      .from('mensajes')
      .update({ leido: true })
      .eq('conversacion_id', conversacionId)
      .neq('remitente_id', usuarioId);

    return { error };
  }
}