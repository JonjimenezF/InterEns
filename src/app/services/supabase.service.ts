// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { AuthApiError, AuthChangeEvent, createClient, Session, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('supabase event: ', event);
      if (session === null) {
        this.router.navigate(['/login'], { replaceUrl: true });
      } else {
        console.log('data del usuario', session.user);
        this.router.navigate(['/home'], { state: { userInfo: session.user }, replaceUrl: true });
      }
    });
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:8100/home', // Asegúrate de cambiar esta URL por la tuya
        queryParams:{
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
        console.error('Error durante el inicio de sesión:', error);
        return null; // O alguna otra forma de manejar el error, como lanzar una excepción
    }

    return { data };
  }
  
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
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
