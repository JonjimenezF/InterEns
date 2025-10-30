import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { supabase } from '../../services/supabase.client';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ReportComponent {
  @Input() tipoReporte!: 'usuario' | 'producto';
  @Input() objetoId!: string;
  @Input() objetoNombre?: string;

  motivo = '';
  descripcion = '';
  isLoading = false;

  motivos = [
    { value: 'contenido_inapropiado', label: 'Contenido inapropiado' },
    { value: 'spam', label: 'Spam o publicidad' },
    { value: 'fraude', label: 'Fraude o estafa' },
    { value: 'producto_falso', label: 'Producto falso o engañoso' },
    { value: 'comportamiento_abusivo', label: 'Comportamiento abusivo' },
    { value: 'otro', label: 'Otro motivo' }
  ];

  constructor(
    private modalController: ModalController,
    private toastController: ToastController
  ) {}

  async enviarDenuncia() {
    if (!this.motivo) {
      this.presentToast('❌ Selecciona un motivo', 'danger');
      return;
    }

    if (!this.descripcion.trim()) {
      this.presentToast('❌ Describe el problema', 'danger');
      return;
    }

    this.isLoading = true;

    try {
      const { data: session } = await supabase.auth.getSession();
      const usuarioReportador = session?.session?.user?.id;

      if (!usuarioReportador) {
        this.presentToast('❌ Debes iniciar sesión', 'danger');
        return;
      }

      const { error } = await supabase
        .from('denuncias')
        .insert({
          usuario_reportador: usuarioReportador,
          tipo_reporte: this.tipoReporte,
          objeto_id: this.objetoId,
          motivo: this.motivo,
          descripcion: this.descripcion.trim(),
          estado: 'pendiente'
        });

      if (error) throw error;

      this.presentToast('✅ Denuncia enviada correctamente', 'success');
      this.modalController.dismiss({ success: true });

    } catch (error) {
      console.error('Error al enviar denuncia:', error);
      this.presentToast('❌ Error al enviar denuncia', 'danger');
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