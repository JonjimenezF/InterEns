import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistorialPuntosPage } from './historial-puntos.page';

describe('HistorialPuntosPage', () => {
  let component: HistorialPuntosPage;
  let fixture: ComponentFixture<HistorialPuntosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HistorialPuntosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
