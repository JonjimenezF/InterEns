import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonButton, 
  IonTextarea, 
  IonItem, 
  IonLabel,
  IonIcon,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starOutline } from 'ionicons/icons';
import { supabase } from '../../services/supabase.client';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonButton,
    IonTextarea,
    IonItem,
    IonLabel,
    IonIcon
  ]
})
export class RatingComponent {
  @Input() usuarioCalificado!: string;
  @Input() usuarioCalificador!: string;
  @Input() productoId?: string;
  @Input() conversacionId?: string;

  rating = 0;
  comentario = '';
  isLoading = false;

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {
    addIcons({ star, starOutline });
  }

  setRating(value: number) {
    this.rating = value;
  }

  async enviarCalificacion() {
    if (this.rating === 0) {
      this.presentToast('❌ Selecciona una calificación', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      const { error } = await supabase
        .from('calificaciones')
        .insert({
          usuario_calificador: this.usuarioCalificador,
          usuario_calificado: this.usuarioCalificado,
          producto_id: this.productoId,
          conversacion_id: this.conversacionId,
          puntuacion: this.rating,
          comentario: this.comentario.trim() || null
        });

      if (error) throw error;

      this.presentToast('✅ Calificación enviada correctamente', 'success');
      this.modalController.dismiss({ success: true });

    } catch (error) {
      console.error('Error al enviar calificación:', error);
      this.presentToast('❌ Error al enviar calificación', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  cerrar() {
    this.modalController.dismiss();
  }

  async presentToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    toast.present();
  }
}