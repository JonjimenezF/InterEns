import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent, 
  IonFooter,
  
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-historial-puntos',
  templateUrl: './historial-puntos.page.html',
  styleUrls: ['./historial-puntos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent, IonFooter, FooterInterensComponent
  ],
})
export class HistorialPuntosPage implements OnInit {

  historial = [
    { descripcion: 'Subiste producto: Bicicleta usada', puntos: +500, fecha: '05 Oct 2025' },
    { descripcion: 'Canjeaste: Bolsa Reutilizable', puntos: -300, fecha: '06 Oct 2025' },
    { descripcion: 'Subiste producto: Mesa antigua', puntos: +700, fecha: '07 Oct 2025' },
  ];

  constructor() {}

  ngOnInit() {}
}
