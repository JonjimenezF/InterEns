import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';
import { rUsuario } from '../models/rUsuario';
import { userLogin } from '../models/userLogin';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  URL_SUPEBASE ='https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/';
  constructor(private _http: HttpClient) { }

  supebaseheads = new HttpHeaders()
  .set ('apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbHNhb3lraGpuaXlwdGhqZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ1NTIwMTQsImV4cCI6MjAzMDEyODAxNH0.jmngoEfB87raLwTHDq1DI347a4owyHCqs75VSJUwMZo');

  // registerUser(user: rUsuario): Observable<string | any> {
  //   return this._http.post<any>(this.URL_SUPEBASE + "USUARIO?", user, { headers: this.supebaseheads }).pipe(
  //     map((user) => {
  //       console.log("Map", user)
  //       return user
  //     }), catchError((err) => {
  //       console.log(err)
  //       return err;
  //     })
  //   )
  // }


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


  getLogin(UserLogin: userLogin): Observable<string | any> {
    return this._http.get<any>(this.URL_SUPEBASE + "USUARIO?email=eq." + UserLogin.email + "&password=eq." + UserLogin.password, { headers: this.supebaseheads }).pipe(
      map((user) => {
        console.log("Map", user[0])
        return user[0]
      }), catchError((err) => {
        console.log(err)
        return err;
      })
    )
  }

  

  
}