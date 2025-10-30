import { Component, OnInit } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { supabase } from '../services/supabase.client';
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

  constructor(private router: Router, private navCtrl: NavController) {} // ✅ agregado NavController

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['producto']) {
      this.producto = nav.extras.state['producto'];
      console.log('🟢 Producto recibido:', this.producto);
    } else {
      console.warn('⚠️ No se encontró el producto en el estado.');
    }
  }

  // ✅ Soluciona el error del botón de retroceso
  goBack() {
    this.navCtrl.back();
  }

  // 🟩 Redirigir a la página de canje, enviando el producto
  canjearProducto() {
    if (!this.producto) {
      alert('No se encontró información del producto.');
      return;
    }

    console.log('➡️ Redirigiendo a canjear-puntos con producto:', this.producto);

    this.router.navigate(['/canjear-puntos'], {
      state: { producto: this.producto },
    });
  }

  // 💬 Contactar al vendedor
  async contactarVendedor() {
    console.log('🔥 Botón contactar clickeado');
    console.log('📦 Producto:', this.producto);
    
    if (!this.producto) {
      alert('No se encontró información del producto.');
      return;
    }

    // Verificar que el usuario esté logueado
    const { data: session } = await supabase.auth.getSession();
    console.log('👤 Sesión:', session);
    
    if (!session?.session?.user) {
      console.log('❌ No hay sesión, redirigiendo a login');
      this.router.navigate(['/login']);
      return;
    }

    // No permitir contactar a uno mismo
    if (session.session.user.id === this.producto.propietario_id) {
      alert('No puedes contactarte a ti mismo.');
      return;
    }

    console.log('🚀 Navegando a chat:', `/chat-usuario/${this.producto.propietario_id}/${this.producto.id}`);
    
    // Navegar al chat
    this.router.navigate(['/chat-usuario', this.producto.propietario_id, this.producto.id]);
  }
}
