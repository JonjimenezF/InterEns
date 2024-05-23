import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SproductoPage } from './sproducto.page';

describe('SproductoPage', () => {
  let component: SproductoPage;
  let fixture: ComponentFixture<SproductoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SproductoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
