

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
import { PuntosService } from '../servicios/puntos.service'; // ✅ importamos el servicio

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
  loading = true;
  userId: string | undefined;
  userInfo?: any;

  // 👇 Propiedad para saber qué tarjeta está seleccionada
  selectedCard: string | null = null;

  // 💰 Nueva propiedad para mostrar puntos
  puntosTotales: number = 0;

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
    private navCtrl: NavController,
    private puntosService: PuntosService // ✅ inyectamos el servicio
  ) {
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state && state['userInfo']) {
      this.userInfo = state['userInfo'];
    }
  }

  // 🔹 Obtiene la sesión del usuario actual desde Supabase
  async ngOnInit() {
    const { data: session } = await supabase.auth.getSession();
    const { data: userData } = await supabase.auth.getUser();

    if (userData?.user) {
      this.userInfo = userData.user;
      this.userId = userData.user.id;
      console.log('Usuario activo:', this.userId);

      // 🔸 Traer puntos cuando hay usuario
      this.obtenerPuntos();
    } else {
      console.warn('No hay usuario autenticado.');
    }
  }

  // 🪙 Obtener puntos desde el backend
  obtenerPuntos() {
    if (!this.userId) return;

    this.puntosService.getUserPoints(this.userId).subscribe({
      next: (res) => {
        console.log('🎯 Puntos obtenidos (Home):', res);
        this.puntosTotales = res.total_points || 0;
      },
      error: (err) => {
        console.error('❌ Error al obtener puntos en Home:', err);
      }
    });
  }

  // 👇 Método que marca la tarjeta activa
  selectCard(card: string) {
    this.selectedCard = card;
  }

  // 🌍 Navegaciones principales
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
