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

  constructor(private router: Router,
              public actionSheetController: ActionSheetController, 
              private navCtrl: NavController,
              private productService: ProductoService,
              private http: HttpClient,) {
              // this.imagenProducto = new Observable<Blob>();
  }
  producto={
    descripcion: "",
    precio: "",
    foto: "",
    id_producto: "",
  }

  productos: any[] = [];

  // productos: any[] = []; // Declaración de la propiedad productos
  // imagenProducto: Observable<Blob>; // Declaración de la propiedad imagenProducto

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
      },
      (error) => {
        console.error("Error al obtener imágenes:", error);
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

  


  //recibir datos producto
  goDetalleProducto(detProducto:producto) {
    console.log(detProducto)
    if (detProducto) {
      this.router.navigate(['/detalle-producto'], { state: { det_producto: detProducto}})
      // this.navCtrl.navigateForward(['/detalle-producto/: id']);
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
      text: 'Puntuación',
      role: 'button',
      
    },
    {
      text: 'Categoría',
      role: 'button',

    }
  ]

  showMenu = false;

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  goProducto(){
    this.router.navigate(['/producto']);
  }

  home(){
    this.router.navigate(['/home']);
  }

  perfil(){
    this.router.navigate(['/perfil']);
  }

  salir(){

  }
  puntoLimpio(){

  }

  goBack() {
    this.navCtrl.back();
  }

  goCarrito(){
    this.router.navigate(['/carrito']);
  }

}
