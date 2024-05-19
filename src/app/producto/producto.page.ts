import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { ProductoService } from '../servicios/producto.service';
import { Observable } from 'rxjs';
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


  constructor(private router: Router,
              public actionSheetController: ActionSheetController, 
              private navCtrl: NavController,
              private productService: ProductoService,
              private http: HttpClient,) {
              this.imagenProducto = new Observable<Blob>();
  }
  producto={
    descripcion: "",
    precio: "",
    foto: "",
  }

  productos: any[] = []; // Declaración de la propiedad productos
  imagenProducto: Observable<Blob>; // Declaración de la propiedad imagenProducto

  ngOnInit() {
    this.getProductos(); // Llamar al método para obtener los productos al inicializar el componente
  }

  uploadImage(imageData: FormData) {
    return this.http.post<any>('http://localhost:5000/foto/', imageData);
  }
  
  getProductos() {
    this.productService.getProduct().subscribe(
      (data: any[]) => {
        console.log(data);
        this.productos = data; // Almacenar los productos en la variable 'productos'
      },
      (error) => {
        console.error(error);
      }
    );
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

}
