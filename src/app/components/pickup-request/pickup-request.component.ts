import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { supabase } from '../../services/supabase.client';

@Component({
  selector: 'app-pickup-request',
  templateUrl: './pickup-request.component.html',
  styleUrls: ['./pickup-request.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PickupRequestComponent {
  @Input() producto!: any;

  direccion = '';
  telefono = '';
  horarioPreferido = '';
  comentarios = '';
  isLoading = false;

  horariosDisponibles = [
    { value: 'manana', label: 'Mañana (9:00 - 12:00)' },
    { value: 'tarde', label: 'Tarde (14:00 - 17:00)' },
    { value: 'noche', label: 'Noche (18:00 - 20:00)' },
    { value: 'cualquier_hora', label: 'Cualquier horario' }
  ];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async solicitarRetiro() {
    if (!this.direccion.trim()) {
      this.presentToast('❌ La dirección es obligatoria', 'danger');
      return;
    }

    if (!this.telefono.trim()) {
      this.presentToast('❌ El teléfono es obligatorio', 'danger');
      return;
    }

    if (!this.horarioPreferido) {
      this.presentToast('❌ Selecciona un horario', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      const { data: session } = await supabase.auth.getSession();
      const usuarioId = session?.session?.user?.id;

      if (!usuarioId) {
        this.presentToast('❌ Debes iniciar sesión', 'danger');
        return;
      }

      const { error } = await supabase
        .from('solicitudes_retiro')
        .insert({
          usuario_id: usuarioId,
          producto_id: this.producto.id,
          direccion: this.direccion.trim(),
          telefono: this.telefono.trim(),
          horario_preferido: this.horarioPreferido,
          comentarios: this.comentarios.trim() || null,
          estado: 'pendiente'
        });

      if (error) throw error;

      this.presentToast('✅ Solicitud de retiro enviada correctamente', 'success');
      this.modalController.dismiss({ success: true });

    } catch (error) {
      console.error('Error al solicitar retiro:', error);
      this.presentToast('❌ Error al enviar solicitud', 'danger');
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