import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleAssociationsAdditionComponent } from './multiple-associations-addition.component';

describe('MultipleAssociationsAdditionComponent', () => {
  let component: MultipleAssociationsAdditionComponent;
  let fixture: ComponentFixture<MultipleAssociationsAdditionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleAssociationsAdditionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleAssociationsAdditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
