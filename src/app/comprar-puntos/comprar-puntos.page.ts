import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { TransbankService } from '../services/transbank.service';

@Component({
  selector: 'app-comprar-puntos',
  templateUrl: './comprar-puntos.page.html',
  styleUrls: ['./comprar-puntos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ComprarPuntosPage implements OnInit {
  
  paquetes = [
    { puntos: 10000, precio: 10000, popular: false },
    { puntos: 50000, precio: 50000, popular: true },
    { puntos: 100000, precio: 100000, popular: false }
  ];

  usuarioId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private transbankService: TransbankService
  ) {}

  ngOnInit() {
    this.usuarioId = localStorage.getItem('userId') || '';
    this.checkTransbankReturn();
  }

  private checkTransbankReturn() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.procesarRetornoTransbank(params['token'], params['success'], params['puntos']);
      }
    });
  }

  private async procesarRetornoTransbank(token: string, success: string, puntos: string) {
    const loading = await this.loadingController.create({
      message: 'Verificando pago...'
    });
    await loading.present();

    try {
      if (success === 'true' && puntos) {
        this.mostrarExito(`¡Compra exitosa! Has recibido ${puntos} puntos.`);
        // Limpiar parámetros de la URL
        this.router.navigate(['/comprar-puntos'], { replaceUrl: true });
        return;
      }

      if (token) {
        // Consultar estado real de la transacción
        const estado = await this.transbankService.consultarEstado(token);
        
        if (estado.success && estado.status?.estado === 'AUTORIZADA') {
          this.mostrarExito(`¡Compra exitosa! Has recibido ${estado.status.puntos} puntos.`);
        } else if (estado.status?.estado === 'rechazada') {
          this.mostrarError('El pago fue rechazado. Verifica tus datos e intenta nuevamente.');
        } else {
          this.mostrarError('El pago está pendiente. Intenta nuevamente en unos minutos.');
        }
      } else {
        this.mostrarError('Error en el pago. Intenta nuevamente.');
      }

      // Limpiar parámetros de la URL
      this.router.navigate(['/comprar-puntos'], { replaceUrl: true });

    } catch (error: any) {
      console.error('Error procesando retorno:', error);
      this.mostrarError('Error verificando el pago. Contacta soporte si el problema persiste.');
    } finally {
      loading.dismiss();
    }
  }

  async comprarPuntos(paquete: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar Compra',
      message: `¿Confirmas la compra de ${paquete.puntos.toLocaleString()} puntos por $${paquete.precio.toLocaleString()}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Comprar',
          handler: () => {
            this.procesarCompra(paquete);
          }
        }
      ]
    });
    await alert.present();
  }

  async procesarCompra(paquete: any) {
    if (!this.usuarioId) {
      this.mostrarError('Usuario no identificado');
      return;
    }

    if (!paquete.puntos || !paquete.precio) {
      this.mostrarError('Datos del paquete inválidos');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando compra...'
    });
    await loading.present();

    try {
      const result = await this.transbankService.crearTransaccion(
        this.usuarioId,
        paquete.puntos,
        paquete.precio
      );

      if (result.success && result.token && result.url) {
        await loading.dismiss();
        await this.transbankService.abrirWebpay(result.url, result.token);
      } else {
        throw new Error(result.error || 'Error creando transacción');
      }

    } catch (error: any) {
      console.error('Error procesando compra:', error);
      
      let mensaje = 'Error procesando la compra';
      if (error.message.includes('Parámetros inválidos')) {
        mensaje = 'Datos inválidos. Intenta nuevamente.';
      } else if (error.message.includes('conexión')) {
        mensaje = 'Error de conexión. Verifica tu internet.';
      } else if (error.message.includes('Webpay')) {
        mensaje = 'No se pudo abrir el sistema de pago. Intenta nuevamente.';
      }
      
      this.mostrarError(mensaje);
    } finally {
      loading.dismiss();
    }
  }


  async mostrarExito(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  async mostrarError(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  volver() {
    this.router.navigate(['/perfil']);
  }
}