import { Injectable } from '@angular/core';
import { supabase } from './supabase.client';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class EnserService {
  constructor(private http: HttpClient) {}

  // Inserta un nuevo enser (producto)
  async addEnser(enser: any) {
    const { data, error } = await supabase
      .from('enseres')
      .insert([enser])
      .select('*'); // 👈 retorna el registro insertado
    return { data, error };
  }

  // (Opcional) Si en el futuro guardas imágenes en otra tabla
  async addImagen(enser_id: number, ruta_storage: string, es_principal = true) {
    const { data, error } = await supabase
      .from('enser_imagenes')
      .insert([{ enser_id, ruta_storage, es_principal }]);
    return { data, error };
  }
}
