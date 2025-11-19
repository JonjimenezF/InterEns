import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonBadge,
  IonProgressBar,
  IonFooter,
  IonBackButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  ToastController,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-misiones',
  templateUrl: './misiones.page.html',
  styleUrls: ['./misiones.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonBadge,
    IonProgressBar,
    IonFooter,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    FooterInterensComponent,
  ],
})
export class MisionesPage implements OnInit, OnDestroy {
  misiones: any[] = [];
  infoMisiones = [
    { nombre: 'Sube 3 productos', condicion: 'Publica 3 enseres válidos', puntos: 50 },
    // 🚫 Eliminado: { nombre: 'Intercambia un producto', condicion: 'Completa un intercambio', puntos: 100 },
    { nombre: 'Canjea un producto con puntos', condicion: 'Canjea puntos en tienda', puntos: 30 },
  ];

  usuarioId: string | null = null;
  completadas = 0;
  totalMisiones = 0;
  puntosTotales = 0;
  cargando = true;
  mostrandoAnimacion = false;
  puntosGanados = 0;

  private actualizarListener?: () => void;
  private bloqueado = false;

  constructor(
    private http: HttpClient,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    this.usuarioId =
      localStorage.getItem('usuario_id') ||
      '4e41acef-a7db-4225-882b-d510b6e49494';

    this.cargarMisiones();

    // 🔁 Escucha evento global
    this.actualizarListener = async () => {
      if (this.bloqueado) return;
      this.bloqueado = true;

      console.log('♻️ Evento global → recargando misiones...');
      await this.cargarMisiones();
      this.mostrarToast('Misiones actualizadas ✅');

      setTimeout(() => (this.bloqueado = false), 1500);
    };

    window.addEventListener('misionesActualizadas', this.actualizarListener);
  }

  ngOnDestroy() {
    if (this.actualizarListener) {
      window.removeEventListener('misionesActualizadas', this.actualizarListener);
    }
  }

  ionViewWillEnter() {
    this.cargarMisiones();
  }

  goBack() {
    this.navCtrl.back();
  }

  async refrescarMisiones() {
    console.log('♻️ Refrescando misiones manualmente...');
    await this.cargarMisiones();
    this.mostrarToast('Misiones recargadas ✅');
  }

  // 📊 Obtiene y procesa misiones del backend
  cargarMisiones() {
    if (!this.usuarioId) return;
    this.cargando = true;

    const url = `http://54.210.35.66:4000/api/misiones/${this.usuarioId}?t=${Date.now()}`;

    this.http.get<any[]>(url).subscribe({
      next: (res) => {
        const puntosAntes = this.puntosTotales;

        // 🚫 Filtra la misión "Intercambia un producto"
        const filtradas = res.filter(
          (m) => m.nombre !== 'Intercambia un producto'
        );

        this.misiones = filtradas.map((m) => ({
          ...m,
          porcentaje: m.cantidad > 0 ? Math.min(m.progreso / m.cantidad, 1) : 0,
          veces_completada: m.veces_completada || 1,
        }));

        this.totalMisiones = this.misiones.length;
        this.completadas = this.misiones.filter((m) => m.completada).length;
        this.puntosTotales = this.misiones
          .filter((m) => m.completada)
          .reduce((sum, m) => sum + (m.puntos || 0), 0);

        // ✨ Mostrar animación si se ganaron puntos nuevos
        if (this.puntosTotales > puntosAntes) {
          this.puntosGanados = this.puntosTotales - puntosAntes;
          this.mostrarAnimacion();
        }

        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error al obtener misiones:', err);
        this.cargando = false;
      },
    });
  }

  // ✨ Animación visual al ganar puntos o completar misión
  mostrarAnimacion() {
    this.mostrandoAnimacion = true;
    setTimeout(() => (this.mostrandoAnimacion = false), 1800);
  }

  // 💬 Toast visual moderno
  async mostrarToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 1500,
      position: 'bottom',
      color: 'success',
    });
    toast.present();
  }
}
