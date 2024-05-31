import { HttpClient, HttpErrorResponse, HttpHeaders,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { infoCarrito } from '../models/infoCarrito';
import { idUsuario } from '../models/idUsuario';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  constructor(private _http: HttpClient) { }
  private baseUrl = 'http://localhost:5000';  


  postCarrito(carrito: infoCarrito): Observable<any> {
    return this._http.post<any>(this.baseUrl + '/agregar_carrito', carrito).pipe(
      catchError(this.handleError)
    );
  }

  getCarrito(id_usuario: string): Observable<any> {
    const params = new HttpParams().set('id_usuario', id_usuario);
    return this._http.get<any>(this.baseUrl + '/obtener_carrito', { params }).pipe(
      catchError(this.handleError)
    );
  }

  getProductoCarrito(id_producto: number): Observable<any> {
    const params = new HttpParams().set('id_producto', id_producto);
    return this._http.get<any>(this.baseUrl + '/obtener_productos_carrito', { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      console.error('Error del lado del cliente:', error.error.message);
    } else {
      // El servidor retornó un código de error
      console.error(
        `Código de error ${error.status}, ` +
        `mensaje: ${error.error}`);
    }
    // Devuelve un observable con un mensaje de error orientado al usuario
    return throwError('Hubo un problema al realizar la operación. Por favor, intenta nuevamente más tarde.');
  };


}
