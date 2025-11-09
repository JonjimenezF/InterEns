import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonIcon
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { supabase } from 'src/shared/supabase/supabase.client';
import { PuntosService } from '../servicios/puntos.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonButton,
    IonImg,
    IonCard,
    IonCardContent,
    IonAvatar,
    IonIcon
  ]
})
export class HomePage implements OnInit, OnDestroy {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;
  perfile: any;

  formNombre = '';
  formTelefono = '';
  formNombreUsuario = '';
  loading = true;
  userId: string | undefined;
  userInfo?: any;

  selectedCard: string | null = null;
  puntosTotales: number = 0;

  mostrarAnimacion = false;
  puntosGanados = 0;

  // 🔔 Canal realtime
  private realtimeChannel: any;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private navCtrl: NavController,
    private puntosService: PuntosService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  // 🟢 Cargar usuario y puntos al iniciar
  async ngOnInit() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      this.userInfo = userData.user;
      this.userId = userData.user.id;
      console.log('✅ Usuario activo:', this.userId);

      // Carga inicial
      await this.cargarPuntosIniciales();

      // Escucha cambios realtime
      this.escucharCambiosEnPuntos();
    } else {
      console.warn('⚠️ No hay usuario autenticado.');
    }

    this.loading = true;
    await this.loadPerfil();
  }

  async ionViewWillEnter() {
    await this.loadPerfil();
  }

  private async loadPerfil() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const r = await fetch('http://127.0.0.1:4000/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const perfil = await r.json();

    this.perfile = perfil;

    let url = perfil?.avatar_url ?? null;
    if (url && !url.includes('?v=')) {
      url = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    }
    this.avatarUrl = url;

    this.loading = false;
  }

  // 💰 Cargar puntos actuales (snapshot inicial)
  private async cargarPuntosIniciales() {
    if (!this.userId) return;

    // Usa tu service (el mismo que ocupabas antes en obtenerPuntos)
    await new Promise<void>((resolve) => {
      this.puntosService.getUserPoints(this.userId!).subscribe({
        next: (res) => {
          console.log('🔹 Snapshot puntos (service):', res);
          this.puntosTotales = Number(res?.total_points ?? 0);
          resolve();
        },
        error: (err) => {
          console.error('❌ Error snapshot puntos:', err);
          this.puntosTotales = 0;
          resolve();
        }
      });
    });
  }


  // 🔁 Escuchar cambios en tiempo real de los puntos
  private escucharCambiosEnPuntos() {
    if (!this.userId) return;

    // Cierra canal previo si existe (evita duplicados)
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
    }

    this.realtimeChannel = supabase
      .channel(`user-points-${this.userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `usuario_id=eq.${this.userId}`,
        },
        (payload) => {
          const nuevo = (payload.new as any)?.total_points;

          if (typeof nuevo === 'number') {
            const diferencia = nuevo - this.puntosTotales;

            // Animación si suben los puntos
            if (diferencia > 0) {
              this.puntosGanados = diferencia;
              this.mostrarAnimacion = true;
              setTimeout(() => (this.mostrarAnimacion = false), 1500);
            }

            this.puntosTotales = nuevo;
            console.log('🔁 Puntos actualizados en tiempo real:', this.puntosTotales);
          } else {
            this.cargarPuntosIniciales(); // seguridad si no hay payload.new
          }
        }
      )
      .subscribe((status) =>
        console.log('🟢 Canal Realtime conectado:', status)
      );
  }

  // 🧹 Limpiar canal al salir
  ngOnDestroy() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
      console.log('🔴 Canal Realtime desconectado');
    }
  }

  // 💚 Selección de tarjetas
  selectCard(card: string) {
    this.selectedCard = card;
  }

  // 🌍 Navegaciones
  goProducto() {
    this.router.navigate(['/producto'], { state: { userInfo: this.userInfo } });
  }

  home() {
    this.router.navigate(['/home']);
  }

  misiones() {
    this.router.navigate(['/misiones']);
  }

  perfil() {
    this.router.navigate(['/perfil']);
  }

  salir() {
    this.router.navigate(['/portada']);
  }

  preguntas() {
    this.router.navigate(['/preguntas']);
  }

  contacto() {
    this.router.navigate(['/contacto']);
  }

  goPuntos() {
    this.router.navigate(['/puntos']);
  }

  goSubirfoto() {
    this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo } });
  }

  goMisProductos() {
    this.router.navigate(['/mis-productos'], {
      state: { userInfo: this.userInfo?.id },
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  goConsejos() {
    this.navCtrl.navigateForward('/consejos');
  }

  inter() {
    this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo } });
  }

  favoritos() {
    this.router.navigate(['/favoritos']);
  }

  mapa() {
    this.router.navigate(['/mapa']);
  }
}
