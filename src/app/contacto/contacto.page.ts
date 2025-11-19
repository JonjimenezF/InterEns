
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController, AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FooterInterensComponent,
  ],
})
export class ContactoPage implements OnInit {
  nombre: string = '';
  email: string = '';
  mensaje: string = '';
  loading: boolean = false;

  constructor(
    private navCtrl: NavController,
    private http: HttpClient,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController // ✅ Importante
  ) {}

  ngOnInit() {}

  async submitForm() {
    if (!this.nombre || !this.email || !this.mensaje) {
      this.showToast('Por favor completa todos los campos.');
      return;
    }

    this.loading = true;

    const data = {
      nombre: this.nombre,
      correo_usuario: this.email,
      mensaje: this.mensaje,
    };

    this.http.post('http://54.210.35.66:4000/api/enviar-correo', data).subscribe({
      next: async (response) => {
        console.log('✅ Correo enviado:', response);
        this.loading = false;
        this.clearForm();

        // ✅ Mostrar alerta bonita
        this.showAlert(
          'Mensaje Enviado 💌',
          'Tu solicitud ha sido enviada correctamente. Te responderemos pronto. 🌿'
        );
      },
      error: async (error) => {
        console.error('❌ Error al enviar el correo:', error);
        this.loading = false;
        this.showAlert(
          'Error al enviar',
          'No pudimos enviar tu mensaje. Inténtalo nuevamente más tarde.'
        );
      },
    });
  }

  clearForm() {
    this.nombre = '';
    this.email = '';
    this.mensaje = '';
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      position: 'bottom',
      color: 'dark',
    });
    toast.present();
  }

  async showAlert(title: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: title,
      message,
      buttons: ['Aceptar'],
      mode: 'ios',
      cssClass: 'custom-alert', // 💅 puedes darle estilo con SCSS
    });
    await alert.present();
  }

  goProducto(): void {
    this.router.navigate(['/producto']);
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  perfil(): void {
    this.router.navigate(['/perfil']);
  }

  puntoLimpio(): void {
    this.router.navigate(['/punto-limpio']);
  }
}
