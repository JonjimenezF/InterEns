import { Component } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { idUsuario } from '../models/idUsuario';
import { NavController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';

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

  ngOnInit() {
    if (this.userInfo) {
      console.log(this.userInfo.id_usuario);
      console.log(this.userInfo);
    } else {
      console.log('El objeto userInfo es null o undefined',this.userInfo);
                }
  }
  

  goProducto(){
    this.router.navigate(['/producto']);
  }

  home(){
    this.router.navigate(['/home']);
    console.log('El objeto userInfo es null o undefined',this.userInfo);
  
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
    this.router.navigate(['/sfoto'], { state: { userInfo: this.userInfo}})
  }

  goBack() {
    this.navCtrl.back();
  }
}
