import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { HttpClientModule } from '@angular/common/http';

// 👇 IMPORTANTE: imports nuevos
import { Platform } from '@ionic/angular';
import { SocialLogin } from '@capgo/capacitor-social-login';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet, HttpClientModule],
})
export class AppComponent {
  constructor(private platform: Platform) {
    this.platform.ready().then(() => {
      this.initSocialLogin();
    });
  }

  private async initSocialLogin() {
    try {
      await SocialLogin.initialize({
        google: {
          // ⚠️ usa tu Client ID WEB de Google
          webClientId: '997631884203-1b33ils4o4i776u6paskj2qjrnaui7j0.apps.googleusercontent.com',
        },
      });
      console.log('Google SocialLogin inicializado correctamente');
    } catch (err) {
      console.error('Error inicializando SocialLogin', err);
    }
  }
}
