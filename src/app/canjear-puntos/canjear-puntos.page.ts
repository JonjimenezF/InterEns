
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
        // Mostrar solo productos activos y publicados
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

    // 🚫 Evitar que el usuario canjee su propio producto
    if (item.propietario_id === this.userId) {
      const alert = await this.alertController.create({
        header: '⚠️ No permitido',
        message: 'No puedes canjear un producto que tú mismo publicaste.',
        buttons: ['Entendido'],
        cssClass: 'custom-alert',
      });
      await alert.present();
      return;
    }

    // ⚠️ Verificar puntos suficientes
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

    try {
      // 🔄 Llamar al backend actualizado
      const response: any = await this.http.post('http://localhost:4000/api/canjear', {
        usuario_id: this.userId,
        producto_id: item.id,
        puntos_requeridos: item.valor_puntos,
      }).toPromise();

      if (response.success) {
        this.puntosTotales = response.nuevo_total;
        this.obtenerProductos();

        const alert = await this.alertController.create({
          header: '🎉 ¡Canje exitoso!',
          message: `Has canjeado ${item.titulo}. Se sumaron los puntos al propietario.`,
          buttons: ['Aceptar'],
          cssClass: 'custom-alert',
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: 'Error ⚠️',
          message: response.error || 'No se pudo completar el canje.',
          buttons: ['Aceptar'],
          cssClass: 'custom-alert',
        });
        await alert.present();
      }
    } catch (error) {
      console.error('❌ Error al canjear producto:', error);
      const alert = await this.alertController.create({
        header: '❌ Error',
        message: 'Ocurrió un error al procesar el canje. Inténtalo nuevamente.',
        buttons: ['Aceptar'],
        cssClass: 'custom-alert',
      });
      await alert.present();
    }
  }
}
