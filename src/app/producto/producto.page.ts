import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { CategoriaService } from '../servicios/categoria.service';
import { CarritoService } from '../servicios/carrito.service';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { FavoritosService } from '../servicios/favoritos.service';
import { supabase } from 'src/shared/supabase/supabase.client';
import { addIcons } from 'ionicons';
import { heart, heartOutline } from 'ionicons/icons';

addIcons({ heart, heartOutline });

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FooterInterensComponent],
})
export class ProductoPage implements OnInit, OnDestroy {
  categorias: any[] = [];
  productos: any[] = [];
  filteredProducts: any[] = [];
  favoritos: number[] = [];
  loading = true;

  searchQuery = '';
  precioMin = '';
  precioMax = '';
  categoriaSeleccionada = '';
  userInfo?: any;
  userId: string | null = null;

  private intercambiadoHandler?: (event: any) => void;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private favoritosService: FavoritosService,
    private toastController: ToastController,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    const { data: session } = await supabase.auth.getSession();
    this.userId = session?.session?.user?.id || null;

    this.getCategorias();
    this.getProductos();

    // ♻️ Listener cuando un producto cambia estado
    this.intercambiadoHandler = () => {
      console.log('♻️ Evento productoIntercambiado → recargando lista');
      this.getProductos();
      if (this.userId) this.loadFavoritos();
    };
    window.addEventListener('productoIntercambiado', this.intercambiadoHandler);
  }

  ngOnDestroy() {
    if (this.intercambiadoHandler)
      window.removeEventListener('productoIntercambiado', this.intercambiadoHandler);
  }

  // 🔹 Obtener categorías
  async getCategorias() {
    try {
      this.categorias = await this.categoriaService.getTodasCategorias();
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
    }
  }

  // 🔹 Obtener productos activos desde el backend
  getProductos() {
    this.loading = true;
    this.productoService.getAllProducts().subscribe({
      next: (data) => {
        // ✅ Solo productos activos y publicados (por seguridad)
        this.productos = data.filter(p => p.activo && p.estado === 'publicado');
        this.filteredProducts = [...this.productos];
        this.loading = false;

        if (this.userId) setTimeout(() => this.loadFavoritos(), 300);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.loading = false;
      },
    });
  }

  // ❤️ Cargar favoritos activos
  loadFavoritos() {
    if (!this.userId) return;
    this.favoritosService.getFavoritos(this.userId).subscribe({
      next: (res) => {
        this.favoritos = res
          .filter((f: any) => f.producto?.activo && f.producto?.estado === 'publicado')
          .map((f: any) => f.producto_id);
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar favoritos:', err),
    });
  }

  isFavorito(productoId: number): boolean {
    return this.favoritos.includes(productoId);
  }

  toggleFavorito(event: Event, producto: any) {
    event.stopPropagation();

    if (!this.userId) {
      this.showToast('Debes iniciar sesión para usar favoritos ❤️');
      return;
    }

    const id = producto.id;

    if (this.isFavorito(id)) {
      this.favoritosService.removeFavorito(this.userId, id).subscribe({
        next: async () => {
          this.favoritos = this.favoritos.filter(fid => fid !== id);
          await this.showToast('💔 Eliminado de favoritos');
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => console.error('❌ Error al quitar favorito:', err),
      });
    } else {
      this.favoritosService.addFavorito(this.userId, id).subscribe({
        next: async () => {
          this.favoritos.push(id);
          await this.showToast('❤️ Agregado a favoritos');
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => console.error('❌ Error al agregar favorito:', err),
      });
    }
  }

  applyAllFilters() {
    const query = (this.searchQuery || '').trim().toLowerCase().slice(0, 100);

    // Coerción segura
    const minRaw = String(this.precioMin ?? '').trim();
    const maxRaw = String(this.precioMax ?? '').trim();
    const minNum = minRaw === '' ? 0 : Number(minRaw);
    const maxNum = maxRaw === '' ? Number.POSITIVE_INFINITY : Number(maxRaw);

    // Validaciones duras
    if (Number.isNaN(minNum) || Number.isNaN(maxNum)) {
      this.showToast('Ingresa números válidos en Puntos.');
      return;
    }
    if (minNum < 0 || maxNum < 0) {
      this.showToast('Los puntos no pueden ser negativos.');
      return;
    }
    if (maxNum !== Number.POSITIVE_INFINITY && minNum > maxNum) {
      this.showToast('El mínimo no puede ser mayor que el máximo.');
      return;
    }

    const categoria = this.categoriaSeleccionada;
    const categoriaExiste = !categoria || this.categorias.some(c => String(c.id) === String(categoria));
    if (!categoriaExiste) {
      this.showToast('La categoría seleccionada no existe.');
      return;
    }

    this.filteredProducts = this.productos.filter(p => {
      const titulo = (p.titulo || '').toLowerCase();
      const desc = (p.descripcion || '').toLowerCase();
      const matchesSearch = !query || titulo.includes(query) || desc.includes(query);
      const matchesCategory = categoria ? String(p.categoria_id) === String(categoria) : true;
      const puntos = Number(p.valor_puntos) || 0;
      const matchesPrice = puntos >= minNum && puntos <= maxNum;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }


  resetFilters() {
    this.searchQuery = '';
    this.precioMin = '';
    this.precioMax = '';
    this.categoriaSeleccionada = '';
    this.filteredProducts = [...this.productos];
  }

  getImagenProducto(producto: any): string {
    return producto.imagen_url || 'assets/img/default.png';
  }

  agregarCarrito(event: Event, producto: any) {
    event.stopPropagation();
    const item = {
      id_producto: producto.id,
      id_usuario: this.userInfo?.id,
      cantidad: 1,
    };
    this.carritoService.postCarrito(item).subscribe({
      next: () => this.showToast('Producto agregado al carrito 🛒'),
      error: (error) => console.error('Error al agregar producto', error),
    });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  verDetalle(producto: any) {
    console.log('🔍 Navegando a detalle con producto:', producto);
    this.router.navigate(['/detalle-producto'], { state: { producto } });
  }

  goBack() { this.navCtrl.back(); }
  home() { this.router.navigate(['/home']); }
  perfil() { this.router.navigate(['/perfil']); }
  goProducto() { this.router.navigate(['/sproducto']); }
  puntoLimpio() { this.router.navigate(['/puntos']); }
}
