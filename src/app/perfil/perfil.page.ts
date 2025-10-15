import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { supabase } from 'src/shared/supabase/supabase.client';
import { ViewChild, ElementRef } from '@angular/core';
import { FooterInterensComponent } from '../components/footer-interens/footer-interens.component';


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

  }

  async ionViewWillEnter() {
  await this.loadPerfil();
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
