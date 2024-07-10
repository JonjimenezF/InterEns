import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar,NavController, IonTitle, IonContent, IonSpinner, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg } from '@ionic/angular/standalone';
import { Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductoService } from '../servicios/producto.service';
import { Observable, catchError, forkJoin, of } from 'rxjs';
@Component({
  selector: 'app-mis-productos',
  templateUrl: './mis-productos.page.html',
  styleUrls: ['./mis-productos.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSpinner,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    CommonModule, 
    FormsModule]
})
export class MisProductosPage implements OnInit {

  private baseUrl = 'http://localhost:5000';  
  productos: any[] = [];
  userInfo?: any
  loading: boolean = true;
  imagesLoadedCount: number = 0;
  constructor(private router:Router,
              private http: HttpClient,
              private productService: ProductoService,
              private navCtrl: NavController
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
   }

   ngOnInit() {
    console.log(this.userInfo);
    if (this.userInfo) {
      this.getProductosUsuario(this.userInfo);
    } else {
      console.error('userInfo no está definido o no tiene un campo id.');
    }
  }

  getProductosUsuario(id_usuario: string) {
    console.log("Id_usuario dentro de la funcion getProductosUsuario:", id_usuario);

    this.productService.getProductosid(id_usuario).subscribe(
      (response) => {
        this.productos = response;
        console.log('Productos del usuario:', this.productos);
        this.obtenerImagenesProductos();
      },
      (error) => {
        console.error('Error al obtener productos del usuario:', error);
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
        console.log(imagenes);
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

  goBack() {
    this.navCtrl.back();
  }
}