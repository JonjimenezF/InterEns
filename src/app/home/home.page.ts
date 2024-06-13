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
  userId: string | undefined;

  userInfo?: any;
  constructor(private router: Router, private activateRoute: ActivatedRoute,private navCtrl: NavController,private supabaseService: SupabaseService) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  ngOnInit() {
    this.supabaseService.user$.subscribe(user => {
      if (user) {
        this.userInfo = user;
        this.userId = user.id;
        console.log('User ID:', this.userId);
      } else {
        console.log('El objeto userInfo es null o undefined');
      }
    });
  }
  

  goProducto(){
    this.router.navigate(['/producto'], { state: { userInfo: this.userInfo}})
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
    this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo}})
  }

  goMisProductos(){
    this.router.navigate(['/mis-productos'], { state: { userInfo: this.userInfo.id}})
  }

  goBack() {
    this.navCtrl.back();
  }
}
