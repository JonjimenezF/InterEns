import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonButton, IonInput, IonItem, IonImg, IonIcon, IonText, IonToast
} from '@ionic/angular/standalone';
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  standalone: true,
  selector: 'app-auth-reset',
  imports: [IonContent, IonButton, IonInput, IonItem, IonImg, IonIcon, IonText, IonToast, FormsModule],
  template: `
  <ion-content class="register" [fullscreen]="true">
    <div class="wrap">

      <!-- Marca -->
      <div class="brand">
        <ion-img class="logo" src="assets/nuevos_img/interens-logo.png"></ion-img>
        <h1 class="brand-name">InterEns</h1>
      </div>

      <form class="form" (ngSubmit)="submit()">

        <!-- Título -->
        <h2 class="title">Restablecer contraseña</h2>

        <!-- Nueva contraseña -->
        <label class="stack">Nueva contraseña</label>
        <div class="field">
          <div class="input-shell">
            <ion-img class="lead" src="assets/nuevos_img/cerrado.png"></ion-img>
            <ion-input
              [type]="show1 ? 'text' : 'password'"
              [(ngModel)]="p1"
              name="p1"
              placeholder="Mínimo 6 caracteres"
              autocomplete="new-password"
              required>
            </ion-input>
            <button type="button" class="ghost" (click)="show1 = !show1" aria-label="Mostrar/Ocultar">
              <ion-icon [name]="show1 ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Repetir contraseña -->
        <label class="stack">Repite la contraseña</label>
        <div class="field">
          <div class="input-shell">
            <ion-img class="lead" src="assets/nuevos_img/cerrado.png"></ion-img>
            <ion-input
              [type]="show2 ? 'text' : 'password'"
              [(ngModel)]="p2"
              name="p2"
              placeholder="Vuelve a escribirla"
              autocomplete="new-password"
              required>
            </ion-input>
            <button type="button" class="ghost" (click)="show2 = !show2" aria-label="Mostrar/Ocultar">
              <ion-icon [name]="show2 ? 'eye-off-outline' : 'eye-outline'"></ion-icon>
            </button>
          </div>
        </div>

        <!-- Mensaje -->
        <ion-text *ngIf="msg" [color]="error ? 'danger' : 'success'" class="msg">{{ msg }}</ion-text>

        <!-- CTA -->
        <ion-button class="cta" expand="block" shape="round" size="large"
                    type="submit" [disabled]="!p1 || !p2 || loading">
          {{ loading ? 'Guardando…' : 'GUARDAR CONTRASEÑA' }}
        </ion-button>
      </form>

    </div>
  </ion-content>
  `,
  styles: [`
:host{
  --bg:#0c0f13;
  --card:#14161a;
  --stroke:#2b3036;
  --txt:#ffffff;
  --muted:#b8bec6;
  --accent:#1fd39a;
}
ion-content.register{ --background:var(--bg); color:var(--txt); }

.wrap{ max-width:360px; margin:0 auto; padding:90px 18px 24px; }

.brand{ display:flex; align-items:center; justify-content:center; gap:14px; margin-bottom:8px; }
.logo{ width:56px; height:56px; }
.brand-name{ margin:0; color:#fff; font-size:30px; font-weight:800; }

.title{ margin:6px 2px 10px; font-size:20px; font-weight:800; color:#e5e9ef; }

.stack{ display:block; margin:14px 2px 6px; font-size:13.5px; color:#e5e9ef; font-weight:700; }
.field{ margin:0 0 12px 0; }

.input-shell{
  position:relative; display:flex; align-items:center;
  background:var(--card);
  border:1px solid var(--stroke);
  border-radius:10px; height:48px; padding:0 12px;
  box-shadow:0 2px 18px rgba(0,0,0,.18);
}
.input-shell .lead{ flex:0 0 40px; display:grid; place-items:center; margin-right:4px; }
.input-shell .lead::part(image){ width:22px; height:22px; }
.input-shell ion-input{
  flex:1 1 0%; min-width:0;
  --padding-start:0; --padding-end:38px;
  --color:var(--txt);
  --placeholder-color:var(--muted); --placeholder-opacity:1;
}
.ghost{
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  border:none; background:transparent; color:var(--muted);
  display:grid; place-items:center; font-size:20px;
  cursor:pointer;
}
.msg{ display:block; margin:4px 4px 0; }

.cta{
  --background:var(--accent); --color:#0b1115;
  --border-radius:12px;
  --padding-top:14px; --padding-bottom:14px;
  font-weight:800; letter-spacing:.3px; margin-top:12px;
}
  `]
})
export class AuthResetPage {
  p1 = '';
  p2 = '';
  show1 = false;
  show2 = false;
  loading = false;
  msg = '';
  error = false;

  constructor(private router: Router) {}

  async submit() {
    this.msg = ''; this.error = false;
    if (this.p1.length < 6) { this.msg = 'La contraseña debe tener al menos 6 caracteres.'; this.error = true; return; }
    if (this.p1 !== this.p2) { this.msg = 'Las contraseñas no coinciden.'; this.error = true; return; }

    this.loading = true;
    const { error } = await supabase.auth.updateUser({ password: this.p1 });
    this.loading = false;

    if (error) { this.msg = error.message; this.error = true; return; }

    this.msg = 'Contraseña actualizada. Redirigiendo…';
    setTimeout(() => this.router.navigateByUrl('/login', { replaceUrl: true }), 1000);
  }
}
