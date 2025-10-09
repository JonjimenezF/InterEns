import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonImg} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.page.html',
  styleUrls: ['./preguntas.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonBackButton,
    IonImg,
    CommonModule, 
    FormsModule
  ]
})
export class PreguntasPage implements OnInit {
  respuestasVisibles: boolean[] = [];

  constructor(private navCtrl: NavController,private router: Router) { }
  

  ngOnInit(): void {
  }

  toggleAnswer(answerId: string) {
    const answer = document.getElementById(answerId);
    const arrow = answer?.previousElementSibling?.querySelector('.arrow');

    if (answer?.style.display === "block") {
      answer.style.display = "none";
      if (arrow) arrow.innerHTML = "&#9660;";
    } else {
      answer!.style.display = "block";
      if (arrow) arrow.innerHTML = "&#9650;";
    }
  }
  goBack() {
    this.navCtrl.back();
  }

  goProducto(): void {
    this.router.navigate(['/producto']);
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  perfil(): void {
    this.router.navigate(['/perfil']);
  }

  salir(): void {
    // Acción al salir
  }
}
