import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReputacionService } from '../../servicios/reputacion.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-reviews-list',
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, StarRatingComponent]
})
export class ReviewsListComponent implements OnInit {
  @Input() usuarioId!: string;
  @Input() showTitle: boolean = true;
  
  reviews: any[] = [];
  loading = true;

  constructor(private reputacionService: ReputacionService) {}

  async ngOnInit() {
    if (this.usuarioId) {
      await this.cargarReseñas();
    }
  }

  async cargarReseñas() {
    this.loading = true;
    try {
      this.reviews = await this.reputacionService.obtenerCalificacionesDetalladas(this.usuarioId);
      
      // Obtener nombres de los calificadores
      for (let review of this.reviews) {
        try {
          const resp = await fetch(`http://127.0.0.1:4000/profile/${review.usuario_calificador}`);
          const perfil = await resp.json();
          review.nombre_calificador = perfil?.nombre_completo || 'Usuario';
        } catch {
          review.nombre_calificador = 'Usuario';
        }
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    } finally {
      this.loading = false;
    }
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const reviewDate = new Date(fecha);
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hace 1 día';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    return `Hace ${Math.ceil(diffDays / 30)} meses`;
  }
}