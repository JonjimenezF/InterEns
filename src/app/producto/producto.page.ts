import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { CategoriaService } from '../servicios/categoria.service';
import { CarritoService } from '../servicios/carrito.service';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { FavoritosService } from '../servicios/favoritos.service'; // ❤️ servicio de favoritos
import { supabase } from 'src/shared/supabase/supabase.client';   // para obtener userId
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
  favoritos: number[] = []; // ❤️ IDs de productos favoritos
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

  // 🚀 Inicialización
  async ngOnInit() {
    // 🧠 Obtener usuario actual primero
    const { data: session } = await supabase.auth.getSession();
    this.userId = session?.session?.user?.id || null;

    this.getCategorias();
    this.getProductos();

    // ♻️ Listener: cuando un producto cambia a "intercambiado"
    this.intercambiadoHandler = () => {
      console.log('♻️ Evento: productoIntercambiado → recargando lista...');
      this.getProductos();
      if (this.userId) this.loadFavoritos(); // ❤️ sincroniza lista tras canjeo
    };
    window.addEventListener('productoIntercambiado', this.intercambiadoHandler);
  }

  ngOnDestroy() {
    if (this.intercambiadoHandler) {
      window.removeEventListener('productoIntercambiado', this.intercambiadoHandler);
    }
  }

  // 🔹 Obtener categorías
  async getCategorias() {
    try {
      this.categorias = await this.categoriaService.getTodasCategorias();
      console.log('✅ Categorías cargadas:', this.categorias);
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
    }
  }

  // 🔹 Obtener productos desde el backend
  getProductos() {
    this.loading = true;
    this.productoService.getAllProducts().subscribe({
      next: (data) => {
        // Filtra productos activos (no intercambiados)
        this.productos = data.filter((p) => p.estado_enser !== 'intercambiado');
        this.filteredProducts = [...this.productos];
        this.loading = false;
        console.log(`🧩 Productos cargados: ${this.productos.length}`);

        // ❤️ Si ya hay userId, carga los favoritos después
        if (this.userId) {
          setTimeout(() => this.loadFavoritos(), 300);
        }
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.loading = false;
      },
    });
  }

  // ❤️ Cargar lista de deseos (favoritos)
  loadFavoritos() {
    if (!this.userId) return;
    this.favoritosService.getFavoritos(this.userId).subscribe({
      next: (res) => {
        // Evita mostrar favoritos que ya no existen o fueron intercambiados
        this.favoritos = res
          .filter((f: any) => f.producto && f.producto.estado_enser !== 'intercambiado')
          .map((f: any) => f.producto_id);

        console.log('❤️ Favoritos activos cargados:', this.favoritos);
        this.changeDetectorRef.detectChanges();
      },
      error: (err) => console.error('❌ Error al cargar favoritos:', err),
    });
  }

  // ❤️ Verifica si un producto está marcado como favorito
  isFavorito(productoId: number): boolean {
    return this.favoritos.includes(productoId);
  }

  // ❤️ Alternar favorito (agregar / quitar)
  toggleFavorito(event: Event, producto: any) {
    event.stopPropagation();

    if (!this.userId) {
      this.showToast('Debes iniciar sesión para usar favoritos ❤️');
      return;
    }

    const id = producto.id;

    // Si ya es favorito → eliminar
    if (this.isFavorito(id)) {
      this.favoritosService.removeFavorito(this.userId, id).subscribe({
        next: async () => {
          this.favoritos = this.favoritos.filter((fid) => fid !== id);
          await this.showToast('💔 Eliminado de favoritos');
          this.changeDetectorRef.detectChanges();
        },
        error: (err) => console.error('❌ Error al quitar favorito:', err),
      });
    } else {
      // Si no → agregar
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

  // 🧩 Aplica los filtros combinados
  applyAllFilters() {
    const query = this.searchQuery.trim().toLowerCase();
    const min = parseFloat(this.precioMin) || 0;
    const max = parseFloat(this.precioMax) || Infinity;
    const categoria = this.categoriaSeleccionada;

    this.filteredProducts = this.productos.filter((p) => {
      const matchesSearch =
        p.titulo?.toLowerCase().includes(query) ||
        p.descripcion?.toLowerCase().includes(query);
      const matchesCategory = categoria ? p.categoria_id == categoria : true;
      const matchesPrice = p.valor_puntos >= min && p.valor_puntos <= max;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }

  // 🔄 Restablecer filtros
  resetFilters() {
    this.searchQuery = '';
    this.precioMin = '';
    this.precioMax = '';
    this.categoriaSeleccionada = '';
    this.filteredProducts = [...this.productos];
  }

  // 🖼️ Imagen del producto o fallback
  getImagenProducto(producto: any): string {
    return producto.imagen_url || 'assets/img/default.png';
  }

  // 🛒 Agregar al carrito
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

  // 📣 Toasts
  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }

  // 🔗 Navegación y detalle
  verDetalle(producto: any) {
    console.log('➡️ Navegando al detalle de producto:', producto);
    this.router.navigate(['/detalle-producto'], { state: { producto } });
  }

  goBack() {
    this.navCtrl.back();
  }

  // 🔗 Footer navegación
  home() { this.router.navigate(['/home']); }
  perfil() { this.router.navigate(['/perfil']); }
  goProducto() { this.router.navigate(['/sproducto']); }
  puntoLimpio() { this.router.navigate(['/puntos']); }
}
