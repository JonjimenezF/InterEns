// import { Injectable } from '@angular/core';
// import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// import { Observable, catchError, map, throwError } from 'rxjs';
// import { producto } from '../models/producto';
// import { subirImagen } from '../models/subirImagen';

// @Injectable({
//   providedIn: 'root'
// })
// export class ProductoService {

//   constructor(private _http: HttpClient) { }
//   private baseUrl = 'https://pystore-interens-7.onrender.com';  
  
//   addProduct(product: producto): Observable<any> {
//     return this._http.post<any>(this.baseUrl + '/agregar_producto', product).pipe(
//       catchError(this.handleError)
//     );
//   }

//   addImagenProduct(imagen:subirImagen): Observable<any> {
//     return this._http.post<any>(this.baseUrl + '/subir_imagen_producto', imagen).pipe(
//       catchError(this.handleError)
//     );
//   }

//   getProduct(): Observable<any[]> {
//     return this._http.get<any[]>(this.baseUrl + '/obtener_productos').pipe(
//       catchError(this.handleError)
//     );
//   }

//   // getProductById(id: number): Observable<any> {
//   //   return this._http.get<any>(this.baseUrl + '/PRODUCTO?id_producto=eq.' + id).pipe(
//   //     catchError(this.handleError)
//   //   );
//   // }

//   getImagenes(id_producto: number): Observable<any> {
//     return this._http.get<any>(this.baseUrl + '/obtener_imagen', { params: { id_producto: id_producto.toString() } }).pipe(
//       catchError(this.handleError)
//     );
//   }

//   getTodasImagenes(id_producto: number): Observable<any> {
//     return this._http.get<any>(this.baseUrl + '/obtener_todas_imagen', { params: { id_producto: id_producto.toString() } }).pipe(
//       catchError(this.handleError)
//     );
//   }

//   getProductosid(id_usuario:String): Observable<any>{
//     return this._http.get<any>(this.baseUrl + '/obtener_productos_id?id_usuario=' + id_usuario).pipe(
//       catchError(this.handleError)
//     )
//   }


//   // uploadPhoto(photo: File, id_producto: number): Observable<any> {
//   //   const formData: FormData = new FormData();
//   //   formData.append('foto', photo);
//   //   formData.append('id_producto', id_producto.toString());

//   //   return this._http.post<any>(this.baseUrl+ '/upload', formData).pipe(
//   //     catchError(this.handleError)
//   //   );
//   // }

//   private handleError(error: HttpErrorResponse) {
//     if (error.error instanceof ErrorEvent) {
//       // Error del lado del cliente
//       console.error('Error del lado del cliente:', error.error.message);
//     } else {
//       // El servidor retornó un código de error
//       console.error(
//         `Código de error ${error.status}, ` +
//         `mensaje: ${error.error}`);
//     }
//     // Devuelve un observable con un mensaje de error orientado al usuario
//     return throwError('Hubo un problema al realizar la operación. Por favor, intenta nuevamente más tarde.');
//   };


  








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

  
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = 'http://localhost:4000/api'; // URL del backend Fastify

  constructor(private http: HttpClient) {}

  // ✅ Obtener todos los productos desde la API
  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllProducts`);
  }
}
