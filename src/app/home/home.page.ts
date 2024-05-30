import { Component } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { idUsuario } from '../models/idUsuario';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule,],
})
export class HomePage {
  userId: string | undefined;

  userInfo?: any;
  constructor(private router: Router, private activateRoute: ActivatedRoute,private navCtrl: NavController) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  async ngOnInit() {
    if (this.userInfo) {
      // Normaliza la estructura de datos del usuario
      if (this.userInfo.user && this.userInfo.user.id) {
        this.userId = this.userInfo.user.id;  // Para autenticación por email
      } else if (this.userInfo.id) {
        this.userId = this.userInfo.id;  // Para autenticación por Google
      }
      console.log('User ID:', this.userId);
    } else {
      console.log('El objeto userInfo es null o undefined');
    }
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
    console.log("Dentro",this.userInfo)
    this.router.navigate(['/sproducto'], { state: { userInfo: { id: this.userId } } });
  }

  goBack() {
    this.navCtrl.back();
  }
}
