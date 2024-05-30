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

@Component({
  selector: 'app-producto',
  templateUrl: './producto.page.html',
  styleUrls: ['./producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ProductoPage implements OnInit {
  productos: any[] = [];
  loading: boolean = true;
  imagesLoadedCount: number = 0;

  constructor(
    private router: Router,
    public actionSheetController: ActionSheetController, 
    private navCtrl: NavController,
    private productService: ProductoService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.getProductos();
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
    this.router.navigate(['/carrito']);
  }
}