import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonBadge,
  IonProgressBar,
  IonFooter,
} from '@ionic/angular/standalone';
import { HttpClient } from '@angular/common/http';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

@Component({
  selector: 'app-misiones',
  templateUrl: './misiones.page.html',
  styleUrls: ['./misiones.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, IonBadge, IonProgressBar,
    CommonModule, FormsModule,IonFooter,
    FooterInterensComponent,
  ]
})
export class MisionesPage implements OnInit {
  misiones: any[] = [];
  infoMisiones = [
    { nombre: 'Subir 3 productos', condicion: 'Publica 3 enseres válidos', puntos: 50 },
    { nombre: 'Intercambiar un producto', condicion: 'Completa un intercambio', puntos: 100 },
    { nombre: 'Canjear puntos por producto', condicion: 'Canjea puntos en tienda', puntos: 30 },
    { nombre: 'Donar un enser', condicion: 'Marca el producto como donación', puntos: 40 },
    { nombre: 'Completar perfil', condicion: 'Rellena todos los campos del perfil', puntos: 20 },
  ];

  usuarioId: string | null = null;
  completadas = 0;
  totalMisiones = 0;
  puntosTotales = 0;
  cargando = true;

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.usuarioId = localStorage.getItem('usuario_id') || '4e41acef-a7db-4225-882b-d510b6e49494';
    this.cargarMisiones();
  }

  cargarMisiones() {
    this.http
      .get<any[]>(`http://localhost:4000/api/misiones/${this.usuarioId}`)
      .subscribe({
        next: (res) => {
          this.misiones = res.map((m) => ({
            ...m,
            porcentaje: m.cantidad > 0 ? Math.min(m.progreso / m.cantidad, 1) : 0,
            veces_completada: m.veces_completada || 1
          }));
          this.totalMisiones = this.misiones.length;
          this.completadas = this.misiones.filter(m => m.completada).length;
          this.puntosTotales = this.misiones
            .filter(m => m.completada)
            .reduce((sum, m) => sum + (m.puntos || 0), 0);
          this.cargando = false;
        },
        error: (err) => {
          console.error('❌ Error al obtener misiones:', err);
          this.cargando = false;
        },
      });
  }
}
