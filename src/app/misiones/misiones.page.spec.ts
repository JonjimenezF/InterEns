import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisionesPage } from './misiones.page';

describe('MisionesPage', () => {
  let component: MisionesPage;
  let fixture: ComponentFixture<MisionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
