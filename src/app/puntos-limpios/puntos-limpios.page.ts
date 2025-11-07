import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Loader } from '@googlemaps/js-api-loader';

@Component({
  selector: 'app-puntos-limpios',
  templateUrl: './puntos-limpios.page.html',
  styleUrls: ['./puntos-limpios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PuntosLimpiosPage implements AfterViewInit, OnDestroy {
  private map!: google.maps.Map;
  private directionsService!: google.maps.DirectionsService;
  private directionsRenderer!: google.maps.DirectionsRenderer;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.directionsRenderer) this.directionsRenderer.setMap(null);
  }

  private async initMap(): Promise<void> {
    const loader = new Loader({
      apiKey: 'TU_API_KEY_AQUI', // 🔑 Reemplaza por tu API key real
      version: 'weekly',
      libraries: ['places'],
    });

    // ⏳ Cargar Google Maps
    await loader.load();

    const puntoLimpio = { lat: -33.0475, lng: -71.6121 }; // Valparaíso 🇨🇱

    // 🗺️ Crear mapa
    this.map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
      center: puntoLimpio,
      zoom: 13,
      disableDefaultUI: false,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    // ♻️ Marcador del punto limpio
    new google.maps.Marker({
      position: puntoLimpio,
      map: this.map,
      title: 'Punto Limpio Valparaíso',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#1fd39a',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#fff',
      },
    });

    // 🚗 Servicio de rutas
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: { strokeColor: '#1fd39a', strokeWeight: 5 },
    });
    this.directionsRenderer.setMap(this.map);

    // 📍 Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };

          // 📍 Marcador del usuario
          new google.maps.Marker({
            position: userPos,
            map: this.map,
            title: 'Tu ubicación',
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: '#fff',
            },
          });

          // 🧭 Calcular y mostrar ruta
          this.directionsService.route(
            {
              origin: userPos,
              destination: puntoLimpio,
              travelMode: google.maps.TravelMode.DRIVING,
            },
            (res: google.maps.DirectionsResult | null, status: google.maps.DirectionsStatus) => {
              if (status === 'OK' && res) {
                this.directionsRenderer.setDirections(res);
                const leg = res.routes[0].legs[0];
                const distancia = leg.distance?.text ?? '';
                const tiempo = leg.duration?.text ?? '';

                const infoDiv = document.getElementById('info');
                if (infoDiv) {
                  infoDiv.innerHTML = `
                    <div class="info-banner">
                      <b>♻️ Punto Limpio más cercano</b><br>
                      Distancia: ${distancia} · Tiempo: ${tiempo}
                    </div>
                    <button class="floating-btn" id="startTripBtn">🚗 Iniciar viaje</button>
                  `;

                  // ✅ Corregido: template literal bien cerrado y limpio
                  document
                    .getElementById('startTripBtn')
                    ?.addEventListener('click', () => {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${userPos.lat},${userPos.lng}&destination=${puntoLimpio.lat},${puntoLimpio.lng}&travelmode=driving`,
                        '_blank'
                      );
                    });
                }
              } else {
                alert('No se pudo calcular la ruta.');
              }
            }
          );
        },
        () => alert('No se pudo obtener tu ubicación.')
      );
    } else {
      alert('Tu navegador no permite geolocalización.');
    }
  }
}
