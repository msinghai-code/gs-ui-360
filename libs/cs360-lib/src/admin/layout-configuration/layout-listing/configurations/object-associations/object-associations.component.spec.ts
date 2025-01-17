import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectAssociationsComponent } from './object-associations.component';

describe('ObjectAssociationsComponent', () => {
  let component: ObjectAssociationsComponent;
  let fixture: ComponentFixture<ObjectAssociationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectAssociationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectAssociationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
