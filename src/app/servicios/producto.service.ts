
  
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://54.210.35.66:4000/api'; // URL del backend Fastify

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los productos desde la API
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllProducts`);
  }
}
