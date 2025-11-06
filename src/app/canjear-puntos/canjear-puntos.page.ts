// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AlertController } from '@ionic/angular';
// import { HttpClientModule } from '@angular/common/http';
// import {
//   IonHeader,
//   IonToolbar,
//   IonTitle,
//   IonContent,
//   IonButtons,
//   IonBackButton,
//   IonImg,
//   IonCard,
//   IonFooter,
//   IonCardHeader,
//   IonCardTitle,
//   IonCardSubtitle,
//   IonCardContent,
//   IonButton,
//   IonSpinner,
//   IonIcon,
//   ToastController
// } from '@ionic/angular/standalone';
// import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
// import { PuntosService } from '../servicios/puntos.service';
// import { supabase } from 'src/shared/supabase/supabase.client';

// @Component({
//   selector: 'app-canjear-puntos',
//   templateUrl: './canjear-puntos.page.html',
//   styleUrls: ['./canjear-puntos.page.scss'],
//   standalone: true,
//   imports: [
//     CommonModule,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonContent,
//     IonButtons,
//     IonBackButton,
//     IonImg,
//     IonCard,
//     IonCardHeader,
//     IonCardTitle,
//     IonCardSubtitle,
//     IonCardContent,
//     IonButton,
//     IonFooter,
//     IonSpinner,
//     IonIcon,
//     FooterInterensComponent,
//     HttpClientModule,
//   ],
// })
// export class CanjearPuntosPage implements OnInit, OnDestroy {
//   productos: any[] = [];
//   userId: string | undefined;
//   puntosTotales: number = 0;
//   loading = true;

//   private intercambiadoHandler?: (event: any) => void;

//   constructor(
//     private puntosService: PuntosService,
//     private alertController: AlertController,
//     private toastController: ToastController
//   ) {}

//   async ngOnInit() {
//     const { data: session } = await supabase.auth.getSession();
//     const { data: userData } = await supabase.auth.getUser();

//     if (userData?.user) {
//       this.userId = userData.user.id;
//       this.obtenerPuntos();
//       this.obtenerProductos();
//     } else {
//       console.warn('⚠️ No hay usuario autenticado.');
//     }

//     // 🧩 Listener global para actualizar al marcar productos como intercambiados
//     this.intercambiadoHandler = () => {
//       console.log('♻️ Evento recibido: productoIntercambiado → refrescando lista de canje.');
//       this.obtenerProductos();
//     };
//     window.addEventListener('productoIntercambiado', this.intercambiadoHandler);
//   }

//   ngOnDestroy() {
//     if (this.intercambiadoHandler) {
//       window.removeEventListener('productoIntercambiado', this.intercambiadoHandler);
//     }
//   }

//   // 🪙 Obtener puntos del usuario
//   obtenerPuntos() {
//     if (!this.userId) return;
//     this.puntosService.getUserPoints(this.userId).subscribe({
//       next: (res: any) => {
//         this.puntosTotales = res.total_points || 0;
//       },
//       error: (err: any) => {
//         console.error('❌ Error al obtener puntos:', err);
//       },
//     });
//   }

//   // 🛍️ Obtener todos los productos disponibles para canjear
// obtenerProductos() {
//   this.loading = true;
//   this.puntosService.getAllProducts().subscribe({
//     next: (data: any[]) => {
//       // ✅ Solo productos activos y publicados
//       this.productos = data.filter(p => p.activo && p.estado === 'publicado');
//       this.loading = false;
//       console.log(`🎁 Productos disponibles para canje: ${this.productos.length}`);
//     },
//     error: (err: any) => {
//       console.error('❌ Error al cargar productos:', err);
//       this.loading = false;
//     },
//   });
// }


//   // 🖼️ Imagen del producto o fallback
//   getImagenProducto(producto: any): string {
//     return producto.imagen_url || 'assets/img/default.png';
//   }

//   // 💱 Canjear producto
//   async canjear(item: any) {
//     if (!this.userId) return;

//     if (this.puntosTotales < item.valor_puntos) {
//       const alert = await this.alertController.create({
//         header: 'Puntos insuficientes 😕',
//         message: 'No tienes puntos suficientes para este canje.',
//         buttons: ['Aceptar'],
//         cssClass: 'custom-alert'
//       });
//       await alert.present();
//       return;
//     }

//     this.puntosService.canjearProducto(this.userId, item.id, item.valor_puntos).subscribe({
//       next: async (res: any) => {
//         if (res.success) {
//           this.puntosTotales = res.nuevo_total;
//           this.obtenerProductos();

//           const alert = await this.alertController.create({
//             header: '🎉 ¡Canje exitoso!',
//             message: `Has canjeado ${item.titulo} correctamente. Te quedan ${res.nuevo_total} puntos.`,
//             buttons: ['Aceptar'],
//             cssClass: 'custom-alert'
//           });
//           await alert.present();
//         } else {
//           const alert = await this.alertController.create({
//             header: 'Error ⚠️',
//             message: 'No se pudo completar el canje.',
//             buttons: ['Aceptar'],
//             cssClass: 'custom-alert'
//           });
//           await alert.present();
//         }
//       },
//       error: async () => {
//         const alert = await this.alertController.create({
//           header: '❌ Error',
//           message: 'Ocurrió un error al procesar el canje. Inténtalo nuevamente.',
//           buttons: ['Aceptar'],
//           cssClass: 'custom-alert'
//         });
//         await alert.present();
//       },
//     });
//   }
// }
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController, ToastController } from '@ionic/angular';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonImg,
  IonCard,
  IonFooter,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonSpinner,
  IonIcon,
} from '@ionic/angular/standalone';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { PuntosService } from '../servicios/puntos.service';
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  selector: 'app-canjear-puntos',
  templateUrl: './canjear-puntos.page.html',
  styleUrls: ['./canjear-puntos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonFooter,
    IonSpinner,
    IonIcon,
    FooterInterensComponent,
    HttpClientModule,
  ],
})
export class CanjearPuntosPage implements OnInit, OnDestroy {
  productos: any[] = [];
  userId: string | undefined;
  puntosTotales: number = 0;
  loading = true;

  private intercambiadoHandler?: (event: any) => void;

  constructor(
    private puntosService: PuntosService,
    private alertController: AlertController,
    private toastController: ToastController,
    private http: HttpClient
  ) {}

  async ngOnInit() {
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user) {
      this.userId = userData.user.id;
      this.obtenerPuntos();
      this.obtenerProductos();
    }

    this.intercambiadoHandler = () => {
      console.log('♻️ Evento recibido: productoIntercambiado → refrescando lista.');
      this.obtenerProductos();
    };
    window.addEventListener('productoIntercambiado', this.intercambiadoHandler);
  }

  ngOnDestroy() {
    if (this.intercambiadoHandler) {
      window.removeEventListener('productoIntercambiado', this.intercambiadoHandler);
    }
  }

  obtenerPuntos() {
    if (!this.userId) return;
    this.puntosService.getUserPoints(this.userId).subscribe({
      next: (res: any) => {
        this.puntosTotales = res.total_points || 0;
      },
      error: (err: any) => {
        console.error('❌ Error al obtener puntos:', err);
      },
    });
  }

  obtenerProductos() {
    this.loading = true;
    this.puntosService.getAllProducts().subscribe({
      next: (data: any[]) => {
        this.productos = data.filter((p) => p.activo && p.estado === 'publicado');
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar productos:', err);
        this.loading = false;
      },
    });
  }

  getImagenProducto(producto: any): string {
    return producto.imagen_url || 'assets/img/default.png';
  }

  // 💱 Canjear producto
  async canjear(item: any) {
    if (!this.userId) return;

    if (this.puntosTotales < item.valor_puntos) {
      const alert = await this.alertController.create({
        header: 'Puntos insuficientes 😕',
        message: 'No tienes puntos suficientes para este canje.',
        buttons: ['Aceptar'],
        cssClass: 'custom-alert',
      });
      await alert.present();
      return;
    }

    this.puntosService.canjearProducto(this.userId, item.id, item.valor_puntos).subscribe({
      next: async (res: any) => {
        if (res.success) {
          this.puntosTotales = res.nuevo_total;
          this.obtenerProductos();

          // 🧩 NUEVO: notificar al backend que se realizó la acción de canje
          try {
            await this.http.post('http://localhost:4000/api/misiones/registrar', {
              usuario_id: this.userId,
              tipo_accion: 'canjear_producto',
            }).toPromise();

            console.log('🏆 Misión "Canjear producto" registrada en backend');
            window.dispatchEvent(new Event('misionesActualizadas'));
          } catch (err) {
            console.error('⚠️ Error notificando misión de canje:', err);
          }

          const alert = await this.alertController.create({
            header: '🎉 ¡Canje exitoso!',
            message: `Has canjeado ${item.titulo} correctamente. Te quedan ${res.nuevo_total} puntos.`,
            buttons: ['Aceptar'],
            cssClass: 'custom-alert',
          });
          await alert.present();
        } else {
          const alert = await this.alertController.create({
            header: 'Error ⚠️',
            message: 'No se pudo completar el canje.',
            buttons: ['Aceptar'],
            cssClass: 'custom-alert',
          });
          await alert.present();
        }
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: '❌ Error',
          message: 'Ocurrió un error al procesar el canje. Inténtalo nuevamente.',
          buttons: ['Aceptar'],
          cssClass: 'custom-alert',
        });
        await alert.present();
      },
    });
  }
}
