

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ProductoService } from '../servicios/producto.service';
import { CategoriaService } from '../servicios/categoria.service';
import { CarritoService } from '../servicios/carrito.service';
import { producto } from '../models/producto';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,              // 💡 Incluye todos los componentes base (IonHeader, IonButton, IonSelect, etc.)
    FooterInterensComponent   // 💚 Agregamos el footer de InterEns
  ]
})
export class ProductoPage implements OnInit {
  categorias: any[] = [];
  productos: any[] = [];
  filteredProducts: any[] = [];
  loading = true;
  searchQuery = '';
  precioMin = '';
  precioMax = '';
  categoriaSeleccionada = '';
  isModalOpen = false;
  userInfo?: any;

  constructor(
    private router: Router,
    private navCtrl: NavController,
    private productService: ProductoService,
    private categoriaService: CategoriaService,
    private serviceCarrito: CarritoService,
    private toastController: ToastController,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getCategorias();
    this.getProductos();
  }

  async getCategorias() {
    try {
      this.categorias = await this.categoriaService.getTodasCategorias();
      console.log('✅ Categorías cargadas:', this.categorias);
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
    }
  }

  getProductos() {
    this.productService.getProduct().subscribe({
      next: (data: any[]) => {
        this.productos = data.filter((p) => p.validacion === true);
        this.filteredProducts = this.productos;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
      },
    });
  }

  filterByCategory() {
    this.filteredProducts = this.categoriaSeleccionada
      ? this.productos.filter(
          (p) => p.id_categoria === this.categoriaSeleccionada
        )
      : this.productos;
  }

  filterProducts() {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredProducts = query
      ? this.productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(query) ||
            p.descripcion.toLowerCase().includes(query)
        )
      : this.productos;
  }

  openCategoryFilter() {
    this.isModalOpen = true;
  }

  closeCategoryFilter() {
    this.isModalOpen = false;
  }

  filterByPrice() {
    const min = parseFloat(this.precioMin) || 0;
    const max = parseFloat(this.precioMax) || Infinity;
    this.filteredProducts = this.productos.filter((p) => {
      const price = parseFloat((p.precio + '').replace(/[^0-9.]/g, ''));
      return price >= min && price <= max;
    });
    this.closeCategoryFilter();
  }

  getImagenProducto(producto: any): string {
    if (producto?.imagen?.[0]?.url_imagen) {
      return `https://pystore-interens-7.onrender.com/foto/${producto.imagen[0].url_imagen}`;
    }
    return 'assets/img/default.png';
  }

  goDetalleProducto(detProducto: producto) {
    this.router.navigate(['/detalle-producto'], {
      state: { det_producto: detProducto },
    });
  }

  agregarCarrito(event: Event, producto: any) {
    event.stopPropagation();
    const carrito = {
      id_producto: producto.id_producto,
      id_usuario: this.userInfo?.id,
      cantidad: 1,
    };
    this.serviceCarrito.postCarrito(carrito).subscribe({
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

  goBack() {
    this.navCtrl.back();
  }

  // 🔗 Navegación Footer
  home() {
    this.router.navigate(['/home']);
  }

  perfil() {
    this.router.navigate(['/perfil']);
  }

  goProducto() {
    this.router.navigate(['/sproducto']);
  }

  puntoLimpio() {
    this.router.navigate(['/puntos']);
  }
}
