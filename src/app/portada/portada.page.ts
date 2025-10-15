import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { NavController, Animation, createAnimation } from '@ionic/angular';

@Component({
  selector: 'app-portada',
  templateUrl: './portada.page.html',
  styleUrls: ['./portada.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonImg, CommonModule, FormsModule]
})
export class PortadaPage implements OnInit, AfterViewInit {
  @ViewChild('portada', { read: ElementRef }) portadaEl!: ElementRef<HTMLElement>;

  isLoaded = false;

  constructor(private router: Router, private navCtrl: NavController) {}

  ngOnInit() {}

  async ngAfterViewInit() {
    // Dispara tus animaciones existentes (CSS ya las maneja con .loaded)
    setTimeout(() => (this.isLoaded = true), 60);

    // Tiempo visible de la portada (ajústalo a gusto)
    const visibleMs = 2200;

    // Espera y luego hace un fade-out suave del ion-content SIN tocar tu CSS
    setTimeout(async () => {
      await this.fadeOutPortada(420);
      await this.navCtrl.navigateRoot('/login', {
        animated: true,
        animation: fadeRouteAnimation,
      });
    }, visibleMs);
  }

  private fadeOutPortada(duration = 420) {
  const el = this.portadaEl?.nativeElement;
  if (!el) return Promise.resolve();

  const fade = createAnimation()
    .addElement(el)
    .duration(duration)
    .easing('ease')
    .fill('forwards')              // 👈 queda en 0 sólo hasta navegar
    .fromTo('opacity', '1', '0');

  // Si quieres, agrega un sutil scale:
  // .fromTo('transform', 'scale(1)', 'scale(0.98)')

  return fade.play().then(() => undefined);
}
}

/** Transición FADE entre páginas (sin deslizamiento) */
export const fadeRouteAnimation = (_baseEl: HTMLElement, opts?: any): Animation => {
  // Ajusta estos tiempos a tu gusto:
  const ENTER_DURATION = 560;  // más largo = aparece más de a poco
  const LEAVE_DURATION = 340;  // salida un poco más corta
  const OVERLAP_MS = 120;      // solapa entrada/salida (negativo = empieza antes)

  const enteringEl = opts?.enteringEl as HTMLElement;
  const leavingEl = opts?.leavingEl as HTMLElement;

  const root = createAnimation();

  // ENTRADA (login): fade + leve desplazamiento (o puedes usar scale)
  if (enteringEl) {
    const enter = createAnimation()
      .addElement(enteringEl)
      .beforeRemoveClass('ion-page-invisible')
      .beforeStyles({ opacity: '0', transform: 'translateY(8px)' }) // o: 'scale(0.98)'
      .duration(ENTER_DURATION)
      .easing('cubic-bezier(0.22, 1, 0.36, 1)')
      .fromTo('opacity', '0', '1')
      .fromTo('transform', 'translateY(8px)', 'translateY(0)')      // o: 'scale(0.98)' -> 'scale(1)'
      .afterClearStyles(['opacity', 'transform']);

    root.addAnimation(enter);
  }

  // SALIDA (portada): fade más rápido
  if (leavingEl) {
    const leave = createAnimation()
      .addElement(leavingEl)
      .duration(LEAVE_DURATION)
      .easing('cubic-bezier(0.22, 1, 0.36, 1)')
      .fromTo('opacity', '1', '0')
      .afterClearStyles(['opacity']);

    root.addAnimation(leave);
  }

  // Sincronización: solapamos entrada con salida para que se sienta continuo
  root.addAnimation([
    createAnimation().direction('normal').delay(0),                 // placeholder
  ]);
  root.duration(Math.max(ENTER_DURATION, LEAVE_DURATION));
  root.easing('linear');

  // Aplica offset para que la ENTRADA empiece un poco antes de que termine la SALIDA
  if (enteringEl && leavingEl) {
    // el solapamiento se logra “empezando” la entrada antes del fin de salida
    root.addAnimation(
      createAnimation()
        .duration(0) // no hace nada, solo fuerza el timing del grupo
    );
    // @ts-ignore: Ionic no expone offsets finos; usamos delay en una de las partes
    (enteringEl as any).style.setProperty('--enter-delay', `${Math.max(0, LEAVE_DURATION - OVERLAP_MS)}ms`);
  }

  return root;
};