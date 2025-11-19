import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent, IonItem, IonList, IonLabel, IonButton, IonIcon, IonChip } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-puntos-limpios',
  templateUrl: './puntos-limpios.page.html',
  styleUrls: ['./puntos-limpios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonChip
  ]
})
export class PuntosLimpiosPage implements OnInit {

  userLat: number | null = null;
  userLng: number | null = null;

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

  constructor() {}

  async ngOnInit() {
    await this.requestPermissions();
    await this.obtenerUbicacion();
  }

  // =======================================
  // OBTENER UBICACIÓN DEL USUARIO
  // =======================================
  async obtenerUbicacion() {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
      });

      this.userLat = position.coords.latitude;
      this.userLng = position.coords.longitude;

      console.log('📍 Ubicación del usuario:', this.userLat, this.userLng);
    } catch (err) {
      console.error('❌ Error obteniendo ubicación', err);
    }
  }

  // =======================================
  // ABRIR MAPA
  // =======================================
  abrirMapa(direccion: string) {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
    window.open(url, '_blank');
  }

  // =======================================
  // LLAMAR POR TELÉFONO
  // =======================================
  llamar(telefono: string) {
    window.open(`tel:${telefono}`);
  }

  async requestPermissions() {
    try {
      const perm = await Geolocation.requestPermissions();
      console.log('🔐 Permisos:', perm);
    } catch (err) {
      console.error('❌ Error pidiendo permisos:', err);
    }
  }


}
