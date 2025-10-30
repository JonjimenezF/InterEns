import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from 'src/shared/supabase/supabase.client';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../servicios/chat.service';
import { ReputacionService } from '../servicios/reputacion.service';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { ReviewsListComponent } from '../components/reviews-list/reviews-list.component';
import { PickupRequestComponent } from '../components/pickup-request/pickup-request.component';
import { TransaccionService } from '../servicios/transaccion.service';
import { Transaccion } from '../models/transaccion';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FooterInterensComponent, StarRatingComponent, ReviewsListComponent],
})
export class PerfilPage implements OnInit, OnDestroy {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;
  loading = true;

  productos: any[] = [];
  borradores: any[] = [];
  conversaciones: any[] = [];
  prodLoading = false;
  borrLoading = false;
  mensajesLoading = false;
  reputacion: any = null;

  selectedTab: string = 'productos';
  userId: string | null = null;
  transaccionesPendientes: any[] = [];
  solicitudesPendientes: any[] = [];

  private eventListener: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController,
    private chatService: ChatService,
    private reputacionService: ReputacionService,
    private modalController: ModalController,
    private transaccionService: TransaccionService
  ) {}

  async ngOnInit() {
    await this.loadPerfil();

    const nav = this.router.getCurrentNavigation();
    const openTab = nav?.extras?.state?.['openTab'];
    if (openTab) this.selectedTab = openTab;

    await this.loadMyProducts();
    await this.loadBorradores();
    await this.loadConversaciones();
    await this.cargarReputacion();
    await this.loadTransaccionesPendientes();
    await this.loadSolicitudesPendientes();

    // 🔄 Escuchar evento global
    this.eventListener = () => this.loadMyProducts();
    window.addEventListener('productoIntercambiado', this.eventListener);
  }

  ngOnDestroy() {
    if (this.eventListener)
      window.removeEventListener('productoIntercambiado', this.eventListener);
  }

  async ionViewWillEnter() {
    console.log('♻️ Refrescando perfil...');
    const nav = this.router.getCurrentNavigation();
    const removeDraftId = nav?.extras?.state?.['removeDraftId'];
    const publishedTitle = nav?.extras?.state?.['publishedTitle'];

    await this.loadMyProducts();

    if (removeDraftId) {
      const draftIndex = this.borradores.findIndex(
        (b) => Number(b.id) === Number(removeDraftId)
      );
      if (draftIndex !== -1) {
        this.borradores.splice(draftIndex, 1);
        await this.presentAnimatedToast(
          `✅ El borrador "${publishedTitle || 'sin título'}" fue publicado y movido a Mis Productos`
        );
      }
    }

    await this.refreshBorradoresFromDB();
    
    // Cargar conversaciones si está en la pestaña mensajes
    if (this.selectedTab === 'mensajes') {
      await this.loadConversaciones();
    }
    
    // Cargar transacciones si está en la pestaña transacciones
    if (this.selectedTab === 'transacciones') {
      await this.loadTransaccionesPendientes();
    }
    
    // Cargar solicitudes si está en la pestaña solicitudes
    if (this.selectedTab === 'solicitudes') {
      await this.loadSolicitudesPendientes();
    }
  }

  // =========================
  // PERFIL
  // =========================
  async loadPerfil() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const res = await fetch('http://127.0.0.1:4000/profile/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const perfil = await res.json();

    this.nombre = perfil?.nombre_completo ?? null;
    this.email = perfil?.email ?? null;
    this.avatarUrl = perfil?.avatar_url ?? '/assets/img/avatar.png';
    this.userId = session?.user?.id ?? perfil?.id ?? perfil?.user_id ?? null;
  }

  // =========================
  // PRODUCTOS PUBLICADOS
  // =========================
  async loadMyProducts() {
    this.prodLoading = true;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      const resp = await fetch(`http://127.0.0.1:4000/product_usuario/usuario`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      this.productos =
        data.items?.filter(
          (p: any) =>
            ['publicado', 'aprobado', 'no_disponible'].includes(
              `${p.estado}`.toLowerCase()
            )
        ) || [];
    } catch (e) {
      console.error('❌ Error cargando productos:', e);
    } finally {
      this.prodLoading = false;
    }
  }

  // =========================
  // BORRADORES
  // =========================
  async loadBorradores() {
    if (!this.userId) return;
    this.borrLoading = true;
    const antiCache = Date.now();

    this.http
      .get(`http://localhost:4000/api/getUserDrafts/${this.userId}?t=${antiCache}`)
      .subscribe({
        next: (res: any) => {
          this.borradores =
            (res || []).filter(
              (b: any) => `${b.estado}`.toLowerCase() === 'borrador'
            ) || [];
          this.borrLoading = false;
        },
        error: (err) => {
          console.error('❌ Error al obtener borradores:', err);
          this.borrLoading = false;
        },
      });
  }

  async refreshBorradoresFromDB() {
    if (!this.userId) return;
    this.borrLoading = true;
    const antiCache = Date.now();

    this.http
      .get(`http://localhost:4000/api/getUserDrafts/${this.userId}?t=${antiCache}`)
      .subscribe({
        next: (res: any) => {
          this.borradores =
            (res || []).filter(
              (b: any) => `${b.estado}`.toLowerCase() === 'borrador'
            ) || [];
          this.borrLoading = false;
        },
        error: (err) => {
          console.error('❌ Error refrescando borradores:', err);
          this.borrLoading = false;
        },
      });
  }

  // =========================
  // UTILIDADES
  // =========================
  cover(p: any) {
    return p.cover_url || p.imagen_url || '/assets/img/placeholder.png';
  }

  statusColor(p: any) {
    switch (`${p.estado}`.toLowerCase()) {
      case 'aprobado':
      case 'publicado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'rechazado':
      case 'borrador':
        return 'medium';
      case 'no_disponible':
        return 'tertiary';
      default:
        return 'light';
    }
  }

  // ✅ Nueva función para mostrar estados con formato bonito
  formatEstado(estado: string): string {
    if (!estado) return '';
    return estado.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  // =========================
  // ✏️ EDITAR / ELIMINAR BORRADOR
  // =========================
  editarBorrador(borrador: any) {
    localStorage.setItem('borrador_en_edicion', JSON.stringify(borrador));
    this.router.navigate(['/sproducto'], { state: { borrador } });
  }

  eliminarBorrador(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este borrador?')) return;
    this.http.delete(`http://localhost:4000/api/deleteDraft/${id}`).subscribe({
      next: async () => {
        this.borradores = this.borradores.filter(
          (b) => Number(b.id) !== Number(id)
        );
        await this.presentAnimatedToast('🗑️ Borrador eliminado correctamente');
      },
      error: async (err) => {
        console.error('❌ Error al eliminar borrador:', err);
        await this.presentToast('Error al eliminar borrador', 'danger');
      },
    });
  }

  // =========================
  // ♻️ DISPONIBILIDAD / INTERCAMBIO
  // =========================
  async marcarIntercambiado(producto: any) {
    try {
      const id = producto.id;
      const resp: any = await this.http
        .put(`http://localhost:4000/api/toggleAvailability/${id}`, {})
        .toPromise();

      producto.estado = resp.nuevoEstado;
      producto.activo = resp.nuevoEstado === 'publicado';

      const msg =
        resp.nuevoEstado === 'publicado'
          ? '✅ Producto reactivado y disponible nuevamente.'
          : '♻️ Producto marcado como no disponible.';
      await this.presentToast(msg, 'success');
    } catch (error) {
      console.error('❌ Error al cambiar disponibilidad:', error);
      await this.presentToast('Error al cambiar estado del producto.', 'danger');
    }
  }

  editarperfil() {
    this.router.navigate(['/edit-perfil']);
  }

  // =========================
  // TOASTS
  // =========================
  async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'success'
  ) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
      cssClass: 'interens-toast',
    });
    await toast.present();
  }

  async presentAnimatedToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      cssClass: 'interens-animated-toast',
      animated: true,
      mode: 'ios',
    });
    await toast.present();
  }

  // =========================
  // MENSAJES / CONVERSACIONES
  // =========================
  async loadConversaciones() {
    if (!this.userId) return;
    
    this.mensajesLoading = true;
    try {
      const { data: conversaciones } = await this.chatService.obtenerConversacionesUsuario(this.userId);
      
      if (conversaciones) {
        // Enriquecer con datos del enser, último mensaje y nombres de usuarios
        for (let conv of conversaciones) {
          // Obtener datos del enser
          if (conv.producto_id) {
            const { data: enser } = await supabase
              .from('enseres')
              .select('titulo, imagen_url')
              .eq('id', conv.producto_id)
              .single();
            
            if (enser) {
              conv.enser_titulo = enser.titulo;
              conv.enser_imagen = enser.imagen_url;
            }
          }
          
          // Obtener nombres de los usuarios
          const otroUsuarioId = conv.usuario1_id === this.userId ? conv.usuario2_id : conv.usuario1_id;
          
          try {
            const resp = await fetch(`http://127.0.0.1:4000/profile/${otroUsuarioId}`);
            const perfil = await resp.json();
            conv.otro_usuario_nombre = perfil?.nombre_completo || 'Usuario';
          } catch {
            conv.otro_usuario_nombre = 'Usuario';
          }
          
          // Obtener último mensaje real
          const { data: ultimoMensaje } = await supabase
            .from('mensajes')
            .select('mensaje, remitente_id, created_at')
            .eq('conversacion_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (ultimoMensaje) {
            conv.ultimo_mensaje_real = ultimoMensaje.mensaje;
            conv.ultimo_mensaje_fecha = ultimoMensaje.created_at;
            conv.ultimo_remitente = ultimoMensaje.remitente_id;
            conv.es_mio = ultimoMensaje.remitente_id === this.userId;
          }
          
          // Contar mensajes no leídos
          const { count } = await supabase
            .from('mensajes')
            .select('*', { count: 'exact', head: true })
            .eq('conversacion_id', conv.id)
            .eq('leido', false)
            .neq('remitente_id', this.userId);
          
          conv.mensajes_no_leidos = count || 0;
        }
        
        this.conversaciones = conversaciones;
      }
    } catch (error) {
      console.error('Error cargando conversaciones:', error);
    } finally {
      this.mensajesLoading = false;
    }
  }

  async abrirChat(conversacion: any) {
    // Marcar mensajes como leídos
    if (conversacion.mensajes_no_leidos > 0) {
      await this.chatService.marcarComoLeido(conversacion.id, this.userId!);
      conversacion.mensajes_no_leidos = 0;
    }
    
    // Determinar el otro usuario
    const otroUsuarioId = conversacion.usuario1_id === this.userId 
      ? conversacion.usuario2_id 
      : conversacion.usuario1_id;
    
    this.router.navigate(['/chat-usuario', otroUsuarioId, conversacion.producto_id || '']);
  }

  // =========================
  // REPUTACIÓN
  // =========================
  async cargarReputacion() {
    if (!this.userId) return;
    
    try {
      this.reputacion = await this.reputacionService.obtenerReputacion(this.userId);
    } catch (error) {
      console.error('Error cargando reputación:', error);
    }
  }

  async solicitarRetiro(producto: any) {
    const modal = await this.modalController.create({
      component: PickupRequestComponent,
      componentProps: {
        producto: producto
      },
      cssClass: 'pickup-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentAnimatedToast('✅ Solicitud de retiro enviada correctamente');
    }
  }

  // =========================
  // TRANSACCIONES
  // =========================
  async loadTransaccionesPendientes() {
    if (!this.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          *,
          enseres:enser_id (
            id,
            titulo,
            imagen_url,
            valor_puntos
          ),
          propietario:propietario_id (
            nombre_completo
          )
        `)
        .eq('solicitante_id', this.userId)
        .eq('estado', 'en_logistica');
        
      if (error) {
        console.error('Error cargando transacciones:', error);
        this.transaccionesPendientes = [];
        return;
      }
      
      this.transaccionesPendientes = data.map(t => ({
        id: t.id,
        producto_nombre: t.enseres?.titulo || 'Producto',
        producto_imagen: t.enseres?.imagen_url || 'assets/img/default.png',
        vendedor_nombre: t.propietario?.nombre_completo || 'Vendedor',
        estado: t.estado,
        fecha_creacion: new Date(t.creado_en),
        precio: t.enseres?.valor_puntos || 0
      }));
      
      console.log('Transacciones pendientes cargadas:', this.transaccionesPendientes);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      this.transaccionesPendientes = [];
    }
  }

  confirmarRecepcionProducto(transaccionId: string) {
    this.router.navigate(['/confirmar-recepcion', transaccionId]);
  }

  // =========================
  // SOLICITUDES DE CANJE
  // =========================
  async loadSolicitudesPendientes() {
    if (!this.userId) return;
    
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          *,
          enseres:enser_id (
            id,
            titulo,
            imagen_url,
            valor_puntos
          ),
          solicitante:solicitante_id (
            nombre_completo
          )
        `)
        .eq('propietario_id', this.userId)
        .in('estado', ['pendiente', 'aceptada']);
        
      if (error) {
        console.error('Error cargando solicitudes:', error);
        return;
      }
      
      this.solicitudesPendientes = data.map(s => ({
        id: s.id,
        producto_nombre: s.enseres?.titulo || 'Producto',
        producto_imagen: s.enseres?.imagen_url || 'assets/img/default.png',
        solicitante_nombre: s.solicitante?.nombre_completo || 'Usuario',
        valor_puntos: s.enseres?.valor_puntos || 0,
        estado: s.estado,
        creado_en: s.creado_en
      }));
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    }
  }

  async aceptarSolicitud(transaccionId: number) {
    try {
      const { error } = await supabase
        .from('transacciones')
        .update({ estado: 'aceptada' })
        .eq('id', transaccionId);
        
      if (error) {
        await this.presentToast('Error al aceptar solicitud', 'danger');
        return;
      }
      
      await this.presentToast('✅ Solicitud aceptada', 'success');
      await this.loadSolicitudesPendientes();
    } catch (error) {
      await this.presentToast('Error al aceptar solicitud', 'danger');
    }
  }

  async rechazarSolicitud(transaccionId: number) {
    try {
      const { error } = await supabase
        .from('transacciones')
        .update({ estado: 'cancelada' })
        .eq('id', transaccionId);
        
      if (error) {
        await this.presentToast('Error al rechazar solicitud', 'danger');
        return;
      }
      
      await this.presentToast('❌ Solicitud rechazada', 'success');
      await this.loadSolicitudesPendientes();
    } catch (error) {
      await this.presentToast('Error al rechazar solicitud', 'danger');
    }
  }

  async marcarComoEnviado(transaccionId: number) {
    try {
      const { error } = await supabase
        .from('transacciones')
        .update({ estado: 'en_logistica' })
        .eq('id', transaccionId);
        
      if (error) {
        await this.presentToast('Error al marcar como enviado', 'danger');
        return;
      }
      
      await this.presentToast('🚚 Producto marcado como enviado', 'success');
      await this.loadSolicitudesPendientes();
    } catch (error) {
      await this.presentToast('Error al marcar como enviado', 'danger');
    }
  }


}
