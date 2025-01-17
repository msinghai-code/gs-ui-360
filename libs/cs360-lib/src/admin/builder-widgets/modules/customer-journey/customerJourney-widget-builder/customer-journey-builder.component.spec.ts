import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJourneyBuilderComponent } from './customer-journey-builder.component';

describe('CustomerJourneyBuilderComponent', () => {
  let component: CustomerJourneyBuilderComponent;
  let fixture: ComponentFixture<CustomerJourneyBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerJourneyBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerJourneyBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
