import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule} from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
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
  producto: any[] = [];
  userInfo?: any;
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
        console.log(this.carrito)
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getProductCarrito(id:number){
    this.serviceCarrito.getProductoCarrito(id).subscribe(
    (data: any[]) => {
      this.producto = data;
      console.log(this.producto)
    },
    (error) => {
      console.error(error);
    }
    )

  }





  goBack() {
    this.navCtrl.back();
  }

  
  goProducto(){
    this.router.navigate(['/producto'])
  }

}
