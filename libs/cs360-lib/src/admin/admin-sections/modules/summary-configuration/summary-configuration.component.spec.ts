import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryConfigurationComponent } from './summary-configuration.component';

describe('SummaryConfigurationComponent', () => {
  let component: SummaryConfigurationComponent;
  let fixture: ComponentFixture<SummaryConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummaryConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
