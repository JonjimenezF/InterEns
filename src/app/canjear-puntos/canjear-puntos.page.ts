import { Component, OnInit } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonImg,
  IonCard,
  IonFooter,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-canjear-puntos',
  templateUrl: './canjear-puntos.page.html',
  styleUrls: ['./canjear-puntos.page.scss'],
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
    IonCardContent,
    IonButton,
    IonFooter, FooterInterensComponent
  ],
})
export class CanjearPuntosPage implements OnInit {

  recompensas = [
    { nombre: 'Bolsa Reutilizable', costo: 300, imagen: 'assets/img/bolsa.jpg' },
    { nombre: 'Descuento en Transporte Verde', costo: 1000, imagen: 'assets/img/transporte.jpg' },
    { nombre: 'Camiseta Ecológica', costo: 1500, imagen: 'assets/img/camiseta.jpg' },
  ];

  constructor() {}

  ngOnInit() {}

  canjear(item: any) {
    alert(`Has canjeado ${item.nombre} por ${item.costo} puntos. ¡Gracias por tu compromiso con el planeta! 🌱`);
  }
}
