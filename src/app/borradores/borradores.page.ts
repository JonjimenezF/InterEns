import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonImg,
  IonIcon,
  IonFooter,
   IonSpinner,

} from '@ionic/angular/standalone';

@Component({
  selector: 'app-borradores',
  templateUrl: './borradores.page.html',
  styleUrls: ['./borradores.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonImg,
    IonIcon,
    IonFooter,
    FooterInterensComponent,
    IonSpinner, 
  ],
})
export class BorradoresPage implements OnInit {
  borradores: any[] = [];
  userId: string | null = null;
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  async ngOnInit() {
    const userData = localStorage.getItem('supabase.auth.token');
    if (userData) {
      const parsed = JSON.parse(userData);
      this.userId = parsed.currentSession?.user?.id || null;
    }

    if (this.userId) {
      this.cargarBorradores();
    } else {
      this.loading = false;
    }
  }

  cargarBorradores() {
    this.loading = true;
    this.http
      .get(`http://localhost:4000/api/getUserDrafts/${this.userId}`)
      .subscribe({
        next: (res: any) => {
          this.borradores = res;
          this.loading = false;
        },
        error: (err) => {
          console.error('❌ Error al obtener borradores:', err);
          this.loading = false;
        },
      });
  }

  // ✏️ Editar: redirige al formulario con el borrador cargado
  editarBorrador(borrador: any) {
    this.router.navigate(['/sproducto'], { state: { borrador } });
  }

  // 🗑️ Eliminar borrador
  eliminarBorrador(id: number) {
    if (!confirm('¿Seguro que deseas eliminar este borrador?')) return;

    this.http
      .delete(`http://localhost:4000/api/deleteDraft/${id}`)
      .subscribe({
        next: () => {
          alert('🗑️ Borrador eliminado');
          this.cargarBorradores();
        },
        error: (err) => {
          console.error('❌ Error al eliminar borrador:', err);
        },
      });
  }

  


  goBack() {
    this.router.navigate(['/perfil']);
  }
}
