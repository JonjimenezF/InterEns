import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonicModule,NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule,]
})
export class ContactoPage implements OnInit {

  nombre: string = '';
  email: string = '';
  mensaje: string = '';

  constructor(private navCtrl: NavController, private http: HttpClient) { }

  ngOnInit() {
  }

 
  submitForm() {
    const data = {
      nombre: this.nombre,
      destinatario: this.email,
      mensaje: this.mensaje
    };

    this.http.post('http://localhost:5000/enviar-correo', data).subscribe(
      response => {
        console.log('Correo enviado:', response);
        alert('Correo enviado correctamente');
      },
      error => {
        console.error('Error al enviar el correo:', error);
        alert('Error al enviar el correo');
      }
    );
  }
  goBack() {
    this.navCtrl.back();
  }
}

