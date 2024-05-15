import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { idProducto } from '../models/idProducto';
import { ProductoService } from '../servicios/producto.service';
import { lastValueFrom } from 'rxjs';
import { producto } from '../models/producto';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetalleProductoPage implements OnInit {

  id:any
  det_producto?: producto ;
  constructor(private router: Router, 
              private activateRoute: ActivatedRoute,
              private navCtrl: NavController,
              private productService: ProductoService,) 
  { 
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['det_producto']) {
    this.det_producto = state['det_producto'];
    }
  }


  ngOnInit() {
    console.log(this.det_producto)
    this.id=this.det_producto
    // if (this.id_producto) {
    //   this.detalleProductoID(this.id);
    // }
    console.log()
  }

  // async detalleProductoID(id: number) {
  //   try {
  //     const product = await this.productService.getProductoid(id).toPromise(); // Obtener detalles del producto por ID
  //     console.log(product); // Imprimir detalles del producto en la consola
  //   } catch (error) {
  //     console.error('Error al cargar detalles del producto:', error); // Manejar errores
  //   }
  // }
}
