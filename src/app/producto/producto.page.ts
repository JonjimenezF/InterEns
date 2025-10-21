import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { CategoriaService } from '../servicios/categoria.service';
import { CarritoService } from '../servicios/carrito.service';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

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
  loading = true;

  searchQuery = '';
  precioMin = '';
  precioMax = '';
  categoriaSeleccionada = '';
  userInfo?: any;

  private intercambiadoHandler?: (event: any) => void;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private toastController: ToastController,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getCategorias();
    this.getProductos();

    // 🧩 Listener global: escucha cuando un producto se marca como intercambiado
    this.intercambiadoHandler = () => {
      console.log('♻️ Evento recibido: productoIntercambiado, recargando lista...');
      this.getProductos(); // refresca lista automáticamente
    };

    window.addEventListener('productoIntercambiado', this.intercambiadoHandler);
  }

  ngOnDestroy() {
    // Limpieza del listener al salir de la página
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
        this.productos = data;
        this.filteredProducts = data;
        this.loading = false;
        console.log(`🧩 Productos cargados: ${this.productos.length}`);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.loading = false;
      },
    });
  }

  // 🧩 Aplica todos los filtros combinados
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

  // 🖼️ Obtener imagen del producto o fallback
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
  goDetalleProducto(producto: any) {
    this.router.navigate(['/detalle-producto'], { state: { producto } });
  }

  verDetalle(producto: any) {
    console.log('➡️ Navegando al detalle de producto:', producto);
    this.router.navigate(['/detalle-producto'], { state: { producto } });
  }

  goBack() {
    this.navCtrl.back();
  }

  // 🔗 Footer
  home() { this.router.navigate(['/home']); }
  perfil() { this.router.navigate(['/perfil']); }
  goProducto() { this.router.navigate(['/sproducto']); }
  puntoLimpio() { this.router.navigate(['/puntos']); }
}
