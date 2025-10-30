import { Component, OnInit } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { Router } from '@angular/router';
import { NavController, ModalController, ToastController } from '@ionic/angular';
import { supabase } from '../services/supabase.client';
import { RatingComponent } from '../components/rating/rating.component';
import { ReputacionService } from '../servicios/reputacion.service';
import { StarRatingComponent } from '../components/star-rating/star-rating.component';
import { ReviewsListComponent } from '../components/reviews-list/reviews-list.component';
import { ReportComponent } from '../components/report/report.component';
import { TransaccionService } from '../servicios/transaccion.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss', './detalle-producto-styles.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FooterInterensComponent,
    StarRatingComponent,
    ReviewsListComponent,
    ReportComponent
  ],
})
export class DetalleProductoPage implements OnInit {
  producto: any;
  puedeCalificar = false;
  usuarioActual?: string;
  vendedorReputacion: any = null;

  constructor(
    private router: Router, 
    private navCtrl: NavController,
    private modalController: ModalController,
    private toastController: ToastController,
    private reputacionService: ReputacionService,
    private transaccionService: TransaccionService
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['producto']) {
      this.producto = nav.extras.state['producto'];
      console.log('🟢 Producto recibido:', this.producto);
    } else {
      console.warn('⚠️ No se encontró el producto en el estado.');
    }

    // Verificar si puede calificar
    await this.verificarPuedeCalificar();
    
    // Cargar reputación del vendedor
    if (this.producto?.propietario_id) {
      await this.cargarReputacionVendedor();
    }
  }

  // ✅ Soluciona el error del botón de retroceso
  goBack() {
    this.navCtrl.back();
  }

  // 🟩 Crear transacción para canjear producto
  async canjearProducto() {
    if (!this.producto) {
      this.presentToast('❌ No se encontró información del producto.');
      return;
    }

    // Verificar que el usuario esté logueado
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      this.presentToast('❌ Debes iniciar sesión para canjear productos');
      this.router.navigate(['/login']);
      return;
    }

    const usuarioId = session.session.user.id;

    // No permitir canjear su propio producto
    if (usuarioId === this.producto.propietario_id) {
      this.presentToast('❌ No puedes canjear tu propio producto');
      return;
    }

    try {
      // Crear transacción directamente en Supabase
      const { data, error } = await supabase
        .from('transacciones')
        .insert({
          enser_id: this.producto.id,
          propietario_id: this.producto.propietario_id,
          solicitante_id: usuarioId,
          estado: 'pendiente',
          mensaje: `Solicitud de canje por ${this.producto.valor_puntos} InterCoins`,
          creado_en: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creando transacción:', error);
        this.presentToast('❌ Error al crear la solicitud de canje');
        return;
      }

      this.presentToast('✅ Solicitud de canje enviada al vendedor');
      console.log('✅ Transacción creada:', data);
      
      // Opcional: redirigir al perfil
      // this.router.navigate(['/perfil']);
      
    } catch (error) {
      console.error('Error:', error);
      this.presentToast('❌ Error al procesar la solicitud');
    }
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

  async verificarPuedeCalificar() {
    const { data: session } = await supabase.auth.getSession();
    this.usuarioActual = session?.session?.user?.id;

    if (!this.usuarioActual || !this.producto) {
      this.puedeCalificar = false;
      return;
    }

    // No puede calificarse a sí mismo
    if (this.usuarioActual === this.producto.propietario_id) {
      this.puedeCalificar = false;
      return;
    }

    // Verificar si ya calificó a este vendedor
    const { data: existeCalificacion } = await supabase
      .from('calificaciones')
      .select('id')
      .eq('usuario_calificador', this.usuarioActual)
      .eq('usuario_calificado', this.producto.propietario_id)
      .eq('producto_id', this.producto.id)
      .single();

    this.puedeCalificar = !existeCalificacion;
  }

  async calificarVendedor() {
    if (!this.usuarioActual || !this.producto) {
      this.presentToast('❌ Error: No se puede calificar en este momento');
      return;
    }

    const modal = await this.modalController.create({
      component: RatingComponent,
      componentProps: {
        usuarioCalificado: this.producto.propietario_id,
        usuarioCalificador: this.usuarioActual,
        productoId: this.producto.id.toString(),
        conversacionId: null
      },
      cssClass: 'rating-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentToast('✅ Calificación enviada correctamente');
      this.puedeCalificar = false; // Ocultar botón después de calificar
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    toast.present();
  }

  async cargarReputacionVendedor() {
    if (!this.producto?.propietario_id) return;
    
    try {
      this.vendedorReputacion = await this.reputacionService.obtenerReputacion(this.producto.propietario_id);
    } catch (error) {
      console.error('Error cargando reputación del vendedor:', error);
    }
  }

  async reportarProducto() {
    const modal = await this.modalController.create({
      component: ReportComponent,
      componentProps: {
        tipoReporte: 'producto',
        objetoId: this.producto.id.toString(),
        objetoNombre: this.producto.titulo
      },
      cssClass: 'report-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentToast('✅ Denuncia enviada correctamente');
    }
  }
}
