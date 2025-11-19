import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonicModule,
  NavController,
  ModalController,
  ToastController
} from '@ionic/angular';

import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { ReviewsListComponent } from '../components/reviews-list/reviews-list.component';
import { ReportComponent } from '../components/report/report.component';
import { RatingComponent } from '../components/rating/rating.component';

import { ReputacionService } from '../servicios/reputacion.service';
import { TransaccionService } from '../servicios/transaccion.service';
import { PuntosService } from '../servicios/puntos.service';

import { supabase } from '../services/supabase.client';
import { consumerPollProducersForChange } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss', './detalle-producto-styles.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FooterInterensComponent,
    StarRatingComponent,
    ReviewsListComponent,
    ReportComponent,
    HttpClientModule 
  ],
})
export class DetalleProductoPage implements OnInit, OnDestroy {
  producto: any;
  puedeCalificar = false;
  usuarioActual?: string;
  vendedorReputacion: any = null;
  API_BASE = 'http://54.210.35.66:4000';

  // 💰 saldo del usuario (muestra en UI y valida canjeo)
  userSaldo: number | null = null;

  // ⛔ evita doble click en canje
  isBusyCanje = false;

  // Realtime channel para actualizar saldo al vuelo (opcional)
  private puntosChannel: any;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private modalController: ModalController,
    private toastController: ToastController,
    private reputacionService: ReputacionService,
    private transaccionService: TransaccionService,
    private puntosService: PuntosService,
    private http: HttpClient 
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['producto']) {
      this.producto = nav.extras.state['producto'];
      console.log('🟢 Producto recibido:', this.producto);
    } else {
      console.warn('⚠️ No se encontró el producto en el estado.');
    }

    // 1) set usuario actual
    await this.setUsuarioActual();

    // 2) cargar saldo
    await this.cargarSaldoUsuario();

    // 3) reglas de calificación
    await this.verificarPuedeCalificar();

    // 4) reputación del vendedor
    if (this.producto?.propietario_id) {
      await this.cargarReputacionVendedor();
    }

    // 5) realtime de puntos (opcional)
    this.escucharCambiosEnPuntos();
  }

  ngOnDestroy(): void {
    if (this.puntosChannel) {
      supabase.removeChannel(this.puntosChannel);
      this.puntosChannel = null;
    }
  }

  goBack() { this.navCtrl.back(); }

  onImgError(_: any) {
    if (this.producto) this.producto.imagen_url = 'assets/img/default.png';
  }

  // ========== GETTERS de estado ==========
  get esPropietario(): boolean {
    return !!(this.usuarioActual && this.producto?.propietario_id && this.usuarioActual === this.producto.propietario_id);
  }
  get productoNoDisponible(): boolean {
    return this.producto?.estado === 'no_disponible';
  }
  get saldoInsuficiente(): boolean {
    const costo = Number(this.producto?.valor_puntos || 0);
    return (this.userSaldo ?? 0) < costo;
  }



  // ========== USUARIO ==========
  private async setUsuarioActual() {
    const { data: userData } = await supabase.auth.getUser();
    this.usuarioActual = userData?.user?.id ?? undefined;
  }

  // ========== SALDO ==========
  private async cargarSaldoUsuario() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) { this.userSaldo = null; return; }

    this.usuarioActual = userId;

    this.puntosService.getUserPoints(userId).subscribe({
      next: (res) => {
        this.userSaldo = Number(res?.total_points ?? 0);
      },
      error: (err) => {
        console.error('❌ Error al obtener puntos en Detalle:', err);
        this.userSaldo = 0;
      }
    });
  }

  private escucharCambiosEnPuntos() {
    if (!this.usuarioActual) return;

    this.puntosChannel = supabase
      .channel('user-points-realtime-detalle')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `usuario_id=eq.${this.usuarioActual}`,
        },
        (payload) => {
          const nuevo = payload.new as { total_points?: number };
          if (nuevo && typeof nuevo.total_points === 'number') {
            this.userSaldo = nuevo.total_points;
          }
        }
      )
      .subscribe((status) => {
        console.log('🟢 Realtime saldo detalle:', status);
      });
  }

  // ========= HELPERS de puntos / historial =========



  // ========== CANJEO (todo en TS, sin backend) ==========
  async canjearProducto() {
    if (this.isBusyCanje) return;
    this.isBusyCanje = true;

    try {
      // ===== Validaciones base =====
      if (!this.producto) {
        await this.presentToast('❌ No se encontró información del producto.');
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        await this.presentToast('❌ Debes iniciar sesión para canjear productos');
        this.router.navigate(['/login']);
        return;
      }

      const compradorId = session.session.user.id;
      this.usuarioActual = compradorId;

      if (this.esPropietario) {
        await this.presentToast('❌ No puedes canjear tu propio producto');
        return;
      }

      if (this.productoNoDisponible || this.producto.activo === false) {
        await this.presentToast('❌ Este producto ya no está disponible');
        return;
      }

      // Evitar transacción duplicada en curso
      const { data: transaccionExistente } = await supabase
        .from('transacciones')
        .select('id')
        .eq('enser_id', this.producto.id)
        .in('estado', ['pendiente', 'aceptada', 'en_logistica'])
        .limit(1);

      if (transaccionExistente && transaccionExistente.length > 0) {
        await this.presentToast('❌ Este producto ya tiene una transacción en proceso');
        return;
      }

      // Saldo
      const costo = Number(this.producto.valor_puntos || 0);
      const saldoActual = Number(this.userSaldo ?? 0);
      if (saldoActual < costo) {
        await this.presentToast(`❌ InterCoins insuficientes. Te faltan ${costo - saldoActual}.`);
        return;
      }

      const propietarioId = this.producto.propietario_id as string;

      // ===== 1) Crear TRANSACCIÓN en Supabase y obtener su ID =====
      const { data: trx, error: trxErr } = await supabase
        .from('transacciones')
        .insert({
          enser_id: this.producto.id,
          propietario_id: propietarioId,
          solicitante_id: compradorId,
          estado: 'pendiente',
          mensaje: `Solicitud de canje por ${costo} InterCoins`,
          creado_en: new Date().toISOString()
        })
        .select('id')
        .single();

      if (trxErr || !trx?.id) {
        console.error('❌ Error creando transacción:', trxErr);
        await this.presentToast('❌ Error al crear la solicitud de canje');
        return;
      }

      const transaccionId = trx.id; // ✅ ahora sí existe

      // ===== 2) CANJE en backend (el backend guarda historial ± con transaccion_id) =====
      const resp: any = await this.http.post(`${this.API_BASE}/api/canjear`, {
        usuario_id: compradorId,
        producto_id: this.producto.id,
        puntos_requeridos: costo,
        propietario_id: propietarioId,
        transaccion_id: transaccionId
      }).toPromise();

      if (!resp?.success) {
        await this.presentToast(`❌ ${resp?.error || 'No se pudo completar el canje'}`);
        return;
      }

      try {
        const reservarRes = await fetch(`${this.API_BASE}/api/reservar/${this.producto.id}`, { method: 'PUT' });
        if (!reservarRes.ok) {
          if (reservarRes.status === 409) {
            console.warn('⚠️ Ya estaba reservado (409).');
          } else {
            const t = await reservarRes.text().catch(() => '');
            console.warn('⚠️ No se pudo reservar en backend:', reservarRes.status, t);
          }
        } else {
          console.log('✅ Producto reservado en backend');
        }
      } catch (e) {
        console.warn('⚠️ Error de red al reservar producto en backend:', e);
      }

      // ===== 3) Reflejar estado local =====
      this.userSaldo = Number(resp.nuevo_total ?? this.userSaldo);
      this.producto.estado = 'reservado';
      this.producto.activo = false;

      this.presentToast('✅ Canje realizado correctamente');

      // Notificar a otras vistas
      window.dispatchEvent(new CustomEvent('productoIntercambiado', {
        detail: { productoId: this.producto.id, transaccionId }
      }));

      // ===== 4) Crear notificaciones =====
      try {
        const endpoint1 = `${this.API_BASE}/api/notificaciones/canje/propietario`;
        const payload = {
          transaccion_id: transaccionId,
          enser_id: this.producto.id,
          vendedor_id: propietarioId,
          comprador_id: compradorId,
          producto_titulo: this.producto.titulo || 'Producto'
        };
        await fetch(`${this.API_BASE}/api/notificaciones/canje/propietario`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaccion_id: transaccionId,
            enser_id: this.producto.id,
            vendedor_id: propietarioId,
            comprador_id: compradorId,
            producto_titulo: this.producto.titulo || 'Producto'
          })
        });
        console.log('➡️ POST propietario', endpoint1, payload);

        const endpoint2 = `${this.API_BASE}/api/notificaciones/canje/comprador`;
        
        await fetch(`${this.API_BASE}/api/notificaciones/canje/comprador`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transaccion_id: transaccionId,
            enser_id: this.producto.id,
            vendedor_id: propietarioId,
            comprador_id: compradorId,
            producto_titulo: this.producto.titulo || 'Producto'
          })
        });
        console.log('➡️ POST comprador', endpoint2, payload);

        console.log('📩 Notificaciones creadas correctamente');
      } catch (err) {
        console.warn('⚠️ Error creando notificaciones:', err);
      }

      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 1200);

    } catch (e) {
      console.error('❌ Error al canjear:', e);
      await this.presentToast('❌ Error al procesar la solicitud');
    } finally {
      this.isBusyCanje = false;
    }
  }


  // ========== OTRAS ACCIONES ==========
  async contactarVendedor() {
    if (!this.producto) {
      alert('No se encontró información del producto.');
      return;
    }

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      this.router.navigate(['/login']);
      return;
    }

    if (session.session.user.id === this.producto.propietario_id) {
      alert('No puedes contactarte a ti mismo.');
      return;
    }

    this.router.navigate(['/chat-usuario', this.producto.propietario_id, this.producto.id]);
  }

  async verificarPuedeCalificar() {
    const { data: session } = await supabase.auth.getSession();
    this.usuarioActual = session?.session?.user?.id;

    if (!this.usuarioActual || !this.producto) {
      this.puedeCalificar = false;
      return;
    }
    if (this.usuarioActual === this.producto.propietario_id) {
      this.puedeCalificar = false;
      return;
    }

    const { data: existeCalificacion } = await supabase
      .from('calificaciones')
      .select('id')
      .eq('usuario_calificador', this.usuarioActual)
      .eq('usuario_calificado', this.producto.propietario_id)
      .eq('producto_id', this.producto.id)
      .maybeSingle();

    this.puedeCalificar = !existeCalificacion;
  }

  async calificarVendedor() {
    if (!this.usuarioActual || !this.producto) {
      this.presentToast('❌ Error: No se puede calificar en este momento');
      return;
    }

    const modal = await this.modalController.create({
      component: RatingComponent,
      componentProps: {
        usuarioCalificado: this.producto.propietario_id,
        usuarioCalificador: this.usuarioActual,
        productoId: this.producto.id.toString(),
        conversacionId: null
      },
      cssClass: 'rating-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentToast('✅ Calificación enviada correctamente');
      this.puedeCalificar = false;
    }
  }

  async presentToast(message: string) {
    const color =
      message.startsWith('✅')
        ? 'success'
        : message.startsWith('⚠️')
          ? 'warning'
          : 'danger';

    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      cssClass: 'interens-toast',
    });

    await toast.present();
  }

  async cargarReputacionVendedor() {
    if (!this.producto?.propietario_id) return;
    try {
      this.vendedorReputacion = await this.reputacionService.obtenerReputacion(this.producto.propietario_id);
    } catch (error) {
      console.error('Error cargando reputación del vendedor:', error);
    }
  }

  async reportarProducto() {
    const modal = await this.modalController.create({
      component: ReportComponent,
      componentProps: {
        tipoReporte: 'producto',
        objetoId: this.producto.id.toString(),
        objetoNombre: this.producto.titulo
      },
      cssClass: 'report-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentToast('✅ Denuncia enviada correctamente');
    }
  }
}

