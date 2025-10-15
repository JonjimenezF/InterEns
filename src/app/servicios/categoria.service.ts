// import { Injectable } from '@angular/core';
// import { categoria } from '../models/categoria';
// import { Observable, map, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { HttpClient, HttpErrorResponse,  HttpHeaders } from '@angular/common/http';



// @Injectable({
//   providedIn: 'root'
// })
// export class CategoriaService {


//   URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';

//   supebaseheads = new HttpHeaders()
//   .set ('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbHNhb3lraGpuaXlwdGhqZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTIwMTQsImV4cCI6MjAzMDEyODAxNH0.jmngoEfB87raLwTHDq1DI347a4owyHCqs75VSJUwMZo');


//   constructor(private http: HttpClient) { }

   
//   getCategoriaById(id: number): Observable<any> {
//     return this.http.get<any>(this.URL_SUPEBASE + '/CATEGORIA?id_categoria=eq.' + id).pipe(
//       catchError(this.handleError)
//     );
//   }
  

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


//   getTodasCategorias(): Observable<any[]> {
//     const url = `${this.URL_SUPEBASE}CATEGORIA?select=*`;

//     return this.http.get<any[]>(url, { headers: this.supebaseheads }).pipe(
//       map((response: any) => {
//         console.log('Response:', response);
//         return response;
//       }),
//       catchError((error: any) => {
//         console.error('Error:', error);
//         return throwError(error);
//       })
//     );
//   }
//   }

import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private supabase: SupabaseClient;

  constructor() {
    // 👇 Tu URL y tu API Key (anon)
    this.supabase = createClient(
      'https://icnabdpciheuucjpesln.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljbmFiZHBjaWhldXVjanBlc2xuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njg5MjUsImV4cCI6MjA3MzQ0NDkyNX0.Lf8l8KclTXu3hzD0e3DxzoGQuuVfkUrZYyimvYUfUZ8'
    );
  }

  /** ✅ Obtener todas las categorías */
  async getTodasCategorias(): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Error al obtener categorías:', error);
      throw error;
    }

    console.log('✅ Categorías desde Supabase:', data);
    return data || [];
  }

  /** ✅ Obtener categoría por ID */
  async getCategoriaById(id: number): Promise<any> {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error al obtener la categoría:', error);
      throw error;
    }

    return data;
  }
}
