import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { UsuarioService } from '../servicios/usuario.service'; // Importa el servicio UsuarioService
import { Router } from '@angular/router';
import { rUsuario } from '../models/rUsuario';
                      
@Component({
  selector: 'app-registrar',
  templateUrl: './registrar.page.html',
  styleUrls: ['./registrar.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class RegistrarPage implements OnInit {

  user={
    email: "",
    nombre: "",
    apellido: "",
    password:"",
  }

  constructor(private router: Router, public toastController: ToastController, private navCtrl: NavController, private userService: UsuarioService) { } // Inyecta el servicio UsuarioService aquí

  ngOnInit() {
  }

  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  regis(users: any) {
    this.userService.RegistrarUsuario(users).subscribe({
      next: (response: any) => {
        // Mostrar mensaje de éxito
        this.presentToast('Registro exitoso.', 3000);

        // Redirigir a la página de inicio después de mostrar el mensaje
        setTimeout(() => {
          console.log("exito")
          this.navCtrl.navigateRoot('/home');
        }, 3200); // Esperar un poco más que la duración del toast para garantizar que el usuario vea el mensaje
      },
      error: (error: any) => {
        console.error('Error al registrar el usuario:', error);
        this.presentToast('Error al registrar el usuario. Inténtalo de nuevo.');
      }
    });
  }
  
  formData: any = {
    nombre: '',
    email: '',
    mensaje: ''
  };

  submitForm() {
    console.log(this.formData); // Aquí puedes enviar los datos del formulario a través de una petición HTTP
  }

  

}