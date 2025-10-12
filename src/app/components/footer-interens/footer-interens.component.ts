import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonFooter, IonToolbar, IonButtons, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-interens',
  templateUrl: './footer-interens.component.html',
  styleUrls: ['./footer-interens.component.scss'],
  standalone: true,
  imports: [IonFooter, IonToolbar, IonButtons, IonButton, CommonModule]
})
export class FooterInterensComponent {
  constructor(private router: Router) {}

  home() {
    this.router.navigate(['/home']);
  }

  puntoLimpio() {
    this.router.navigate(['/punto-limpio']);
  }

  goProducto() {
    this.router.navigate(['/sproducto']);
  }

  perfil() {
    this.router.navigate(['/perfil']);
  }
}
