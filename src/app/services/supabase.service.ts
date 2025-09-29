// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { AuthApiError, AuthChangeEvent, createClient, Session, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Escuchar cambios en el estado de autenticación
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('evento de supabase: ', event, session);
      // this.user.next(session?.user || null);
      // if (session === null) {
      //   this.router.navigate(['/login'], { replaceUrl: true });
      // } else {
        // console.log('datos del usuario', session.user);
        // this.router.navigate(['/home'], { replaceUrl: true });
      // }
    });
  }

  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'io.supabase.oauth://login',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Error durante el inicio de sesión:', error);
        return null;
      }

      console.log('Usuario autenticado:', data);
      return { data };
    } catch (error) {
      console.error('Error durante el inicio de sesión:', (error as any).message);
      return null;
    }
  }
  
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error durante el registro:', error);
    }

    return { data, error };
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        if (error.status === 400) {
          console.error('Error en el inicio de sesión:');
          return { data: null, error: 'Credenciales de inicio de sesión no válidas' };
        } else {
          console.error('Error en el inicio de sesión:', error.message);
          return { data: null, error: 'Ha ocurrido un error durante el inicio de sesión' };
        }
      }
      return { data, error: null };
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      return { data: null, error: 'Ha ocurrido un error durante el inicio de sesión' };
    }
  }
  
  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }

}
