import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReciclajePage } from './reciclaje.page';

describe('ReciclajePage', () => {
  let component: ReciclajePage;
  let fixture: ComponentFixture<ReciclajePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReciclajePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
