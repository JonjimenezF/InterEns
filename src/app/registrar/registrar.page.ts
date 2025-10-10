import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonInput, IonItem, IonLabel, IonButton, IonImg, IonIcon} from '@ionic/angular/standalone';
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  selector: 'app-registrar',
  standalone: true,
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent, IonInput, IonItem, IonLabel, IonButton,IonImg,IonIcon
  ]
})
export class RegistrarPage {
  showPass = false;
  loading = false;
  form = this.fb.group({
    nombre_completo: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: ['']
  });

  constructor(
    private fb: FormBuilder,
    private toast: ToastController,
    private router: Router
  ) {}

  async onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    const { nombre_completo, email, password, telefono } = this.form.value as any;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {full_name: nombre_completo, email:email, phone_number: telefono },
        // URL DE CONFIRMACION
        emailRedirectTo: 'http://localhost:8100/auth/callback'
      }
    });

    if (error) {
      this.loading = false;
      const msg =
        error.message.includes('already registered') ? 'Este correo ya está registrado.' :
        error.message;
      (await this.toast.create({ message: msg, duration: 2500, color: 'danger' })).present();
      return;
    }

    if (!data.session) {
      const t = await this.toast.create({
        message: 'Cuenta creada. Revisa tu correo para confirmar.',
        duration: 3000,
        color: 'dark'
      });
      await t.present();
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return;
    }

    // Si no pides confirmación, viene sesión: sincroniza perfil y navega
    const token = data.session.access_token;
    await fetch('http://127.0.0.1:4000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
