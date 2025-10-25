import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonImg,
  IonFooter,
  IonButton,
  IonIcon,
  IonInput, // ✅ <--- IMPORTANTE
} from '@ionic/angular/standalone';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-preguntas',
  templateUrl: './preguntas.page.html',
  styleUrls: ['./preguntas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonImg,
    IonFooter,
    IonButton,
    IonIcon,
    IonInput, // ✅ aquí también
    FooterInterensComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // ✅ evita futuros errores similares
})
export class PreguntasPage implements OnInit {
  respuestasVisibles: boolean[] = [];
  chatVisible = false;
  mensajeUsuario: string = ''; // ✅ asegúrate de que sea tipo string
  chatHistorial: { remitente: string; texto: string }[] = [];
  cargando = false;

  constructor(private navCtrl: NavController, private router: Router) {}

  ngOnInit(): void {}

  toggleAnswer(answerId: string) {
    const answer = document.getElementById(answerId);
    const arrow = answer?.previousElementSibling?.querySelector('.arrow');

    if (answer?.style.display === 'block') {
      answer.style.display = 'none';
      if (arrow) arrow.innerHTML = '&#9660;';
    } else {
      answer!.style.display = 'block';
      if (arrow) arrow.innerHTML = '&#9650;';
    }
  }

  goBack() { this.navCtrl.back(); }
  goContacto() { this.router.navigate(['/contacto']); }

  toggleChat() {
    this.chatVisible = !this.chatVisible;
    if (this.chatVisible && this.chatHistorial.length === 0) {
      this.chatHistorial.push({
        remitente: 'bot',
        texto: '👋 ¡Hola! Soy InterBot. ¿En qué puedo ayudarte?',
      });
    }
  }

  async enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    const mensaje = this.mensajeUsuario.trim();
    this.chatHistorial.push({ remitente: 'usuario', texto: mensaje });
    this.mensajeUsuario = '';

    // Muestra "InterBot está escribiendo..."
    this.cargando = true;
    this.chatHistorial.push({ remitente: 'bot', texto: '•••' });

    try {
      const resp = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje }),
      });

      const data = await resp.json();
      this.chatHistorial.pop();
      this.chatHistorial.push({
        remitente: 'bot',
        texto: data.respuesta || '🤔 No tengo respuesta para eso aún.',
      });
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      this.chatHistorial.pop();
      this.chatHistorial.push({
        remitente: 'bot',
        texto: '⚠️ Error al conectar con el servidor. Inténtalo más tarde.',
      });
    } finally {
      this.cargando = false;
      setTimeout(() => {
        const body = document.querySelector('.chat-body');
        body?.scrollTo(0, body.scrollHeight);
      }, 100);
    }
  }
}
