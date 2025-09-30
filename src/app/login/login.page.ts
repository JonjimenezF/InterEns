import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCardContent,
  IonItem, IonInput, IonButton, IonIcon, IonImg, IonSpinner,
  IonCheckbox, IonList, IonLabel
} from '@ionic/angular/standalone';
import { AlertController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
   imports: [
    // Angular
    CommonModule,           // por si usas *ngIf/*ngFor
    ReactiveFormsModule,    // <<--- NECESARIO para [formGroup] y formControlName

    // Ionic standalone
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonCardContent, IonList,
    IonItem, IonInput, IonButton, IonIcon, IonImg,
    IonSpinner, IonCheckbox, IonLabel
  ]
})
export class LoginPage {
  form: FormGroup;
  showPwd = false;
  loading = false;

  constructor(
    fb: FormBuilder,
    private router: Router,
    private toast: ToastController,
    private alert: AlertController
  ) {
    this.form = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  togglePwd() { this.showPwd = !this.showPwd; }

  async signIn() {
    if (this.form.invalid) return;
    this.loading = true;
    const { email, password, remember } = this.form.value;
    try {
      // TODO auth
      if (remember) localStorage.setItem('interens.lastEmail', email);
      else localStorage.removeItem('interens.lastEmail');
      await this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (err: any) {
      (await this.toast.create({ message: err?.message ?? 'No se pudo iniciar sesión', duration: 2500, color: 'danger' })).present();
    } finally {
      this.loading = false;
    }
  }

  async signInWithGoogle() { /* TODO OAuth */ }
  async forgotPassword(ev?: Event) { /* TODO reset */ }
}