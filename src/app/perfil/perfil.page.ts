// import { Component, OnInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { IonicModule, ToastController } from '@ionic/angular';
// import { Router } from '@angular/router';
// import { supabase } from 'src/shared/supabase/supabase.client';
// import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-perfil',
//   templateUrl: './perfil.page.html',
//   styleUrls: ['./perfil.page.scss'],
//   standalone: true,
//   imports: [CommonModule, FormsModule, IonicModule, FooterInterensComponent],
// })
// export class PerfilPage implements OnInit, OnDestroy {
//   // =========================
//   // VARIABLES
//   // =========================
//   nombre: string | null = null;
//   email: string | null = null;
//   avatarUrl: string | null = null;
//   loading = true;

//   productos: any[] = [];
//   borradores: any[] = [];
//   prodLoading = false;
//   borrLoading = false;

//   selectedTab: string = 'productos';
//   userId: string | null = null;
//   impacto: any = null; // 🌍 nuevo bloque de impacto ambiental

//   private eventListener: any;

//   constructor(
//     private router: Router,
//     private http: HttpClient,
//     private toastController: ToastController
//   ) {}

//   // =========================
//   // CICLO DE VIDA
//   // =========================
//   async ngOnInit() {
//     await this.loadPerfil();

//     const nav = this.router.getCurrentNavigation();
//     const openTab = nav?.extras?.state?.['openTab'];
//     if (openTab) this.selectedTab = openTab;

//     await this.loadMyProducts();
//     await this.loadBorradores();
//     await this.loadImpacto(); // 🌍 carga de impacto ambiental

//     // 🔄 Escuchar evento global
//     this.eventListener = () => this.loadMyProducts();
//     window.addEventListener('productoIntercambiado', this.eventListener);
//   }

//   ngOnDestroy() {
//     if (this.eventListener)
//       window.removeEventListener('productoIntercambiado', this.eventListener);
//   }

//   async ionViewWillEnter() {
//     console.log('♻️ Refrescando perfil...');
//     const nav = this.router.getCurrentNavigation();
//     const removeDraftId = nav?.extras?.state?.['removeDraftId'];
//     const publishedTitle = nav?.extras?.state?.['publishedTitle'];

//     await this.loadMyProducts();
//     await this.loadImpacto(); // 🔁 refresca el impacto también

//     if (removeDraftId) {
//       const draftIndex = this.borradores.findIndex(
//         (b) => Number(b.id) === Number(removeDraftId)
//       );
//       if (draftIndex !== -1) {
//         this.borradores.splice(draftIndex, 1);
//         await this.presentAnimatedToast(
//           `✅ El borrador "${publishedTitle || 'sin título'}" fue publicado y movido a Mis Productos`
//         );
//       }
//     }

//     await this.refreshBorradoresFromDB();
//   }

//   // =========================
//   // PERFIL
//   // =========================
//   async loadPerfil() {
//     const {
//       data: { session },
//     } = await supabase.auth.getSession();
//     const token = session?.access_token;
//     if (!token) return;

//     const res = await fetch('http://127.0.0.1:4000/profile/me', {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const perfil = await res.json();

//     this.nombre = perfil?.nombre_completo ?? null;
//     this.email = perfil?.email ?? null;
//     this.avatarUrl = perfil?.avatar_url ?? '/assets/img/avatar.png';
//     this.userId = session?.user?.id ?? perfil?.id ?? perfil?.user_id ?? null;
//   }

//   // =========================
//   // PRODUCTOS PUBLICADOS
//   // =========================
//   async loadMyProducts() {
//     this.prodLoading = true;
//     try {
//       const {
//         data: { session },
//       } = await supabase.auth.getSession();
//       const token = session?.access_token;
//       const resp = await fetch(`http://127.0.0.1:4000/product_usuario/usuario`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await resp.json();
//       this.productos =
//         data.items?.filter(
//           (p: any) =>
//             ['publicado', 'aprobado', 'no_disponible'].includes(
//               `${p.estado}`.toLowerCase()
//             )
//         ) || [];
//     } catch (e) {
//       console.error('❌ Error cargando productos:', e);
//     } finally {
//       this.prodLoading = false;
//     }
//   }

//   // =========================
//   // IMPACTO AMBIENTAL 🌍
//   // =========================
//   async loadImpacto() {
//     if (!this.userId) return;
//     const url = `http://localhost:4000/api/impacto/${this.userId}`;
//     this.http.get(url).subscribe({
//       next: (data) => (this.impacto = data),
//       error: (err) => console.error('❌ Error al obtener impacto:', err),
//     });
//   }

//   // =========================
//   // BORRADORES
//   // =========================
//   async loadBorradores() {
//     if (!this.userId) return;
//     this.borrLoading = true;
//     const antiCache = Date.now();

//     this.http
//       .get(`http://localhost:4000/api/getUserDrafts/${this.userId}?t=${antiCache}`)
//       .subscribe({
//         next: (res: any) => {
//           this.borradores =
//             (res || []).filter(
//               (b: any) => `${b.estado}`.toLowerCase() === 'borrador'
//             ) || [];
//           this.borrLoading = false;
//         },
//         error: (err) => {
//           console.error('❌ Error al obtener borradores:', err);
//           this.borrLoading = false;
//         },
//       });
//   }

//   async refreshBorradoresFromDB() {
//     if (!this.userId) return;
//     this.borrLoading = true;
//     const antiCache = Date.now();

//     this.http
//       .get(`http://localhost:4000/api/getUserDrafts/${this.userId}?t=${antiCache}`)
//       .subscribe({
//         next: (res: any) => {
//           this.borradores =
//             (res || []).filter(
//               (b: any) => `${b.estado}`.toLowerCase() === 'borrador'
//             ) || [];
//           this.borrLoading = false;
//         },
//         error: (err) => {
//           console.error('❌ Error refrescando borradores:', err);
//           this.borrLoading = false;
//         },
//       });
//   }

//   // =========================
//   // UTILIDADES
//   // =========================
//   cover(p: any) {
//     return p.cover_url || p.imagen_url || '/assets/img/placeholder.png';
//   }

//   statusColor(p: any) {
//     switch (`${p.estado}`.toLowerCase()) {
//       case 'aprobado':
//       case 'publicado':
//         return 'success';
//       case 'pendiente':
//         return 'warning';
//       case 'rechazado':
//       case 'borrador':
//         return 'medium';
//       case 'no_disponible':
//         return 'tertiary';
//       default:
//         return 'light';
//     }
//   }

//   formatEstado(estado: string): string {
//     if (!estado) return '';
//     return estado.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
//   }

//   // =========================
//   // ✏️ EDITAR / ELIMINAR BORRADOR
//   // =========================
//   editarBorrador(borrador: any) {
//     localStorage.setItem('borrador_en_edicion', JSON.stringify(borrador));
//     this.router.navigate(['/sproducto'], { state: { borrador } });
//   }

//   eliminarBorrador(id: number) {
//     if (!confirm('¿Seguro que deseas eliminar este borrador?')) return;
//     this.http.delete(`http://localhost:4000/api/deleteDraft/${id}`).subscribe({
//       next: async () => {
//         this.borradores = this.borradores.filter(
//           (b) => Number(b.id) !== Number(id)
//         );
//         await this.presentAnimatedToast('🗑️ Borrador eliminado correctamente');
//       },
//       error: async (err) => {
//         console.error('❌ Error al eliminar borrador:', err);
//         await this.presentToast('Error al eliminar borrador', 'danger');
//       },
//     });
//   }

//   // =========================
//   // ♻️ DISPONIBILIDAD / INTERCAMBIO
//   // =========================
//   async marcarIntercambiado(producto: any) {
//     try {
//       const id = producto.id;
//       const resp: any = await this.http
//         .put(`http://localhost:4000/api/toggleAvailability/${id}`, {})
//         .toPromise();

//       producto.estado = resp.nuevoEstado;
//       producto.activo = resp.nuevoEstado === 'publicado';

//       const msg =
//         resp.nuevoEstado === 'publicado'
//           ? '✅ Producto reactivado y disponible nuevamente.'
//           : '♻️ Producto marcado como no disponible.';
//       await this.presentToast(msg, 'success');
//     } catch (error) {
//       console.error('❌ Error al cambiar disponibilidad:', error);
//       await this.presentToast('Error al cambiar estado del producto.', 'danger');
//     }
//   }

//   editarperfil() {
//     this.router.navigate(['/edit-perfil']);
//   }

//   // =========================
//   // TOASTS
//   // =========================
//   async presentToast(
//     message: string,
//     color: 'success' | 'danger' | 'warning' = 'success'
//   ) {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2500,
//       position: 'bottom',
//       color,
//       cssClass: 'interens-toast',
//     });
//     await toast.present();
//   }

//   async presentAnimatedToast(message: string) {
//     const toast = await this.toastController.create({
//       message,
//       duration: 2500,
//       position: 'bottom',
//       cssClass: 'interens-animated-toast',
//       animated: true,
//       mode: 'ios',
//     });
//     await toast.present();
//   }
// }
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

  impacto: any = null;
  nivel: string = '';
  siguienteMeta: number = 0;
  porcentajeNivel: number = 0;
  equivalencias: any = {};
  impactoPorCategoria: any[] = [];
  maxCo2 = 0;

  private eventListener: any;

  nivelesDisponibles = [
    {
      nombre: '🌱 Principiante Verde',
      icono: 'leaf-outline',
      meta: 10,
      descripcion: 'Empiezas a contribuir con tus primeros enseres reutilizados.',
    },
    {
      nombre: '🌿 Agente Circular',
      icono: 'recycle-outline',
      meta: 30,
      descripcion: 'Reutilizas con frecuencia y ayudas a reducir el desperdicio.',
    },
    {
      nombre: '🌳 Guardián del Bosque',
      icono: 'earth-outline',
      meta: 50,
      descripcion: 'Tu impacto positivo se nota: ahorras recursos y evitas emisiones.',
    },
    {
      nombre: '🌎 Eco Leyenda',
      icono: 'planet-outline',
      meta: 100,
      descripcion: 'Eres un referente ecológico. ¡Gracias por cuidar el planeta!',
    },
  ];

  constructor(
    private router: Router,
    private http: HttpClient,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    await this.loadPerfil();
    await this.loadMyProducts();
    await this.loadBorradores();
    await this.loadImpacto();

    this.eventListener = () => this.loadMyProducts();
    window.addEventListener('productoIntercambiado', this.eventListener);
  }

  ngOnDestroy() {
    if (this.eventListener)
      window.removeEventListener('productoIntercambiado', this.eventListener);
  }

  async ionViewWillEnter() {
    await this.loadMyProducts();
    await this.loadImpacto();
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

  editarperfil() {
    this.router.navigate(['/edit-perfil']);
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
  // IMPACTO AMBIENTAL 🌍
  // =========================
  async loadImpacto() {
    if (!this.userId) return;
    const url = `http://localhost:4000/api/impacto/${this.userId}`;
    this.http.get(url).subscribe({
      next: (data: any) => {
        this.impacto = data;
        this.calcularNivel();
        this.calcularEquivalencias();
        this.calcularImpactoPorCategoria();
      },
      error: (err) => console.error('❌ Error al obtener impacto:', err),
    });
  }

  calcularNivel() {
    const reutilizados = this.impacto?.reutilizados || 0;
    if (reutilizados < 10) {
      this.nivel = '🌱 Principiante Verde';
      this.siguienteMeta = 10;
    } else if (reutilizados < 30) {
      this.nivel = '🌿 Agente Circular';
      this.siguienteMeta = 30;
    } else if (reutilizados < 50) {
      this.nivel = '🌳 Guardián del Bosque';
      this.siguienteMeta = 50;
    } else {
      this.nivel = '🌎 Eco Leyenda';
      this.siguienteMeta = reutilizados;
    }
    this.porcentajeNivel = Math.min(reutilizados / this.siguienteMeta, 1);
  }

  calcularEquivalencias() {
    const co2 = this.impacto?.totales?.co2 || this.impacto?.co2 || 0;
    const agua = this.impacto?.totales?.agua || this.impacto?.agua || 0;

    this.equivalencias = {
      viajesAuto: (co2 / 2.3).toFixed(0),
      celulares: (co2 * 10).toFixed(0),
      duchas: (agua / 50).toFixed(0),
    };
  }

  calcularImpactoPorCategoria() {
    const categorias = this.impacto?.categorias || {};
    this.impactoPorCategoria = Object.entries(categorias).map(([nombre, datos]: any) => ({
      nombre,
      co2: datos.co2 || 0,
      agua: datos.agua || 0,
      arboles: datos.arboles || 0,
    }));
    this.maxCo2 = Math.max(...this.impactoPorCategoria.map((c) => c.co2), 1);
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
  // UTILIDADES DE PRODUCTOS
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

  formatEstado(estado: string): string {
    if (!estado) return '';
    return estado.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

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

  // =========================
  // TOASTS
  // =========================
  async presentToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
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
