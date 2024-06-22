import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule,NavController } from '@ionic/angular';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule,]
})
export class ContactoPage implements OnInit {

  constructor(private navCtrl: NavController) { }

  ngOnInit() {
  }

  submitForm() {
    // Lógica para manejar el envío del formulario
    console.log('Formulario enviado');
    // Aquí puedes añadir la lógica para enviar los datos del formulario a tu backend o realizar otras acciones necesarias
  }

  goBack() {
    this.navCtrl.back();
  }
}

