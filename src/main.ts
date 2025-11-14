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
  menuOutline,
  heart,
  heartOutline,
  pinOutline,
  cubeOutline,
  carOutline,
  bagCheckOutline,
  chatbubblesOutline,
  documentTextOutline,
  starOutline,
  checkmarkCircleOutline,
  swapHorizontalOutline,
  leafOutline,
  checkmarkDoneOutline,
  checkmarkCircle,
} from 'ionicons/icons';

/* 🧩 Agregamos todos los íconos usados en la app */
addIcons({
  // Navegación principal
  'home-outline': homeOutline,
  'navigate-outline': navigateOutline,
  'add-circle-outline': addCircleOutline,
  'person-circle-outline': personCircleOutline,
  'person-outline': personOutline,

  // Utilidades
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
  'menu-outline': menuOutline,

  // Corazones
  'heart': heart,
  'heart-outline': heartOutline,

  // Ubicación y productos
  'pin-outline': pinOutline,
  'cube-outline': cubeOutline,

  // Entrega
  'car-outline': carOutline,
  'bag-check-outline': bagCheckOutline,

  // 📩 MENSAJES
  'chatbubbles-outline': chatbubblesOutline,

  // 📄 BORRADORES
  'document-text-outline': documentTextOutline,

  // ⭐ RESEÑAS
  'star-outline': starOutline,

  // ✔ RECEPCIÓN
  'checkmark-circle-outline': checkmarkCircleOutline,
  'checkmark-circle': checkmarkCircle,
  'checkmark-done-outline': checkmarkDoneOutline,

  // 🔄 SOLICITUDES
  'swap-horizontal-outline': swapHorizontalOutline,

  // 🌱 IMPACTO
  'leaf-outline': leafOutline,
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
