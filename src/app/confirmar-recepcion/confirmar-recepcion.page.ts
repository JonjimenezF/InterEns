import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { TransaccionService } from '../servicios/transaccion.service';
import { supabase } from '../services/supabase.client';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-confirmar-recepcion',
  templateUrl: './confirmar-recepcion.page.html',
  styleUrls: ['./confirmar-recepcion.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule]
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
          )
        `)
        .eq('id', parseInt(this.transaccionId))
        .single();
        
      if (error || !data) {
        console.error('Error cargando transacción:', error);
        this.transaccion = {
          producto_nombre: 'Producto no encontrado',
          precio: 0
        };
        return;
      }
      
      this.transaccion = {
        id: data.id,
        producto_nombre: data.enseres?.titulo || 'Producto',
        producto_imagen: data.enseres?.imagen_url || 'assets/img/default.png',
        precio: data.enseres?.valor_puntos || 0
      };
    } catch (error) {
      console.error('Error cargando transacción:', error);
      this.transaccion = {
        producto_nombre: 'Error cargando producto',
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
      console.log('🚀 Iniciando confirmación para transacción:', this.transaccionId);
      
      // Obtener datos de la transacción para debugging
      const { data: transaccionData } = await supabase
        .from('transacciones')
        .select('propietario_id, solicitante_id')
        .eq('id', parseInt(this.transaccionId))
        .single();
        
      console.log('🔍 IDs obtenidos:', {
        vendedor: transaccionData?.propietario_id,
        comprador: transaccionData?.solicitante_id
      });
      
      // Actualizar transacción a completada
      const { error: errorUpdate } = await supabase
        .from('transacciones')
        .update({ 
          estado: 'completada',
          actualizado_en: new Date().toISOString()
        })
        .eq('id', parseInt(this.transaccionId));
        
      if (errorUpdate) {
        throw new Error('Error actualizando transacción');
      }
      
      // 📧 PASO 4: Obtener emails desde perfiles_con_info
      console.log('🔍 Obteniendo emails desde perfiles_con_info...');
      
      const [compradorPerfil, vendedorPerfil] = await Promise.all([
        supabase.from('perfiles_con_info').select('email, nombre_completo').eq('usuario_id', transaccionData?.solicitante_id).single(),
        supabase.from('perfiles_con_info').select('email, nombre_completo').eq('usuario_id', transaccionData?.propietario_id).single()
      ]);
      
      console.log('📧 Emails obtenidos:', {
        comprador: compradorPerfil.data?.email,
        vendedor: vendedorPerfil.data?.email
      });
      
      const emailComprador = compradorPerfil.data?.email;
      const emailVendedor = vendedorPerfil.data?.email;
      const nombreComprador = compradorPerfil.data?.nombre_completo || 'Comprador';
      const nombreVendedor = vendedorPerfil.data?.nombre_completo || 'Vendedor';
      
      // ✅ PASO 5: Enviar correos si tenemos ambos emails
      if (emailComprador && emailVendedor) {
        console.log('📧 Enviando correos dinámicos...');
        
        const response = await fetch('http://localhost:4000/api/confirmar-intercambio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correoComprador: emailComprador,
            correoVendedor: emailVendedor,
            nombreComprador: nombreComprador,
            nombreVendedor: nombreVendedor,
            productoNombre: this.transaccion?.producto_nombre || 'Producto',
            valorPuntos: this.transaccion?.precio || 0
          })
        });
        
        const result = await response.json();
        console.log('📋 Respuesta del backend:', result);
        
        if (response.ok) {
          console.log('✅ Correos enviados exitosamente');
        } else {
          console.error('❌ Error enviando correos:', result);
        }
      } else {
        console.warn('⚠️ No se pudieron obtener ambos emails:', {
          emailComprador,
          emailVendedor
        });
      }
      
      const toast = await this.toastController.create({
        message: `✅ Recepción confirmada exitosamente`,
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
      console.error('❌ Error confirmando recepción:', error);
      const toast = await this.toastController.create({
        message: 'Error al confirmar recepción',
        duration: 2000,
        color: 'danger'
      });
      await toast.present();
    }
  }
}