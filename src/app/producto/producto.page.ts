import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton, IonContent, IonSearchbar, IonButton, IonIcon, IonModal, IonGrid, IonRow, IonCol, IonLabel, IonInput, IonItem, IonSpinner, IonCard, IonImg} from '@ionic/angular/standalone';
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
  imports: [ 
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonSearchbar,
    IonButton,
    IonIcon,
    IonModal,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonInput,
    IonItem,
    IonSpinner,
    IonCard,
    IonImg,
    CommonModule, 
    FormsModule
  ]
})
export class ProductoPage implements OnInit {
  
  categoria: any[] = [];
  productos: any[] = [];
  filteredProducts: any[] = []; // Lista de productos filtrados
  loading: boolean = true;
  imagesLoadedCount: number = 0;
  searchQuery: string = ''; // Query de búsqueda
  precioMin: string =''; // Precio mínimo para el filtro
  precioMax: string =''; // Precio máximo para el filtro
  selectedCategoria: any; // Categoría seleccionada
  isModalOpen: boolean = false; // Estado del modal
 


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
      },
      (error) => {
        console.error(error);
      }
    );
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
      return 'https://pystore-interens-7.onrender.com/foto/' + producto.imagen[0].url_imagen;
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
    // Convertir a número si hay valores válidos
    let minPrice = parseFloat(this.precioMin?.toString());
    let maxPrice = parseFloat(this.precioMax?.toString());
  
    // Validar que se ingresaron números válidos
    if (isNaN(minPrice)) {
      minPrice = 0; // Valor mínimo si no se especifica correctamente
    }
    if (isNaN(maxPrice)) {
      maxPrice = 1000000; // Valor máximo si no se especifica correctamente
    }
  
    console.log("Min y Max después de conversión:", minPrice, maxPrice);
  
    // Filtrar productos por precio
    this.filteredProducts = this.productos.filter(producto => {
      // Obtener el precio del producto como número usando parsePrice()
      const productPrice = this.parsePrice(producto.precio); // Aquí se pasa producto.precio
  
      // Verificar si el precio es un número válido
      if (!isNaN(productPrice)) {
        return productPrice >= minPrice && productPrice <= maxPrice;
      } else {
        return false; // No incluir productos con precios no válidos
      }
    });
  
    // Cerrar el modal después de filtrar
    this.closeCategoryFilter();
  }
  
  
  // Función para convertir string de precio a número y formatear como string con $
  parsePrice(priceString: string | undefined): number {
    if (!priceString) {
      return 0; // Retorna 0 si priceString es undefined o null
    }
    console.log("Aqui ingresando",priceString);
    // Eliminar caracteres no numéricos excepto '$' y '.'
    const numericString = priceString.replace(/[^\d.$]/g, '');
    console.log("sacando los caracter",numericString);
    // Convertir a número
    const numericPrice = parseFloat(numericString.replace(/\./g, '').replace(/\$/g, ''));
    console.log(numericPrice);
    return numericPrice || 0; // Retorna 0 si no se puede convertir a número
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


  async showCategoriaFilter() {
    console.log('Categorías disponibles:', this.categoria);
    
  }

  openCategoryFilter() {
    this.isModalOpen = true;
    this.changeDetectorRef.detectChanges();  // Forzar detección de cambios
  }

  closeCategoryFilter() {
    this.isModalOpen = false;
    this.changeDetectorRef.detectChanges();  // Forzar detección de cambios
  }

  selectCategory(idCategoria: string) {
    this.filterByCategoria(idCategoria);
    this.closeCategoryFilter();
  }

  showAllProducts() {
    this.selectedCategoria = null;
    this.filteredProducts = this.productos;
    this.closeCategoryFilter();
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



  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
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