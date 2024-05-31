import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Observable, catchError, forkJoin, of } from 'rxjs';
import { CarritoService } from '../servicios/carrito.service';
import { HttpClient } from '@angular/common/http';
import { ProductoService } from '../servicios/producto.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.page.html',
  styleUrls: ['./carrito.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CarritoPage implements OnInit {
  carrito: any[] = [];
  productosCarrito: any[] = [];
  userInfo?: any;
  loading: boolean = true;
  
  constructor(
    private router: Router,
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
    console.log(this.userInfo)
    this.getCarritos(this.userInfo)

  }

  getCarritos(id:string) {
    this.serviceCarrito.getCarrito(id).subscribe(
      (data: any[]) => {
        this.carrito= data;
        console.log(this.carrito[0].id_producto)
        for (const item of this.carrito) {
          console.log(item)
          this.getProductCarritos(item.id_producto);
        }
        // this.getProductCarrito(this.carrito.id_producto)
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getProductCarritos(id_producto: number) {
    this.serviceCarrito.getProductoCarrito(id_producto).subscribe(
      (productos: any[]) => {
        console.log('Información de los productos:', productos);
        // Itera sobre los productos y agrégalos a productosCarrito
        for (const producto of productos) {
          this.obtenerImagenesProducto(producto);
        }
      },
      (error) => {
        console.error('Error al obtener los productos:', error);
      }
    );
  }

  obtenerImagenesProducto(producto: any) {
    this.productService.getImagenes(producto.id_producto).pipe(
      catchError(error => {
        console.error(`Error al obtener imágenes para el producto ${producto.id_producto}:`, error);
        return of([]); // Devuelve un arreglo vacío en caso de error
      })
    ).subscribe((imagenes: any[]) => {
      if (imagenes.length > 0) {
        producto.imagen = imagenes;
      } else {
        producto.imagen = [{ url_imagen: 'URL_IMAGEN_POR_DEFECTO' }];
      }
      this.productosCarrito.push(producto); // Agrega el producto a la lista de productos del carrito después de obtener la imagen
    });
  }

  getImagenesProductosCarrito() {
    const observables = this.productosCarrito.map(producto => 
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
            this.productosCarrito[index].imagen = data; // Asigna las imágenes al producto correspondiente
          } else {
            this.productosCarrito[index].imagen = [{ url_imagen: 'URL_IMAGEN_POR_DEFECTO' }];
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

  getImagenProducto(producto: any): string | null {
    if (producto && producto.imagen && producto.imagen.length > 0 && producto.imagen[0].url_imagen) {
      return 'http://localhost:5000/foto/' + producto.imagen[0].url_imagen;
    } else {
      return null; // No pasar nada si no hay imagen
    }
  }

  eliminarDelCarrito(producto: any) {
    // const index = this.productosCarrito.findIndex(p => p.id_producto === producto.id_producto);
    // if (index !== -1) {
    //   this.productosCarrito.splice(index, 1);
    // }
    // // Llama al servicio para eliminar el producto del carrito en el backend si es necesario
    // this.serviceCarrito.eliminarProductoCarrito(producto.id_producto).subscribe(
    //   () => {
    //     console.log(`Producto ${producto.id_producto} eliminado del carrito`);
    //   },
    //   (error) => {
    //     console.error('Error al eliminar el producto del carrito:', error);
    //   }
    // );
  }



  goBack() {
    this.navCtrl.back();
  }

  
  goProducto(){
    this.router.navigate(['/producto'])
  }

}
