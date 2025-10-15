import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  standalone: true,
  selector: 'app-auth-callback',
  imports: [IonContent],
  template: `<ion-content class="ion-padding">Procesando autenticación…</ion-content>`
})
export class AuthCallbackPage implements OnInit {
  constructor(private router: Router) {}

  async ngOnInit() {
    try {
      const href = window.location.href;
      const url = new URL(href);

      // 1) Soporte OAuth/PKCE (?code=...)
      const code = url.searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(href);
        if (error) throw error;
      }

      // 2) Detecta flujo de recuperación de contraseña
      const unsub = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          // manda al form de nueva contraseña
          this.safeNavigate('/auth/reset');
        }
      });

      // 3) Obtiene sesión y llama a tu backend si hay token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        await fetch('http://127.0.0.1:4000/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});
      }

      // 4) Limpia query/hash para evitar re-procesar
      history.replaceState({}, document.title, window.location.origin + '/');

      // 5) Si no fue recovery, al Home
      this.safeNavigate('/home');

      // cleanup
      unsub.data.subscription.unsubscribe();
    } catch (e) {
      console.error(e);
      this.safeNavigate('/login');
    }
  }

  private safeNavigate(path: string) {
    this.router.navigateByUrl(path, { replaceUrl: true });
  }
}
