import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerificarcontraPage } from './verificarcontra.page';

describe('VerificarcontraPage', () => {
  let component: VerificarcontraPage;
  let fixture: ComponentFixture<VerificarcontraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerificarcontraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
