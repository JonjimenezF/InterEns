//login.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonContent, IonCardContent, IonItem, IonInput, IonButton, IonImg } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';
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
  imports: [
    IonHeader,
    IonContent,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonImg,
    CommonModule, 
    FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  // toastController: any;

  constructor(private supabaseService: SupabaseService,
              private router: Router,
              private toastController: ToastController
              ) {}

  async signInWithGoogle() {
    try {
      const userInfo = await this.supabaseService.signInWithGoogle();
      console.log(userInfo);
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
    }
  }

  async signUp() {
    // Expresión regular para validar el formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Verifica si el correo electrónico coincide con el formato esperado
    if (!emailRegex.test(this.email)) {
      this.showToast('Correo electrónico inválido');
      return;
    }
  
    try {
      // Llama a signUpWithEmail solo si el correo electrónico es válido
      const { data } = await this.supabaseService.signUpWithEmail(this.email, this.password);
      console.log('Usuario registrado:', data);
      this.showToast('Registro exitoso!');
      // Redirige o realiza alguna acción después de un registro exitoso
    } catch (error) {
      this.showToast('Error en el registro');
      console.error('Error en el registro:', error);
    }
  }

  async signIn() {
      const { data, error } = await this.supabaseService.signInWithEmail(this.email, this.password);
      if (error) {
        this.showToast('El correo que ingresaste, o la contraseña, son inválidos. Por favor, vuelve a intentar');
        console.error('Error en el inicio de sesión:', error);
      } else {
        console.log('Inicio de sesión exitoso:', data);
        this.showToast('Inicio de sesión exitoso!');
        this.router.navigate(['/home'], { state: { userInfo: data } });
      }
  }

  //inhabilida el boton
  isFormValid(): boolean {
    return !!this.email;
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
      duration: 4000,
      position: 'top'
    });
    toast.present();
  }
}
