import { Component } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { IonBackButton, IonButtons, IonButton, IonContent, IonHeader, IonImg, IonMenu, IonMenuButton, IonTitle, IonToolbar, IonCardContent } from '@ionic/angular/standalone';
import { IonicModule } from '@ionic/angular';
import { idUsuario } from '../models/idUsuario';
import { NavController } from '@ionic/angular';
import { supabase } from 'src/shared/supabase/supabase.client';



@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonButton,
    IonImg,
    IonCardContent
  ]
})

export class HomePage {
  loading = true;
  userId: string | undefined;

  userInfo?: any;
  constructor(private router: Router, private activateRoute: ActivatedRoute,private navCtrl: NavController) {
    const state = this.router.getCurrentNavigation()?.extras.state;
  }


  async ngOnInit() {
    // 1) Sesión y usuario
    const { data: sessionData, error: sErr } = await supabase.auth.getSession();
    if (sErr) console.error('[HOME] getSession error:', sErr);
    console.log('[HOME] session:', sessionData?.session);

    const { data: userData, error: uErr } = await supabase.auth.getUser();
    if (uErr) console.error('[HOME] getUser error:', uErr);
    console.log('[HOME] user:', userData?.user);

    // 2) Perfil en tu tabla "perfiles"
    const userId = userData?.user?.id;
    if (!userId) {
      console.warn('[HOME] No hay usuario logueado.');
      return;
    }

    const { data: perfil, error: pErr } = await supabase
      .from('perfiles')
      .select('usuario_id')
      .eq('usuario_id', userId)
      .maybeSingle();

    if (pErr) {
      console.error('[HOME] perfiles select error:', pErr);
    } else {
      console.log('[HOME] perfil (objeto):', perfil);
      // Vista tabular agradable en la consola
      if (perfil) console.table([perfil]);
    }
  }

  goProducto(){
    this.router.navigate(['/producto'], { state: { userInfo: this.userInfo}})
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
  preguntas(){
    this.router.navigate(['/preguntas']);

  }
  contacto(){
    this.router.navigate(['/contacto']);

  }
  reciclaje(){
    this.router.navigate(['/reciclaje']);

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

  inter(){
    this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo}})
  }

}
