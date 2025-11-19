import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonFooter,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.page.html',
  styleUrls: ['./chatbox.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonInput,
    IonButton,
    IonFooter,
  ],
})
export class ChatboxPage implements OnInit {
  mensajeUsuario: string = '';
  historial: { remitente: string; texto: string }[] = [];
  cargando: boolean = false;

  ngOnInit() {
    this.historial.push({
      remitente: 'bot',
      texto: '👋 ¡Hola! Soy InterBot, tu asistente virtual. ¿En qué puedo ayudarte hoy?',
    });
  }

  async enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    this.historial.push({ remitente: 'usuario', texto: this.mensajeUsuario });
    const mensaje = this.mensajeUsuario;
    this.mensajeUsuario = '';
    this.cargando = true;

    try {
      const resp = await fetch('http://54.210.35.66:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje }),
      });

      const data = await resp.json();
      this.historial.push({
        remitente: 'bot',
        texto: data.respuesta || 'No tengo una respuesta para eso 😅',
      });
    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      this.historial.push({
        remitente: 'bot',
        texto: '⚠️ Error al conectar con el servidor. Inténtalo más tarde.',
      });
    } finally {
      this.cargando = false;
      setTimeout(() => {
        const chatContainer = document.querySelector('.chat-container');
        chatContainer?.scrollTo(0, chatContainer.scrollHeight);
      }, 100);
    }
  }
}
