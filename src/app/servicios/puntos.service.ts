import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private apiUrl = 'http://localhost:4000/api';
  private puntosTotales = new BehaviorSubject<number>(0);
  puntosTotales$ = this.puntosTotales.asObservable();

  constructor(private http: HttpClient) {}

  /** 🪙 Obtener puntos actuales del usuario */
  getUserPoints(usuario_id: string): Observable<UserPointsResponse> {
    return this.http
      .get<UserPointsResponse>(`${this.apiUrl}/getUserPoints/${usuario_id}`)
      .pipe(
        tap((res) => {
          this.puntosTotales.next(res.total_points || 0);
        })
      );
  }

  /** 📜 Obtener historial */
  getUserPointsHistory(usuario_id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getUserPointsHistory/${usuario_id}`);
  }

  /** 🛍️ Obtener productos */
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllProducts`);
  }

  /** 🔄 Canjear producto */
  canjearProducto(
    usuario_id: string,
    producto_id: number,
    puntos_requeridos: number
  ): Observable<CanjearResponse> {
    const body: CanjearRequest = { usuario_id, producto_id, puntos_requeridos };
    return this.http
      .post<CanjearResponse>(`${this.apiUrl}/canjear`, body)
      .pipe(
        tap((res) => {
          if ('nuevo_total' in res && typeof res.nuevo_total === 'number') {
            this.puntosTotales.next(res.nuevo_total);
            this.dispararAnimacion(`-${puntos_requeridos}`);
          }
        })
      );
  }

  /** 🟢 Incrementar puntos (por publicación, borrador publicado, etc.) */
  sumarPuntos(puntosGanados: number) {
    const nuevoTotal = this.puntosTotales.value + puntosGanados;
    this.puntosTotales.next(nuevoTotal);
    this.dispararAnimacion(`+${puntosGanados}`);
  }

  /** ✨ Efecto visual flotante */
  private dispararAnimacion(texto: string) {
    const anim = document.createElement('div');
    anim.className = 'floating-points';
    anim.textContent = `${texto} InterCoins 💚`;
    document.body.appendChild(anim);

    setTimeout(() => anim.remove(), 1800);
  }
}
