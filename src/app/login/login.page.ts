import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Platform, ToastController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Component } from '@angular/core';
import {
  IonContent, IonList, IonItem, IonInput, IonIcon, IonButton, IonCheckbox,
  IonImg, IonSpinner, IonLabel
} from '@ionic/angular/standalone';
import { Router } from '@angular/router'; //rutas

import { supabase } from 'src/shared/supabase/supabase.client';
import { environment } from 'src/environments/environment';




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
    private platform: Platform,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    if (this.form.invalid) {
    const t = await this.toastCtrl.create({ message: 'Completa tu correo y contraseña.', duration: 1800, color: 'dark' });
    return t.present();
    }
    await this.loginWithEmail();
  }

  private async loginWithEmail() {
  const { email, password } = this.form.value as { email: string; password: string };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    const t = await this.toastCtrl.create({ message: error.message, duration: 2200, color: 'danger' });
    return t.present();
  }

  // si requiere confirmación de email y aún no confirma, session puede venir null
  if (!data.session) {
    const t = await this.toastCtrl.create({ message: 'Revisa tu correo para confirmar la cuenta.', duration: 2800, color: 'dark' });
    return t.present();
  }

  // sincroniza perfil en tu backend y navega
  const token = data.session.access_token;
  await fetch('http://127.0.0.1:4000/auth/me', { headers: { Authorization: `Bearer ${token}` } }).catch(()=>{});
  this.router.navigateByUrl('/home', { replaceUrl: true });
}
  

  async onForgot() {
    // Navega a tu pantalla de recuperación de contraseña
    const email = this.form.get('email')?.value?.toString() || '';
    if (!email) {
      const t = await this.toastCtrl.create({ message: 'Ingresa tu correo y vuelve a intentar.', duration: 2000, color: 'dark' });
      return t.present();
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8100/auth/reset' // crea esta page y configúrala también en Supabase
    });
    if (error) {
      const t = await this.toastCtrl.create({ message: error.message, duration: 2500, color: 'danger' });
      return t.present();
    }
    const t = await this.toastCtrl.create({ message: 'Te enviamos un correo para restablecer tu contraseña.', duration: 2500, color: 'dark' });
    t.present();
  }
  
  onRecuperar() {
    // Navega a tu pantalla de recuperación de contraseña
    this.router.navigateByUrl('/registrar', { replaceUrl: true });

  }
  showPwd = false;
  togglePwd() { this.showPwd = !this.showPwd; }
  async signIn() { /* conecta tu auth aquí */ }


  async continueWithGoogle() {
    const isMobile = this.platform.is('capacitor');
    const redirectTo = isMobile ? environment.redirectUrlMobile : environment.redirectUrlWeb;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        queryParams: { prompt: 'select_account' }
      }
    });

    if (error) {
      const t = await this.toastCtrl.create({ message: error.message, duration: 2200, color: 'danger' });
      t.present();
    }
  }
}
