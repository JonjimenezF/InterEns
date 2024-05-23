import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { categoria } from '../models/categoria';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {


  URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';
  
  constructor(private http: HttpClient) { }

  getCategorias(): Observable<any[]> {
    // Realizar una solicitud GET al endpoint que devuelve las categorías
    return this.http.get<any[]>(this.URL_SUPEBASE);
  }
}
