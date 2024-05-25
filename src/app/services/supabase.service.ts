// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { idUsuario } from '../models/idUsuario';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  constructor(private router: Router) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:8100/home', // Asegúrate de cambiar esta URL por la tuya
      }
      
    });
   const { data: { user } } = await this.supabase.auth.getUser()
   console.log(this.supabase.auth.getUser)

    if (error) console.error('Error durante el inicio de sesión:', error);
  }
  
  async signUpWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) {
      console.error('Error durante el inicio de sesión:', error);
    } else {
      console.log('Datos de inicio de sesión:', data);
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('user_id', data.user.id);
      this.router.navigate(['/home']);  // Redirigir a home
    }
    return { data, error };
  }
  
  async resetPassword(email: string) {
    const { data, error } = await this.supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  }
}
