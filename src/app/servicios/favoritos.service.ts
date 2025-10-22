import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { supabase } from '../services/supabase.client'; // ⚠️ Ajusta la ruta si tu cliente está en otra carpeta

@Injectable({
  providedIn: 'root',
})
export class FavoritosService {
  constructor() {}

  // ✅ Obtener favoritos del usuario actual
  getFavoritos(userId: string): Observable<any[]> {
    return from(
      (async () => {
        const { data, error } = await supabase
          .from('favoritos')
          .select('producto_id, enseres(*)')
          .eq('usuario_id', userId);

        if (error) throw error;

        // devolvemos solo la lista de productos
        return data.map((f) => f.enseres);
      })()
    );
  }

  // ✅ Agregar un favorito
  addFavorito(userId: string, productoId: number): Observable<any> {
    return from(
      (async () => {
        const { error } = await supabase
          .from('favoritos')
          .insert([{ usuario_id: userId, producto_id: productoId }]);

        if (error) throw error;
        return { success: true };
      })()
    );
  }

  // ✅ Eliminar un favorito
  removeFavorito(userId: string, productoId: number): Observable<any> {
    return from(
      (async () => {
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('usuario_id', userId)
          .eq('producto_id', productoId);

        if (error) throw error;
        return { success: true };
      })()
    );
  }

  // ✅ Comprobar si un producto está en favoritos
  isFavorito(userId: string, productoId: number): Observable<boolean> {
    return from(
      (async () => {
        const { data, error } = await supabase
          .from('favoritos')
          .select('id')
          .eq('usuario_id', userId)
          .eq('producto_id', productoId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // ignora "no rows found"
        return !!data;
      })()
    );
  }
}
