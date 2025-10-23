import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from 'src/shared/supabase/supabase.client';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FooterInterensComponent],
})
export class PerfilPage implements OnInit, OnDestroy {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;
  loading = true;

  productos: any[] = [];
  borradores: any[] = [];
  prodLoading = false;
  borrLoading = false;

  selectedTab: string = 'productos';
  userId: string | null = null;

  private eventListener: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadPerfil();

    const nav = this.router.getCurrentNavigation();
    const openTab = nav?.extras?.state?.['openTab'];
    if (openTab) this.selectedTab = openTab;

    await this.loadMyProducts();
    await this.loadBorradores();

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
}
