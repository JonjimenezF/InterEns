import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductosBackendService {
  // 🌍 Dirección de tu backend Fastify
  private apiUrl = 'http://54.210.35.66:4000/api';

  constructor(private http: HttpClient) {}

  /**
   * 🧩 Envía un nuevo producto al backend.
   * El backend se encarga de:
   * - Insertar el producto en la tabla "enseres"
   * - Sumar puntos al usuario en "user_points"
   */
  uploadProduct(enser: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/uploadProduct`, enser);
  }

  /**
   * (Opcional) Podrías agregar más funciones después,
   * como obtener productos, eliminar, editar, etc.
   */
}
