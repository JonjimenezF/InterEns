
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, CommonModule, FormsModule]
})
export class PortadaPage implements OnInit, AfterViewInit {

  isLoaded = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // puedes dejarlo o quitarlo, según lo que necesites
  }

  ngAfterViewInit() {
    // pequeño retardo para activar la animación
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);
  }

  sg() {
    this.router.navigate(['/login']);
  }

}
