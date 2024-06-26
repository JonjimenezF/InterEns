
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.page.html',
  styleUrls: ['./recuperar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RecuperarPage implements OnInit {

  email: string = '';
  newPassword: string = '';
  token: string = '';
  user: { email: string } = { email: '' };
  constructor(
    private navCtrl: NavController,
    private router: Router,
    public toastController: ToastController,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['access_token'];
    });
  }

  Verificar() {
    // Aquí puedes agregar la lógica para verificar el usuario.
    // Este método se llama cuando el usuario hace clic en "Verificar".
    // Puedes implementar la lógica para enviar un correo de verificación aquí.
    this.http.post('https://gglsaoykhjniypthjgfc.supabase.co/rest/v1/rpc/verify_email', {
      email: this.email
    }).subscribe(response => {
      // Maneja la respuesta, muestra un mensaje de éxito, redirige, etc.
      console.log('Verification email sent successfully', response);
      this.presentToast('Correo de verificación enviado con éxito');
    }, error => {
      console.error('Error al enviar el correo de verificación', error);
      this.presentToast('Error al enviar el correo de verificación');
    });
  }

  resetPassword() {
    this.http.post('https://your-backend-api/reset-password', {
      token: this.token,
      new_password: this.newPassword
    }).subscribe(response => {
      // Maneja la respuesta, muestra un mensaje de éxito, redirige, etc.
      console.log('Password reset successfully', response);
      this.presentToast('Contraseña restablecida con éxito');
      this.router.navigate(['/login']);
    }, error => {
      console.error('Error al restablecer la contraseña', error);
      this.presentToast('Error al restablecer la contraseña');
    });
  }

  async presentToast(message: string, duration: number = 1000) {
    let toast = await this.toastController.create({
      message: message,
      duration: duration
    });
    toast.present();
  }

  goBack() {
    this.navCtrl.back();
  }

}
