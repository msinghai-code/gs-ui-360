import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentConditionsComponent } from './assignment-conditions.component';

describe('AssignmentConditionsComponent', () => {
  let component: AssignmentConditionsComponent;
  let fixture: ComponentFixture<AssignmentConditionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignmentConditionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentConditionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
