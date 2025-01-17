import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJourneyCsmComponent } from './customer-journey-csm.component';

describe('CustomerJourneyCsmComponent', () => {
  let component: CustomerJourneyCsmComponent;
  let fixture: ComponentFixture<CustomerJourneyCsmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerJourneyCsmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerJourneyCsmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
