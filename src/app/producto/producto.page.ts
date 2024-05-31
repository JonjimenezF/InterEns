import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
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
  isCategoriaSelected = false;
  productos: any[] = [];
  loading: boolean = true;
  imagesLoadedCount: number = 0;
  Carrito = {
    id_producto:"",
    id_usuario:"",
    cantidad:1
  }

  userInfo?: any;
  constructor(
    private router: Router,
    public actionSheetController: ActionSheetController, 
    private navCtrl: NavController,
    private productService: ProductoService,
    private http: HttpClient,
    private serviceCarrito: CarritoService
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  ngOnInit() {
    this.getProductos();
    
    console.log(this.userInfo)
  }

  agregarCarrito(event: Event, producto: any) {
    event.stopPropagation(); // Detener la propagación del evento
    console.log(producto);
    this.Carrito.id_producto = producto.id_producto;
    this.Carrito.id_usuario = this.userInfo.id;
    console.log(this.Carrito);
    this.serviceCarrito.postCarrito(this.Carrito).subscribe(
      response => {
        console.log('Producto agregado al carrito', response);
        // Puedes mostrar una notificación al usuario aquí
      },
      error => {
        console.error('Error al agregar el producto al carrito', error);
        // Puedes manejar el error aquí, por ejemplo, mostrando un mensaje de error al usuario
      }
    );
    // Aquí puedes agregar la lógica para agregar el producto al carrito
  }

  getProductos() {
    this.productService.getProduct().subscribe(
      (data: any[]) => {
        this.productos = data;
        this.obtenerImagenesProductos();
      },
      (error) => {
        console.error(error);
        this.loading = false; // Detener la animación si hay un error
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

  buildButtons() {
    return this.categoria.map(categoria => ({
      text: categoria.nombre,
      handler: () => this.filterByCategoria(categoria.id)
    }));
  }

  
  
  
  filterByCategoria(idCategoria: string) {
    this.isCategoriaSelected = true;
    this.productos = this.productos.filter(producto => producto.id_categoria === idCategoria);
  }
  

  


  public buttons = [
    {
      text: 'Orden',
      role: 'button',
    },
    {
      text: 'Puntuación',
      role: 'button',
    },
    {
      text: 'Categoría',
      role: 'button',

    },
    {
      text: 'Cerrar',
      role: 'cancel',
    }
  ];

  showMenu = false;

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