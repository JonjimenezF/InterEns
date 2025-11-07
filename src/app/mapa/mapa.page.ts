import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { NavController } from '@ionic/angular';
declare const google: any;

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.page.html',
  styleUrls: ['./mapa.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class MapaPage implements OnInit {
  @ViewChild('mapElement', { static: true }) mapElement!: ElementRef;

  constructor(private navCtrl: NavController) {}

  map: any;
  directionsService: any;
  directionsRenderer: any;
  userMarker: any;
  posicionUsuario: any;
  destinoMasCercano: any;
  distanciaKm: number | null = null;

  // 🗺️ Tres destinos fijos
  destinos = [
    { nombre: 'Punto Valparaíso', lat: -33.0469, lng: -71.6127 },
    { nombre: 'Punto Viña del Mar', lat: -33.0153, lng: -71.5500 },
    { nombre: 'Punto Santiago', lat: -33.4489, lng: -70.6693 },
  ];

  ngOnInit() {
    this.initMap();
  }

  async initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.posicionUsuario = { lat, lng };

          this.map = new google.maps.Map(this.mapElement.nativeElement, {
            center: this.posicionUsuario,
            zoom: 10,
          });

          this.userMarker = new google.maps.Marker({
            position: this.posicionUsuario,
            map: this.map,
            title: 'Tu ubicación actual',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            },
          });

          this.directionsService = new google.maps.DirectionsService();
          this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
          });

          this.agregarDestinos();
          this.calcularDestinoMasCercano();
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          alert('No se pudo obtener tu ubicación.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  }

  agregarDestinos() {
    this.destinos.forEach((dest) => {
      new google.maps.Marker({
        position: { lat: dest.lat, lng: dest.lng },
        map: this.map,
        title: dest.nombre,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
        },
      });
    });
  }

  // 📏 Calcular el destino más cercano
  // 📏 Calcular el destino más cercano
calcularDestinoMasCercano() {
  if (!this.posicionUsuario) {
    console.warn('⚠️ No hay posición del usuario aún.');
    return;
  }

  const { lat, lng } = this.posicionUsuario;
  let menorDistancia = Infinity;
  let destinoCercano: { nombre: string; lat: number; lng: number } | null = null;

  this.destinos.forEach((dest) => {
    const distancia =
      google?.maps?.geometry?.spherical?.computeDistanceBetween
        ? google.maps.geometry.spherical.computeDistanceBetween(
            new google.maps.LatLng(lat, lng),
            new google.maps.LatLng(dest.lat, dest.lng)
          )
        : this.getDistanciaManual(lat, lng, dest.lat, dest.lng);

    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      destinoCercano = dest;
    }
  });

  if (!destinoCercano) {
    alert('No se encontró un destino cercano.');
    return;
  }

  // ✅ Forzamos el tipo para evitar el “never”
  const destino = destinoCercano as { nombre: string; lat: number; lng: number };

  this.destinoMasCercano = destino;
  this.distanciaKm = menorDistancia / 1000;

  console.log(`🚗 Destino más cercano: ${destino.nombre} (${this.distanciaKm.toFixed(2)} km)`);

  this.dibujarRuta(destino);
}


  // 🧮 Fórmula Haversine (respaldo)
  getDistanciaManual(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Radio Tierra (m)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // metros
  }

  // 🛣️ Trazar ruta hacia el más cercano
  dibujarRuta(destino: any) {
    if (!this.posicionUsuario || !destino) return;

    const request = {
      origin: this.posicionUsuario,
      destination: { lat: destino.lat, lng: destino.lng },
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(result);
      } else {
        console.error('Error al trazar ruta:', status);
      }
    });
  }

  iniciarRuta() {
    if (!this.destinoMasCercano) {
      alert('No se encontró un destino cercano.');
      return;
    }

    const url = `https://www.google.com/maps/dir/?api=1&origin=${this.posicionUsuario.lat},${this.posicionUsuario.lng}&destination=${this.destinoMasCercano.lat},${this.destinoMasCercano.lng}&travelmode=driving`;
    window.open(url, '_blank');
  }

  goBack() {
    this.navCtrl.back();
  }
}
