import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonFooter } from '@ionic/angular/standalone';
import { IonicModule,NavController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.page.html',
  styleUrls: ['./contacto.page.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, IonicModule, IonFooter, FooterInterensComponent]
})
export class ContactoPage implements OnInit {

  nombre: string = '';
  email: string = '';
  mensaje: string = '';

  constructor(private navCtrl: NavController, private http: HttpClient, private router: Router) { }

  ngOnInit() {
  }

 
  submitForm() {
    const data = {
      nombre: this.nombre,
      destinatario: this.email,
      mensaje: this.mensaje
    };

    this.http.post('https://pystore-interens-7.onrender.com/enviar-correo', data).subscribe(
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

  puntoLimpio(): void {
    // Acción al ir a punto limpio
  }
}

