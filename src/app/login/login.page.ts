//login.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { userLogin } from '../models/userLogin';
import { UsuarioService } from '../servicios/usuario.service';
import { lastValueFrom } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  toastController: any;

  constructor(private supabaseService: SupabaseService) {}

  // Asegúrate de que el método signInWithGoogle está definido así:
  signInWithGoogle() {
    this.supabaseService.signInWithGoogle();
    return this.supabaseService.signInWithGoogle
    
  }
  async signUp() {
    const { data, error } = await this.supabaseService.signUpWithEmail(this.email, this.password);
    if (error) {
      console.error('Error en el registro:', error);
    } else {
      console.log('Usuario registrado:', data);
    }
  }

  async signIn() {
    const { data, error } = await this.supabaseService.signInWithEmail(this.email, this.password);
    if (error) {
      console.error('Error en el inicio de sesión:', error);
    } else {
      console.log('Inicio de sesión exitoso:', data);
    }
  }
  async resetPassword() {
    const { data, error } = await this.supabaseService.resetPassword(this.email);
    if (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      this.showToast(error.message || "Error al enviar el correo de recuperación. Por favor, inténtalo más tarde.");
    } else {
      console.log('Solicitud de restablecimiento de contraseña enviada:', data);
      this.showToast("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top'
    });
    toast.present();
  }
}
