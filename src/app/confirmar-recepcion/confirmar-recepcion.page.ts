import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TransaccionService } from '../servicios/transaccion.service';
import { supabase } from '../services/supabase.client';

@Component({
  selector: 'app-confirmar-recepcion',
  templateUrl: './confirmar-recepcion.page.html',
  styleUrls: ['./confirmar-recepcion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ConfirmarRecepcionPage implements OnInit {
  transaccionId: string = '';
  usuarioId: string = '';
  transaccion: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transaccionService: TransaccionService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.transaccionId = this.route.snapshot.paramMap.get('id') || '';
    this.usuarioId = localStorage.getItem('userId') || '';
    this.loadTransaccionInfo();
  }

  async loadTransaccionInfo() {
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select(`
          *,
          enseres:enser_id (
            titulo,
            imagen_url,
            valor_puntos
          ),
          propietario:propietario_id (
            nombre_completo
          )
        `)
        .eq('id', parseInt(this.transaccionId))
        .single();
        
      if (error || !data) {
        console.error('Error cargando transacción:', error);
        this.transaccion = {
          producto_nombre: 'Producto no encontrado',
          vendedor_nombre: 'Vendedor',
          precio: 0
        };
        return;
      }
      
      this.transaccion = {
        id: data.id,
        producto_nombre: data.enseres?.titulo || 'Producto',
        producto_imagen: data.enseres?.imagen_url || 'assets/img/default.png',
        vendedor_nombre: data.propietario?.nombre_completo || 'Vendedor',
        precio: data.enseres?.valor_puntos || 0
      };
    } catch (error) {
      console.error('Error cargando transacción:', error);
      this.transaccion = {
        producto_nombre: 'Error cargando producto',
        vendedor_nombre: 'Vendedor',
        precio: 0
      };
    }
  }

  async confirmarRecepcion() {
    const alert = await this.alertController.create({
      header: 'Confirmar Recepción',
      message: '¿Confirmas que recibiste el artículo en buen estado?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => {
            this.procesarConfirmacion();
          }
        }
      ]
    });
    await alert.present();
  }

  private async procesarConfirmacion() {
    try {
      // Primero obtener el enser_id de la transacción
      const { data: transaccion, error: errorTransaccion } = await supabase
        .from('transacciones')
        .select('enser_id')
        .eq('id', parseInt(this.transaccionId))
        .single();
        
      if (errorTransaccion || !transaccion) {
        console.error('Error obteniendo transacción:', errorTransaccion);
        const toast = await this.toastController.create({
          message: 'Error al confirmar recepción',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        return;
      }
      
      // Actualizar transacción a completada
      const { error: errorUpdate } = await supabase
        .from('transacciones')
        .update({ 
          estado: 'completada',
          actualizado_en: new Date().toISOString()
        })
        .eq('id', parseInt(this.transaccionId));
        
      if (errorUpdate) {
        console.error('Error actualizando transacción:', errorUpdate);
        const toast = await this.toastController.create({
          message: 'Error al confirmar recepción',
          duration: 2000,
          color: 'danger'
        });
        await toast.present();
        return;
      }
      
      // Marcar el enser como no disponible
      const { error: errorEnser } = await supabase
        .from('enseres')
        .update({ 
          estado: 'no_disponible',
          updated_at: new Date().toISOString()
        })
        .eq('id', transaccion.enser_id);
        
      if (errorEnser) {
        console.error('Error actualizando enser:', errorEnser);
        // No bloqueamos el flujo, solo logueamos el error
      }
      
      const toast = await this.toastController.create({
        message: `✅ Recepción de "${this.transaccion?.producto_nombre}" confirmada exitosamente`,
        duration: 3000,
        color: 'success',
        position: 'top'
      });
      await toast.present();
      
      // Navegar de vuelta al perfil
      this.router.navigate(['/perfil'], {
        state: { openTab: 'transacciones' }
      });
    } catch (error) {
      console.error('Error confirmando recepción:', error);
      const toast = await this.toastController.create({
        message: 'Error al confirmar recepción',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}