import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from 'src/shared/supabase/supabase.client';
import { ViewChild, ElementRef } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';

type ProductoUsuario = {
  id: string;
  title: string;
  description?: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | string;
  points?: number | null;
  created_at?: string | null;
  condicion?: string | null;
  categoria_id?: string | null;
  cover_url?: string | null;
};

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,              // 👈 ya incluye IonHeader, IonToolbar, IonFooter, IonButton, etc.
    FooterInterensComponent   // 👈 nuestro footer personalizado
  ]
})
export class PerfilPage implements OnInit {
  nombre: string | null = null;
  email: string | null = null;
  avatarUrl: string | null = null;
  perfile: any; loading = true;
  uploading = false;

  userId: string | undefined;
  userInfo?: any;

  selectedTab: string = 'productos'; 

 
  constructor(private router: Router) { }

  
  

  async ngOnInit() {
    this.loading = true;
    await this.loadPerfil();
    await this.loadMyProducts(true);   

  }

  async ionViewWillEnter() {
    await this.loadPerfil();
    await this.loadMyProducts(true);
  }

  private async loadPerfil() {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;

    const r = await fetch('http://127.0.0.1:4000/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const perfil = await r.json();

    this.perfile = perfil;
    this.nombre = perfil?.nombre_completo ?? null;
    this.email  = perfil?.email ?? null;

    // por si el backend no trae ?v=... (cache-buster)
    let url = perfil?.avatar_url ?? null;
    if (url && !url.includes('?v=')) {
      url = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
    }
    this.avatarUrl = url;

    this.loading = false;
  }
  
  productos: ProductoUsuario[] = [];
  prodLoading = false;
  prodPageSize = 10;
  prodNextCursor: string | null = null;              // viene como offset en string
  prodHasMore = true;

  async loadMyProducts(reset = false) {
    if (this.prodLoading) return;
    this.prodLoading = true;

    try {
      if (reset) {
        this.productos = [];
        this.prodNextCursor = null;
        this.prodHasMore = true;
      }
      if (!this.prodHasMore) return;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const params = new URLSearchParams();
      params.set('limit', String(this.prodPageSize));
      if (this.prodNextCursor) params.set('offset', this.prodNextCursor); // nuestro cursor = offset

      const resp = await fetch(`http://127.0.0.1:4000/product_usuario/usuario?` + params.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!resp.ok) {
        console.error('Error HTTP productos:', resp.status, await resp.text());
        return;
      }

      const data: { items: ProductoUsuario[]; total: number; nextCursor: string | null } = await resp.json();

      this.productos = [...this.productos, ...(data.items || [])];
      this.prodNextCursor = data.nextCursor;         // null si no hay más
      this.prodHasMore = !!this.prodNextCursor;
    } catch (e) {
      console.error('Error cargando productos usuario:', e);
    } finally {
      this.prodLoading = false;
    }
  }

  // helpers para UI (si los usas en el HTML)
  cover(p: ProductoUsuario) {
    return p.cover_url || '/assets/img/placeholder.png';
  }

  statusColor(p: ProductoUsuario) {
    switch (p.estado) {
      case 'APROBADO': return 'success';
      case 'PENDIENTE': return 'warning';
      case 'RECHAZADO': return 'danger';
      default: return 'medium';
    }
  }

  // si usas pull-to-refresh o infinite scroll:
  async doRefresh(ev: any) {
    await this.loadMyProducts(true);
    ev?.target?.complete?.();
  }
  async loadMore(ev: any) {
    await this.loadMyProducts(false);
    ev?.target?.complete?.();
  }


  editarperfil(): void {
    this.router.navigate(['/edit-perfil']);
  }

  goProducto(): void {
    this.router.navigate(['/producto']);
  }

  home(): void {
    this.router.navigate(['/home']);
  }

  perfil(): void {
    this.router.navigate(['/perfil']);
  }

  salir(): void {
    // Acción al salir
  }

  puntoLimpio(): void {
    this.router.navigate(['/punto-limpio']);
  }
}
