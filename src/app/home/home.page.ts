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

  userInfo?: idUsuario;
  constructor(private router: Router, private activateRoute: ActivatedRoute,private navCtrl: NavController) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  async ngOnInit() {
    if (this.userInfo) {
      console.log(this.userInfo.id);
      console.log(this.userInfo);
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
    this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo}})
  }

  goBack() {
    this.navCtrl.back();
  }
}
