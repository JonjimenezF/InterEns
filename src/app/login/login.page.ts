import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage implements OnInit {

  user={

    email: '',
    password: ''
  };

 
    

 
  constructor(private router:Router) { }

  ngOnInit() {
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goRecuperar() {
    this.router.navigate(['/recuperar']);
  }

  login(form: NgForm) {
    if (form.invalid) {
      // El formulario es inválido, muestra un mensaje de error o realiza alguna acción
      return;
    }

    // El formulario es válido, procede con el inicio de sesión
    console.log(this.user);
  }
}

