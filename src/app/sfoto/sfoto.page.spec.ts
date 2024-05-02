import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SfotoPage } from './sfoto.page';

describe('SfotoPage', () => {
  let component: SfotoPage;
  let fixture: ComponentFixture<SfotoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SfotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
