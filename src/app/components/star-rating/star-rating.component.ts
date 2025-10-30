import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, starHalf, starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  standalone: true,
  imports: [CommonModule, IonIcon]
})
export class StarRatingComponent {
  @Input() rating: number = 0;
  @Input() totalReviews: number = 0;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showText: boolean = true;

  constructor() {
    addIcons({ star, starHalf, starOutline });
  }

  get stars() {
    const stars = [];
    const fullStars = Math.floor(this.rating);
    const hasHalfStar = this.rating % 1 >= 0.5;
    
    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
      stars.push('star');
    }
    
    // Media estrella
    if (hasHalfStar) {
      stars.push('star-half');
    }
    
    // Estrellas vacías
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push('star-outline');
    }
    
    return stars;
  }

  get ratingText() {
    if (this.totalReviews === 0) return 'Sin reseñas';
    return `${this.rating.toFixed(1)} (${this.totalReviews} reseña${this.totalReviews !== 1 ? 's' : ''})`;
  }
}