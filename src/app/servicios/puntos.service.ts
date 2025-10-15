import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/** Tipos de ayuda (opcional pero útil) */
export interface UserPointsResponse {
  total_points: number;
}

export interface CanjearRequest {
  usuario_id: string;
  producto_id: number;
  puntos_requeridos: number;
}

export type CanjearResponse =
  | { success: true; nuevo_total: number; message: string }
  | { error: string };

@Injectable({
  providedIn: 'root'
})
export class PuntosService {
  /** Ajusta si tu backend cambia de URL o puerto */
  private apiUrl = 'http://localhost:4000/api';

  constructor(private http: HttpClient) {}

  /** 🪙 Obtener puntos actuales del usuario */
  getUserPoints(usuario_id: string): Observable<UserPointsResponse> {
    return this.http.get<UserPointsResponse>(`${this.apiUrl}/getUserPoints/${usuario_id}`);
  }

  /** 📜 (Opcional) Obtener historial de puntos del usuario */
  getUserPointsHistory(usuario_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getUserPointsHistory/${usuario_id}`);
  }

  /** 🛍️ Traer todos los productos (enseres activos) */
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllProducts`);
  }

  /** 🔄 Canjear un producto con puntos */
  canjearProducto(
    usuario_id: string,
    producto_id: number,
    puntos_requeridos: number
  ): Observable<CanjearResponse> {
    const body: CanjearRequest = { usuario_id, producto_id, puntos_requeridos };
    return this.http.post<CanjearResponse>(`${this.apiUrl}/canjear`, body);
    // TIP: si tu backend exige auth, aquí puedes agregar headers con token.
  }
}
