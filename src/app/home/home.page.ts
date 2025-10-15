import { Component, OnDestroy } from '@angular/core';
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
export class HomePage implements OnDestroy {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;
  loading = true;
  userId: string | undefined;
  userInfo?: any;
  subscription: any;

  selectedCard: string | null = null;
  puntosTotales: number = 0;

  // ✨ Animación de puntos
  mostrarAnimacion = false;
  puntosGanados = 0;

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

      this.obtenerPuntos();
      this.escucharCambiosEnPuntos();
    } else {
      console.warn('⚠️ No hay usuario autenticado.');
    }
  }

  // 🟡 Re-obtener puntos al volver al Home (sin recargar)
  ionViewWillEnter() {
    if (this.userId) {
      this.obtenerPuntos();
    }
  }

  // 🪙 Obtener puntos reales desde Supabase
  obtenerPuntos() {
    if (!this.userId) return;

    this.puntosService.getUserPoints(this.userId).subscribe({
      next: (res) => {
        console.log('🎯 Puntos desde Supabase:', res);
        this.puntosTotales = res.total_points || 0;
      },
      error: (err) => {
        console.error('❌ Error al obtener puntos en Home:', err);
      }
    });
  }

  // 🔔 Escuchar actualizaciones en tiempo real (puntos)
  escucharCambiosEnPuntos() {
    if (!this.userId) return;

    this.subscription = supabase
      .channel('user-points-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `usuario_id=eq.${this.userId}`,
        },
        (payload) => {
          const nuevo = payload.new as { total_points?: number };

          if (nuevo && typeof nuevo.total_points === 'number') {
            const diferencia = nuevo.total_points - this.puntosTotales;

            if (diferencia > 0) {
              this.puntosGanados = diferencia;
              this.mostrarAnimacion = true;

              setTimeout(() => {
                this.mostrarAnimacion = false;
              }, 1500);
            }

            this.puntosTotales = nuevo.total_points;
          }
        }
      )
      .subscribe((status) =>
        console.log('🟢 Canal Realtime conectado:', status)
      );
  }

  // 🧹 Limpiar canal al salir
  ngOnDestroy() {
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
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

  inter() {
    this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo } });
  }
}
