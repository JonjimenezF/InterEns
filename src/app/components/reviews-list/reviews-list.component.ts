import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReputacionService } from '../../servicios/reputacion.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { supabase } from '../../services/supabase.client';  // 👈 IMPORTANTE

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
      // 1) Calificaciones del vendedor
      this.reviews = await this.reputacionService
        .obtenerCalificacionesDetalladas(this.usuarioId);

      // 2) Para cada review, traer el nombre del calificador
      for (const review of this.reviews) {
        const { data: perfil, error } = await supabase
          .from('perfiles')
          .select('nombre_completo')
          .eq('usuario_id', review.usuario_calificador)
          .maybeSingle();

        if (!error && perfil) {
          review.nombre_calificador = perfil.nombre_completo || 'Usuario';
        } else {
          review.nombre_calificador = 'Usuario';
        }

        console.log('Review actualizada:', review);
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
