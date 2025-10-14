

// import { Component } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import {
//   IonBackButton,
//   IonButtons,
//   IonButton,
//   IonContent,
//   IonHeader,
//   IonImg,
//   IonMenu,
//   IonMenuButton,
//   IonTitle,
//   IonToolbar,
//   IonCard,
//   IonCardContent,
//   IonAvatar,
//   IonIcon
// } from '@ionic/angular/standalone';
// import { NavController } from '@ionic/angular';
// import { supabase } from 'src/shared/supabase/supabase.client';



// @Component({
//   selector: 'app-home',
//   templateUrl: 'home.page.html',
//   styleUrls: ['home.page.scss'],
//   standalone: true,
//   imports: [
//     IonMenu,
//     IonHeader,
//     IonToolbar,
//     IonTitle,
//     IonContent,
//     IonButtons,
//     IonMenuButton,
//     IonBackButton,
//     IonButton,
//     IonImg,
//     IonCard,          // <-- importante, antes faltaba
//     IonCardContent,
//     IonAvatar,
//     IonIcon
//   ]
// })

// export class HomePage {
//   loading = true;
//   userId: string | undefined;
//   userInfo?: any;
//   constructor(private router: Router, private activateRoute: ActivatedRoute,
//     private navCtrl: NavController,private supabaseService: SupabaseService) {
//     const state = this.router.getCurrentNavigation()?.extras.state;
//     if (state && state['userInfo']) {
//       this.userInfo = state['userInfo'];
//     }
//   }

//   ngOnInit() {
//     this.supabaseService.user$.subscribe(user => {
//       if (user) {
//         this.userInfo = user;
//         this.userId = user.id;
//         console.log('User ID:', this.userId);
//       } else {
//         console.log('El objeto userInfo es null o undefined');
//       }
//     });
//   }
  

//   goProducto(){
//     this.router.navigate(['/producto'], { state: { userInfo: this.userInfo}})
//   }

//   home() {
//     this.router.navigate(['/home']);
//     console.log('El objeto userInfo es null o undefined', this.userInfo);
//   }

//   perfil() {
//     this.router.navigate(['/perfil']);
//   }

//   salir() {
//     this.router.navigate(['/portada']);
//   }

//   preguntas() {
//     this.router.navigate(['/preguntas']);
//   }

//   contacto() {
//     this.router.navigate(['/contacto']);
//   }
// goPuntos() {
//   this.router.navigate(['/puntos']);
// }

  

//   goSubirfoto() {
//     console.log("Dentro", this.userInfo);
//     this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo } });
//   }

//   goMisProductos() {
//     this.router.navigate(['/mis-productos'], { state: { userInfo: this.userInfo?.id } });
//   }

//   goBack() {
//     this.navCtrl.back();
//   }

//   inter() {
//     this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo } });
//   }
// }

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButtons,
  IonButton,
  IonContent,
  IonHeader,
  IonImg,
  IonMenu,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonAvatar,
  IonIcon
} from '@ionic/angular/standalone';
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
    IonCard,
    IonCardContent,
    IonAvatar,
    IonIcon
  ]
})
export class HomePage {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;

  formNombre = '';
  formTelefono = '';
  formNombreUsuario = '';
  loading = true;
  userId: string | undefined;
  userInfo?: any;

  // 👇 Propiedad para saber qué tarjeta está seleccionada
  selectedCard: string | null = null;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private navCtrl: NavController,

  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  private async getToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  private async cargarPerfil() {
    const token = await this.getToken(); if (!token) return;
    const r = await fetch('http://127.0.0.1:4000/profile/me', { headers: { Authorization: `Bearer ${token}` }});
    const p = await r.json();
    this.nombre = p?.nombre_completo ?? null;
    this.email = p?.email ?? null;
    this.avatarUrl = p?.avatar_url ?? null;
    this.formNombre = this.nombre ?? '';
    this.formTelefono = p?.telefono ?? '';
    this.formNombreUsuario = p?.nombre_usuario ?? '';
  }


  // 👇 Método que marca la tarjeta activa
  selectCard(card: string) {
    this.selectedCard = card;
  }

  // 🔹 Obtiene la sesión del usuario actual desde Supabase
  async ngOnInit() {
    await this.cargarPerfil();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      this.userInfo = session.user;
      this.userId = session.user.id;
      console.log('User ID:', this.userId);
    } else {
      console.log('El objeto userInfo es null o undefined');
    }
  }


  goProducto() {
    this.router.navigate(['/producto'], { state: { userInfo: this.userInfo } });
  }

  home() {
    this.router.navigate(['/home']);
    console.log('El objeto userInfo es null o undefined', this.userInfo);
  }

  perfil() {
    this.router.navigate(['/perfil']);
  }

  salir() {
    this.router.navigate(['/portada']);
  }

  preguntas() {
    this.router.navigate(['/preguntas']);
  }

  contacto() {
    this.router.navigate(['/contacto']);
  }

  goPuntos() {
    this.router.navigate(['/puntos']);
  }

  goSubirfoto() {
    console.log('Dentro', this.userInfo);
    this.router.navigate(['/sproducto'], { state: { userInfo: this.userInfo } });
  }

  goMisProductos() {
    this.router.navigate(['/mis-productos'], {
      state: { userInfo: this.userInfo?.id },
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  inter() {
    this.router.navigate(['/que-es'], { state: { userInfo: this.userInfo } });
  }
}
