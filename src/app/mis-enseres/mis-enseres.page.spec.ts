import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisEnseresPage } from './mis-enseres.page';

describe('MisEnseresPage', () => {
  let component: MisEnseresPage;
  let fixture: ComponentFixture<MisEnseresPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisEnseresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
