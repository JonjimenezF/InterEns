import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class UbicacionService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://icnabdpciheuucjpesln.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFiZHBjaWhldXVjanBlc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njg5MjUsImV4cCI6MjA3MzQ0NDkyNX0.Lf8l8KclTXu3hzD0e3DxzoGQuuVfkUrZYyimvYUfUZ8'
    );
  }

  /** ✅ Obtener todas las regiones */
  async getRegiones(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('regiones')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener regiones:', error.message);
      throw error;
    }

    console.log('🌎 Regiones cargadas:', data);
    return data || [];
  }

  /** ✅ Obtener comunas por región */
  async getComunasPorRegion(regionId: number): Promise<any[]> {
    if (!regionId) return [];
    const { data, error } = await this.supabase
      .from('comunas')
      .select('id, nombre')
      .eq('region_id', regionId)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener comunas:', error.message);
      throw error;
    }

    console.log('🏙️ Comunas para región', regionId, ':', data);
    return data || [];
  }
}
