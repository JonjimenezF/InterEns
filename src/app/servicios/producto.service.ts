import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private _http: HttpClient) { }
  private baseUrl = 'http://localhost:5000';  
  
  addProduct(product: producto): Observable<any> {
    return this._http.post<any>(this.baseUrl + '/agregar_producto', product).pipe(
      catchError(this.handleError)
    );
  }

  getProduct(): Observable<any[]> {
    return this._http.get<any[]>(this.baseUrl + '/obtener_productos').pipe(
      catchError(this.handleError)
    );
  }

  getProductById(id: number): Observable<any> {
    return this._http.get<any>(this.baseUrl + '/PRODUCTO?id_producto=eq.' + id).pipe(
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








  // AgregarFoto(product: producto): Observable<string | any> {
  //   return this._http.post<any>(this.URL_SUPEBASE + 'PRODUCTO?', product, { headers: this.supebaseheads }).pipe(
  //     map((product) => {
  //       console.log('Map', product);
  //       return product;
  //     }), catchError((err) => {
  //       console.log(err);
  //       return err;
  //     })
  //   );
  // }

  // getProduct(): Observable<any[]> {
  //   return this._http.get<any[]>(this.URL_SUPEBASE + "PRODUCTO?select=*", { headers: this.supebaseheads }).pipe(
  //     catchError((error) => {
  //       console.log(error);
  //       throw error;
  //     })
  //   );
  // }


  // getProductoid(id: number):Observable<number | any> {
  //   return this._http.get<any>(this.URL_SUPEBASE + 'PRODUCTO?id_producto=eq.' + id, { headers: this.supebaseheads }).pipe(
  //     map((user) => {
  //     console.log("Map", user[0])
  //     return user[0]
  //     }), catchError((err) => {
  //     console.log(err)
  //     return err;
  //     })
  //   );
  // }

  
}