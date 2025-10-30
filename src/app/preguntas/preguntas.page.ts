import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonIcon,
  IonInput,
  IonFooter
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
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonIcon,
    IonInput,
    IonFooter,
    FooterInterensComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PreguntasPage implements OnInit {
  chatVisible = false;
  mensajeUsuario: string = '';
  chatHistorial: { remitente: string; texto: string }[] = [];
  cargando = false;

  constructor(private navCtrl: NavController, private router: Router) {}

  ngOnInit(): void {}

  /** ✅ Alternar visibilidad de respuesta en FAQ */
  toggleAnswer(id: string) {
    const answer = document.getElementById(id);
    const icon = answer?.previousElementSibling?.querySelector('.arrow');

    if (answer && icon) {
      const visible = answer.classList.toggle('show');
      icon.setAttribute('name', visible ? 'chevron-up-outline' : 'chevron-down-outline');
    }
  }

  /** Navegación */
  goBack() {
    this.navCtrl.back();
  }

  goContacto() {
    this.router.navigate(['/contacto']);
  }

  /** Abrir/Cerrar chat */
  toggleChat() {
    this.chatVisible = !this.chatVisible;

    if (this.chatVisible && this.chatHistorial.length === 0) {
      this.chatHistorial.push({
        remitente: 'bot',
        texto: '👋 ¡Hola! Soy InterBot. ¿En qué puedo ayudarte?',
      });
    }
  }

  /** Enviar mensaje al bot */
  async enviarMensaje() {
    if (!this.mensajeUsuario.trim()) return;

    const mensaje = this.mensajeUsuario.trim();
    this.chatHistorial.push({ remitente: 'usuario', texto: mensaje });
    this.mensajeUsuario = '';
    this.cargando = true;

    try {
      const resp = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: mensaje }),
      });

      const data = await resp.json();
      this.chatHistorial.push({
        remitente: 'bot',
        texto: data.respuesta || '🤔 No tengo respuesta para eso aún.',
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
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
