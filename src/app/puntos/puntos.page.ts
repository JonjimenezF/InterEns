// import { Component, OnInit } from '@angular/core';
// import {
//   IonHeader, IonToolbar, IonTitle, IonFooter, IonContent,
//   IonButton, IonImg, IonIcon, IonBackButton, IonButtons
// } from '@ionic/angular/standalone';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute, Router } from '@angular/router';
// import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
// import { PuntosService } from '../servicios/puntos.service'; // 👈 Importamos el servicio que conecta con el backend

// @Component({
//   selector: 'app-puntos',
//   templateUrl: './puntos.page.html',
//   styleUrls: ['./puntos.page.scss'],
//   standalone: true,
//   imports: [
//     IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg,
//     IonIcon, IonBackButton, IonButtons, CommonModule, IonFooter, FooterInterensComponent
//   ]
// })
// export class PuntosPage implements OnInit {
//   puntosTotales: number = 0; // Inicialmente 0, luego se obtiene desde el backend
//   usuarioId = '4e41acef-a7db-4225-882b-d510b6e49494'; // 👈 ID de tu usuario Supabase (por ahora fijo)

//   constructor(
//     private router: Router,
//     private activateRoute: ActivatedRoute,
//     private puntosService: PuntosService // 👈 Inyectamos el servicio
//   ) {}

//   ngOnInit() {
//     this.obtenerPuntos();
//   }

//   // 🔹 Llama al backend para obtener los puntos acumulados del usuario
//   obtenerPuntos() {
//     this.puntosService.getUserPoints(this.usuarioId).subscribe({
//       next: (res) => {
//         console.log('✅ Puntos obtenidos:', res);
//         this.puntosTotales = res.total_points || 0;
//       },
//       error: (err) => {
//         console.error('❌ Error al obtener puntos:', err);
//         this.puntosTotales = 0;
//       }
//     });
//   }

//   // 🔹 Navegar a la página de canje
//   canjearPuntos() {
//     this.router.navigate(['/canjear-puntos']);
//   }

//   // 🔹 Navegar a la página del historial de puntos
//   verHistorial() {
//     this.router.navigate(['/historial-puntos']);
//   }
// }
import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonContent,
  IonButton,
  IonImg,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { PuntosService } from '../servicios/puntos.service'; // ✅ tu servicio de puntos
import { supabase } from '../services/supabase.client'; // ✅ para obtener el usuario logueado

@Component({
  selector: 'app-puntos',
  templateUrl: './puntos.page.html',
  styleUrls: ['./puntos.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonImg,
    IonIcon,
    IonBackButton,
    IonButtons,
    CommonModule,
    IonFooter,
    FooterInterensComponent,
  ],
})
export class PuntosPage implements OnInit {
  puntosTotales: number = 0;
  usuario_id: string | null = null;

  constructor(
    private router: Router,
    private puntosService: PuntosService
  ) {}

  async ngOnInit() {
    await this.obtenerUsuario();
    if (this.usuario_id) {
      this.obtenerPuntos();
    }
  }

  // 🧩 Obtener usuario logueado desde Supabase
  async obtenerUsuario() {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (user) {
      this.usuario_id = user.id;
    } else {
      console.warn('⚠️ No hay usuario logueado.');
    }
  }

  // 🔢 Llamar al backend para obtener los puntos
  obtenerPuntos() {
    if (!this.usuario_id) return;

    this.puntosService.getUserPoints(this.usuario_id).subscribe({
      next: (res) => {
        console.log('🎯 Puntos obtenidos:', res);
        this.puntosTotales = res.total_points || 0;
      },
      error: (err) => {
        console.error('❌ Error al obtener puntos:', err);
      },
    });
  }

  canjearPuntos() {
    this.router.navigate(['/canjear-puntos']);
  }

  verHistorial() {
    this.router.navigate(['/historial-puntos']);
  }
}
