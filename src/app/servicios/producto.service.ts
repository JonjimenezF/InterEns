import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';
  constructor(private _http: HttpClient) { }

  supebaseheads = new HttpHeaders()
  .set('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbHNhb3lraGpuaXlwdGhqZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTIwMTQsImV4cCI6MjAzMDEyODAxNH0.jmngoEfB87raLwTHDq1DI347a4owyHCqs75VSJUwMZo');

  AgregarFoto(product: producto): Observable<string | any> {
    console.log("HOLAAAAAA",product)
    return this._http.post<any>(this.URL_SUPEBASE + 'PRODUCTO?', product, { headers: this.supebaseheads }).pipe(
      map((product) => {
        console.log('Map', product);
        return product;
      }), catchError((err) => {
        console.log(err);
        return err;
      })
    );
  }

  getProduct(): Observable<any[]> {
    return this._http.get<any[]>(this.URL_SUPEBASE + "PRODUCTO?select=*", { headers: this.supebaseheads }).pipe(
      catchError((error) => {
        console.log(error);
        throw error;
      })
    );
  }
  
}