import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PerfilPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  goProducto(){
    this.router.navigate(['/producto']);
  }

  home(){
    this.router.navigate(['/home']);
  }

  perfil(){
    this.router.navigate(['/perfil']);
  }

  salir(){

  }
  puntoLimpio(){

  }
}
