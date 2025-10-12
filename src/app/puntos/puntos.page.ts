import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle,IonFooter,
   IonContent, IonButton, IonImg, IonIcon, IonBackButton, IonButtons } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';


@Component({
  selector: 'app-puntos',
  templateUrl: './puntos.page.html',
  styleUrls: ['./puntos.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, 
    IonIcon, IonBackButton, IonButtons, CommonModule, IonFooter, FooterInterensComponent]
})
export class PuntosPage implements OnInit {
  puntosTotales: number = 1250; // Ejemplo; luego se conecta con Supabase

  constructor(
    private router: Router,
    private activateRoute: ActivatedRoute,
  ) {}

  ngOnInit() {}

  canjearPuntos() {
    this.router.navigate(['/canjear-puntos']);
  }

  verHistorial() {
   this.router.navigate(['/historial-puntos']);
  }
}

