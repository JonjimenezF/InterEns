import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PuntosService {
  private apiUrl = 'http://localhost:4000/api'; // tu backend Fastify

  constructor(private http: HttpClient) {}

  // Obtener puntos de un usuario
  getUserPoints(usuario_id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/getUserPoints/${usuario_id}`);
  }

  // 🧾 Obtener historial de puntos del usuario
getUserPointsHistory(usuario_id: string) {
  return this.http.get(`${this.apiUrl}/getUserPointsHistory/${usuario_id}`);
}

}

