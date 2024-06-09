import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { NavController, ToastController } from '@ionic/angular';
import { ProductoService } from '../servicios/producto.service';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { producto } from '../models/producto';
import { CategoriaService } from '../servicios/categoria.service';
import { CarritoService } from '../servicios/carrito.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductoPage implements OnInit {
  
  categoria: any[] = [];
  productos: any[] = [];
  filteredProducts: any[] = []; // Lista de productos filtrados
  loading: boolean = true;
  imagesLoadedCount: number = 0;
  searchQuery: string = ''; // Query de búsqueda
  precioMin: number = 0; // Precio mínimo para el filtro
  precioMax: number = Infinity; // Precio máximo para el filtro
  selectedCategoria: any; // Categoría seleccionada

  Carrito = {
    id_producto: "",
    id_usuario: "",
    cantidad: 1
  }

  userInfo?: any;

  constructor(
    private router: Router,
    public actionSheetController: ActionSheetController,
    private navCtrl: NavController,
    private productService: ProductoService,
    private categoriaService: CategoriaService,
    private http: HttpClient,
    private serviceCarrito: CarritoService,
    private toastController: ToastController,
    private modalController: ModalController,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  ngOnInit() {
    this.getProductos();
    this.getCategorias();
    console.log(this.userInfo);
  }

  agregarCarrito(event: Event, producto: any) {
    event.stopPropagation(); // Detener la propagación del evento
    console.log(producto);
    this.Carrito.id_producto = producto.id_producto;
    this.Carrito.id_usuario = this.userInfo.id;
    console.log(this.Carrito);
    this.serviceCarrito.postCarrito(this.Carrito).subscribe(
      response => {
        this.showToast("Producto agregado al carrito");
        console.log('Producto agregado al carrito', response);
      },
      error => {
        console.error('Error al agregar el producto al carrito', error);
      }
    );
  }

  getProductos() {
    this.productService.getProduct().subscribe(
      (data: any[]) => {
        // Filtra los productos que tienen validación verdadera
        this.productos = data.filter(producto => producto.validacion === true);
        this.filteredProducts = this.productos; // Mostrar todos los productos inicialmente
        this.obtenerImagenesProductos();
        this.loading = false; // Marcar la carga como completa
      },
      (error) => {
        console.error(error);
        this.loading = false; // Detener la animación si hay un error
      }
    );
  }
  getCategorias() {
    this.categoriaService.getTodasCategorias().subscribe(
      (data: any[]) => {
        this.categoria = data;
        this.configureButtons();
      },
      (error) => {
        console.error(error);
      }
    );
  }

  configureButtons() {
    this.buttons = [
      {
        text: 'Mostrar todos',
        cssClass: 'boton-mostrar-todos',
        handler: () => this.filterByCategoria(null) // Mostrar todos los productos
      },
      ...this.categoria.map(categoria => ({
        cssClass: 'boton-categoria',
        text: categoria.nombre,
        handler: () => {
          this.selectedCategoria = categoria.id_categoria;
          this.filterByCategoria(this.selectedCategoria); // Llama a la función de filtro
        }
      })),
    ];

    // Forzar la actualización de la interfaz de usuario
    this.changeDetectorRef.detectChanges();
  }

  obtenerImagenesProductos() {
    const observables = this.productos.map(producto =>
      this.productService.getImagenes(producto.id_producto).pipe(
        catchError(error => {
          console.error(`Error al obtener imágenes para el producto ${producto.id_producto}:`, error);
          return of([]); // Devuelve un arreglo vacío en caso de error
        })
      )
    );

    forkJoin(observables).subscribe(
      (imagenes: any[][]) => {
        imagenes.forEach((data, index) => {
          if (data.length > 0) {
            this.productos[index].imagen = data;
          } else {
            this.productos[index].imagen = [{ url_imagen: 'URL_IMAGEN_POR_DEFECTO' }];
          }
        });
        this.loading = false; // Detener la animación una vez que todas las imágenes se hayan cargado
      },
      (error) => {
        console.error("Error al obtener imágenes:", error);
        this.loading = false; // Detener la animación si hay un error
      }
    );
  }

  onImageLoad() {
    this.imagesLoadedCount++;
    if (this.imagesLoadedCount === this.productos.length) {
      this.loading = false;
    }
  }

  getImagenProducto(producto: any): string | null {
    if (producto && producto.imagen && producto.imagen.length > 0 && producto.imagen[0].url_imagen) {
      return 'http://localhost:5000/foto/' + producto.imagen[0].url_imagen;
    } else {
      return null; // No pasar nada si no hay imagen
    }
  }

  goDetalleProducto(detProducto: producto) {
    console.log(detProducto);
    if (detProducto) {
      this.router.navigate(['/detalle-producto'], { state: { det_producto: detProducto } });
    } else {
      console.error("ID del producto no definido");
    }
  }

  filterByCategoria(idCategoria: string | null = null) {
    if (idCategoria) {
      this.selectedCategoria = idCategoria;
      this.filteredProducts = this.productos.filter(producto => producto.id_categoria === idCategoria);
      console.log('Productos filtrados por categoría:', this.filteredProducts);
  
      // Forzar la actualización de la interfaz de usuario
      this.changeDetectorRef.detectChanges();
    } else {
      this.selectedCategoria = '';
      this.filteredProducts = this.productos;
      console.log('Todos los productos:', this.filteredProducts);
  
      // Forzar la actualización de la interfaz de usuario
      this.changeDetectorRef.detectChanges();
    }
  }

  filterByPrice() {
    this.filteredProducts = this.productos.filter(producto => 
      producto.precio >= this.precioMin && producto.precio <= this.precioMax
    );
  }

  filterProducts() {
    if (this.searchQuery && this.searchQuery.trim() !== '') {
      const query = this.searchQuery.toLowerCase();
      this.filteredProducts = this.productos.filter(producto => 
        producto.nombre.toLowerCase().includes(query) || 
        producto.descripcion.toLowerCase().includes(query)
      );
    } else {
      this.filteredProducts = this.productos;
    }
  }


  
  
  public buttons = [
    {
      text: 'Mostrar todos',
      handler: () => this.filterByCategoria(null) // Mostrar todos los productos
    },
    {
      text: 'Cerrar',
      handler: () => {
        // Opcionalmente, agrega alguna lógica si es necesario
      }
    }
  ];

  async showCategoriaFilter() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Categorías',
      cssClass: 'my-custom-class',
      buttons: this.categoria.map(categoria => ({
        text: categoria.nombre,
        handler: () => {
          this.selectedCategoria = categoria.id_categoria;
          this.filterByCategoria(this.selectedCategoria); // Llama a la función de filtro
        }
      }))
    });
  
    await actionSheet.present();
  }

  // async showPriceFilterModal() {
  //   const modal = await this.modalController.create({
  //     component: PriceFilterModalComponent,
  //     componentProps: {
  //       precioMin: this.precioMin,
  //       precioMax: this.precioMax
  //     }
  //   });

  //   modal.onDidDismiss().then(data => {
  //     if (data && data.data) {
  //       this.precioMin = data.data.precioMin;
  //       this.precioMax = data.data.precioMax;
  //       this.filterByPrice();
  //     }
  //   });

  //   return await modal.present();
  // }


  showMenu = true;

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }


  toggleMenu() {
    this.showMenu = !this.showMenu;
  }


  goProducto() {
    this.router.navigate(['/producto']);
  }

  home() {
    this.router.navigate(['/home']);
  }

  perfil() {
    this.router.navigate(['/perfil']);
  }

  salir() {}

  puntoLimpio() {}

  goBack() {
    this.navCtrl.back();
  }

  goCarrito() {
    this.router.navigate(['/carrito'], { state: { userInfo: this.userInfo.id } });
  }
}