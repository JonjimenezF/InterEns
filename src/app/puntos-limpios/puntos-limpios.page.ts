import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-puntos-limpios',
  templateUrl: './puntos-limpios.page.html',
  styleUrls: ['./puntos-limpios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PuntosLimpiosPage {
  
  puntosLimpios = [
    {
      nombre: 'Punto Limpio Valparaíso',
      direccion: 'Av. Argentina 475, Valparaíso',
      horario: 'Lun-Vie: 9:00-18:00, Sáb: 9:00-14:00',
      telefono: '+56 32 2123456',
      materiales: ['Papel', 'Cartón', 'Plástico', 'Vidrio', 'Metales']
    },
    {
      nombre: 'Punto Limpio Viña del Mar',
      direccion: 'Calle Libertad 1234, Viña del Mar',
      horario: 'Lun-Vie: 8:30-17:30, Sáb: 9:00-13:00',
      telefono: '+56 32 2987654',
      materiales: ['Papel', 'Cartón', 'Plástico', 'Vidrio', 'Electrónicos']
    },
    {
      nombre: 'Punto Limpio Quilpué',
      direccion: 'Av. Manuel Montt 567, Quilpué',
      horario: 'Lun-Vie: 9:00-17:00',
      telefono: '+56 32 2456789',
      materiales: ['Papel', 'Cartón', 'Plástico', 'Aceite usado']
    }
  ];

  abrirMapa(direccion: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  }

  llamar(telefono: string) {
    window.open(`tel:${telefono}`);
  }
}
