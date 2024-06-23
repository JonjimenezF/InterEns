import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QueEsPage } from './que-es.page';

describe('QueEsPage', () => {
  let component: QueEsPage;
  let fixture: ComponentFixture<QueEsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QueEsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
