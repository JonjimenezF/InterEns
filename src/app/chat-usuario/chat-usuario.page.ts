import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonBackButton, IonButtons, IonFooter, IonInput, IonButton, IonItem, IonLabel, IonIcon, ModalController, ToastController } from '@ionic/angular/standalone';
import { ChatService } from '../servicios/chat.service';
import { supabase } from '../services/supabase.client';
import { RatingComponent } from '../components/rating/rating.component';

@Component({
  selector: 'app-chat-usuario',
  templateUrl: './chat-usuario.page.html',
  styleUrls: ['./chat-usuario.page.scss'],
  standalone: true,
  imports: [IonLabel, IonItem, IonButton, IonInput, IonFooter, IonButtons, IonBackButton, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule]
})
export class ChatUsuarioPage implements OnInit {
  conversacionId?: number;
  mensajes: any[] = [];
  nuevoMensaje = '';
  usuarioActual?: string;
  otroUsuario?: any;
  enser?: any;
  cargando = false;
  
  // Para el header
  productoTitulo = '';
  productoImagen = '';
  otroUsuarioNombre = '';
  otroUsuarioId = '';
  productoId?: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    // Obtener parámetros de la URL
    const otroUsuarioId = this.route.snapshot.paramMap.get('usuarioId');
    const enserId = this.route.snapshot.paramMap.get('enserId');
    
    if (!otroUsuarioId) {
      this.router.navigate(['/home']);
      return;
    }

    // Obtener usuario actual
    const { data: session } = await supabase.auth.getSession();
    this.usuarioActual = session?.session?.user?.id;

    if (!this.usuarioActual) {
      this.router.navigate(['/login']);
      return;
    }

    await this.inicializarChat(otroUsuarioId, enserId ? parseInt(enserId) : undefined);
  }

  async inicializarChat(otroUsuarioId: string, enserId?: number) {
    try {
      this.otroUsuarioId = otroUsuarioId;
      this.productoId = enserId;
      
      // Obtener o crear conversación
      const { data: conversacion } = await this.chatService.obtenerConversacion(
        this.usuarioActual!,
        otroUsuarioId,
        enserId
      );

      if (conversacion) {
        this.conversacionId = conversacion.id;
        await this.cargarMensajes();
        await this.cargarInfoHeader(enserId, otroUsuarioId);
        if (this.conversacionId) {
          await this.chatService.marcarComoLeido(this.conversacionId, this.usuarioActual!);
        }
      }
    } catch (error) {
      console.error('Error al inicializar chat:', error);
    }
  }

  async cargarMensajes() {
    if (!this.conversacionId) return;

    const { data: mensajes } = await this.chatService.obtenerMensajes(this.conversacionId);
    this.mensajes = mensajes || [];
    
    setTimeout(() => this.scrollToBottom(), 100);
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || !this.conversacionId || this.cargando) return;

    this.cargando = true;
    const mensaje = this.nuevoMensaje.trim();
    this.nuevoMensaje = '';

    // Agregar mensaje temporalmente para feedback inmediato
    const mensajeTemp = {
      mensaje,
      remitente_id: this.usuarioActual,
      created_at: new Date().toISOString(),
      temp: true
    };
    this.mensajes.push(mensajeTemp);
    setTimeout(() => this.scrollToBottom(), 50);

    try {
      if (this.conversacionId && this.usuarioActual) {
        await this.chatService.enviarMensaje(this.conversacionId, this.usuarioActual, mensaje);
        // Remover mensaje temporal y cargar mensajes reales
        this.mensajes = this.mensajes.filter(m => !m.temp);
        await this.cargarMensajes();
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      // Remover mensaje temporal en caso de error
      this.mensajes = this.mensajes.filter(m => !m.temp);
    } finally {
      this.cargando = false;
    }
  }

  scrollToBottom() {
    const content = document.querySelector('ion-content');
    content?.scrollToBottom(300);
  }

  async cargarInfoHeader(enserId?: number, otroUsuarioId?: string) {
    // Cargar info del producto
    if (enserId) {
      try {
        const { data: enser } = await supabase
          .from('enseres')
          .select('titulo, imagen_url')
          .eq('id', enserId)
          .single();
        
        if (enser) {
          this.productoTitulo = enser.titulo;
          this.productoImagen = enser.imagen_url;
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
      }
    }
    
    // Cargar nombre del otro usuario
    if (otroUsuarioId) {
      try {
        const resp = await fetch(`http://127.0.0.1:4000/profile/${otroUsuarioId}`);
        const perfil = await resp.json();
        this.otroUsuarioNombre = perfil?.nombre_completo || 'Usuario';
      } catch (error) {
        this.otroUsuarioNombre = 'Usuario';
      }
    }
  }

  volver() {
    this.router.navigate(['/home']);
  }

  async abrirCalificacion() {
    if (!this.otroUsuarioId || !this.usuarioActual) {
      this.presentToast('❌ Error: No se puede calificar en este momento');
      return;
    }

    // Verificar si ya calificó
    const { data: existeCalificacion } = await supabase
      .from('calificaciones')
      .select('id')
      .eq('usuario_calificador', this.usuarioActual)
      .eq('usuario_calificado', this.otroUsuarioId)
      .eq('conversacion_id', this.conversacionId)
      .single();

    if (existeCalificacion) {
      this.presentToast('ℹ️ Ya has calificado a este usuario');
      return;
    }

    const modal = await this.modalController.create({
      component: RatingComponent,
      componentProps: {
        usuarioCalificado: this.otroUsuarioId,
        usuarioCalificador: this.usuarioActual,
        productoId: this.productoId?.toString(),
        conversacionId: this.conversacionId?.toString()
      },
      cssClass: 'rating-modal',
      backdropDismiss: true,
      showBackdrop: true
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data?.success) {
      this.presentToast('✅ Calificación enviada correctamente');
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom'
    });
    toast.present();
  }
}