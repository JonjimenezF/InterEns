import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({

  selector: 'app-verificarcontra',
  templateUrl: './verificarcontra.page.html',
  styleUrls: ['./verificarcontra.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class VerificarcontraPage implements OnInit {

  
  constructor(private router: Router, public toastController: ToastController) { }

  user={
    newPassword: ""
  }

  ngOnInit() {
  }

  // recuperarContrasena(){
  //   this.userService.actualizarContrasena(this.user.newPassword);
  //   console.log(`Contraseña cambiada exitosamente`);
  //   this.router.navigate(['/login']); 

  // }

  vollogin(){
    this.presentToast("Guardado exitosamente")
    this.router.navigate(['/login']); 
  }


  async presentToast(menssage: string, duration:number = 5000){//creacion de una funcion asincronica
    let toast = this.toastController.create({ //creamos una variable toast que se inicializa llamando al metodo create 
      message: menssage,
      duration: duration     
    });
    (await toast).present();// pausa la ejecución del código en ese punto hasta que la operación toast.present() haya terminado
  }
}
