import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { createClient } from '@supabase/supabase-js';

@Component({
  selector: 'app-mostar',
  templateUrl: './mostar.page.html',
  styleUrls: ['./mostar.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MostarPage implements OnInit {
  supabase = createClient('TU_URL_DE_SUPABASE', 'TU_CLAVE_PÚBLICA_DE_SUPABASE');
  fotoUrl!: string;

  constructor() { 
    this.fotoUrl = ''; // O cualquier valor por defecto que desees
}
   

  async ngOnInit() {
    const { data, error } = await this.supabase
      .from('fotos')
      .select('url')
      .single();

    if (error) {
      console.error('Error al obtener la URL de la foto desde la base de datos:', error.message);
    } else {
      this.fotoUrl = data.url;
    }
  }

}
