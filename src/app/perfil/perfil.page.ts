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
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    console.log('token', session);
    if (!token) {
      console.error('No token: el usuario no está autenticado');
      //this.router.navigate(['/login']);
      return;
    }
    const r = await fetch('http://127.0.0.1:4000/profile/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const perfil = await r.json();
    console.log('perfil', perfil);

    this.perfile = perfil;
    this.nombre = perfil?.nombre_completo ?? null;
    this.email = perfil?.email ?? null;
    this.avatarUrl = perfil?.avatar_url ?? null;
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
