import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule,],
})
export class HomePage {
  constructor(private router: Router, private navCtrl: NavController) {
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
    this.router.navigate(['/portada']);

  }
  puntoLimpio(){

  }
  goSubirfoto() {
    // Aquí puedes agregar la lógica para navegar a la página de subir foto
    // Por ejemplo:
    this.router.navigate(['/sfoto']);
  }

  goBack() {
    this.navCtrl.back();
  }
}
