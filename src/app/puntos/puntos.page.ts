
import { Component, OnInit } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonContent,
  IonButton,
  IonImg,
  IonIcon,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { PuntosService } from '../servicios/puntos.service'; // ✅ tu servicio de puntos
import { supabase } from '../services/supabase.client'; // ✅ para obtener el usuario logueado

@Component({
  selector: 'app-puntos',
  templateUrl: './puntos.page.html',
  styleUrls: ['./puntos.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonImg,
    IonIcon,
    IonBackButton,
    IonButtons,
    CommonModule,
    IonFooter,
    FooterInterensComponent,
    HttpClientModule,
  ],
})
export class PuntosPage implements OnInit {
  puntosTotales: number = 0;
  usuario_id: string | null = null;

  constructor(
    private router: Router,
    private puntosService: PuntosService
  ) {}

  async ngOnInit() {
    await this.obtenerUsuario();
    if (this.usuario_id) {
      this.obtenerPuntos();
    }
  }

  // 🧩 Obtener usuario logueado desde Supabase
  async obtenerUsuario() {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    if (user) {
      this.usuario_id = user.id;
    } else {
      console.warn('⚠️ No hay usuario logueado.');
    }
  }

  // 🔢 Llamar al backend para obtener los puntos
  obtenerPuntos() {
    if (!this.usuario_id) return;

    this.puntosService.getUserPoints(this.usuario_id).subscribe({
      next: (res) => {
        console.log('🎯 Puntos obtenidos:', res);
        this.puntosTotales = res.total_points || 0;
      },
      error: (err) => {
        console.error('❌ Error al obtener puntos:', err);
      },
    });
  }

  canjearPuntos() {
    this.router.navigate(['/canjear-puntos']);
  }

  verHistorial() {
    this.router.navigate(['/historial-puntos']);
  }
}
