import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import {
  IonContent, IonList, IonItem, IonInput, IonIcon, IonButton, IonCheckbox,
  IonImg, IonSpinner, IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent, IonList, IonItem, IonInput, IonIcon, IonButton, IonCheckbox, IonImg, IonSpinner, IonLabel
  ]
})
export class LoginPage {
  showPassword = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember: [false]
  });

  constructor(
    private fb: FormBuilder,
    private toastCtrl: ToastController
  ) {}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.form.invalid) {
      const t = await this.toastCtrl.create({
        message: 'Completa tu correo y contraseña.',
        duration: 1800,
        color: 'dark'
      });
      return t.present();
    }
    // Aquí integras tu lógica real de login (Firebase, Supabase, API, etc.)
    const t = await this.toastCtrl.create({
      message: 'Iniciando sesión…',
      duration: 1200,
      color: 'dark'
    });
    t.present();
  }

  onForgot() {
    // Navega a tu pantalla de recuperación de contraseña
    console.log('Recuperar contraseña');
  }
  showPwd = false;
  togglePwd() { this.showPwd = !this.showPwd; }
  async signIn() { /* conecta tu auth aquí */ }


  continueWithGoogle() {
    // Llama a tu flujo de Google (Capacitor + Firebase Auth, por ejemplo)
    console.log('Sign in with Google');
  }
}
