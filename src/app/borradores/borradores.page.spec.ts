import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BorradoresPage } from './borradores.page';

describe('BorradoresPage', () => {
  let component: BorradoresPage;
  let fixture: ComponentFixture<BorradoresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BorradoresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
