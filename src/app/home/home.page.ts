import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
  IonIcon,
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { supabase } from 'src/shared/supabase/supabase.client';
import { PuntosService } from '../servicios/puntos.service';
import { PopoverController } from '@ionic/angular';
import { provideIonicAngular } from '@ionic/angular/standalone'; // <-- provider global de controllers

// -----------------------------------------------------------------------------
// HOME PAGE
// -----------------------------------------------------------------------------
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true, // <-- evita NullInjectorError para PopoverController
  providers: [PopoverController], 
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
  ],
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
  puntosTotales = 0;

  mostrarAnimacion = false;
  puntosGanados = 0;

  // 🔔 badge
  notificacionesPendientes = 0;

  // 🔁 realtime
  private realtimeChannel: any;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private navCtrl: NavController,
    private puntosService: PuntosService,
    private popoverCtrl: PopoverController,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) this.userInfo = state['userInfo'];
  }

  // 🟢 Cargar usuario y puntos al iniciar
  async ngOnInit() {
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      this.userInfo = userData.user;
      this.userId = userData.user.id;
      console.log('✅ Usuario activo:', this.userId);

      await this.cargarPuntosIniciales();
      this.escucharCambiosEnPuntos();
      this.escucharCambiosEnNotificaciones();
      // 🔔 badge inicial
      await this.cargarContadorNotificaciones();
      
    } else {
      console.warn('⚠️ No hay usuario autenticado.');
    }

    this.loading = true;
    await this.loadPerfil();
  }

  async ionViewWillEnter() {
    await this.loadPerfil();
    await this.cargarContadorNotificaciones();
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
    await new Promise<void>((resolve) => {
      this.puntosService.getUserPoints(this.userId!).subscribe({
        next: (res) => {
          this.puntosTotales = Number(res?.total_points ?? 0);
          resolve();
        },
        error: (_err) => {
          this.puntosTotales = 0;
          resolve();
        }
      });
    });
  }

  // 🔁 Escuchar cambios en tiempo real de los puntos
  private escucharCambiosEnPuntos() {
    if (!this.userId) return;

    if (this.realtimeChannel) supabase.removeChannel(this.realtimeChannel);

    this.realtimeChannel = supabase
      .channel(`user-points-${this.userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_points', filter: `usuario_id=eq.${this.userId}` },
        (payload) => {
          const nuevo = (payload.new as any)?.total_points;
          if (typeof nuevo === 'number') {
            const diferencia = nuevo - this.puntosTotales;
            if (diferencia > 0) {
              this.puntosGanados = diferencia;
              this.mostrarAnimacion = true;
              setTimeout(() => (this.mostrarAnimacion = false), 1500);
            }
            this.puntosTotales = nuevo;
          } else {
            this.cargarPuntosIniciales();
          }
        }
      )
      .subscribe();
  }

  // 🧹 Limpiar canal al salir
  ngOnDestroy() {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }
  private lastCount = 0;
  // 🔔 contador de notificaciones
  private async cargarContadorNotificaciones() {
     try {
        if (!this.userId) return;
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const url = new URL('http://127.0.0.1:4000/api/notificaciones/count');
        url.searchParams.set('usuario_id', this.userId);

        const r = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
        const json = await r.json();
        const nuevoCount = Number(json?.count ?? 0);

        // ✨ animación si aumenta
        if (nuevoCount > this.lastCount) {
          const el = document.querySelector('.notif-count');
          el?.classList.add('pulse');
          setTimeout(() => el?.classList.remove('pulse'), 800);
        }

        this.lastCount = nuevoCount;
        this.notificacionesPendientes = nuevoCount;
        console.log('🔔 Notificaciones pendientes:', this.notificacionesPendientes);
      } catch (e) {
        console.warn('❌ Error cargando contador de notificaciones', e);
      }
  }

  // 🔔 Abre popover con la lista (sin navegar)
  async verNotificaciones(ev?: Event) {
    if (!this.userId) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const pop = await this.popoverCtrl.create({
      component: NotifPopoverComponent,
      componentProps: {
        apiBase: 'http://127.0.0.1:4000',
        usuarioId: this.userId,
        token,
        onChanged: async () => {
          await this.cargarContadorNotificaciones();
        }
      },
      event: ev,
      reference: 'event',
      side: 'bottom',      // ↓ debajo de la campana
      alignment: 'end',    // ↘ alineado al borde derecho del ícono
      translucent: true,
      showBackdrop: true,
      cssClass: 'notif-popover' // clase para estilos
    });

    await pop.present();
  }

  // 🔔 Escuchar inserciones nuevas en notificaciones
private escucharCambiosEnNotificaciones() {
  if (!this.userId) return;

  console.log('🟢 Suscribiendo a notificaciones realtime...');

  supabase
    .channel('notificaciones')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notificaciones' },
      (payload) => {
        const nueva = payload.new as any;
        // Verifica que la notificación sea para este usuario
        if (nueva.usuario_id === this.userId) {
          console.log('🔔 Nueva notificación recibida:', nueva);
          this.cargarContadorNotificaciones();

          // Opcional: muestra un toast visual
          this.presentToast(`📢 ${nueva.titulo}: ${nueva.cuerpo}`);
        }
      }
    )
    .subscribe();
  }

  async presentToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 3000;
    toast.color = 'success';
    toast.position = 'top';
    document.body.appendChild(toast);
    await toast.present();
  }
  // 💚 Selección de tarjetas
  selectCard(card: string) { this.selectedCard = card; }

  // 🌍 Navegaciones
  goProducto() { this.router.navigate(['/producto'], { state: { userInfo: this.userInfo } }); }
  home() { this.router.navigate(['/home']); }
  misiones() { this.router.navigate(['/misiones']); }
  perfil() { this.router.navigate(['/perfil']); }
  salir() { this.router.navigate(['/portada']); }
  preguntas() { this.router.navigate(['/preguntas']); }
  contacto() { this.router.navigate(['/contacto']); }
  goPuntos() { this.router.navigate(['/puntos']); }
  goSubirfoto() { this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo } }); }
  goMisProductos() { this.router.navigate(['/mis-productos'], { state: { userInfo: this.userInfo?.id } }); }
  goBack() { this.navCtrl.back(); }
  goConsejos() { this.navCtrl.navigateForward('/consejos'); }
  inter() { this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo } }); }
  favoritos() { this.router.navigate(['/favoritos']); }
  mapa() { this.router.navigate(['/mapa']); }
}

// -----------------------------------------------------------------------------
// POPOVER DE NOTIFICACIONES (standalone)
// -----------------------------------------------------------------------------
import {
  IonList, IonItem, IonLabel, IonBadge, IonSpinner,
  IonFooter, IonText,IonNote
} from '@ionic/angular/standalone';

@Component({
  selector: 'notif-popover',
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonButton, IonIcon,
    IonList, IonItem, IonLabel, IonBadge, IonSpinner, IonFooter, IonText, IonNote
  ],
   template: `
  <ion-content class="notif-popover-content">
    <div class="popover-header">
      <span>Notificaciones</span>

      <!-- 🗑️ Eliminar TODAS -->
      <ion-button size="small" fill="outline" color="success"
                  (click)="removeAll()" [disabled]="loading || items.length===0">
        Eliminar todas
      </ion-button>
    </div>

    <div *ngIf="loading" class="ion-text-center loading-box">
      <ion-spinner></ion-spinner>
    </div>

    <ion-list *ngIf="!loading && items.length > 0" lines="none" class="notif-list">
      <ion-item
        *ngFor="let n of items; let i = index"
        detail="false"
        [class.unread]="!n.leida_en"
        button
        (click)="open(n)"
      >
        <ion-icon name="sparkles-outline" slot="start" class="lead-icon"></ion-icon>

        <ion-label>
          <h3 class="title">{{ n.titulo }}</h3>
          <p class="body ion-text-wrap">{{ n.cuerpo }}</p>
          <ion-note class="when">{{ n.creado_en | date:'short' }}</ion-note>
        </ion-label>

        <!-- ❌ Eliminar UNA -->
        <ion-button size="small" fill="clear" class="mark-btn" color="medium"
                    (click)="remove(n, i); $event.stopPropagation()"
                    aria-label="Eliminar">
          <ion-icon name="close-outline" slot="icon-only"></ion-icon>
        </ion-button>

        <ion-badge color="success" *ngIf="!n.leida_en" class="new-badge">Nuevo</ion-badge>
      </ion-item>
    </ion-list>

    <div *ngIf="!loading && items.length === 0" class="empty">
      <ion-icon name="notifications-off-outline"></ion-icon>
      <div>Sin notificaciones</div>
    </div>
  </ion-content>
  `,
  styles: [`
  :host {
    --bg: #0c0f13;
    --card: #14161a;
    --stroke: #2b3036;
    --txt: #ffffff;
    --muted: #b8bec6;
    --accent: #1fd39a;
  }

  .notif-popover-content {
    --background: var(--card);
    color: var(--txt);
    min-width: 320px;
    max-width: 420px;
    padding: 0;
  }

  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    font-weight: 700;
    border-bottom: 1px solid var(--stroke);
  }

  .loading-box { padding: 16px; }

  .notif-list ion-item {
    --background: transparent;
    margin: 8px 10px;
    border: 1px solid var(--stroke);
    border-radius: 12px;
    position: relative;
  }

  .notif-list ion-item.unread {
    background: rgba(31, 211, 154, 0.06);
    border-color: rgba(31, 211, 154, 0.35);
  }

  .lead-icon {
    font-size: 20px;
    color: var(--accent);
    margin-right: 6px;
  }

  .title {
    margin: 2px 0 0 0;
    font-size: 14px;
    color: var(--txt);
    font-weight: 700;
  }

  .body {
    margin: 4px 0 6px;
    font-size: 13px;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .when { font-size: 11px; opacity: 0.7; }
  .mark-btn { margin-left: auto; font-size: 12px; }
  .new-badge { position: absolute; top: 8px; right: 8px; }

  .empty {
    text-align: center;
    padding: 18px 0 22px;
    opacity: 0.8;
  }
  .empty ion-icon { font-size: 40px; display: block; margin: 0 auto 6px; }

  ::ng-deep ion-popover {
    --offset-x: -40px;  /* 🔹 mueve más a la izquierda */
      --offset-y: 8px;    /* un poquito más arriba */
      --width: 300px;     /* 🔹 un poco más ancho para que respire el texto */
      --background: #14161a;
      --box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      border-radius: 14px;
    }
  
    
  /* mueve y dimensiona el popover con seguridad de viewport */
  ::ng-deep ion-popover.notif-popover {
    --offset-x: -10px;                      /* más a la izquierda */
    --offset-y: 8px;                        /* un pelito abajo */
    --width: 320px;                         /* ancho cómodo */
    --max-width: calc(100vw - 24px);        /* evita salir del viewport */
  }

  /* quita clipping y aplica fondo/sombra/curva al contenedor real */
  ::ng-deep ion-popover.notif-popover::part(content) {
    padding: 0;
    overflow: visible;                      /* ← sin cortes */
    background: #14161a;
    border-radius: 14px;
    box-shadow: 0 10px 28px rgba(0,0,0,.45);
  }

  /* tu contenedor interno */
  .notif-popover-content {
    --background: var(--card);
    color: var(--txt);
    min-width: 300px;
    max-width: 420px;
    padding: 0;
    overflow: visible;                      /* por si acaso */
  }

  /* margen interno de cada item, sin que toque el borde */
  .notif-list ion-item {
    --background: transparent;
    margin: 10px 12px;
    border: 1px solid var(--stroke);
    border-radius: 12px;
    position: relative;
  }

  /* encabezado con padding hacia la derecha para que no se “pegue” */
  .popover-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    font-weight: 700;
    border-bottom: 1px solid var(--stroke);
  }

    
  `]
})
export class NotifPopoverComponent {
  @Input() apiBase!: string;
  @Input() usuarioId!: string;
  @Input() token!: string;
  @Input() onChanged?: () => void;

  items: any[] = [];
  loading = true;

  async ngOnInit() { await this.reload(); }

  private headers() {
    return { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' };
  }

  async reload() {
    this.loading = true;
    try {
      const url = new URL(`${this.apiBase}/api/notificaciones`);
      url.searchParams.set('usuario_id', this.usuarioId);
      url.searchParams.set('limit', '50');

      const r = await fetch(url.toString(), { headers: this.headers() });
      const json = await r.json();
      this.items = json?.items ?? [];
    } catch (e) {
      console.warn('notif reload error', e);
      this.items = [];
    } finally {
      this.loading = false;
    }
  }

  async markRead(n: any) {
    try {
      await fetch(`${this.apiBase}/api/notificaciones/mark-read`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ usuario_id: this.usuarioId, id: n.id })
      });
      n.leida_en = new Date().toISOString();
      this.onChanged?.();
    } catch (e) {
      console.warn('markRead error', e);
    }
  }

  async markAll() {
    try {
      await fetch(`${this.apiBase}/api/notificaciones/mark-all`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({ usuario_id: this.usuarioId })
      });
      this.items = this.items.map(n => ({ ...n, leida_en: new Date().toISOString() }));
      this.onChanged?.();
    } catch (e) {
      console.warn('markAll error', e);
    }
  }

  open(n: any) {
    if (!n.leida_en) this.markRead(n);
    // aquí puedes rutear según ref_tabla/ref_id si quieres
  }


  // ❌ Eliminar una notificación
  async remove(n: any, idx: number) {
    try {
      await fetch(`${this.apiBase}/api/notificaciones/${n.id}`, {
        method: 'DELETE',
        headers: this.headers()
      });
      this.items.splice(idx, 1);
      this.items = [...this.items];     // fuerza change detection
      this.onChanged?.();               // refresca el badge en Home
    } catch (e) {
      console.warn('remove notif error', e);
    }
  }

  // ❌ Eliminar todas
  async removeAll() {
    if (this.items.length === 0) return;
    this.loading = true;
    try {
      await fetch(`${this.apiBase}/api/notificaciones`, {
        method: 'DELETE',
        headers: this.headers(),
        body: JSON.stringify({ usuario_id: `'${this.usuarioId}'` }) // 👈 agrega comillas aquí
      });
      this.items = [];
      this.onChanged?.();
    } catch (e) {
      console.warn('remove all notif error', e);
    } finally {
      this.loading = false;
    }
  }
}
