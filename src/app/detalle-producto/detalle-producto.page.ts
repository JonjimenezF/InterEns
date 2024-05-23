import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
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
  @ViewChild('slides', { static: true }) slides: any;
  
  id: any;
  det_imagen: any[] = [];
  det_producto?: producto;

  constructor(private router: Router, 
              private activateRoute: ActivatedRoute,
              private navCtrl: NavController,
              private productService: ProductoService) { 
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['det_producto']) {
      this.det_producto = state['det_producto'];
    }
  }

  ngOnInit() {
    if (this.det_producto) {
      this.id = this.det_producto;
      this.getImagenes(this.id.id_producto);
    }
    console.log(this.det_producto);
  }

  getImagenes(id: number) {
    this.productService.getTodasImagenes(id).subscribe(
      (data: any[]) => {
        this.det_imagen = data;
        console.log(this.det_imagen); // Asegúrate de que las imágenes se están recibiendo correctamente
      },
      (error) => {
        console.error(error);
      }
    );
  }


}