import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonBackButton, IonHeader, IonToolbar, IonButtons, IonContent} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-que-es',
  templateUrl: './que-es.page.html',
  styleUrls: ['./que-es.page.scss'],
  standalone: true,
  imports: [
    IonBackButton,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonContent,
    CommonModule, 
    FormsModule
  ]
})
export class QueEsPage implements OnInit, AfterViewInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
    // Initialization logic here
  }

  goBack() {
    this.navCtrl.back();
  }

  ngAfterViewInit() {
    // Example of adding an event listener
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId = (event.target as HTMLAnchorElement).getAttribute('href')?.substring(1);
        if (targetId) {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
  
  
}
