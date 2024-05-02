import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostarPage } from './mostar.page';

describe('MostarPage', () => {
  let component: MostarPage;
  let fixture: ComponentFixture<MostarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MostarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
