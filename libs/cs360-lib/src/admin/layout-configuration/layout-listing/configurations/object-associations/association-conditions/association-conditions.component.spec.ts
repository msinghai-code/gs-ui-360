import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociationConditionsComponent } from './association-conditions.component';

describe('AssociationConditionsComponent', () => {
  let component: AssociationConditionsComponent;
  let fixture: ComponentFixture<AssociationConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociationConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociationConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
