import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';

@Injectable({
  providedIn: 'root'
})
export class EnserService {
  constructor() {}

  // Inserta un nuevo enser (producto)
  async addEnser(enser: any) {
    const { data, error } = await supabase
      .from('enseres')
      .insert([enser])
      .select()
      .single();
    return { data, error };
  }

  // Inserta una imagen asociada a un enser
  async addImagen(enser_id: number, ruta_storage: string, es_principal = true) {
    const { data, error } = await supabase
      .from('enser_imagenes')
      .insert([
        {
          enser_id,
          ruta_storage,
          es_principal
        }
      ]);
    return { data, error };
  }
}
