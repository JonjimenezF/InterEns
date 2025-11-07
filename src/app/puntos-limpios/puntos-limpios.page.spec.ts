import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuntosLimpiosPage } from './puntos-limpios.page';

describe('PuntosLimpiosPage', () => {
  let component: PuntosLimpiosPage;
  let fixture: ComponentFixture<PuntosLimpiosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PuntosLimpiosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
