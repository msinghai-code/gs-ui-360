import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageConfigurationComponent } from './usage-configuration.component';

describe('UsageConfigurationComponent', () => {
  let component: UsageConfigurationComponent;
  let fixture: ComponentFixture<UsageConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UsageConfigurationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
