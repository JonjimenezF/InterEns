import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  imports: [IonContent],
  template: `<ion-content></ion-content>`
})
export class AuthCallbackPage implements OnInit {
  constructor(private router: Router) {}

  async ngOnInit() {
    // 1) Maneja el callback de autenticación
    await supabase.auth.getSession();

    // 2) Llama a tu API con el token del usuario
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token) {
      await fetch('http://127.0.0.1:4000/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }

    // 3) Navega al Home
    this.router.navigateByUrl('/home', { replaceUrl: true });
  }
}
