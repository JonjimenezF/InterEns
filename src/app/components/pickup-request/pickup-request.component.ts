import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
// 👇 usa el mismo cliente que usas en PerfilPage
import { supabase } from 'src/shared/supabase/supabase.client';

@Component({
  selector: 'app-pickup-request',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './pickup-request.component.html',
  styleUrls: ['./pickup-request.component.scss']
})
export class PickupRequestComponent {
  @Input() producto!: any;

  direccion = '';
  telefono = '';
  horarioPreferido = '';
  comentarios = '';
  isLoading = false;

  horariosDisponibles = [
    { value: 'am',         label: 'Mañana (9:00 - 12:00)' },
    { value: 'pm',          label: 'Tarde (14:00 - 17:00)' },
    { value: 'pm',          label: 'Noche (18:00 - 20:00)' }
  ];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  private async presentToast(message: string, color: 'success'|'danger'|'warning'='success') {
    const t = await this.toastController.create({ message, duration: 2500, position: 'bottom', color });
    await t.present();
  }

  cerrar() { this.modalController.dismiss(); }

  // 🔎 Buscar la transacción ACTIVA del enser (pendiente/aceptada/en_logistica)
  private async getTransaccionActiva(enserId: number) {
    const { data, error } = await supabase
      .from('transacciones')
      .select('id')
      .eq('enser_id', enserId)
      .in('estado', ['pendiente','aceptada','en_logistica'])
      .order('creado_en', { ascending: false })
      .limit(1);
    if (error || !data?.length) return null;
    return data[0].id as number;
  }

  async solicitarRetiro() {
    if (!this.direccion.trim())  return this.presentToast('❌ La dirección es obligatoria','danger');
    if (!this.telefono.trim())   return this.presentToast('❌ El teléfono es obligatorio','danger');
    if (!this.horarioPreferido)  return this.presentToast('❌ Selecciona un horario','danger');

    this.isLoading = true;
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        return this.presentToast('❌ Debes iniciar sesión','danger');
      }

      // 1) Resolver transacción
      const enserId = this.producto?.id;
      const transaccionId = await this.getTransaccionActiva(enserId);
      if (!transaccionId) {
        return this.presentToast('⚠️ No se encontró transacción activa para este producto','warning');
      }

      // 2) Actualizar transacción con los datos del retiro
      const { error } = await supabase
        .from('transacciones')
        .update({
          entrega_opcion: 'retiro_operador',
          direccion: this.direccion.trim(),
          telefono: this.telefono.trim(),
          horario_pref: this.horarioPreferido,
          notas: this.comentarios.trim() || null,
          estado: 'en_logistica'            // avanzamos el flujo
        })
        .eq('id', transaccionId);

      if (error) throw error;

      await this.presentToast('✅ Solicitud de retiro enviada correctamente','success');
      this.modalController.dismiss({ success: true });

    } catch (e:any) {
      console.error('Error solicitarRetiro:', e);
      await this.presentToast(e?.message || '❌ Error al enviar solicitud','danger');
    } finally {
      this.isLoading = false;
    }
  }
}
