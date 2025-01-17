import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleAssociationsAdditionContentComponent } from './multiple-associations-addition-content.component';

describe('MultipleAssociationsAdditionContentComponent', () => {
  let component: MultipleAssociationsAdditionContentComponent;
  let fixture: ComponentFixture<MultipleAssociationsAdditionContentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultipleAssociationsAdditionContentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleAssociationsAdditionContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
