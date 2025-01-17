import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerJourneySettingsComponent } from './customer-journey-builder-settings.component';

describe('CustomerJourneySettingsComponent', () => {
  let component: CustomerJourneySettingsComponent;
  let fixture: ComponentFixture<CustomerJourneySettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerJourneySettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerJourneySettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
