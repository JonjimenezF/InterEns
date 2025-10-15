import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertController } from '@ionic/angular';

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
  ToastController
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
    FooterInterensComponent
  ],
})
export class CanjearPuntosPage implements OnInit {
  productos: any[] = [];
  userId: string | undefined;
  puntosTotales: number = 0;
  loading = true;

  constructor(
    private puntosService: PuntosService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    const { data: session } = await supabase.auth.getSession();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      this.userId = userData.user.id;
      this.obtenerPuntos();
      this.obtenerProductos();
    } else {
      console.warn('⚠️ No hay usuario autenticado.');
    }
  }

  // 🪙 Obtener puntos del usuario
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

  // 🛍️ Obtener todos los productos disponibles para canjear
  obtenerProductos() {
    this.loading = true;
    this.puntosService.getAllProducts().subscribe({
      next: (data: any[]) => {
        this.productos = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar productos:', err);
        this.loading = false;
      },
    });
  }

  // 🖼️ Imagen del producto o fallback
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
      cssClass: 'custom-alert'
    });
    await alert.present();
    return;
  }

  this.puntosService.canjearProducto(this.userId, item.id, item.valor_puntos).subscribe({
    next: async (res: any) => {
      if (res.success) {
        this.puntosTotales = res.nuevo_total;
        this.obtenerProductos();

        const alert = await this.alertController.create({
          header: '🎉 ¡Canje exitoso!',
          message: `Has canjeado ${item.titulo} correctamente.Te quedan 
          ${res.nuevo_total} puntos.`,
          buttons: ['Aceptar'],
          cssClass: 'custom-alert'
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Error ⚠️',
          message: 'No se pudo completar el canje.',
          buttons: ['Aceptar'],
          cssClass: 'custom-alert'
        });
        await alert.present();
      }
    },
    error: async () => {
      const alert = await this.alertController.create({
        header: '❌ Error',
        message: 'Ocurrió un error al procesar el canje. Inténtalo nuevamente.',
        buttons: ['Aceptar'],
        cssClass: 'custom-alert'
      });
      await alert.present();
    },
  });
}

}
