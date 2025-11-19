import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaccion, ConfirmarRecepcion } from '../models/transaccion';

@Injectable({
  providedIn: 'root'
})
export class TransaccionService {
  private apiUrl = 'http://54.210.35.66:4000/api';

  constructor(private http: HttpClient) {}

  confirmarRecepcion(transaccionId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/transacciones/${transaccionId}/confirmar`, {});
  }

  obtenerTransaccionesUsuario(usuarioId: string): Observable<Transaccion[]> {
    return this.http.get<Transaccion[]>(`${this.apiUrl}/transacciones/usuario/${usuarioId}`);
  }
}