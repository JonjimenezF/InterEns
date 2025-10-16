import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http'; // ✅ solo este
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';
import { HttpClientModule } from '@angular/common/http';

/* 🌿 Registrar Ionicons manualmente */
import { addIcons } from 'ionicons';
import {
  homeOutline,
  navigateOutline,
  addCircleOutline,
  personCircleOutline,
  personOutline,
  helpCircleOutline,
  mailOutline,
  informationCircleOutline,
  cashOutline,
  appsOutline,
  searchOutline,
  giftOutline,
  chevronDownOutline,
  cloudUploadOutline,
  trophyOutline,
  cartOutline,
  menuOutline
} from 'ionicons/icons';

/* 🧩 Agregamos todos los íconos usados en la app */
addIcons({
  'home-outline': homeOutline,
  'navigate-outline': navigateOutline,
  'add-circle-outline': addCircleOutline,
  'person-circle-outline': personCircleOutline,
  'person-outline': personOutline,
  'help-circle-outline': helpCircleOutline,
  'mail-outline': mailOutline,
  'information-circle-outline': informationCircleOutline,
  'cash-outline': cashOutline,
  'apps-outline': appsOutline,
  'search-outline': searchOutline,
  'gift-outline': giftOutline,
  'chevron-down-outline': chevronDownOutline,
  'cloud-upload-outline': cloudUploadOutline,
  'trophy-outline': trophyOutline,
  'cart-outline': cartOutline,
  'menu-outline': menuOutline
});

/* 🚀 Configuración estándar */
if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(), // ✅ aquí sí va
  ],
});
