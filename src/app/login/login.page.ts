import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { userLogin } from '../models/userLogin';
import { UsuarioService } from '../servicios/usuario.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  user={
    email: "",
    password: ""
  }
  constructor(private router:Router,private userService: UsuarioService,public toastController: ToastController) { }
  //Funcion para mostrar mensajes
  async presentToast(message: string, duration: number = 2000) {
    const toast = await this.toastController.create({
      message,
      duration,
      position: 'bottom'
    });
    toast.present();
  }

  //Valida al usuario si esta registrado
  async Login(userLoginInfo: userLogin) {
    const usuario = await lastValueFrom(this.userService.getLogin(userLoginInfo));
    console.log(usuario);
    if (usuario) {
      console.log("Usuario existe...");
      this.router.navigate(['/home'], { state: { userInfo: usuario}})
    } else {
      //NO EXISTE
      console.log("Usuario no existe...");
      this.presentToast("Usuario y/o Contraseña incorrectas")
    }
  }

  ngOnInit() {
  }




  //Router 

  goHome() {
    this.router.navigate(['/home']);
  }

  goregistrar(){
    this.router.navigate(['/registrar']);
  }


  goRecuperar() {
    this.router.navigate(['/recuperar']);
  }
}
