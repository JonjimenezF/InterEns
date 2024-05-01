import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule,HttpClientModule]
})
export class LoginPage implements OnInit {

  user={
    usuario: "",
    password: ""
  }
  constructor(private router:Router) { }

  ngOnInit() {
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goregistrar(){
    this.router.navigate(['/registrar']);
  }

}
