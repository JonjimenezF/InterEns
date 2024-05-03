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
    const user_alumno = await lastValueFrom(this.userService.getLogin(userLoginInfo));
    console.log(user_alumno);
    if (user_alumno) {
      console.log("Usuario existe...");
      this.router.navigate(['/home'], { state: { user_info: user_alumno}})
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

<<<<<<< HEAD
  goRecuperar() {
    this.router.navigate(['/recuperar']);
=======
  goRecuperar(){

>>>>>>> c9cb36395b102f49e4900f4d3c3ac1ef8768ecd7
  }

}
