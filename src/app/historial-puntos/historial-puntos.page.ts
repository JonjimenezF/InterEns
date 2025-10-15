
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonImg,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonFooter,
  IonIcon,
} from '@ionic/angular/standalone';
import { PuntosService } from '../servicios/puntos.service';
import { supabase } from '../services/supabase.client';

@Component({
  selector: 'app-historial-puntos',
  templateUrl: './historial-puntos.page.html',
  styleUrls: ['./historial-puntos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonImg,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonFooter,
    FooterInterensComponent,
    IonIcon,
  ],
})
export class HistorialPuntosPage implements OnInit {
  historial: any[] = [];
  usuario_id: string | null = null;

  constructor(private puntosService: PuntosService) {}

  async ngOnInit() {
    await this.obtenerUsuario();
    if (this.usuario_id) {
      this.cargarHistorial();
    }
  }

  // 🔑 Obtener usuario actual desde Supabase Auth
  async obtenerUsuario() {
    const { data } = await supabase.auth.getSession();
    this.usuario_id = data?.session?.user?.id || null;
  }

  // 🔁 Cargar historial real desde el backend
  cargarHistorial() {
    if (!this.usuario_id) return;

    this.puntosService.getUserPointsHistory(this.usuario_id).subscribe({
      next: (data: any) => {
        console.log('📜 Historial de puntos:', data);
        // Mapeamos los nombres a los usados en tu HTML
        this.historial = data.map((item: any) => ({
          descripcion: item.descripcion,
          puntos: item.puntos_asignados,
          fecha: new Date(item.fecha).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
        }));
      },
      error: (err) => {
        console.error('❌ Error al obtener historial:', err);
      },
    });
  }
}
