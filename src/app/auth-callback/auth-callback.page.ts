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
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
      await fetch('http://54.210.35.66:4000/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});

      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      // si algo falla, vuelve al login
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
