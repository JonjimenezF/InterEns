import { Injectable } from '@angular/core';
import { categoria } from '../models/categoria';
import { Observable, map, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse,  HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class CategoriaService {


  URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';

  supebaseheads = new HttpHeaders()
  .set ('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbHNhb3lraGpuaXlwdGhqZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTIwMTQsImV4cCI6MjAzMDEyODAxNH0.jmngoEfB87raLwTHDq1DI347a4owyHCqs75VSJUwMZo');


  constructor(private http: HttpClient) { }

   
  getCategoriaById(id: number): Observable<any> {
    return this.http.get<any>(this.URL_SUPEBASE + '/CATEGORIA?id_categoria=eq.' + id).pipe(
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


  getAllCategorias(): Observable<any[]> {
    const url = `${this.URL_SUPEBASE}CATEGORIA?select=*`;

    return this.http.get<any[]>(url, { headers: this.supebaseheads }).pipe(
      map((response: any) => {
        console.log('Response:', response);
        return response;
      }),
      catchError((error: any) => {
        console.error('Error:', error);
        return throwError(error);
      })
    );
  }
  }


