import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { rUsuario } from '../models/rUsuario';
import { userLogin } from '../models/userLogin';


@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  signInWithGoogle() {
    throw new Error('Method not implemented.');
  }
  URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';
  constructor(private _http: HttpClient) { }

  private baseUrl = 'http://localhost:5000';  

  supebaseheads = new HttpHeaders()
  .set ('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbHNhb3lraGpuaXlwdGhqZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTIwMTQsImV4cCI6MjAzMDEyODAxNH0.jmngoEfB87raLwTHDq1DI347a4owyHCqs75VSJUwMZo');


  RegistrarUsuario(user: rUsuario): Observable<string | any> {
    console.log("HOLAAAAAA",user)
    return this._http.post<any>(this.URL_SUPEBASE + 'USUARIO?', user, { headers: this.supebaseheads }).pipe(
      map((user) => {
        console.log('Map', user);
        return user;
      }), catchError((err) => {
        console.log(err);
        return err;
      })
    );
  }

  getLogin(UserLogin: userLogin): Observable<any> {
    const credencial = { email: UserLogin.email, password: UserLogin.password };
    return this._http.post<any>(this.baseUrl + '/login', credencial).pipe(
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