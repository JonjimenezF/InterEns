import { Component, OnInit } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonImg,
  IonIcon,
  IonButton,
  IonFooter,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonImg,
    IonIcon,
    IonButton,
    IonFooter,
    FooterInterensComponent,
  ],
})
export class DetalleProductoPage implements OnInit {
  producto: any;

  constructor(private router: Router) {}

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['producto']) {
      this.producto = nav.extras.state['producto'];
      console.log('🟢 Producto recibido:', this.producto);
    } else {
      console.warn('⚠️ No se encontró el producto en el estado.');
    }
  }

  // 🟩 Redirigir a la página de canje, enviando el producto
  canjearProducto() {
    if (!this.producto) {
      alert('No se encontró información del producto.');
      return;
    }

    console.log('➡️ Redirigiendo a canjear-puntos con producto:', this.producto);

    // ✅ Enviamos el producto a la página de canje
    this.router.navigate(['/canjear-puntos'], {
      state: { producto: this.producto },
    });
  }
}
