import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent,IonButton,IonImg,IonBackButton, IonList, IonItem, IonSpinner, IonLabel, IonNote, IonButtons} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';
import { NavController, ToastController } from '@ionic/angular';
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
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonImg,
    IonBackButton,
    IonList,
    IonItem,
    IonSpinner,
    IonLabel,
    IonNote,
    IonButtons
  ]
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
    private serviceCarrito: CarritoService,
    private toastController: ToastController,
    private elementRef: ElementRef,
    private alertController: AlertController
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
    
  }

  ngOnInit() {
    console.log(this.userInfo);
    this.getCarritos(this.userInfo);
  }

  getCarritos(id: string) {
    this.serviceCarrito.getCarrito(id).subscribe(
      (data: any[]) => {
        this.carrito = data;
        for (const item of this.carrito) {
          this.getProductCarritos(item.id_carrito, item.id_producto); // Pasar id_carrito y id_producto
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
  getProductCarritos(id_carrito: number, id_producto: number) {
    this.serviceCarrito.getProductoCarrito(id_producto).subscribe(
      (productos: any[]) => {
        for (const producto of productos) {
          producto.id_carrito = id_carrito; // Asignar id_carrito al producto
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
        return of([]); 
      })
    ).subscribe((imagenes: any[]) => {
      if (imagenes.length > 0) {
        producto.imagen = imagenes;
      } else {
        producto.imagen = [{ url_imagen: 'URL_IMAGEN_POR_DEFECTO' }];
      }
      producto.cantidad = 1; // Inicializa la cantidad del producto
      this.productosCarrito.push(producto);
    });
  }

  getImagenProducto(producto: any): string | null {
    if (producto && producto.imagen && producto.imagen.length > 0 && producto.imagen[0].url_imagen) {
      return 'https://pystore-interens-7.onrender.com/foto/' + producto.imagen[0].url_imagen;
    } else {
      return null;
    }
  }

  async eliminarDelCarrito(producto: any) {
    const idCarrito = producto.id_carrito;

    const alert = await this.alertController.create({
      header: 'Eliminar',
      message: '¿Quieres eliminar el producto?',
      buttons: [
        {
          text: 'Volver',
          role: 'cancel',
          handler: () => {
            console.log('Eliminación cancelada');
          }
        },
        {
          text: 'Eliminar',
          handler: () => {
            const index = this.productosCarrito.findIndex(p => p.id_producto === producto.id_producto);
            if (index !== -1) {
              this.productosCarrito.splice(index, 1);
              console.log("Carrito actualizado:", this.productosCarrito);
              this.showToast("Producto eliminado del carrito");

              this.serviceCarrito.eliminarProductoCarrito(idCarrito)
                .subscribe(
                  response => {
                    console.log('Producto eliminado del carrito:', response);
                  },
                  error => {
                    console.error('Error al eliminar producto del carrito:', error);
                  }
                );
            }
          }
        }
      ]
    });

    await alert.present();
  }

  incrementarCantidad(producto: any) {
    producto.cantidad += 1;
  }

  decrementarCantidad(producto: any) {
    if (producto.cantidad > 1) {
      producto.cantidad -= 1;
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  // Función para limpiar y convertir precios a números
  limpiarYConvertirPrecio(precio: string): number {
    // Eliminar símbolos no numéricos (ejemplo: "$", ",", etc.)
    const precioLimpio = precio.replace(/[$,.]/g, '');
    // Convertir a número
    return parseFloat(precioLimpio);
  }

  calcularTotal(): number {
    let total = 0;
    this.productosCarrito.forEach((producto: any) => {
      const precioNumerico = this.limpiarYConvertirPrecio(producto.precio);
      const subtotal = precioNumerico * producto.cantidad;
      total += subtotal;
    });
    return total;
  }

  

  ngAfterViewInit(): void {
    this.adjustSummaryPosition();
    // Escuchar cambios en el tamaño de la ventana para ajustar la posición
    window.addEventListener('resize', () => this.adjustSummaryPosition());
  }

  adjustSummaryPosition(): void {
    const summaryDiv = this.elementRef.nativeElement.querySelector('#summaryDiv');
    if (summaryDiv) {
      const productListHeight = document.querySelector('.product-list')?.clientHeight || 0; // Ajusta esto según la clase de tu lista de productos
      const windowHeight = window.innerHeight;
      const summaryDivHeight = summaryDiv.offsetHeight;

      if (productListHeight + summaryDivHeight > windowHeight) {
        summaryDiv.style.bottom = 'auto';
        summaryDiv.style.top = `${productListHeight}px`;
      } else {
        summaryDiv.style.top = 'auto';
        summaryDiv.style.bottom = '0';
      }
    }
  }

  

  continuarCompra() {
    const total = this.calcularTotal();
    const url = `http://localhost:3000/webpay_plus/create?amount=${total}`;
    console.log('Enviando solicitud al servidor para iniciar la transacción con URL:', url);

    // Realiza una redirección al navegador
    window.location.href = url;  // Esto debería funcionar si tu backend redirige correctamente.
  }



  

  goBack() {
    this.navCtrl.back();
  }

  goProducto() {
    this.router.navigate(['/producto']);
  }
}