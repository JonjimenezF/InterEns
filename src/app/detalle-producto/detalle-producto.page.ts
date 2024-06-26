import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { idProducto } from '../models/idProducto';
import { ProductoService } from '../servicios/producto.service';
import { lastValueFrom } from 'rxjs';
import { producto } from '../models/producto';
import { Swiper } from 'swiper';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetalleProductoPage implements OnInit, AfterViewInit {
  @ViewChild('swiperContainer', { static: false }) swiperContainer?: ElementRef<any>;
  
  id: any;
  det_imagen: any[] = [];
  det_producto?: producto;
  
  Carrito = {
    id_producto:"",
    id_usuario:"",
    cantidad:1
  }

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

  // agregarCarrito(producto: any){
  //   console.log(producto)
  //   this.Carrito.id_producto = producto
  //   this.Carrito.id_usuario = this.userInfo.id
  //   console.log(this.Carrito)
  // }

  ngAfterViewInit() {
    if (this.swiperContainer) {
      const mySwiper = new Swiper(this.swiperContainer.nativeElement, {
        pagination: {
          el: '.custom-pagination', // Usa la clase de la paginación personalizada
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
      });
  
      // Agrega un listener para actualizar la clase activa en los puntos de paginación
      mySwiper.on('slideChange', () => {
        const bullets = document.querySelectorAll('.custom-pagination-bullet');
        bullets.forEach((bullet, index) => {
          bullet.classList.remove('active');
          if (index === mySwiper.activeIndex) {
            bullet.classList.add('active');
          }
        });
      });
  
      console.log('Swiper initialized successfully');
    } else {
      console.error('Swiper container not found.');
    }
  
    // Marcar automáticamente el primer elemento de la paginación como activo después de cargar las imágenes
    this.getImagenes(this.id.id_producto);
  }

  getImagenes(id: number) {
    this.productService.getTodasImagenes(id).subscribe(
      (data: any[]) => {
        this.det_imagen = data;
        console.log(this.det_imagen); // Asegúrate de que las imágenes se están recibiendo correctamente
  
        // Marcar automáticamente el primer elemento de la paginación como activo
        const bullets = document.querySelectorAll('.custom-pagination-bullet');
        if (bullets.length > 0) {
          bullets[0].classList.add('active');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  goBack() {
    this.navCtrl.back();
  }

}