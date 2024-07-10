import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent,IonButton,IonImg,IonBackButton, IonList, IonItem, IonSpinner, IonLabel, IonNote, IonMenu} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, IonBackButton,IonList,IonItem,IonSpinner, IonLabel, IonNote, IonMenu, CommonModule, FormsModule]
})
export class PortadaPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      // El código se está ejecutando en un dispositivo móvil
      console.log('Estás en un dispositivo móvil.');
    } else {
      // El código se está ejecutando en una computadora
      console.log('Estás en una computadora.');
    }
  }

  sg(){
    this.router.navigate(['/login']);
  }

}
