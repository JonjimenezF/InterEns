import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';
import { FavoritosService } from '../servicios/favoritos.service';
import { supabase } from 'src/shared/supabase/supabase.client';


@Component({
  selector: 'app-favoritos',
  templateUrl: './favoritos.page.html',
  styleUrls: ['./favoritos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, FooterInterensComponent],
})
export class FavoritosPage implements OnInit {
  favoritos: any[] = [];
  loading = true;

  constructor(
    private favoritosService: FavoritosService,
    private navCtrl: NavController,
    private toastController: ToastController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.cargarFavoritos();
  }

  goBack() {
    this.navCtrl.back();
  }

  async cargarFavoritos() {
  this.loading = true;
  try {
    // 👉 ahora usamos getFavoritos()
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const data = await this.favoritosService.getFavoritos(userId).toPromise();
    this.favoritos = data || [];
    console.log('💖 Favoritos cargados:', this.favoritos.length);
  } catch (error) {
    console.error('❌ Error al cargar favoritos:', error);
    this.showToast('Error al cargar tus favoritos');
  } finally {
    this.loading = false;
  }
}

  async eliminarFavorito(productoId: number) {
  try {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    await this.favoritosService.removeFavorito(userId, productoId).toPromise();
    this.favoritos = this.favoritos.filter((p) => p.id !== productoId);
    this.showToast('Producto eliminado de tus favoritos 💔');
  } catch (error) {
    console.error('❌ Error al eliminar favorito:', error);
    this.showToast('Error al eliminar favorito');
  }
}


  getImagenProducto(producto: any): string {
    return producto.imagen_url || 'assets/img/default.png';
  }

  verDetalle(producto: any) {
    this.router.navigate(['/detalle-producto'], { state: { producto } });
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color: 'dark',
    });
    await toast.present();
  }
}
